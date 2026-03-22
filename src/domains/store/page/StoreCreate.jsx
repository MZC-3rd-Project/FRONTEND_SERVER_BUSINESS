import { useActionState, useState } from "react"
import {
  ChevronRight, Check
} from "lucide-react"
import { createStoreAction } from "@/domains/store/actions/createStoreAction"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import Step1 from "@/components/store/Step1.jsx";
import Step2 from "@/components/store/Step2.jsx";
import Step3 from "@/components/store/Step3.jsx";
import Step4 from "@/components/store/Step4.jsx";
import ReviewSummary from "@/components/store/ReviewSummary.jsx";

const STEPS = ["기본 정보", "주소", "연락처", "소개 & 이미지"]



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

    if (step === 0) {
      if (!formData.store_name.trim()) errs.store_name = "가게명을 입력해주세요."
    }

    if (step === 1) {
      if (formData.addresses.length === 0) {
        errs._step = "주소를 최소 1개 이상 추가해주세요."
      } else if (formData.addresses.some((a) => !a.address.trim())) {
        errs._step = "모든 주소를 입력해주세요."
      }
    }

    if (step === 2) {
      if (formData.contacts.length === 0) {
        errs._step = "연락처를 최소 1개 이상 추가해주세요."
      } else {
        formData.contacts.forEach((c, i) => {
          if (!c.contact_value.trim()) {
            errs[`contact_${i}`] = "연락처 값을 입력해주세요."
          } else if (c.contact_type === "PHONE") {
            const digits = c.contact_value.replace(/-/g, "")
            if (!/^\d+$/.test(digits)) {
              errs[`contact_${i}`] = "숫자만 입력해주세요."
            } else if (!digits.startsWith("010")) {
              errs[`contact_${i}`] = "010으로 시작해야 합니다."
            } else if (digits.length !== 11) {
              errs[`contact_${i}`] = "010을 포함한 11자리를 입력해주세요."
            }
          }
        })
      }
    }

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
          {step === 2 && <Step3 data={formData} onChange={handleChange} errors={stepErrors} />}
          {step === 3 && <Step4 data={formData} onChange={handleChange} />}
          {step === 4 && <ReviewSummary data={formData} />}
        </CardContent>
      </Card>
      {stepErrors._step && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{stepErrors._step}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between mt-5">
        <Button variant="outline" onClick={() => { setStepErrors({}); setStep((s) => Math.max(s - 1, 0)) }} disabled={step === 0}>
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
            {state.errors && Object.keys(state.errors).length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  {state.errors._form?.[0]
                    ?? Object.values(state.errors).flat()[0]
                    ?? "입력 정보를 확인해주세요."}
                </AlertDescription>
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
