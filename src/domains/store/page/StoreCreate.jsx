import { useActionState, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Check,
  ChevronRight,
  FileText,
  ImagePlus,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  Store,
  X,
} from "lucide-react";

import { createStoreAction } from "@/domains/store/actions/createStoreAction";
import { useMyStoreQuery } from "@/domains/items/hook/useItemsQuery.js";
import { useStoreDetailQuery, useUpdateStoreMutation } from "@/domains/store/hook/useStoreQuery.js";
import { getMediaUrl, uploadImageToMedia } from "@/common/api/mediaApi.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import Step1 from "@/components/store/Step1.jsx";
import Step2 from "@/components/store/Step2.jsx";
import Step3 from "@/components/store/Step3.jsx";
import Step4 from "@/components/store/Step4.jsx";
import ReviewSummary from "@/components/store/ReviewSummary.jsx";
import StoreManageActions from "@/components/store/StoreManageActions.jsx";
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

const GALLERY_MAX = 4;

function ImageThumbnail({ mediaId, previewUrl, className }) {
  const { data: fetchedUrl, isPending } = useQuery({
    queryKey: ["media", "url", String(mediaId)],
    queryFn: () => getMediaUrl(String(mediaId)),
    enabled: !!mediaId && !previewUrl,
    staleTime: 5 * 60_000,
    retry: 1,
  });
  const url = previewUrl || fetchedUrl;

  if (!url) {
    return (
      <div
        className={cn(
          "rounded-xl flex items-center justify-center bg-muted",
          isPending && "animate-pulse",
          className
        )}
      >
        {!isPending && <ImagePlus size={16} className="text-muted-foreground/40" />}
      </div>
    );
  }
  return (
    <img
      src={url}
      alt=""
      className={cn("object-cover rounded-xl", className)}
      onError={(e) => {
        e.currentTarget.style.display = "none";
        e.currentTarget.nextSibling?.style && (e.currentTarget.nextSibling.style.display = "flex");
      }}
    />
  );
}

