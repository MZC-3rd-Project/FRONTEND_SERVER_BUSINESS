import {Phone, Plus, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button.js";
import {Card, CardContent} from "@/components/ui/card.js";
import {Badge} from "@/components/ui/badge.js";
import {Label} from "@/components/ui/label.js";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.js";
import {Input} from "@/components/ui/input.js";

const CONTACT_PLACEHOLDER = {
    PHONE: "010-0000-0000", EMAIL: "example@email.com",
    KAKAO: "카카오 채널 ID", SNS: "SNS 링크",
}
const CONTACT_TYPES = ["PHONE", "EMAIL", "KAKAO", "SNS"]

export default function Step3({ data, onChange, errors = {} }) {
    const update = (idx, field, value) =>
        onChange({ target: { name: "contacts", value: data.contacts.map((c, i) => i === idx ? { ...c, [field]: value } : c) } })
    const add = () =>
        onChange({ target: { name: "contacts", value: [...data.contacts, { contact_type: "PHONE", contact_value: "", is_primary: false }] } })
    const remove = (idx) =>
        onChange({ target: { name: "contacts", value: data.contacts.filter((_, i) => i !== idx) } })

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Phone size={18} className="text-primary" />
                    <h2 className="text-base font-semibold">연락처 정보</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={add} type="button">
                    <Plus size={14} /> 연락처 추가
                </Button>
            </div>
            {data.contacts.length === 0 && (
                <div className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
                    <Phone size={24} className="mx-auto mb-2 opacity-30" />
                    연락처를 추가해주세요
                </div>
            )}
            {data.contacts.map((contact, idx) => (
                <Card key={idx}>
                    <CardContent className="p-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <Badge variant="secondary">{contact.contact_type}</Badge>
                            <Button variant="ghost" size="icon" onClick={() => remove(idx)} type="button"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive">
                                <Trash2 size={13} />
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <Label>연락처 유형</Label>
                                <Select value={contact.contact_type} onValueChange={(v) => update(idx, "contact_type", v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {CONTACT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end pb-1">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input type="checkbox" checked={contact.is_primary}
                                           onChange={(e) => update(idx, "is_primary", e.target.checked)}
                                           className="accent-primary" />
                                    <span className="font-medium">대표 연락처</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>연락처 값 <span className="text-destructive">*</span></Label>
                            <Input value={contact.contact_value}
                                   onChange={(e) => update(idx, "contact_value", e.target.value)}
                                   placeholder={CONTACT_PLACEHOLDER[contact.contact_type]}
                                   className={errors[`contact_${idx}`] ? "border-destructive" : ""} />
                            {errors[`contact_${idx}`] && (
                                <span className="text-destructive text-xs font-medium">{errors[`contact_${idx}`]}</span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}