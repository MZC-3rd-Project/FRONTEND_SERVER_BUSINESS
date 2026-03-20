import { useActionState, useState } from "react"
import {
 MapPin, Phone, ImagePlus, FileText,
  ChevronRight, Check, X, Plus, Trash2,
} from "lucide-react"
import { createStoreAction } from "@/domains/store/actions/createStoreAction"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Step1 from "@/components/store/Step1.jsx";

const STEPS = ["기본 정보", "주소", "연락처", "소개 & 이미지"]
const ADDRESS_TYPES = ["MAIN", "PICKUP", "RETURN", "WAREHOUSE"]
const CONTACT_TYPES = ["PHONE", "EMAIL", "KAKAO", "SNS"]
const ADDRESS_LABEL = { MAIN: "메인", PICKUP: "픽업", RETURN: "반품", WAREHOUSE: "창고" }
const CONTACT_PLACEHOLDER = {
  PHONE: "010-0000-0000", EMAIL: "example@email.com",
  KAKAO: "카카오 채널 ID", SNS: "SNS 링크",
}

const INITIAL_FORM = {
  store_name: "", status: "INACTIVE",
  addresses: [], contacts: [],
  description: "", thumbnail: null, gallery: [],
}

function StepIndicator({ current }) {
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
              i < current && "bg-primary text-primary-foreground",
              i === current && "bg-primary text-primary-foreground ring-4 ring-accent",
              i > current && "bg-muted text-muted-foreground"
            )}>
              {i < current ? <Check size={14} /> : i + 1}
            </div>
            <span className={cn(
              "text-xs mt-1 font-medium whitespace-nowrap",
              i === current ? "text-primary" : "text-muted-foreground"
            )}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn(
              "h-px w-12 sm:w-20 mx-1 mb-4 transition-all",
              i < current ? "bg-primary" : "bg-border"
            )} />
          )}
        </div>
      ))}
    </div>
  )
}



