import {Store} from "lucide-react";
import {Label} from "@/components/ui/label.js";
import {Input} from "@/components/ui/input.js";
import {Alert, AlertDescription} from "@/components/ui/alert.js";
import {cn} from "@/lib/utils.js";
import {Textarea} from "@/components/ui/textarea.js";


export default function Step1({ data, onChange, errors }) {
    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2">
                <Store size={18} className="text-primary"/>
                <h2 className="text-base font-semibold">가게 기본 정보</h2>
            </div>
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="store_name">가게명 <span className="text-destructive">*</span></Label>
                <Input
                    id="store_name" name="store_name"
                    value={data.store_name} onChange={onChange}
                    placeholder="가게 이름을 입력하세요"
                />
                {errors?.store_name && (
                    <span className="text-destructive text-xs font-medium">{errors.store_name}</span>
                )}
            </div>
            <div className="flex flex-col gap-1.5">
                <Label>운영 상태 <span className="text-destructive">*</span></Label>
                <div className="flex gap-3">
                    {[{value: "ACTIVE", label: "활성"}, {value: "INACTIVE", label: "비활성"}].map((s) => (
                        <button key={s.value} type="button"
                                onClick={() => onChange({target: {name: "status", value: s.value}})}
                                className={cn(
                                    "flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all",
                                    data.status === s.value
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-input border-border hover:border-primary/50"
                                )}>
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="description">가게 소개</Label>
                <Textarea
                    className="placeholder:opacity-25"
                    id="description" name="description"
                    value={data.description} onChange={onChange}
                    placeholder="가게를 소개하는 글을 입력하세요..."
                    rows={4}
                />
            </div>
            <Alert>
                <AlertDescription>
                    가게 생성 후 상태를 ACTIVE로 변경하면 고객에게 노출됩니다.
                </AlertDescription>
            </Alert>
        </div>
    )
}