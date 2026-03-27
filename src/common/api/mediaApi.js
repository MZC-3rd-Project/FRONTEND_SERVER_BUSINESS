import apiInstance from "@/common/api/apiInstance.js"
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils.js"

async function createUploadIntent(payload) {
  try {
    const res = await apiInstance.post("/v1/media/upload-intents", payload)
    return unwrapApiResponseBody(res, "업로드 준비에 실패했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "업로드 준비에 실패했습니다.")
  }
}

async function confirmUpload(payload) {
  try {
    const res = await apiInstance.post("/v1/media/confirm", payload)
    return unwrapApiResponseBody(res, "업로드 확인에 실패했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "업로드 확인에 실패했습니다.")
  }
}

export async function getMediaUrl(mediaId) {
  try {
    const res = await apiInstance.get(`/v1/media/${mediaId}/url`)
    const data = unwrapApiResponseBody(res, "이미지 URL 조회에 실패했습니다.")
    return typeof data === "string" ? data : (data?.mediaUrl ?? data?.url ?? null)
  } catch {
    return null
  }
}

/**
 * 파일 → 미디어 서비스 3단계 업로드
 * 반환: { mediaId: number, mediaUrl: string }
 */
export async function uploadImageToMedia(file, { ownerType = null, ownerId = null, usageType = null, sortOrder = null } = {}) {
  const bindingPayload = {}
  if (ownerType) bindingPayload.ownerType = ownerType
  if (ownerId !== null && ownerId !== undefined) bindingPayload.ownerId = ownerId
  if (usageType) bindingPayload.usageType = usageType
  if (sortOrder !== null && sortOrder !== undefined) bindingPayload.sortOrder = sortOrder

  const intent = await createUploadIntent({
    fileName: file.name,
    contentType: file.type,
    fileSize: file.size,
    ...bindingPayload,
  })

  // S3 직접 업로드 (presigned PUT)
  const s3Res = await fetch(intent.presignedUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  })
  if (!s3Res.ok) {
    throw new Error("이미지 업로드에 실패했습니다.")
  }

  return confirmUpload({
    mediaId: intent.mediaId,
    uploadToken: intent.uploadToken,
    ...bindingPayload,
  })
}
