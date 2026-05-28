import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Save, Loader2, Image as ImageIcon, Upload } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { useRef, useState as useReactState } from "react";

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState("General");
  const { data: content, isLoading, refetch } = trpc.siteContent.getAll.useQuery();
  const updateMutation = trpc.siteContent.update.useMutation();
  const uploadImage = trpc.products.uploadImage.useMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-[#C9A227]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const categories = Array.from(new Set(content?.map((c) => c.category) || []));
  const activeFields = content?.filter((c) => c.category === activeTab) || [];

  const handleValueChange = (key: string, value: string) => {
    setPendingChanges((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (key: string) => {
    const value = pendingChanges[key];
    if (value === undefined) return;

    try {
      await updateMutation.mutateAsync({ key, value });
      toast.success("Content updated successfully");
      refetch();
      };
    } catch (err: any) {
      toast.error(err.message || "Failed to update content");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(key);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const { url } = await uploadImage.mutateAsync({ filename: file.name, contentType: file.type, dataUrl });
      
      handleValueChange(key, url);
      toast.success("Image uploaded!");
    } catch {
      toast.error("Failed to upload image.");
    } finally {
      setUploadingField(null);
      if (e.target) e.target.value = "";
    }
  };

  return (
    <AdminLayout>
      <h1 className="font-cinzel text-[#F5F0EB] text-3xl mb-8" style={{ fontFamily: "Cinzel, serif" }}>
        Content Manager
      </h1>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2 border-b border-[#2D1A0E]">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-4 py-2 font-semibold text-sm transition-colors whitespace-nowrap ${
              activeTab === cat
                ? "text-[#C9A227] border-b-2 border-[#C9A227]"
                : "text-[#8D6E63] hover:text-[#F5F0EB]"
            }`}
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {cat} Settings
          </button>
        ))}
      </div>

      <div className="space-y-6 max-w-4xl">
        {activeFields.map((field) => {
          const currentValue = pendingChanges[field.key] ?? field.value ?? "";
          const isChanged = pendingChanges[field.key] !== undefined && pendingChanges[field.key] !== field.value;

          return (
            <div key={field.key} className="bg-[#2D1A0E]/30 p-6 rounded-lg border border-[#2D1A0E]">
              <div className="flex justify-between items-start mb-2">
                <label className="text-[#F5F0EB] font-semibold text-sm tracking-wide" style={{ fontFamily: "Inter, sans-serif" }}>
                  {field.label}
                </label>
                {isChanged && (
                  <button
                    onClick={() => handleSave(field.key)}
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C9A227] text-[#1A1008] text-xs font-semibold rounded hover:bg-[#D4B03A] transition-colors disabled:opacity-50"
                  >
                    {updateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Save
                  </button>
                )}
              </div>

              {field.type === "text" && (
                <input
                  type="text"
                  value={currentValue}
                  onChange={(e) => handleValueChange(field.key, e.target.value)}
                  className="w-full bg-[#1A1008] border border-[#2D1A0E] text-[#D7CCC8] p-3 rounded focus:outline-none focus:border-[#C9A227] transition-colors font-sans"
                />
              )}

              {field.type === "textarea" && (
                <textarea
                  rows={4}
                  value={currentValue}
                  onChange={(e) => handleValueChange(field.key, e.target.value)}
                  className="w-full bg-[#1A1008] border border-[#2D1A0E] text-[#D7CCC8] p-3 rounded focus:outline-none focus:border-[#C9A227] transition-colors font-sans"
                />
              )}

              {field.type === "color" && (
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={currentValue}
                    onChange={(e) => handleValueChange(field.key, e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer bg-transparent border-0 p-0"
                  />
                  <input
                    type="text"
                    value={currentValue}
                    onChange={(e) => handleValueChange(field.key, e.target.value)}
                    className="w-32 bg-[#1A1008] border border-[#2D1A0E] text-[#D7CCC8] p-3 rounded focus:outline-none focus:border-[#C9A227] font-mono text-sm"
                  />
                </div>
              )}

              {field.type === "image" && (
                <div className="flex gap-4 items-start">
                  {currentValue ? (
                    <img src={currentValue} alt={field.label} className="w-24 h-24 object-cover rounded border border-[#2D1A0E]" />
                  ) : (
                    <div className="w-24 h-24 bg-[#1A1008] border border-[#2D1A0E] rounded flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-[#8D6E63]" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <p className="text-[#8D6E63] text-xs font-medium">Image URL</p>
                    <input
                      type="text"
                      value={currentValue}
                      onChange={(e) => handleValueChange(field.key, e.target.value)}
                      placeholder="/uploads/my-image.jpg or https://..."
                      className="w-full bg-[#1A1008] border border-[#2D1A0E] text-[#D7CCC8] p-3 rounded focus:outline-none focus:border-[#C9A227] transition-colors font-mono text-sm mb-2"
                    />
                    <div className="flex items-center gap-2">
                      <input 
                        id={`file-${field.key}`}
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(e, field.key)} 
                      />
                      <button 
                        type="button" 
                        onClick={() => document.getElementById(`file-${field.key}`)?.click()} 
                        disabled={uploadingField === field.key}
                        className="flex items-center gap-2 px-3 py-2 rounded text-xs bg-[#3E2723] text-[#D7CCC8] hover:bg-[#5D4037] disabled:opacity-50"
                      >
                        {uploadingField === field.key ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                        {uploadingField === field.key ? "Uploading…" : "Upload New Image"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