function Step2({data, onChange}) {
    const update = (idx, field, value) =>
        onChange({
            target: {
                name: "addresses",
                value: data.addresses.map((a, i) => i === idx ? {...a, [field]: value} : a)
            }
        })
    const add = () =>
        onChange({target: {name: "addresses", value: [...data.addresses, { address_type: "MAIN", address: "", is_default: false }] } })
  const remove = (idx) =>
    onChange({ target: { name: "addresses", value: data.addresses.filter((_, i) => i !== idx) } })

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
              <Button variant="ghost" size="icon" onClick={() => remove(idx)} type="button"
                className="h-7 w-7 text-muted-foreground hover:text-destructive">
                <Trash2 size={13} />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>주소 유형</Label>
                <Select value={addr.address_type} onValueChange={(v) => update(idx, "address_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ADDRESS_TYPES.map((t) => <SelectItem key={t} value={t}>{ADDRESS_LABEL[t]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={addr.is_default}
                    onChange={(e) => update(idx, "is_default", e.target.checked)}
                    className="accent-primary" />
                  <span className="font-medium">기본 주소</span>
                </label>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>상세 주소 <span className="text-destructive">*</span></Label>
              <Input value={addr.address} onChange={(e) => update(idx, "address", e.target.value)}
                placeholder="주소를 입력하세요" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function Step3({ data, onChange }) {
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
                placeholder={CONTACT_PLACEHOLDER[contact.contact_type]} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function Step4({ data, onChange }) {
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

function ReviewSummary({ data }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold">입력 내용 확인</h2>
      <Card><CardContent className="p-4 flex flex-col gap-1">
        <p className="text-xs text-muted-foreground">가게명</p>
        <p className="font-semibold">{data.store_name || "—"}</p>
        <Badge variant={data.status === "ACTIVE" ? "default" : "outline"} className="w-fit mt-1">{data.status}</Badge>
      </CardContent></Card>
      <Card><CardContent className="p-4 flex flex-col gap-1.5">
        <p className="text-xs text-muted-foreground">주소 ({data.addresses.length}개)</p>
        {data.addresses.length === 0 && <p className="text-sm text-muted-foreground">—</p>}
        {data.addresses.map((a, i) => (
          <div key={i} className="flex items-center gap-2">
            <Badge variant="outline" className="shrink-0">{ADDRESS_LABEL[a.address_type]}</Badge>
            <p className="text-sm truncate">{a.address || "주소 없음"}</p>
            {a.is_default && <Badge className="shrink-0">기본</Badge>}
          </div>
        ))}
      </CardContent></Card>
      <Card><CardContent className="p-4 flex flex-col gap-1.5">
        <p className="text-xs text-muted-foreground">연락처 ({data.contacts.length}개)</p>
        {data.contacts.length === 0 && <p className="text-sm text-muted-foreground">—</p>}
        {data.contacts.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <Badge variant="secondary" className="shrink-0">{c.contact_type}</Badge>
            <p className="text-sm">{c.contact_value || "—"}</p>
            {c.is_primary && <Badge className="shrink-0">대표</Badge>}
          </div>
        ))}
      </CardContent></Card>
    </div>
  )
}

export default function StoreCreatePage() {
  const [step, setStep] = useState(0)
  const [stepErrors, setStepErrors] = useState({})
  const [formData, setFormData] = useState(INITIAL_FORM)

  const [state, formAction, isPending] = useActionState(createStoreAction,
      { success: false, errors: {} })


  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((p) => ({ ...p, [name]: value }))
    if (stepErrors[name]) setStepErrors((p) => ({ ...p, [name]: null }))
  }

  const validateStep = () => {
    const errs = {}
    if (step === 0 && !formData.store_name.trim()) errs.store_name = "가게명을 입력해주세요."
    setStepErrors(errs)
    return Object.keys(errs).length === 0
  }


  if (state.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Check size={32} className="text-primary" />
        </div>
        <h2 className="text-xl font-bold">가게 생성 완료!</h2>
        <p className="text-muted-foreground text-sm">가게가 성공적으로 등록되었습니다.</p>
        <Button onClick={() => { setStep(0); setFormData(INITIAL_FORM) }}>다시 생성하기</Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">가게 생성</h1>
        <p className="text-muted-foreground text-sm mt-1">새로운 가게를 등록하세요.</p>
      </div>
      <StepIndicator current={step} />
      <Card>
        <CardContent className="p-6 sm:p-8 min-h-80">
          {step === 0 && <Step1 data={formData} onChange={handleChange} errors={stepErrors} />}
          {step === 1 && <Step2 data={formData} onChange={handleChange} />}
          {step === 2 && <Step3 data={formData} onChange={handleChange} />}
          {step === 3 && <Step4 data={formData} onChange={handleChange} />}
          {step === 4 && <ReviewSummary data={formData} />}
        </CardContent>
      </Card>
      <div className="flex justify-between mt-5">
        <Button variant="outline" onClick={() => setStep((s) => Math.max(s - 1, 0))} disabled={step === 0}>
          이전
        </Button>
        {step <= STEPS.length - 1 && (
          <Button onClick={() => { if (validateStep()) setStep((s) => s + 1) }}>
            다음 <ChevronRight size={16} />
          </Button>
        )}
        {step === STEPS.length && (
          <form action={formAction} className="flex flex-col items-end gap-2">
            <input type="hidden" name="store_name" value={formData.store_name} />
            <input type="hidden" name="status" value={formData.status} />
            <input type="hidden" name="addresses" value={JSON.stringify(formData.addresses)} />
            <input type="hidden" name="contacts" value={JSON.stringify(formData.contacts)} />
            <input type="hidden" name="description" value={formData.description} />
            {state.errors?._form && (
              <Alert variant="destructive">
                <AlertDescription>{state.errors._form[0]}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" disabled={isPending}>
              <Check size={16} /> {isPending ? "생성 중..." : "가게 생성"}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
