import apiInstance from "@/common/api/apiInstance.js"
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils.js"
import {
  demoCancelCampaign,
  demoCreateCampaign,
  demoGetCampaignById,
  demoGetCampaignByItemId,
  demoGetCampaignProgress,
  demoGetCampaigns,
  demoUpdateCampaign,
  isDemoModeEnabled,
} from "@/domains/management/mock/demoBackend.js"

export async function createCampaign(payload) {
  if (isDemoModeEnabled()) {
    return demoCreateCampaign(payload)
  }
  try {
    const response = await apiInstance.post("/campaigns", payload)
    return unwrapApiResponseBody(response, "펀딩 캠페인 생성에 실패했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "펀딩 캠페인 생성에 실패했습니다.")
  }
}

export async function updateCampaign(campaignId, payload) {
  if (isDemoModeEnabled()) {
    return demoUpdateCampaign(campaignId, payload)
  }
  try {
    const response = await apiInstance.put(`/campaigns/${campaignId}`, payload)
    return unwrapApiResponseBody(response, "펀딩 캠페인 수정에 실패했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "펀딩 캠페인 수정에 실패했습니다.")
  }
}

export async function cancelCampaign(campaignId, reason) {
  if (isDemoModeEnabled()) {
    return demoCancelCampaign(campaignId, reason)
  }
  try {
    const params = reason ? { reason } : {}
    const response = await apiInstance.post(`/campaigns/${campaignId}/cancel`, null, { params })
    return unwrapApiResponseBody(response, "펀딩 캠페인 취소에 실패했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "펀딩 캠페인 취소에 실패했습니다.")
  }
}

export async function reactivateCampaign(campaignId, payload) {
  if (isDemoModeEnabled()) {
    return demoUpdateCampaign(campaignId, payload)
  }
  try {
    const response = await apiInstance.post(`/campaigns/${campaignId}/reactivate`, payload)
    return unwrapApiResponseBody(response, "펀딩 캠페인 재활성화에 실패했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "펀딩 캠페인 재활성화에 실패했습니다.")
  }
}

export async function getCampaigns(params = {}) {
  if (isDemoModeEnabled()) {
    return demoGetCampaigns(params)
  }
  try {
    const response = await apiInstance.get("/campaigns", { params })
    return unwrapApiResponseBody(response, "펀딩 캠페인 목록을 불러오지 못했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "펀딩 캠페인 목록 조회에 실패했습니다.")
  }
}

export async function getCampaignById(campaignId) {
  if (isDemoModeEnabled()) {
    return demoGetCampaignById(campaignId)
  }
  try {
    const response = await apiInstance.get(`/campaigns/${campaignId}`)
    return unwrapApiResponseBody(response, "펀딩 캠페인 정보를 불러오지 못했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "펀딩 캠페인 조회에 실패했습니다.")
  }
}

export async function getCampaignByItemId(itemId) {
  if (isDemoModeEnabled()) {
    return demoGetCampaignByItemId(itemId)
  }
  try {
    const response = await apiInstance.get(`/campaigns/item/${itemId}`)
    return unwrapApiResponseBody(response, "상품별 펀딩 정보를 불러오지 못했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "상품별 펀딩 조회에 실패했습니다.")
  }
}

export async function getCampaignProgress(campaignId) {
  if (isDemoModeEnabled()) {
    return demoGetCampaignProgress(campaignId)
  }
  try {
    const response = await apiInstance.get(`/campaigns/${campaignId}/progress`)
    return unwrapApiResponseBody(response, "펀딩 진행률을 불러오지 못했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "펀딩 진행률 조회에 실패했습니다.")
  }
}
