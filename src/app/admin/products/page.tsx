"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  Plus, Trash2, Edit2, Loader2, ImageIcon, 
  Video, FileText, Image as ImageIcon2, 
  Globe, Layout, ChevronRight, X, Save, UploadCloud, FileUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { generateSlug, calcDiscount, type Product } from "@/lib/products";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/lib/pricing";

// ── Helper: Safe Image Src ───────────────────────────────────────────
function safeImageSrc(src: string) {
  if (!src) return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800";
  if (src.startsWith("file://")) return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800";
  return src;
}

// ── Helper: Pack/Unpack Tags ───────────────────────────────────────────
function unpackProduct(p: Product) {
  // Extract ordered media: media:0:image:url, media:1:video:url, etc.
  const mediaTags = p.tags?.filter(t => t.startsWith("media:")) || [];
  const slides = Array(5).fill(null).map((_, i) => {
    const tag = mediaTags.find(t => t.startsWith(`media:${i}:`));
    if (tag) {
      const parts = tag.split(":");
      return { type: parts[2] as 'image' | 'video', url: parts.slice(3).join(":") };
    }
    // Fallback for legacy data
    if (i === 0) {
      const video_url = p.tags?.find(t => t.startsWith("video:"))?.replace("video:", "");
      if (video_url) return { type: 'video' as const, url: video_url };
      return { type: 'image' as const, url: p.image_url || "" };
    }
    const legacyGallery = p.tags?.filter(t => t.startsWith("gallery:"))?.map(t => t.replace("gallery:", "")) || [];
    if (legacyGallery[i - 1]) return { type: 'image' as const, url: legacyGallery[i - 1] };
    
    return { type: 'image' as const, url: "" };
  });

  const file_type = p.tags?.find(t => t.startsWith("type:"))?.replace("type:", "") || "zip";
  const normalTags = p.tags?.filter(t => !t.startsWith("media:") && !t.startsWith("video:") && !t.startsWith("gallery:") && !t.startsWith("type:")) || [];
  
  return {
    ...p,
    slides,
    file_type,
    displayTags: normalTags.join(", ")
  };
}

function packTags(form: any) {
  const tags: string[] = [];
  
  // Pack ordered media
  form.slides.forEach((slide: any, i: number) => {
    if (slide.url) {
      tags.push(`media:${i}:${slide.type}:${slide.url}`);
    }
  });

  // Keep legacy video:url for compatibility with existing components
  const firstVideo = form.slides.find((s: any) => s.type === 'video' && s.url);
  if (firstVideo) tags.push(`video:${firstVideo.url}`);

  if (form.file_type) tags.push(`type:${form.file_type}`);
  if (form.displayTags) {
    form.displayTags.split(",").forEach((t: string) => {
      const trimmed = t.trim();
      if (trimmed) tags.push(trimmed);
    });
  }
  return tags;
}

// ── File Upload Hook ──────────────────────────────────────────────────
function useFileUpload() {
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File, folder: string = "products") => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      return data.url;
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading };
}

