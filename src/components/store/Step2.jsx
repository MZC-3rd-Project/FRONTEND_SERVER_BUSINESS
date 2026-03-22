import {MapPin, Plus, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button.js";
import {Card, CardContent} from "@/components/ui/card.js";
import {Badge} from "@/components/ui/badge.js";
import {Label} from "@/components/ui/label.js";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.js";
import {Input} from "@/components/ui/input.js";

const ADDRESS_TYPES = ["MAIN", "PICKUP", "RETURN", "WAREHOUSE"]
const CONTACT_TYPES = ["PHONE", "EMAIL", "KAKAO", "SNS"]
const ADDRESS_LABEL = { MAIN: "메인", PICKUP: "픽업", RETURN: "반품", WAREHOUSE: "창고" }

export default function Step2({ data, onChange }) {
    const update = (idx, field, value) =>
        onChange({
            target: {
                name: "addresses",
                value: data.addresses.map((a, i) =>
                    i === idx ? { ...a, [field]: value } : a
                ),
            },
        })

    const add = () =>
        onChange({
            target: {
                name: "addresses",
                value: [
                    ...data.addresses,
                    {
                        address_type: "MAIN",
                        postcode: "",
                        address: "",
                        detail_address: "",
                        is_default: false,
                    },
                ],
            },
        })

    const remove = (idx) =>
        onChange({
            target: {
                name: "addresses",
                value: data.addresses.filter((_, i) => i !== idx),
            },
        })

    // 카카오 주소 검색 팝업
    const openPostcode = (idx) => {
        new window.daum.Postcode({
            oncomplete: (result) => {
                const address = result.roadAddress || result.jibunAddress
                // postcode + address 한 번에 업데이트
                onChange({
                    target: {
                        name: "addresses",
                        value: data.addresses.map((a, i) =>
                            i === idx
                                ? { ...a, postcode: result.zonecode, address, detail_address: "" }
                                : a
                        ),
                    },
                })
            },
        }).open()
    }

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-primary" />
                    <h2 className="text-base font-semibold">주소 정보</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={add} type="button">
                    <Plus size={14} /> 주소 추가
                </Button>
            </div>

            {data.addresses.length === 0 && (
                <div className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
                    <MapPin size={24} className="mx-auto mb-2 opacity-30" />
                    주소를 추가해주세요
                </div>
            )}

            {data.addresses.map((addr, idx) => (
                <Card key={idx}>
                    <CardContent className="p-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <Badge variant="outline">{ADDRESS_LABEL[addr.address_type]}</Badge>
                            <Button
                                variant="ghost" size="icon" type="button"
                                onClick={() => remove(idx)}
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            >
                                <Trash2 size={13} />
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <Label>주소 유형</Label>
                                <Select
                                    value={addr.address_type}
                                    onValueChange={(v) => update(idx, "address_type", v)}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {ADDRESS_TYPES.map((t) => (
                                            <SelectItem key={t} value={t}>{ADDRESS_LABEL[t]}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end pb-1">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={addr.is_default}
                                        onChange={(e) => update(idx, "is_default", e.target.checked)}
                                        className="accent-primary"
                                    />
                                    <span className="font-medium">기본 주소</span>
                                </label>
                            </div>
                        </div>

                        {/* 우편번호 + 검색 버튼 */}
                        <div className="flex flex-col gap-1.5">
                            <Label>주소 <span className="text-destructive">*</span></Label>
                            <div className="flex gap-2">
                                <Input
                                    value={addr.postcode}
                                    readOnly
                                    placeholder="우편번호"
                                    className="w-28 bg-muted cursor-default"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openPostcode(idx)}
                                >
                                    <MapPin size={14} /> 주소 검색
                                </Button>
                            </div>
                            {/* 도로명 주소 — readOnly */}
                            <Input
                                value={addr.address}
                                readOnly
                                placeholder="도로명 주소"
                                className="bg-muted cursor-default"
                            />
                            {/* 상세주소 — 직접 입력 */}
                            <Input
                                value={addr.detail_address}
                                onChange={(e) => update(idx, "detail_address", e.target.value)}
                                placeholder="상세주소를 입력하세요 (동/호수 등)"
                            />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}