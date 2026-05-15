"use client";

import { supabase } from "@/lib/supabase";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form States
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [status, setStatus] = useState("نشط");
  const [isFeatured, setIsFeatured] = useState(false);
  const [fileUrl, setFileUrl] = useState(""); // New state for real file URL
  
  // Media & Files States
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [digitalFiles, setDigitalFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const digitalFilesRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast.error("فشل تحميل المنتجات من قاعدة البيانات");
    } finally {
      setIsLoading(false);
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDigitalFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // For now we still simulate upload progress, 
      // but we encourage users to provide a direct link (e.g. Google Drive/Dropbox/S3)
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setDigitalFiles(prevFiles => [...prevFiles, ...files]);
            toast.success(`تم رفع ${files.length} ملفات (محلياً للمعاينة)`);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
  };

  const removeDigitalFile = (index: number) => {
    setDigitalFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FileText className="w-8 h-8 text-red-500" />;
    if (type.includes("zip") || type.includes("rar")) return <FileArchive className="w-8 h-8 text-amber-500" />;
    if (type.includes("json")) return <FileJson className="w-8 h-8 text-blue-500" />;
    if (type.includes("video")) return <PlayCircle className="w-8 h-8 text-emerald-500" />;
    return <FileText className="w-8 h-8 text-zinc-400" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleAddProduct = async () => {
    if (!title || !price) {
      toast.error("الرجاء إدخال اسم المنتج والسعر");
      return;
    }

    try {
      const { error } = await supabase.from("products").insert({
        title,
        price: parseFloat(price),
        original_price: parseFloat(originalPrice) || null,
        status,
        image_url: imagePreview || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800",
        is_featured: isFeatured,
        file_url: fileUrl,
      });

      if (error) throw error;
      
      toast.success("تم إضافة المنتج بنجاح");
      fetchProducts();
      resetForm();
      setIsAddOpen(false);
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء الحفظ");
    }
  };

  const handleEditProduct = async () => {
    if (!title || !price || !editingProduct) return;

    try {
      const { error } = await supabase
        .from("products")
        .update({
          title,
          price: parseFloat(price),
          original_price: parseFloat(originalPrice) || null,
          status,
          image_url: imagePreview,
          is_featured: isFeatured,
          file_url: fileUrl,
        })
        .eq("id", editingProduct.id);

      if (error) throw error;

      toast.success("تم تحديث المنتج بنجاح");
      fetchProducts();
      resetForm();
      setIsEditOpen(false);
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء التحديث");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      try {
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) throw error;
        toast.success("تم حذف المنتج");
        fetchProducts();
      } catch (error: any) {
        toast.error("فشل الحذف");
      }
    }
  };

  const openEditDialog = (product: any) => {
    setEditingProduct(product);
    setTitle(product.title);
    setPrice(product.price.toString());
    setOriginalPrice(product.original_price?.toString() || "");
    setStatus(product.status);
    setIsFeatured(product.is_featured || false);
    setImagePreview(product.image_url);
    setFileUrl(product.file_url || "");
    setDigitalFiles([]);
    setUploadProgress(0);
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setTitle("");
    setPrice("");
    setOriginalPrice("");
    setStatus("نشط");
    setIsFeatured(false);
    setFileUrl("");
    setImagePreview(null);
    setDigitalFiles([]);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (digitalFilesRef.current) digitalFilesRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-alexandria font-bold text-zinc-900">إدارة المنتجات الرقمية</h1>
        
        {/* ADD PRODUCT DIALOG */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 text-white font-cairo">
              <Plus className="w-4 h-4 mr-2" />
              إضافة منتج جديد
            </Button>
          } />
          <DialogContent className="bg-white border-zinc-200 text-zinc-900 sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-alexandria text-xl">منتج رقمي جديد</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4 font-cairo">
              <div className="space-y-2">
                <Label className="text-zinc-600">اسم المنتج</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: حزمة أتمتة المبيعات" className="bg-white border-zinc-200 focus-visible:ring-blue-500 text-zinc-900" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-600">السعر (ج.م)</Label>
                  <Input value={price} onChange={e => setPrice(e.target.value)} type="number" placeholder="49.00" className="bg-white border-zinc-200 focus-visible:ring-blue-500 text-zinc-900" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-600">السعر قبل الخصم (ج.م)</Label>
                  <Input value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} type="number" placeholder="99.00" className="bg-white border-zinc-200 focus-visible:ring-blue-500 text-zinc-900" dir="ltr" />
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-2">
                <Label className="text-zinc-600">صورة الغلاف (Thumbnail)</Label>
                <div 
                  className="border-2 border-dashed border-zinc-200 rounded-xl p-8 text-center hover:bg-zinc-50 transition-colors cursor-pointer relative overflow-hidden group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                  {imagePreview ? (
                    <Image src={imagePreview} alt="Preview" fill className="object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-zinc-300 mx-auto mb-2 group-hover:text-blue-600 transition-colors" />
                  )}
                  <p className="text-zinc-500 font-cairo text-sm relative z-10">اضغط لرفع صورة العرض</p>
                </div>
              </div>

              {/* Digital Files Drag & Drop Upload */}
              <div className="space-y-2">
                <Label className="text-zinc-600">الملفات الرقمية للتسليم (PDF, ZIP, JSON)</Label>
                <div 
                  className="border-2 border-dashed border-blue-200 bg-blue-50 rounded-xl p-8 text-center hover:bg-blue-100 transition-colors cursor-pointer"
                  onClick={() => digitalFilesRef.current?.click()}
                >
                  <input type="file" ref={digitalFilesRef} className="hidden" multiple accept=".pdf,.zip,.rar,.json,.mp4" onChange={handleDigitalFilesChange} />
                  <UploadCloud className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                  <p className="text-blue-700 font-cairo font-bold">اسحب الملفات هنا أو اضغط للرفع</p>
                  <p className="text-zinc-500 font-cairo text-xs mt-2">الحد الأقصى 500MB للملف الواحد</p>
                </div>

                {/* Upload Progress */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-zinc-100 rounded-full h-2 mt-4 overflow-hidden">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                )}

                {/* Digital Delivery Link */}
                <div className="mt-6 space-y-2">
                  <Label className="text-blue-700 font-bold">رابط الملف الفعلي (Google Drive / Dropbox / S3)</Label>
                  <Input 
                    value={fileUrl} 
                    onChange={e => setFileUrl(e.target.value)} 
                    placeholder="https://drive.google.com/..." 
                    className="bg-white border-blue-100 focus-visible:ring-blue-500 text-zinc-900" 
                    dir="ltr"
                  />
                  <p className="text-[10px] text-zinc-400">هذا الرابط هو ما سيتم إرساله للعميل تلقائياً بعد الدفع الناجح.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-600">حالة المنتج</Label>
                  <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value)}
                    className="w-full h-10 rounded-md bg-white border border-zinc-200 text-zinc-900 font-cairo px-3 focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    <option value="نشط">نشط (مرئي)</option>
                    <option value="مسودة">مسودة (مخفي)</option>
                  </select>
                </div>
                <div className="space-y-2 flex flex-col justify-end">
                  <div className="flex items-center space-x-2 space-x-reverse h-10">
                    <input 
                      type="checkbox" 
                      id="featured" 
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-300 bg-white text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="featured" className="text-zinc-600 cursor-pointer">تمييز كالأكثر مبيعاً</Label>
                  </div>
                </div>
              </div>

            </div>
            <DialogFooter>
              <DialogClose render={
                <Button variant="ghost" className="text-zinc-500 hover:text-zinc-900 font-cairo">إلغاء</Button>
              } />
              <Button onClick={handleAddProduct} className="bg-blue-600 hover:bg-blue-700 text-white font-cairo">حفظ المنتج</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white border-zinc-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow className="border-zinc-200 hover:bg-transparent">
              <TableHead className="font-cairo text-zinc-500 text-right">المنتج</TableHead>
              <TableHead className="font-cairo text-zinc-500 text-right">السعر</TableHead>
              <TableHead className="font-cairo text-zinc-500 text-right">المبيعات</TableHead>
              <TableHead className="font-cairo text-zinc-500 text-right">الحالة</TableHead>
              <TableHead className="font-cairo text-zinc-500 text-right">الملفات</TableHead>
              <TableHead className="text-left"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="border-zinc-200 hover:bg-zinc-50/50 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-zinc-100 relative overflow-hidden shrink-0 border border-zinc-200">
                      <Image 
                        src={product.image || product.img} 
                        alt="Product" 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-cairo font-bold text-zinc-900 flex items-center gap-2">
                        {product.title || product.name}
                        {product.isFeatured && <Badge className="bg-blue-50 text-blue-600 text-[10px] px-1.5 py-0 border-blue-100">مميز</Badge>}
                      </div>
                      <div className="text-xs text-zinc-400 font-cairo mt-1">ID: {product.id}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-zinc-900 font-sans">{product.price} ج.م</TableCell>
                <TableCell className="text-zinc-600">{product.sales}</TableCell>
                <TableCell>
                  <Badge className={
                    product.status === "نشط" 
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" 
                      : "bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200"
                  }>
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {product.file_url ? (
                      <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-sans">Ready for Delivery</Badge>
                    ) : (
                      <span className="text-zinc-400 text-xs">رابط مفقود</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-left">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-900">
                        <span className="sr-only">فتح القائمة</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    } />
                    <DropdownMenuContent align="end" className="bg-white border-zinc-200 font-cairo shadow-lg">
                      <DropdownMenuItem onClick={() => openEditDialog(product)} className="text-zinc-700 hover:bg-zinc-50 focus:bg-zinc-50 cursor-pointer">
                        <Edit className="w-4 h-4 ml-2" />
                        تعديل
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:bg-red-50 focus:bg-red-50 cursor-pointer">
                        <Trash2 className="w-4 h-4 ml-2" />
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-zinc-400 font-cairo">
                  لا توجد منتجات حالياً.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* EDIT PRODUCT DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-white border-zinc-200 text-zinc-900 sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-alexandria text-xl">تعديل المنتج</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4 font-cairo">
            <div className="space-y-2">
              <Label className="text-zinc-600">اسم المنتج</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} className="bg-white border-zinc-200 focus-visible:ring-blue-500 text-zinc-900" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-600">السعر ($)</Label>
                <Input value={price} onChange={e => setPrice(e.target.value)} type="number" className="bg-white border-zinc-200 focus-visible:ring-blue-500 text-zinc-900" dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-600">السعر قبل الخصم ($)</Label>
                <Input value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} type="number" className="bg-white border-zinc-200 focus-visible:ring-blue-500 text-zinc-900" dir="ltr" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-600">صورة الغلاف (Thumbnail)</Label>
              <div 
                className="border-2 border-dashed border-zinc-200 rounded-xl p-8 text-center hover:bg-zinc-50 transition-colors cursor-pointer relative overflow-hidden group"
                onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                {imagePreview ? (
                  <Image src={imagePreview} alt="Preview" fill className="object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-zinc-300 mx-auto mb-2 group-hover:text-blue-600 transition-colors" />
                )}
                <p className="text-zinc-500 font-cairo text-sm relative z-10">اضغط لتغيير الصورة</p>
              </div>
            </div>

            {/* Digital Files Drag & Drop Upload */}
            <div className="space-y-2">
              <Label className="text-zinc-600">إضافة/تحديث الملفات الرقمية</Label>
              <div 
                className="border-2 border-dashed border-blue-200 bg-blue-50 rounded-xl p-6 text-center hover:bg-blue-100 transition-colors cursor-pointer"
                onClick={() => digitalFilesRef.current?.click()}
              >
                <input type="file" ref={digitalFilesRef} className="hidden" multiple accept=".pdf,.zip,.rar,.json,.mp4" onChange={handleDigitalFilesChange} />
                <UploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-blue-700 font-cairo font-bold text-sm">اسحب الملفات هنا أو اضغط للرفع</p>
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-zinc-100 rounded-full h-2 mt-4 overflow-hidden">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}

              {/* Uploaded Files List */}
              {digitalFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {digitalFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.type || file.name)}
                        <div>
                          <p className="text-zinc-900 text-sm font-cairo font-bold truncate max-w-[200px]" dir="ltr">{file.name}</p>
                          <p className="text-zinc-500 text-xs font-cairo">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button onClick={() => removeDigitalFile(idx)} className="text-zinc-400 hover:text-red-600 transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-600">حالة المنتج</Label>
                <select 
                  value={status} 
                  onChange={e => setStatus(e.target.value)}
                  className="w-full h-10 rounded-md bg-white border border-zinc-200 text-zinc-900 font-cairo px-3 focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="نشط">نشط (مرئي)</option>
                  <option value="مسودة">مسودة (مخفي)</option>
                </select>
              </div>
              <div className="space-y-2 flex flex-col justify-end">
                <div className="flex items-center space-x-2 space-x-reverse h-10">
                  <input 
                    type="checkbox" 
                    id="edit_featured" 
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-300 bg-white text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="edit_featured" className="text-zinc-600 cursor-pointer">تمييز كالأكثر مبيعاً</Label>
                </div>
              </div>
            </div>

          </div>
          <DialogFooter>
            <DialogClose render={
              <Button variant="ghost" className="text-zinc-500 hover:text-zinc-900 font-cairo">إلغاء</Button>
            } />
            <Button onClick={handleEditProduct} className="bg-blue-600 hover:bg-blue-700 text-white font-cairo">حفظ التغييرات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
