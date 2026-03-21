import apiInstance from "@/common/api/apiInstance.js"

export async function createCampaign(payload) {
  const { data } = await apiInstance.post("/campaigns", payload)
  return data
}

export async function updateCampaign(campaignId, payload) {
  const { data } = await apiInstance.put(`/campaigns/${campaignId}`, payload)
  return data
}

export async function cancelCampaign(campaignId, reason) {
  const params = reason ? { reason } : {}
  const { data } = await apiInstance.post(`/campaigns/${campaignId}/cancel`, null, { params })
  return data
}

export async function getCampaigns(params = {}) {
  const { data } = await apiInstance.get("/campaigns", { params })
  return data?.data ?? { content: [], nextCursor: null }
}

export async function getCampaignById(campaignId) {
  const { data } = await apiInstance.get(`/campaigns/${campaignId}`)
  return data?.data ?? null
}

export async function getCampaignByItemId(itemId) {
  const { data } = await apiInstance.get(`/campaigns/item/${itemId}`)
  return data?.data ?? null
}

export async function getCampaignProgress(campaignId) {
  const { data } = await apiInstance.get(`/campaigns/${campaignId}/progress`)
  return data?.data ?? null
}
