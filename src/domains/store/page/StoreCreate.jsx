import { useActionState, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  FileText,
  MapPin,
  Phone,
  ShieldCheck,
  Store,
} from "lucide-react";

import { createStoreAction } from "@/domains/store/actions/createStoreAction";
import { useMyStoreQuery } from "@/domains/items/hook/useItemsQuery.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import Step1 from "@/components/store/Step1.jsx";
import Step2 from "@/components/store/Step2.jsx";
import Step3 from "@/components/store/Step3.jsx";
import Step4 from "@/components/store/Step4.jsx";
import ReviewSummary from "@/components/store/ReviewSummary.jsx";
import PageIntro from "@/components/layout/PageIntro.jsx";

const STEPS = ["기본 정보", "주소", "연락처", "소개 & 이미지"];
const FLOW_STEPS = [...STEPS, "최종 확인"];
const STATUS_LABEL = {
  ACTIVE: "운영 중",
  INACTIVE: "비공개",
};

const INITIAL_FORM = {
  store_name: "",
  status: "INACTIVE",
  addresses: [],
  contacts: [],
  description: "",
  thumbnail: null,
  gallery: [],
};

function getStoreName(store) {
  return store?.store_name ?? store?.storeName ?? store?.name ?? "내 가게";
}

function getStoreStatus(store) {
  return store?.status ?? "INACTIVE";
}

function getAddresses(store) {
  return Array.isArray(store?.addresses) ? store.addresses : [];
}

function getContacts(store) {
  return Array.isArray(store?.contacts) ? store.contacts : [];
}

function getAddressText(address) {
  if (!address) return "주소 정보 없음";

  const main = address.address ?? address.roadAddress ?? address.baseAddress ?? "";
  const detail = address.detail_address ?? address.detailAddress ?? "";

  return [main, detail].filter(Boolean).join(" ");
}

function getContactText(contact) {
  return contact?.contact_value ?? contact?.contactValue ?? "연락처 정보 없음";
}