// ── Product Form Dialog ────────────────────────────────────────────────
function ProductFormDialog({ open, onClose, onSaved, initial }: { open: boolean; onClose: () => void; onSaved: () => void; initial?: Product | null; }) {
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "media" | "files" | "seo">("general");
  const { upload, uploading } = useFileUpload();
  
  const [form, setForm] = useState<any>({
    title: "", slug: "", description: "", short_description: "",
    price: "", original_price: "", 
    price_egp: "", original_price_egp: "", price_usd: "", original_price_usd: "",
    status: "Active",
    image_url: "", file_url: "", category: "Automation", 
    slides: Array(5).fill(null).map(() => ({ type: 'image', url: '' })),
    file_type: "zip", displayTags: "",
    seo_title: "", seo_description: ""
  });

  const uploadRefs = [
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), 
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (initial) {
        const unpacked = unpackProduct(initial);
        setForm({
          title: unpacked.title, slug: unpacked.slug,
          description: unpacked.description || "", short_description: unpacked.short_description || "",
          price: String(unpacked.price || ""), original_price: String(unpacked.original_price || ""),
          price_egp: String(unpacked.price_egp !== undefined && unpacked.price_egp !== null ? unpacked.price_egp : unpacked.price || ""),
          original_price_egp: String(unpacked.original_price_egp !== undefined && unpacked.original_price_egp !== null ? unpacked.original_price_egp : unpacked.original_price || ""),
          price_usd: String(unpacked.price_usd !== undefined && unpacked.price_usd !== null ? unpacked.price_usd : ""),
          original_price_usd: String(unpacked.original_price_usd !== undefined && unpacked.original_price_usd !== null ? unpacked.original_price_usd : ""),
          status: unpacked.status === "نشط" ? "Active" : unpacked.status === "مسودة" ? "Draft" : unpacked.status === "مخفي" ? "Hidden" : unpacked.status, 
          is_featured: unpacked.is_featured,
          image_url: unpacked.image_url || "", file_url: unpacked.file_url || "",
          category: unpacked.category === "الأتمتة" ? "Automation" : unpacked.category === "الذكاء الاصطناعي" ? "Artificial Intelligence" : unpacked.category === "صناعة المحتوى" ? "Content Creation" : unpacked.category || "", 
          slides: unpacked.slides,
          file_type: unpacked.file_type,
          displayTags: unpacked.displayTags,
          seo_title: unpacked.seo_title || "",
          seo_description: unpacked.seo_description || ""
        });
      } else {
        setForm({
          title: "", slug: "", description: "", short_description: "",
          price: "", original_price: "", status: "Active",
          price_egp: "", original_price_egp: "", price_usd: "", original_price_usd: "",
          is_featured: false, image_url: "", file_url: "", category: "Automation", 
          video_url: "", gallery: [""], file_type: "zip", displayTags: "",
          seo_title: "", seo_description: ""
        });
      }
      setActiveTab("general");
    }
  }, [open, initial]);

  async function handleSave() {
    if (!form.title.trim()) { toast.error("Product title is required"); return; }
    if (!form.price || isNaN(Number(form.price))) { toast.error("Price is invalid"); return; }

    setSaving(true);
    const price_egp = form.price_egp ? parseFloat(form.price_egp) : (parseFloat(form.price) || 0);
    const original_price_egp = form.original_price_egp ? parseFloat(form.original_price_egp) : (form.original_price ? parseFloat(form.original_price) : null);
    const price_usd = form.price_usd ? parseFloat(form.price_usd) : 0;
    const original_price_usd = form.original_price_usd ? parseFloat(form.original_price_usd) : null;
    
    // Determine primary image for the database column
    let finalImageUrl = form.image_url || "";
    if (!finalImageUrl) {
      const primarySlide = form.slides[0];
      finalImageUrl = primarySlide && primarySlide.type === 'image' ? primarySlide.url : "";
    }
    if (!finalImageUrl) {
      const firstImg = form.slides.find((s: any) => s.type === 'image' && s.url);
      finalImageUrl = firstImg ? firstImg.url : "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800";
    }

    const mappedStatus = form.status === "Active" ? "نشط" : form.status === "Draft" ? "مسودة" : "مخفي";
    const mappedCategory = form.category === "Automation" ? "الأتمتة" : form.category === "Artificial Intelligence" ? "الذكاء الاصطناعي" : "صناعة المحتوى";

    const payload = {
      title: form.title.trim(),
      slug: form.slug || generateSlug(form.title),
      description: form.description,
      short_description: form.short_description,
      price: price_egp,
      original_price: original_price_egp,
      price_egp,
      original_price_egp,
      price_usd,
      original_price_usd,
      discount_pct: calcDiscount(price_egp, original_price_egp),
      status: mappedStatus,
      is_featured: form.is_featured,
      image_url: finalImageUrl,
      file_url: form.file_url || null,
      category: mappedCategory,
      tags: packTags(form),
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null
    };

    try {
      if (initial) {
        const { error } = await supabase.from("products").update(payload).eq("id", initial.id);
        if (error) throw error;
        toast.success("Product updated successfully!");
      } else {
        const { error } = await supabase.from("products").insert({ ...payload, sales: 0, views: 0 });
        if (error) throw error;
        toast.success("Product added successfully!");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "An error occurred while saving");
    } finally {
      setSaving(false);
    }
  }

  const handleSlideUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const url = await upload(file);
    if (url) {
      const newSlides = [...form.slides];
      newSlides[index].url = url;
      setForm({ ...form, slides: newSlides });
      toast.success("Uploaded successfully!");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await upload(file);
    if (url) {
      setForm({ ...form, file_url: url });
      toast.success("File uploaded successfully!");
    }
  };

  const updateSlide = (index: number, updates: any) => {
    const newSlides = [...form.slides];
    newSlides[index] = { ...newSlides[index], ...updates };
    setForm({ ...form, slides: newSlides });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="border-white/8 text-white sm:max-w-4xl max-h-[95vh] overflow-hidden p-0 rounded-[2rem]" style={{ background: "#080810", border: "1px solid rgba(255,255,255,0.08)" }} dir="ltr">
        <div className="flex h-full min-h-[600px] text-left">
          {/* Sidebar Tabs */}
          <div className="w-64 border-r border-white/5 bg-black/20 p-6 flex flex-col gap-2">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-xl pl-2 text-white">
                {initial ? "Edit Product" : "New Product"}
              </DialogTitle>
            </DialogHeader>
            
            {[
              { id: "general", label: "General Info", icon: Layout },
              { id: "media", label: "Media & Gallery", icon: Video },
              { id: "files", label: "Digital Files", icon: FileText },
              { id: "seo", label: "SEO Settings", icon: Globe },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer",
                  activeTab === tab.id 
                    ? "bg-[#D6004B] text-white shadow-lg shadow-[#D6004B]/20" 
                    : "text-zinc-500 hover:text-white hover:bg-white/5"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}

            <div className="mt-auto pt-6 border-t border-white/5">
               <button
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-zinc-500 hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {activeTab === "general" && (
                    <div className="grid gap-6">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-bold" style={{ color: "#d4d4d8" }}>Product Title *</Label>
                        <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="h-12 rounded-xl text-white border-white/10" style={{ background: "rgba(255,255,255,0.05)" }} placeholder="e.g. n8n Professional Templates Bundle" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-sm font-bold text-rose-400">Price in EGP *</Label>
                          <Input type="number" value={form.price_egp} onChange={e => setForm({...form, price_egp: e.target.value, price: e.target.value})} className="h-12 rounded-xl text-white border-white/10" style={{ background: "rgba(255,255,255,0.05)" }} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm font-bold text-zinc-400">Original Price (EGP)</Label>
                          <Input type="number" value={form.original_price_egp} onChange={e => setForm({...form, original_price_egp: e.target.value, original_price: e.target.value})} className="h-12 rounded-xl text-white border-white/10" style={{ background: "rgba(255,255,255,0.05)" }} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-sm font-bold text-emerald-400">Price in USD *</Label>
                          <Input type="number" value={form.price_usd} onChange={e => setForm({...form, price_usd: e.target.value})} className="h-12 rounded-xl text-white border-white/10" style={{ background: "rgba(255,255,255,0.05)" }} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm font-bold text-zinc-400">Original Price (USD)</Label>
                          <Input type="number" value={form.original_price_usd} onChange={e => setForm({...form, original_price_usd: e.target.value})} className="h-12 rounded-xl text-white border-white/10" style={{ background: "rgba(255,255,255,0.05)" }} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-sm font-bold" style={{ color: "#d4d4d8" }}>Status</Label>
                          <select value={form.status} onChange={e => setForm({...form, status: e.target.value as any})} className="w-full h-12 rounded-xl px-4 text-white appearance-none outline-none border border-white/10 cursor-pointer" style={{ background: "rgba(255,255,255,0.05)" }}>
                            <option value="Active" className="bg-[#080810]">Active (Visible in store)</option>
                            <option value="Draft" className="bg-[#080810]">Draft (Internal preview)</option>
                            <option value="Hidden" className="bg-[#080810]">Hidden (Completely invisible)</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm font-bold" style={{ color: "#d4d4d8" }}>Category</Label>
                          <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full h-12 rounded-xl px-4 text-white appearance-none outline-none border border-white/10 cursor-pointer" style={{ background: "rgba(255,255,255,0.05)" }}>
                            <option value="Automation" className="bg-[#080810]">Automation</option>
                            <option value="Artificial Intelligence" className="bg-[#080810]">Artificial Intelligence</option>
                            <option value="Content Creation" className="bg-[#080810]">Content Creation</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-bold" style={{ color: "#d4d4d8" }}>Short Description</Label>
                        <Input value={form.short_description} onChange={e => setForm({...form, short_description: e.target.value})} className="h-12 rounded-xl text-white border-white/10" style={{ background: "rgba(255,255,255,0.05)" }} placeholder="Appears directly below the title" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-bold" style={{ color: "#d4d4d8" }}>Full Description</Label>
                        <textarea 
                          value={form.description} 
                          onChange={e => setForm({...form, description: e.target.value})} 
                          rows={6}
                          className="w-full p-4 rounded-xl text-white text-sm outline-none resize-none border border-white/10" 
                          style={{ background: "rgba(255,255,255,0.05)" }}
                          placeholder="Write a detailed description of the product..."
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === "media" && (
                    <div className="space-y-8">
                      <div className="space-y-3 bg-white/[0.02] border border-white/5 p-6 rounded-[2rem]">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-rose-500" />
                          <h4 className="font-bold text-white text-sm">Product Cover Image (Main thumbnail display)</h4>
                        </div>
                        <p className="text-zinc-500 text-xs font-sans">This image will display store-wide on product catalogs in place of auto-playing videos.</p>
                        <div className="flex gap-3">
                          <Input 
                            value={form.image_url} 
                            onChange={e => setForm({...form, image_url: e.target.value})} 
                            className="h-12 rounded-xl text-white flex-1 border-white/10" 
                            style={{ background: "rgba(255,255,255,0.05)" }} 
                            placeholder="Cover Image URL..." 
                          />
                          <Button
                            onClick={async () => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = "image/*";
                              input.onchange = async (e: any) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = await upload(file);
                                  if (url) {
                                    setForm((prev: any) => ({ ...prev, image_url: url }));
                                    toast.success("Cover image uploaded successfully!");
                                  }
                                }
                              };
                              input.click();
                            }}
                            type="button"
                            className="h-12 px-6 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2 cursor-pointer"
                          >
                            <UploadCloud className="w-4 h-4" />
                            <span>Upload Image</span>
                          </Button>
                        </div>
                        {form.image_url && (
                          <div className="relative w-32 aspect-video rounded-xl overflow-hidden border border-white/10 mt-2">
                            <Image src={form.image_url} alt="Cover Preview" fill className="object-cover" />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {form.slides.map((slide: any, idx: number) => (
                          <div 
                            key={idx} 
                            className={cn(
                              "relative group flex flex-col gap-3 p-4 rounded-[2rem] border transition-all duration-500",
                              idx === 0 ? "md:col-span-2 border-rose-600/30 bg-rose-600/5 shadow-2xl shadow-rose-600/10" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <Badge className={cn(
                                "text-[8px] font-black uppercase tracking-widest",
                                idx === 0 ? "bg-rose-600 text-white" : "bg-zinc-800 text-zinc-400"
                              )}>
                                {idx === 0 ? "Primary Display" : `Slide ${idx + 1}`}
                              </Badge>
                              <div className="flex bg-black/40 p-1 rounded-full border border-white/5">
                                <button 
                                  onClick={() => updateSlide(idx, { type: 'image' })}
                                  className={cn("p-1.5 rounded-full transition-all cursor-pointer", slide.type === 'image' ? "bg-rose-600 text-white" : "text-zinc-500 hover:text-white")}
                                >
                                  <ImageIcon2 className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={() => updateSlide(idx, { type: 'video' })}
                                  className={cn("p-1.5 rounded-full transition-all cursor-pointer", slide.type === 'video' ? "bg-rose-600 text-white" : "text-zinc-500 hover:text-white")}
                                >
                                  <Video className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <div 
                              onClick={() => uploadRefs[idx].current?.click()}
                              className={cn(
                                "relative aspect-video rounded-2xl overflow-hidden cursor-pointer border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 group-hover:border-rose-600/50 transition-all",
                                slide.url ? "border-solid border-transparent" : "bg-black/20"
                              )}
                            >
                              {slide.url ? (
                                <>
                                  {slide.type === 'image' ? (
                                    <Image src={slide.url} alt="preview" fill className="object-cover" />
                                  ) : (
                                    <video src={slide.url} className="w-full h-full object-cover" muted playsInline />
                                  )}
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                     <UploadCloud className="w-6 h-6 text-white" />
                                     <span className="text-[10px] font-bold text-white uppercase">Replace Asset</span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-rose-600/20 transition-colors">
                                    <UploadCloud className="w-5 h-5 text-zinc-500 group-hover:text-rose-500" />
                                  </div>
                                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Click to Upload</span>
                                </>
                              )}
                              <input 
                                type="file" 
                                ref={uploadRefs[idx]} 
                                className="hidden" 
                                accept={slide.type === 'image' ? "image/*" : "video/*"} 
                                onChange={(e) => handleSlideUpload(e, idx)} 
                              />
                            </div>

                            <div className="space-y-1.5 mt-2">
                              <Label className="text-[10px] font-bold text-zinc-500">Direct {slide.type === 'image' ? 'Image' : 'Video'} URL</Label>
                              <Input 
                                value={slide.url} 
                                onChange={e => updateSlide(idx, { url: e.target.value })} 
                                dir="ltr" 
                                className="h-9 rounded-xl text-[11px] text-white border-white/10" 
                                style={{ background: "rgba(255,255,255,0.05)" }} 
                                placeholder="https://..." 
                              />
                            </div>
                            
                            {slide.url && (
                              <button 
                                onClick={() => updateSlide(idx, { url: '' })}
                                className="absolute -top-2 -right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "files" && (
                    <div className="grid gap-6">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-emerald-500" />
                            <Label className="text-sm font-bold" style={{ color: "#d4d4d8" }}>Digital Deliverable File URL</Label>
                          </div>
                           <button 
                            onClick={() => fileRef.current?.click()} 
                            disabled={uploading}
                            className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 hover:underline cursor-pointer"
                           >
                              <FileUp className="w-3.5 h-3.5" />
                              Upload Deliverable
                           </button>
                           <input type="file" ref={fileRef} className="hidden" onChange={(e) => handleFileUpload(e)} />
                        </div>
                        <Input value={form.file_url} onChange={e => setForm({...form, file_url: e.target.value})} dir="ltr" className="h-12 rounded-xl text-white border-white/10" style={{ background: "rgba(255,255,255,0.05)" }} placeholder="Direct download URL..." />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-sm font-bold" style={{ color: "#d4d4d8" }}>File Type Extension</Label>
                          <select value={form.file_type} onChange={e => setForm({...form, file_type: e.target.value})} className="w-full h-12 rounded-xl px-4 text-white outline-none appearance-none border border-white/10 cursor-pointer" style={{ background: "rgba(255,255,255,0.05)" }}>
                            <option value="zip" className="bg-[#080810]">ZIP / Archive</option>
                            <option value="pdf" className="bg-[#080810]">PDF Document</option>
                            <option value="json" className="bg-[#080810]">JSON File</option>
                            <option value="video" className="bg-[#080810]">MP4 Video</option>
                            <option value="link" className="bg-[#080810]">External Link</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm font-bold" style={{ color: "#d4d4d8" }}>Search Keywords (Tags)</Label>
                          <Input value={form.displayTags} onChange={e => setForm({...form, displayTags: e.target.value})} className="h-12 rounded-xl text-white border-white/10" style={{ background: "rgba(255,255,255,0.05)" }} placeholder="template, n8n, automation" />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "seo" && (
                    <div className="grid gap-6">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-bold" style={{ color: "#d4d4d8" }}>Meta Title (SEO)</Label>
                        <Input value={form.seo_title} onChange={e => setForm({...form, seo_title: e.target.value})} className="h-12 rounded-xl text-white border-white/10" style={{ background: "rgba(255,255,255,0.05)" }} placeholder="Displayed on search engine indexes" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-bold" style={{ color: "#d4d4d8" }}>Meta Description (SEO)</Label>
                        <textarea 
                          value={form.seo_description} 
                          onChange={e => setForm({...form, seo_description: e.target.value})} 
                          rows={4}
                          className="w-full p-4 rounded-xl text-white text-sm outline-none resize-none border border-white/10" 
                          style={{ background: "rgba(255,255,255,0.05)" }}
                          placeholder="Brief synopsis..."
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Buttons */}
            <div className="p-8 border-t border-white/5 flex items-center justify-between bg-black/20">
               <div className="text-xs text-zinc-600">
                  {uploading ? (
                    <span className="text-rose-500 flex items-center gap-2 animate-pulse">
                      <Loader2 className="w-4 h-4 animate-spin" /> Uploading file...
                    </span>
                  ) : "* Indicated fields are mandatory"}
               </div>
               <Button 
                onClick={handleSave} 
                disabled={saving || uploading} 
                className="h-14 px-10 rounded-2xl font-black text-lg transition-all active:scale-95 cursor-pointer"
                style={{ 
                  background: "linear-gradient(135deg, #D6004B, #ff2d6b)", 
                  boxShadow: "0 8px 32px rgba(214,0,75,0.4)",
                  color: "#ffffff"
                }}
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving Changes...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    Save Product Asset
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete Dialog ────────────────────────────────────────────────────────
function DeleteDialog({ product, onClose, onDeleted }: { product: Product; onClose: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false);
  async function handleDelete() {
    setDeleting(true);
    try {
      const { error } = await supabase.from("products").delete().eq("id", product.id);
      if (error) throw error;
      toast.success("Deleted successfully!");
      onDeleted();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  }
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#080810] border-red-500/20 text-white sm:max-w-md rounded-[2rem] p-8" dir="ltr">
        <DialogHeader><DialogTitle className="text-red-500 text-xl font-bold">Delete Product Permanently</DialogTitle></DialogHeader>
        <p className="py-6 text-zinc-400 leading-relaxed text-left">Are you sure you want to permanently delete <span className="text-white font-bold">"{product.title}"</span>?</p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1 h-12 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer">Cancel</Button>
          <Button onClick={handleDelete} disabled={deleting} variant="destructive" className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 cursor-pointer">
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page Component ──────────────────────────────────────────────────
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [addOpen, setAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const hasFetched = useRef(false);

  async function fetchProducts() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data as Product[]);
    } catch (err: any) {
      console.error("[FETCH_ERROR]", err);
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchProducts();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 p-2 md:p-4 text-left font-sans" style={{ minHeight: "100vh" }} dir="ltr">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Digital Products Hub</h1>
          <p className="text-zinc-500 text-sm mt-1">Cumulative {products.length} registered digital products in database</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-6 h-12 rounded-2xl font-bold text-white transition-all active:scale-95 cursor-pointer"
          style={{ background: "linear-gradient(135deg, #D6004B, #ff2d6b)", boxShadow: "0 8px 32px rgba(214,0,75,0.35)" }}
        >
          <Plus className="w-5 h-5" /> Create Product
        </button>
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-[2.5rem]" style={{ background: "rgba(16,16,26,0.8)", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                <TableHead className="py-6 pl-8 text-xs uppercase tracking-widest font-black text-zinc-500">Product Asset</TableHead>
                <TableHead className="text-xs uppercase tracking-widest font-black text-zinc-500">Price & Currency</TableHead>
                <TableHead className="text-xs uppercase tracking-widest font-black text-zinc-500">Total Sales</TableHead>
                <TableHead className="text-xs uppercase tracking-widest font-black text-zinc-500">Status</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5">
                    <TableCell className="py-6 pl-8 animate-pulse"><div className="h-10 w-full bg-white/5 rounded" /></TableCell>
                    <TableCell><div className="h-4 w-16 bg-white/5 rounded" /></TableCell>
                    <TableCell><div className="h-4 w-8 bg-white/5 rounded" /></TableCell>
                    <TableCell><div className="h-6 w-16 bg-white/5 rounded" /></TableCell>
                    <TableCell />
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center text-zinc-600">No digital products registered yet.</TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <TableCell className="py-5 pl-8">
                      <div className="flex items-center gap-5 text-left">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-800 relative overflow-hidden shrink-0 flex items-center justify-center border border-white/5">
                          {(() => {
                            const videoUrl = p.tags?.find(t => t.startsWith("video:"))?.replace("video:", "");
                            const isYouTube = videoUrl?.includes("youtube.com") || videoUrl?.includes("youtu.be");
                            const ytId = isYouTube ? (videoUrl?.split('v=')[1]?.split('&')[0] || videoUrl?.split('/').pop()) : null;

                            if (isYouTube && ytId) {
                              return (
                                <Image 
                                  src={`https://img.youtube.com/vi/${ytId}/default.jpg`}
                                  alt={p.title}
                                  fill
                                  className="object-cover"
                                />
                              );
                            } else if (videoUrl) {
                              return (
                                <div className="relative w-full h-full">
                                  <video 
                                    src={`${videoUrl}#t=0.1`}
                                    className="w-full h-full object-cover"
                                    muted
                                    playsInline
                                    preload="metadata"
                                  />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <span className="text-[7px] font-bold bg-rose-600 text-white px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-lg">Video</span>
                                  </div>
                                </div>
                              );
                            } else if (p.image_url) {
                              return (
                                <Image 
                                  src={safeImageSrc(p.image_url)} 
                                  alt={p.title} 
                                  fill 
                                  className="object-cover" 
                                  sizes="56px" 
                                  unoptimized={p.image_url.startsWith("file://")}
                                />
                              );
                            } else {
                              return <ImageIcon className="w-6 h-6 text-zinc-600" />;
                            }
                          })()}
                        </div>
                        <div>
                          <div className="font-bold text-white text-base group-hover:text-rose-500 transition-colors">{p.title}</div>
                          {p.short_description && <div className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">{p.short_description}</div>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-white">
                      <div className="text-rose-400">{formatPrice(Number(p.price_egp || p.price), 'EGP').replace("ج.م", "L.E")}</div>
                      <div className="text-emerald-400 text-[10px]">${p.price_usd || 0}</div>
                    </TableCell>
                    <TableCell className="text-zinc-400 font-bold">{p.sales || 0}</TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "px-3 py-1 rounded-lg border-none",
                        p.status === 'نشط' || p.status === 'Active' ? "bg-emerald-500/10 text-emerald-400" :
                        p.status === 'مسودة' || p.status === 'Draft' ? "bg-amber-500/10 text-amber-400" :
                        "bg-zinc-800 text-zinc-500"
                      )}>
                        {p.status === 'نشط' ? 'Active' : p.status === 'مسودة' ? 'Draft' : p.status === 'مخفي' ? 'Hidden' : p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-8">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-10 w-10 flex items-center justify-center rounded-xl text-zinc-500 hover:bg-white/10 hover:text-white transition-all outline-none cursor-pointer">
                          <ChevronRight className="w-5 h-5 rotate-90" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#0d0d1a] border-white/10 p-2 rounded-2xl">
                          <DropdownMenuItem onClick={() => setEditProduct(p)} className="cursor-pointer text-zinc-300 hover:bg-white/5 rounded-xl p-3 gap-3">
                            <Edit2 className="w-4 h-4 text-rose-500" /> Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteProduct(p)} className="cursor-pointer text-red-400 hover:bg-red-500/10 rounded-xl p-3 gap-3">
                            <Trash2 className="w-4 h-4" /> Delete Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ProductFormDialog open={addOpen} onClose={() => setAddOpen(false)} onSaved={fetchProducts} />
      {editProduct && <ProductFormDialog open initial={editProduct} onClose={() => setEditProduct(null)} onSaved={fetchProducts} />}
      {deleteProduct && <DeleteDialog product={deleteProduct} onClose={() => setDeleteProduct(null)} onDeleted={fetchProducts} />}
    </div>
  );
}
