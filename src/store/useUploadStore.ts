import { create } from 'zustand';
import { toast } from 'sonner';
import { supabaseClient } from '@/lib/supabaseClient';
import { upsertLesson } from '@/lib/coursesDb';

export type UploadStatus = 'Uploading' | 'Encoding' | 'Ready' | 'Failed';

export interface UploadTask {
  lessonId: string;
  title: string;
  status: UploadStatus;
  progress: number;
  videoId?: string;
  xhr?: XMLHttpRequest;
  pollingInterval?: any;
  courseId?: string;
  sectionId?: string;
  isNewLesson?: boolean;
  savedToDb?: boolean;
}

interface UploadStore {
  uploads: Record<string, UploadTask>;
  addUpload: (lessonId: string, task: Omit<UploadTask, 'lessonId'>) => void;
  updateProgress: (lessonId: string, progress: number) => void;
  updateStatus: (lessonId: string, status: UploadStatus, videoId?: string) => void;
  removeUpload: (lessonId: string) => void;
  cancelUpload: (lessonId: string) => void;
  startBackgroundUpload: (lessonId: string, file: File, meta?: { courseId: string; sectionId: string; title: string; isNewLesson: boolean }) => Promise<void>;
}

export const useUploadStore = create<UploadStore>((set, get) => ({
  uploads: {},

  addUpload: (lessonId, task) => set((state) => ({
    uploads: { ...state.uploads, [lessonId]: { ...task, lessonId } }
  })),

  updateProgress: (lessonId, progress) => set((state) => {
    const upload = state.uploads[lessonId];
    if (!upload) return state;
    return {
      uploads: { ...state.uploads, [lessonId]: { ...upload, progress } }
    };
  }),

  updateStatus: (lessonId, status, videoId) => set((state) => {
    const upload = state.uploads[lessonId];
    if (!upload) return state;
    return {
      uploads: { 
        ...state.uploads, 
        [lessonId]: { ...upload, status, ...(videoId ? { videoId } : {}) } 
      }
    };
  }),

  removeUpload: (lessonId) => set((state) => {
    const newUploads = { ...state.uploads };
    const upload = newUploads[lessonId];
    if (upload) {
      if (upload.xhr) upload.xhr.abort();
      if (upload.pollingInterval) clearInterval(upload.pollingInterval);
      delete newUploads[lessonId];
    }
    return { uploads: newUploads };
  }),

  cancelUpload: (lessonId) => {
    get().removeUpload(lessonId);
    toast.error("تم إلغاء الرفع");
  },

  startBackgroundUpload: async (lessonId, file, meta) => {
    // 1. Initial State
    get().addUpload(lessonId, {
      title: meta?.title || file.name,
      status: 'Uploading',
      progress: 0,
      courseId: meta?.courseId,
      sectionId: meta?.sectionId,
      isNewLesson: meta?.isNewLesson,
      savedToDb: false,
    });

    try {
      // 2. Fetch configurations
      const configRes = await fetch("/api/admin/bunny/config");
      if (!configRes.ok) {
        throw new Error("فشل تحميل إعدادات Bunny Stream. تأكد من إعداد متغيرات البيئة.");
      }
      const { libraryId, apiKey } = await configRes.json();

      // 3. Create placeholder
      const createRes = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos`, {
        method: "POST",
        headers: {
          "AccessKey": apiKey,
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title: file.name })
      });
      if (!createRes.ok) {
        const errText = await createRes.text();
        throw new Error(`فشل إنشاء حاوية الفيديو في Bunny Stream (${createRes.status}): ${errText.slice(0,200)}`);
      }
      const createData = await createRes.json();
      const videoId = createData.guid;

      get().updateStatus(lessonId, 'Uploading', videoId);

      // 4. Perform direct browser-to-Bunny upload using XHR
      const xhr = new XMLHttpRequest();
      
      // Store XHR so we can cancel it
      set((state) => {
        const upload = state.uploads[lessonId];
        if (!upload) return state;
        return {
          uploads: { ...state.uploads, [lessonId]: { ...upload, xhr } }
        };
      });

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          get().updateProgress(lessonId, percentage);
        }
      });

      const uploadPromise = new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`فشل رفع الفيديو إلى Bunny Stream. رمز الاستجابة: ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error("حدث خطأ في الاتصال أثناء الرفع."));
        xhr.onabort = () => reject(new Error("ABORTED"));
      });

      xhr.open("PUT", `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`);
      xhr.setRequestHeader("AccessKey", apiKey);
      xhr.send(file);

      await uploadPromise;

      // 5. Start polling status
      get().updateStatus(lessonId, 'Encoding');
      get().updateProgress(lessonId, 0);

      const interval = setInterval(async () => {
        try {
          const res = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`, {
            headers: { "AccessKey": apiKey, "Accept": "application/json" }
          });
          if (!res.ok) return;
          const data = await res.json();
          
          if (data.status === 3 || data.status === 4) {
            clearInterval(interval);
            get().updateStatus(lessonId, 'Ready');
            get().updateProgress(lessonId, 100);
            
            const playUrl = `https://iframe.mediadelivery.net/play/${libraryId}/${videoId}/playlist.m3u8`;
            const thumbUrl = data.thumbnailUrl || `https://iframe.mediadelivery.net/play/${libraryId}/${videoId}/thumbnail.jpg`;
            const duration_seconds = data.length || 0;
            
            const task = get().uploads[lessonId];
            if (task?.isNewLesson && task.sectionId) {
              await upsertLesson({
                id: lessonId,
                title: task.title,
                section_id: task.sectionId,
                video_id: videoId,
                video_url: playUrl,
                playback_url: playUrl,
                thumbnail_url: thumbUrl,
                duration_seconds,
                video_processing_status: 'completed',
                upload_progress: 100,
                lecture_type: 'video',
                is_preview: false
              } as any);
              
              set((state) => ({
                uploads: {
                  ...state.uploads,
                  [lessonId]: { ...state.uploads[lessonId], savedToDb: true }
                }
              }));
              
              toast.success(`تم حفظ المحاضرة: ${task.title} ✓`);
            } else {
              // Save to database directly
              await supabaseClient.from("course_lessons").update({
                video_id: videoId,
                video_url: playUrl,
                playback_url: playUrl,
                thumbnail_url: thumbUrl,
                duration_seconds,
                video_processing_status: 'completed',
                upload_progress: 100
              }).eq("id", lessonId);
              
              set((state) => ({
                uploads: {
                  ...state.uploads,
                  [lessonId]: { ...state.uploads[lessonId], savedToDb: true }
                }
              }));
              
              toast.success(`اكتمل رفع ومعالجة الفيديو "${file.name}" بنجاح! 🚀`);
            }
          } else if (data.status === 5 || data.status === 8) {
            clearInterval(interval);
            get().updateStatus(lessonId, 'Failed');
            toast.error(`فشل تشفير الفيديو "${file.name}" على Bunny Stream.`);
          } else {
            get().updateProgress(lessonId, data.encodeProgress || 0);
          }
        } catch (err) {
          console.error("Error polling video status:", err);
        }
      }, 4000);

      // Store interval so we can cancel it
      set((state) => {
        const upload = state.uploads[lessonId];
        if (!upload) return state;
        return {
          uploads: { ...state.uploads, [lessonId]: { ...upload, pollingInterval: interval } }
        };
      });

    } catch (err: any) {
      if (err.message !== "ABORTED") {
        get().updateStatus(lessonId, 'Failed');
        toast.error(err.message || `خطأ أثناء رفع الفيديو "${file.name}".`);
      }
    }
  }
}));