function StepIndicator({ current }) {
  return (
    <div className="grid gap-3 lg:grid-cols-5">
      {FLOW_STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;

        return (
          <div
            key={label}
            className={cn(
              "metric-chip flex items-center gap-3 rounded-[1.5rem] px-4 py-4 transition-all",
              active &&
                "border-primary/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(219,234,254,0.84))] shadow-[0_18px_40px_rgba(59,130,246,0.16)] dark:border-sky-400/20 dark:bg-[linear-gradient(135deg,rgba(8,15,31,0.96),rgba(15,23,42,0.84))]",
              done &&
                "bg-primary text-white shadow-[0_14px_30px_rgba(29,161,242,0.18)]"
            )}
          >
            <div
              className={cn(
                "grid h-11 w-11 shrink-0 place-items-center rounded-[1.1rem] border text-sm font-semibold transition-all",
                done
                  ? "border-white/14 bg-white/12 text-white"
                  : active
                    ? "border-primary/14 bg-primary text-primary-foreground"
                    : "border-white/80 bg-white/70 text-muted-foreground dark:border-slate-700 dark:bg-slate-950/40"
              )}
            >
              {done ? <Check size={16} /> : i + 1}
            </div>
            <div className="min-w-0">
              <p
                className={cn(
                  "text-[0.68rem] font-semibold uppercase tracking-[0.22em]",
                  done
                    ? "text-white/70"
                    : active
                      ? "text-primary/80"
                      : "text-muted-foreground"
                )}
              >
                Step {i + 1}
              </p>
              <p className="mt-1 truncate text-sm font-semibold">{label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StoreOverview({ store }) {
  const storeName = getStoreName(store);
  const status = getStoreStatus(store);
  const addresses = getAddresses(store);
  const contacts = getContacts(store);
  const description = store?.description ?? "가게 소개가 아직 등록되지 않았습니다.";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageIntro
        eyebrow="Store Management"
        title="가게 관리"
        description="가게의 기본 정보와 운영 상태를 확인하는 메인 관리 화면입니다. 첫 진입 동선은 대시보드로 옮기고, 이 페이지는 스토어 엔티티 관리에 집중하도록 정리했습니다."
        meta={[
          STATUS_LABEL[status] ?? status,
          `주소 ${addresses.length}개`,
          `연락처 ${contacts.length}개`,
        ]}
      >
        <div className="metric-chip rounded-[1.75rem] px-5 py-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            Store status
          </p>
          <p className="mt-3 text-lg font-semibold text-foreground">
            {STATUS_LABEL[status] ?? status}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            가게가 이미 존재하므로 메인 진입은 판매 대시보드로 연결됩니다.
          </p>
        </div>
      </PageIntro>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="section-kicker">Store</p>
            <p className="mt-3 text-lg font-semibold text-foreground">{storeName}</p>
            <Badge
              variant={status === "ACTIVE" ? "default" : "outline"}
              className="mt-3 w-fit"
            >
              {STATUS_LABEL[status] ?? status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="section-kicker">Address</p>
            <p className="mt-3 text-lg font-semibold text-foreground">{addresses.length}개</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {addresses[0] ? getAddressText(addresses[0]) : "등록된 주소 없음"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="section-kicker">Contact</p>
            <p className="mt-3 text-lg font-semibold text-foreground">{contacts.length}개</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {contacts[0] ? getContactText(contacts[0]) : "등록된 연락처 없음"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="section-kicker">Next</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link to="/business/dashboard">
                  대시보드 <ArrowRight size={14} />
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/business/items">상품 관리</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Store size={18} className="text-primary" />
              <h2 className="display-title text-2xl font-semibold text-foreground">
                기본 정보
              </h2>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="metric-chip rounded-[1.4rem] px-4 py-4">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Store name
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">{storeName}</p>
              </div>

              <div className="metric-chip rounded-[1.4rem] px-4 py-4">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Visibility
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {STATUS_LABEL[status] ?? status}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-border/80 bg-white/60 p-4 dark:bg-slate-950/24">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                <p className="text-sm font-semibold text-foreground">가게 소개</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-primary" />
                <h2 className="display-title text-2xl font-semibold text-foreground">
                  주소 정보
                </h2>
              </div>

              <div className="mt-5 space-y-3">
                {addresses.length > 0 ? (
                  addresses.map((address, index) => (
                    <div
                      key={`${address?.id ?? "address"}-${index}`}
                      className="metric-chip rounded-[1.35rem] px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-foreground">
                          {address?.address_type ?? address?.addressType ?? `주소 ${index + 1}`}
                        </p>
                        {address?.is_default || address?.isDefault ? (
                          <Badge variant="outline">기본 주소</Badge>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {getAddressText(address)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">등록된 주소가 없습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Phone size={18} className="text-primary" />
                <h2 className="display-title text-2xl font-semibold text-foreground">
                  연락처 정보
                </h2>
              </div>

              <div className="mt-5 space-y-3">
                {contacts.length > 0 ? (
                  contacts.map((contact, index) => (
                    <div
                      key={`${contact?.id ?? "contact"}-${index}`}
                      className="metric-chip rounded-[1.35rem] px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-foreground">
                          {contact?.contact_type ?? contact?.contactType ?? `연락처 ${index + 1}`}
                        </p>
                        {contact?.is_primary || contact?.isPrimary ? (
                          <Badge variant="outline">대표 연락처</Badge>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {getContactText(contact)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">등록된 연락처가 없습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StoreOnboardingFlow() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [stepErrors, setStepErrors] = useState({});
  const [formData, setFormData] = useState(INITIAL_FORM);

  const [state, formAction, isPending] = useActionState(createStoreAction, {
    success: false,
    errors: {},
  });

  useEffect(() => {
    if (!state.success) return;

    queryClient.invalidateQueries({ queryKey: ["store", "me"] });
    navigate("/business/dashboard", { replace: true });
  }, [navigate, queryClient, state.success]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (stepErrors[name]) {
      setStepErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateStep = () => {
    const errors = {};

    if (step === 0) {
      if (!formData.store_name.trim()) {
        errors.store_name = "가게명을 입력해주세요.";
      }
    }

    if (step === 1) {
      if (formData.addresses.length === 0) {
        errors._step = "주소를 최소 1개 이상 추가해주세요.";
      } else if (formData.addresses.some((address) => !address.address.trim())) {
        errors._step = "모든 주소를 입력해주세요.";
      }
    }

    if (step === 2) {
      if (formData.contacts.length === 0) {
        errors._step = "연락처를 최소 1개 이상 추가해주세요.";
      } else {
        formData.contacts.forEach((contact, index) => {
          if (!contact.contact_value.trim()) {
            errors[`contact_${index}`] = "연락처 값을 입력해주세요.";
          } else if (contact.contact_type === "PHONE") {
            const digits = contact.contact_value.replace(/-/g, "");
            if (!/^\d+$/.test(digits)) {
              errors[`contact_${index}`] = "숫자만 입력해주세요.";
            } else if (!digits.startsWith("010")) {
              errors[`contact_${index}`] = "010으로 시작해야 합니다.";
            } else if (digits.length !== 11) {
              errors[`contact_${index}`] = "010을 포함한 11자리를 입력해주세요.";
            }
          }
        });
      }
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  if (state.success) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center">
        <div className="glass-panel surface-hero flex w-full flex-col items-center gap-4 rounded-[2rem] px-8 py-12 text-center">
          <Badge variant="outline">Store ready</Badge>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/12">
            <Check size={32} className="text-primary" />
          </div>
          <h2 className="display-title text-3xl font-semibold">가게 생성 완료!</h2>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            가게가 성공적으로 등록되었습니다. 메인 동선은 이제 판매 대시보드로 전환됩니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageIntro
        eyebrow="Store Onboarding"
        title="가게 등록"
        description="가게가 아직 없기 때문에 먼저 스토어 온보딩을 진행합니다. 등록이 끝나면 메인 진입은 자동으로 대시보드 중심 구조로 전환됩니다."
        meta={[
          `진행 단계 ${step + 1}/${FLOW_STEPS.length}`,
          `주소 ${formData.addresses.length}개`,
          `연락처 ${formData.contacts.length}개`,
        ]}
      >
        <div className="metric-chip rounded-[1.75rem] px-5 py-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            Entry rule
          </p>
          <p className="mt-3 text-lg font-semibold text-foreground">
            등록 완료 후 메인 진입은 대시보드
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            이 화면은 최초 1회 온보딩 성격이고, 이후에는 가게 관리 화면으로 바뀝니다.
          </p>
        </div>
      </PageIntro>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-5">
          <Card>
            <CardContent className="p-6 sm:p-7">
              <StepIndicator current={step} />
              <div className="mt-6">
                {step === 0 && <Step1 data={formData} onChange={handleChange} errors={stepErrors} />}
                {step === 1 && <Step2 data={formData} onChange={handleChange} />}
                {step === 2 && <Step3 data={formData} onChange={handleChange} errors={stepErrors} />}
                {step === 3 && <Step4 data={formData} onChange={handleChange} />}
                {step === 4 && <ReviewSummary data={formData} />}
              </div>
            </CardContent>
          </Card>

          {stepErrors._step && (
            <Alert variant="destructive">
              <AlertDescription>{stepErrors._step}</AlertDescription>
            </Alert>
          )}

          <div className="glass-panel flex flex-col gap-3 rounded-[1.75rem] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {step < FLOW_STEPS.length - 1
                ? "각 단계의 핵심 정보만 채우면 다음 단계로 이동합니다."
                : "최종 확인 후 가게를 생성합니다."}
            </p>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setStepErrors({});
                  setStep((value) => Math.max(value - 1, 0));
                }}
                disabled={step === 0}
              >
                이전
              </Button>
              {step <= STEPS.length - 1 && (
                <Button
                  onClick={() => {
                    if (validateStep()) setStep((value) => value + 1);
                  }}
                >
                  다음 <ChevronRight size={16} />
                </Button>
              )}
              {step === STEPS.length && (
                <form action={formAction} className="flex flex-col items-end gap-2">
                  <input type="hidden" name="store_name" value={formData.store_name} />
                  <input type="hidden" name="status" value={formData.status} />
                  <input
                    type="hidden"
                    name="addresses"
                    value={JSON.stringify(formData.addresses)}
                  />
                  <input
                    type="hidden"
                    name="contacts"
                    value={JSON.stringify(formData.contacts)}
                  />
                  <input type="hidden" name="description" value={formData.description} />
                  {state.errors && Object.keys(state.errors).length > 0 && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {state.errors._form?.[0] ??
                          Object.values(state.errors).flat()[0] ??
                          "입력 정보를 확인해주세요."}
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
        </div>

        <Card className="h-fit xl:sticky xl:top-[9rem]">
          <CardContent className="p-5">
            <p className="section-kicker">Snapshot</p>
            <div className="mt-4 space-y-4">
              <div className="metric-chip rounded-[1.4rem] px-4 py-4">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Store name
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {formData.store_name || "아직 입력 전"}
                </p>
              </div>

              <div className="metric-chip rounded-[1.4rem] px-4 py-4">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Status
                </p>
                <Badge
                  variant={formData.status === "ACTIVE" ? "default" : "outline"}
                  className="mt-2 w-fit"
                >
                  {formData.status}
                </Badge>
              </div>

              <div className="metric-chip rounded-[1.4rem] px-4 py-4">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Assets
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  썸네일 {formData.thumbnail ? "1장 준비" : "없음"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  갤러리 {formData.gallery.length}/4
                </p>
              </div>

              <div className="metric-chip rounded-[1.4rem] px-4 py-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-primary" />
                  <p className="text-sm font-semibold text-foreground">
                    등록 후 이동 경로
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  가게가 생성되면 메인 동선은 `가게 관리`가 아니라 `판매 대시보드`로 바뀝니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function StoreCreatePage() {
  const { data: myStore, isLoading } = useMyStoreQuery();

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[45vh] max-w-3xl items-center justify-center">
        <div className="glass-panel flex w-full flex-col items-center gap-3 rounded-[1.8rem] px-6 py-10 text-center">
          <Store size={28} className="text-primary" />
          <h2 className="display-title text-2xl font-semibold text-foreground">
            가게 정보를 불러오는 중
          </h2>
          <p className="text-sm text-muted-foreground">
            돈모아 판매 워크스페이스를 확인한 뒤, 맞는 시작 화면으로 연결합니다.
          </p>
        </div>
      </div>
    );
  }

  if (myStore) {
    return <StoreOverview store={myStore} />;
  }

  return <StoreOnboardingFlow />;
}
