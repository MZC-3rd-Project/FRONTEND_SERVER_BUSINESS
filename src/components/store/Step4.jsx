import {FileText, ImagePlus, Plus, X} from "lucide-react";
import {Label} from "@/components/ui/label.js";
import {Textarea} from "@/components/ui/textarea.js";

export default function Step4({ data, onChange }) {
    const MAX = 4
    const addThumb = (e) => {
        const f = e.target.files[0]
        if (f) onChange({ target: { name: "thumbnail", value: { file: f, url: URL.createObjectURL(f) } } })
    }
    const addGallery = (e) => {
        const f = e.target.files[0]
        if (f && data.gallery.length < MAX)
            onChange({ target: { name: "gallery", value: [...data.gallery, { file: f, url: URL.createObjectURL(f) }] } })
    }
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                <h2 className="text-base font-semibold">소개 & 이미지</h2>
            </div>
            <div className="flex flex-col gap-1.5">
                <Label>가게 소개</Label>
                <Textarea name="description" value={data.description} onChange={onChange}
                          placeholder="가게를 소개하는 글을 입력하세요..." rows={4} />
            </div>
            <div>
                <Label className="mb-2 block">
                    썸네일 <span className="text-muted-foreground font-normal text-xs">(1장)</span>
                </Label>
                <label className="cursor-pointer block w-fit">
                    <input type="file" accept="image/*" className="hidden" onChange={addThumb} />
                    {data.thumbnail ? (
                        <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-border group">
                            <img src={data.thumbnail.url} alt="thumb" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                <span className="text-white text-xs">변경</span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-40 h-40 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors bg-card">
                            <ImagePlus size={24} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">업로드</span>
                        </div>
                    )}
                </label>
            </div>
            <div>
                <Label className="mb-2 block">
                    갤러리 <span className="text-muted-foreground font-normal text-xs">({data.gallery.length}/{MAX}장)</span>
                </Label>
                <div className="flex gap-3 flex-wrap">
                    {data.gallery.map((img, idx) => (
                        <div key={idx} className="relative w-28 h-28 rounded-xl overflow-hidden border border-border group">
                            <img src={img.url} alt={`g${idx}`} className="w-full h-full object-cover" />
                            <button type="button"
                                    onClick={() => onChange({ target: { name: "gallery", value: data.gallery.filter((_, i) => i !== idx) } })}
                                    className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition">
                                <X size={12} className="text-white" />
                            </button>
                        </div>
                    ))}
                    {data.gallery.length < MAX && (
                        <label className="cursor-pointer">
                            <input type="file" accept="image/*" className="hidden" onChange={addGallery} />
                            <div className="w-28 h-28 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 hover:border-primary transition-colors bg-card">
                                <Plus size={20} className="text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">추가</span>
                            </div>
                        </label>
                    )}
                </div>
            </div>
        </div>
    )
}