function StepIndicator({ current }) {
  return (
    <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 xl:grid-cols-5">
      {FLOW_STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;

        return (
          <div
            key={label}
            className={cn(
              "metric-chip flex items-center gap-2 rounded-[1.5rem] px-3 py-3 transition-all",
              active &&
                "border-primary/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(219,234,254,0.84))] shadow-[0_18px_40px_rgba(59,130,246,0.16)] dark:border-sky-400/20 dark:bg-[linear-gradient(135deg,rgba(8,15,31,0.96),rgba(15,23,42,0.84))]",
              done &&
                "bg-primary text-white shadow-[0_14px_30px_rgba(29,161,242,0.18)]"
            )}
          >
            <div
              className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded-[1rem] border text-sm font-semibold transition-all",
                done
                  ? "border-white/14 bg-white/12 text-white"
                  : active
                    ? "border-primary/14 bg-primary text-primary-foreground"
                    : "border-white/80 bg-white/70 text-muted-foreground dark:border-slate-700 dark:bg-slate-950/40"
              )}
            >
              {done ? <Check size={14} /> : i + 1}
            </div>
            <div className="min-w-0">
              <p
                className={cn(
                  "text-[0.65rem] font-semibold uppercase tracking-[0.15em]",
                  done
                    ? "text-white/70"
                    : active
                      ? "text-primary/80"
                      : "text-muted-foreground"
                )}
              >
                Step {i + 1}
              </p>
              <p
                className={cn(
                  "mt-0.5 truncate text-xs font-semibold",
                  done ? "text-white" : "text-foreground"
                )}
              >
                {label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const ADDRESS_TYPE_LABEL = {
  MAIN: "본점",
  PICKUP: "픽업",
  RETURN: "반품",
  WAREHOUSE: "창고",
};

const CONTACT_TYPE_LABEL = {
  PHONE: "전화",
  EMAIL: "이메일",
};

function SectionEditButton({ onClick }) {
  return (
    <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-muted-foreground" onClick={onClick}>
      <Pencil size={12} /> 수정
    </Button>
  );
}

function EditActions({ onSave, onCancel, isPending }) {
  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={onSave} disabled={isPending}>
        {isPending ? "저장 중..." : "저장"}
      </Button>
      <Button size="sm" variant="outline" onClick={onCancel} disabled={isPending}>
        <X size={14} />
      </Button>
    </div>
  );
}

function StoreOverview({ store }) {
  const navigate = useNavigate();
  const storeName = getStoreName(store);
  const status = getStoreStatus(store);
  const addresses = getAddresses(store);
  const contacts = getContacts(store);
  const description = store?.description || "";
  const storeId = store?.id ?? store?.storeId;

  const isActive = status === "ACTIVE";

  const updateMutation = useUpdateStoreMutation();
  const { data: storeDetail } = useStoreDetailQuery(storeId);

  // 편집 섹션 상태
  const [editSection, setEditSection] = useState(null); // "basic" | "address" | "contact" | "description" | "images"
  const [editError, setEditError] = useState(null);

  // 이미지 편집 상태
  // 각 항목: { mediaId: string, imageType: "THUMBNAIL"|"GALLERY", sortOrder: number, previewUrl: string|null }
  const [editImages, setEditImages] = useState([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // 기본 정보 편집 상태
  const [editStoreName, setEditStoreName] = useState(storeName);
  const [editStatus, setEditStatus] = useState(status);

  // 주소 편집 상태
  const addr = addresses[0];
  const [editAddressType, setEditAddressType] = useState(
    addr?.addressType ?? addr?.address_type ?? "MAIN"
  );
  const [editPostcode, setEditPostcode] = useState("");
  const [editRoadAddress, setEditRoadAddress] = useState(addr?.address ?? "");
  const [editDetailAddress, setEditDetailAddress] = useState("");

  // 연락처 편집 상태
  const contact = contacts[0];
  const [editContactValue, setEditContactValue] = useState(
    contact?.contactValue ?? contact?.contact_value ?? ""
  );
  const [editContactType, setEditContactType] = useState(
    contact?.contactType ?? contact?.contact_type ?? "PHONE"
  );

  // 소개 편집 상태
  const [editDescription, setEditDescription] = useState(description);

  function openEdit(section) {
    setEditError(null);
    // 최신값으로 초기화
    if (section === "basic") {
      setEditStoreName(storeName);
      setEditStatus(status);
    } else if (section === "address") {
      const a = addresses[0];
      setEditAddressType(a?.addressType ?? a?.address_type ?? "MAIN");
      setEditPostcode("");
      setEditRoadAddress(a?.address ?? "");
      setEditDetailAddress("");
    } else if (section === "contact") {
      const c = contacts[0];
      setEditContactValue(c?.contactValue ?? c?.contact_value ?? "");
      setEditContactType(c?.contactType ?? c?.contact_type ?? "PHONE");
    } else if (section === "description") {
      setEditDescription(description);
    } else if (section === "images") {
      const thumb = storeDetail?.image?.thumbnail;
      const gallery = Array.isArray(storeDetail?.image?.gallery) ? storeDetail.image.gallery : [];
      const initial = [];
      if (thumb?.mediaId) {
        initial.push({
          mediaId: String(thumb.mediaId),
          imageType: "THUMBNAIL",
          sortOrder: 0,
          previewUrl: thumb.mediaUrl ?? null,
        });
      }
      gallery.forEach((img, i) => {
        initial.push({
          mediaId: String(img.mediaId),
          imageType: "GALLERY",
          sortOrder: img.sortOrder ?? i + 1,
          previewUrl: img.mediaUrl ?? null,
        });
      });
      setEditImages(initial);
    }
    setEditSection(section);
  }

  function closeEdit() {
    setEditSection(null);
    setEditError(null);
  }

  function openKakaoPostcode() {
    new window.daum.Postcode({
      oncomplete: (result) => {
        setEditPostcode(result.zonecode);
        setEditRoadAddress(result.roadAddress || result.jibunAddress);
        setEditDetailAddress("");
      },
    }).open();
  }

  async function handleImageUpload(file, imageType) {
    setIsUploadingImage(true);
    setEditError(null);
    try {
      const confirmed = await uploadImageToMedia(file, {
        ownerType: "STORE",
        ownerId: Number(storeId),
        usageType: imageType,
        sortOrder: editImages.filter((i) => i.imageType === imageType).length,
      });
      const newImg = {
        mediaId: String(confirmed.mediaId),
        imageType,
        sortOrder: editImages.filter((i) => i.imageType === imageType).length,
        previewUrl: confirmed.mediaUrl ?? null,
      };
      if (imageType === "THUMBNAIL") {
        // 썸네일은 1장만 — 기존 썸네일 교체
        setEditImages((prev) => [
          ...prev.filter((i) => i.imageType !== "THUMBNAIL"),
          newImg,
        ]);
      } else {
        setEditImages((prev) => [...prev, newImg]);
      }
    } catch (err) {
      setEditError(err?.message ?? "이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploadingImage(false);
    }
  }

  function removeEditImage(mediaId) {
    setEditImages((prev) => prev.filter((i) => i.mediaId !== mediaId));
  }

  function handleSave(payload) {
    updateMutation.mutate(
      { storeId, data: payload },
      {
        onSuccess: closeEdit,
        onError: (err) => setEditError(err?.message ?? "수정에 실패했습니다."),
      }
    );
  }

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
            <Badge variant={isActive ? "default" : "outline"} className="mt-3 w-fit">
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

      {/* 가게 운영 관리 */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-base font-semibold text-foreground">가게 운영 관리</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            가게 공개 여부를 변경하거나 가게를 영구 삭제할 수 있습니다.
          </p>
          <div className="mt-5">
            <StoreManageActions
              storeId={storeId}
              storeName={storeName}
              status={status}
              onDeleted={() => navigate("/business/store", { replace: true })}
            />
          </div>
        </CardContent>
      </Card>

      {editError && (
        <Alert variant="destructive">
          <AlertDescription>{editError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        {/* 기본 정보 + 소개 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Store size={18} className="text-primary" />
                <h2 className="display-title text-2xl font-semibold text-foreground">기본 정보</h2>
              </div>
              {editSection !== "basic" && <SectionEditButton onClick={() => openEdit("basic")} />}
            </div>

            {editSection === "basic" ? (
              <div className="mt-5 space-y-4">
                <div className="space-y-1.5">
                  <Label>가게명</Label>
                  <Input
                    value={editStoreName}
                    onChange={(e) => setEditStoreName(e.target.value)}
                    placeholder="가게명을 입력하세요"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>운영 상태</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">운영 중</SelectItem>
                      <SelectItem value="INACTIVE">비공개</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <EditActions
                  onSave={() =>
                    handleSave({
                      storeName: editStoreName,
                      status: editStatus,
                      address: addr?.address ?? addresses[0]?.address ?? "",
                      addressType: addr?.addressType ?? addr?.address_type ?? "MAIN",
                      contactValue: contact?.contactValue ?? contact?.contact_value ?? "",
                      contactType: contact?.contactType ?? contact?.contact_type ?? "PHONE",
                      description: description,
                    })
                  }
                  onCancel={closeEdit}
                  isPending={updateMutation.isPending}
                />
              </div>
            ) : (
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
            )}

            {/* 소개 섹션 */}
            <div className="mt-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-primary" />
                  <p className="text-sm font-semibold text-foreground">가게 소개</p>
                </div>
                {editSection !== "description" && (
                  <SectionEditButton onClick={() => openEdit("description")} />
                )}
              </div>

              {editSection === "description" ? (
                <div className="mt-3 space-y-3">
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="가게 소개를 입력하세요"
                    rows={4}
                  />
                  <EditActions
                    onSave={() =>
                      handleSave({
                        storeName: storeName,
                        status: status,
                        address: addr?.address ?? addresses[0]?.address ?? "",
                        addressType: addr?.addressType ?? addr?.address_type ?? "MAIN",
                        contactValue: contact?.contactValue ?? contact?.contact_value ?? "",
                        contactType: contact?.contactType ?? contact?.contact_type ?? "PHONE",
                        description: editDescription,
                      })
                    }
                    onCancel={closeEdit}
                    isPending={updateMutation.isPending}
                  />
                </div>
              ) : (
                <div className="mt-3 rounded-[1.5rem] border border-border/80 bg-white/60 p-4 dark:bg-slate-950/24">
                  <p className="text-sm leading-6 text-muted-foreground">
                    {description || "가게 소개가 아직 등록되지 않았습니다."}
                  </p>
                </div>
              )}
            </div>

            {/* 이미지 섹션 */}
            <div className="mt-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ImagePlus size={16} className="text-primary" />
                  <p className="text-sm font-semibold text-foreground">가게 이미지</p>
                </div>
                {editSection !== "images" && (
                  <SectionEditButton onClick={() => openEdit("images")} />
                )}
              </div>

              {editSection === "images" ? (
                <div className="mt-3 space-y-5">
                  {/* 썸네일 */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      썸네일 <span className="font-normal">(1장)</span>
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {editImages
                        .filter((i) => i.imageType === "THUMBNAIL")
                        .map((img) => (
                          <div key={img.mediaId} className="relative group w-24 h-24">
                            <ImageThumbnail
                              mediaId={img.mediaId}
                              previewUrl={img.previewUrl}
                              className="w-24 h-24"
                            />
                            <button
                              type="button"
                              onClick={() => removeEditImage(img.mediaId)}
                              className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                            >
                              <X size={12} className="text-white" />
                            </button>
                          </div>
                        ))}
                      {editImages.filter((i) => i.imageType === "THUMBNAIL").length === 0 && (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleImageUpload(f, "THUMBNAIL");
                              e.target.value = "";
                            }}
                          />
                          <div className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-primary transition-colors bg-card">
                            <ImagePlus size={18} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">업로드</span>
                          </div>
                        </label>
                      )}
                      {editImages.filter((i) => i.imageType === "THUMBNAIL").length > 0 && (
                        <label className="cursor-pointer self-end">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleImageUpload(f, "THUMBNAIL");
                              e.target.value = "";
                            }}
                          />
                          <Button type="button" variant="outline" size="sm" asChild>
                            <span>변경</span>
                          </Button>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* 갤러리 */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      갤러리{" "}
                      <span className="font-normal">
                        ({editImages.filter((i) => i.imageType === "GALLERY").length}/{GALLERY_MAX}장)
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {editImages
                        .filter((i) => i.imageType === "GALLERY")
                        .map((img) => (
                          <div key={img.mediaId} className="relative group w-20 h-20">
                            <ImageThumbnail
                              mediaId={img.mediaId}
                              previewUrl={img.previewUrl}
                              className="w-20 h-20"
                            />
                            <button
                              type="button"
                              onClick={() => removeEditImage(img.mediaId)}
                              className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                            >
                              <X size={12} className="text-white" />
                            </button>
                          </div>
                        ))}
                      {editImages.filter((i) => i.imageType === "GALLERY").length < GALLERY_MAX && (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleImageUpload(f, "GALLERY");
                              e.target.value = "";
                            }}
                          />
                          <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-primary transition-colors bg-card">
                            <ImagePlus size={16} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">추가</span>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>

                  {isUploadingImage && (
                    <p className="text-xs text-muted-foreground animate-pulse">업로드 중...</p>
                  )}

                  <EditActions
                    onSave={() =>
                      handleSave({
                        storeName: storeName,
                        status: status,
                        address: addr?.address ?? addresses[0]?.address ?? "",
                        addressType: addr?.addressType ?? addr?.address_type ?? "MAIN",
                        contactValue: contact?.contactValue ?? contact?.contact_value ?? "",
                        contactType: contact?.contactType ?? contact?.contact_type ?? "PHONE",
                        description: description,
                        images: editImages.map((img, idx) => ({
                          imageType: img.imageType,
                          mediaId: img.mediaId,
                          mediaUrl: img.previewUrl ?? null,
                          sortOrder: idx,
                        })),
                      })
                    }
                    onCancel={closeEdit}
                    isPending={updateMutation.isPending || isUploadingImage}
                  />
                </div>
              ) : (
                <div className="mt-3">
                  {(() => {
                    const thumb = storeDetail?.image?.thumbnail;
                    const gallery = storeDetail?.image?.gallery ?? [];
                    const hasImages = !!(thumb?.mediaId || gallery.length > 0);

                    if (!storeDetail) {
                      return (
                        <div className="flex gap-3">
                          {[0, 1].map((i) => (
                            <div key={i} className="w-20 h-20 animate-pulse rounded-xl bg-muted" />
                          ))}
                        </div>
                      );
                    }

                    if (!hasImages) {
                      return <p className="text-sm text-muted-foreground">등록된 이미지가 없습니다.</p>;
                    }

                    return (
                      <div className="flex flex-wrap gap-3">
                        {thumb?.mediaId && (
                          <div className="flex flex-col items-center gap-1">
                            <ImageThumbnail
                              mediaId={thumb.mediaId}
                              previewUrl={thumb.mediaUrl}
                              className="w-20 h-20"
                            />
                            <span className="text-[0.65rem] text-muted-foreground">썸네일</span>
                          </div>
                        )}
                        {gallery.map((img, i) => (
                          <div key={img.mediaId ?? i} className="flex flex-col items-center gap-1">
                            <ImageThumbnail
                              mediaId={img.mediaId}
                              previewUrl={img.mediaUrl}
                              className="w-20 h-20"
                            />
                            <span className="text-[0.65rem] text-muted-foreground">갤러리 {i + 1}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 주소 + 연락처 */}
        <div className="grid gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-primary" />
                  <h2 className="display-title text-2xl font-semibold text-foreground">주소 정보</h2>
                </div>
                {editSection !== "address" && <SectionEditButton onClick={() => openEdit("address")} />}
              </div>

              {editSection === "address" ? (
                <div className="mt-5 space-y-4">
                  <div className="space-y-1.5">
                    <Label>주소 유형</Label>
                    <Select value={editAddressType} onValueChange={setEditAddressType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ADDRESS_TYPE_LABEL).map(([val, label]) => (
                          <SelectItem key={val} value={val}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>주소 <span className="text-destructive">*</span></Label>
                    <div className="flex gap-2">
                      <Input
                        value={editPostcode}
                        readOnly
                        placeholder="우편번호"
                        className="w-28 bg-muted cursor-default"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={openKakaoPostcode}>
                        <MapPin size={14} /> 주소 검색
                      </Button>
                    </div>
                    <Input
                      value={editRoadAddress}
                      readOnly
                      placeholder="도로명 주소"
                      className="bg-muted cursor-default"
                    />
                    <Input
                      value={editDetailAddress}
                      onChange={(e) => setEditDetailAddress(e.target.value)}
                      placeholder="상세주소를 입력하세요 (동/호수 등)"
                    />
                  </div>
                  <EditActions
                    onSave={() => {
                      const fullAddress = [editRoadAddress, editDetailAddress.trim()]
                        .filter(Boolean)
                        .join(" ");
                      handleSave({
                        storeName: storeName,
                        status: status,
                        address: fullAddress,
                        addressType: editAddressType,
                        contactValue: contact?.contactValue ?? contact?.contact_value ?? "",
                        contactType: contact?.contactType ?? contact?.contact_type ?? "PHONE",
                        description: description,
                      });
                    }}
                    onCancel={closeEdit}
                    isPending={updateMutation.isPending}
                  />
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {addresses.length > 0 ? (
                    addresses.map((address, index) => (
                      <div
                        key={`${address?.id ?? "address"}-${index}`}
                        className="metric-chip rounded-[1.35rem] px-4 py-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-foreground">
                            {ADDRESS_TYPE_LABEL[address?.addressType ?? address?.address_type] ??
                              address?.addressType ?? address?.address_type ?? `주소 ${index + 1}`}
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
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Phone size={18} className="text-primary" />
                  <h2 className="display-title text-2xl font-semibold text-foreground">연락처 정보</h2>
                </div>
                {editSection !== "contact" && <SectionEditButton onClick={() => openEdit("contact")} />}
              </div>

              {editSection === "contact" ? (
                <div className="mt-5 space-y-4">
                  <div className="space-y-1.5">
                    <Label>연락처 유형</Label>
                    <Select value={editContactType} onValueChange={setEditContactType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CONTACT_TYPE_LABEL).map(([val, label]) => (
                          <SelectItem key={val} value={val}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>연락처</Label>
                    <Input
                      value={editContactValue}
                      onChange={(e) => setEditContactValue(e.target.value)}
                      placeholder={editContactType === "EMAIL" ? "이메일을 입력하세요" : "전화번호를 입력하세요"}
                    />
                  </div>
                  <EditActions
                    onSave={() =>
                      handleSave({
                        storeName: storeName,
                        status: status,
                        address: addr?.address ?? addresses[0]?.address ?? "",
                        addressType: addr?.addressType ?? addr?.address_type ?? "MAIN",
                        contactValue: editContactValue,
                        contactType: editContactType,
                        description: description,
                      })
                    }
                    onCancel={closeEdit}
                    isPending={updateMutation.isPending}
                  />
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {contacts.length > 0 ? (
                    contacts.map((contact, index) => (
                      <div
                        key={`${contact?.id ?? "contact"}-${index}`}
                        className="metric-chip rounded-[1.35rem] px-4 py-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-foreground">
                            {CONTACT_TYPE_LABEL[contact?.contactType ?? contact?.contact_type] ??
                              contact?.contactType ?? contact?.contact_type ?? `연락처 ${index + 1}`}
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
              )}
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
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const [state, formAction, isPending] = useActionState(createStoreAction, {
    success: false,
    errors: {},
  });

  useEffect(() => {
    if (!state.success) return;

    queryClient.invalidateQueries({ queryKey: ["store", "me"] });
    navigate("/business/dashboard", { replace: true });
  }, [navigate, queryClient, state.success]);

  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (name === "thumbnail" && value?.file) {
      setIsUploadingImages(true);
      setStepErrors((prev) => ({ ...prev, images: null, _step: null }));
      try {
        const uploaded = await uploadImageToMedia(value.file);
        setFormData((prev) => ({
          ...prev,
          thumbnail: {
            mediaId: String(uploaded.mediaId),
            imageType: "THUMBNAIL",
            sortOrder: 0,
            url: uploaded.mediaUrl ?? value.url,
          },
        }));
      } catch {
        setStepErrors((prev) => ({
          ...prev,
          images: "이미지 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.",
        }));
      } finally {
        setIsUploadingImages(false);
      }
      return;
    }

    if (name === "gallery" && Array.isArray(value)) {
      const existingImages = value
        .filter((image) => !image?.file || image?.mediaId)
        .map((image, index) => ({
          ...image,
          imageType: "GALLERY",
          sortOrder: index + 1,
        }));
      const pendingImages = value.filter((image) => image?.file && !image?.mediaId);

      if (pendingImages.length === 0) {
        setFormData((prev) => ({ ...prev, gallery: existingImages }));
        return;
      }

      setIsUploadingImages(true);
      setStepErrors((prev) => ({ ...prev, images: null, _step: null }));
      try {
        const uploadedImages = [];
        for (const [index, image] of pendingImages.entries()) {
          const uploaded = await uploadImageToMedia(image.file);
          uploadedImages.push({
            mediaId: String(uploaded.mediaId),
            imageType: "GALLERY",
            sortOrder: existingImages.length + index + 1,
            url: uploaded.mediaUrl ?? image.url,
          });
        }

        setFormData((prev) => ({
          ...prev,
          gallery: [...existingImages, ...uploadedImages].map((image, index) => ({
            ...image,
            sortOrder: index + 1,
          })),
        }));
      } catch {
        setStepErrors((prev) => ({
          ...prev,
          images: "갤러리 이미지 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.",
        }));
      } finally {
        setIsUploadingImages(false);
      }
      return;
    }

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

          {stepErrors.images && (
            <Alert variant="destructive">
              <AlertDescription>{stepErrors.images}</AlertDescription>
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
                disabled={step === 0 || isUploadingImages}
              >
                이전
              </Button>
              {step <= STEPS.length - 1 && (
                <Button
                  onClick={() => {
                    if (validateStep()) setStep((value) => value + 1);
                  }}
                  disabled={isUploadingImages}
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
                  <input
                    type="hidden"
                    name="thumbnail"
                    value={JSON.stringify(formData.thumbnail)}
                  />
                  <input
                    type="hidden"
                    name="gallery"
                    value={JSON.stringify(formData.gallery)}
                  />
                  {state.errors && Object.keys(state.errors).length > 0 && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {state.errors._form?.[0] ??
                          Object.values(state.errors).flat()[0] ??
                          "입력 정보를 확인해주세요."}
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" disabled={isPending || isUploadingImages}>
                    <Check size={16} /> {isPending ? "생성 중..." : isUploadingImages ? "이미지 업로드 중..." : "가게 생성"}
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
