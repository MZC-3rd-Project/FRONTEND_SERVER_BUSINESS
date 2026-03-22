import apiInstance from "@/common/api/apiInstance.js"

export async function createHotDeal(payload) {
  console.log(payload)
  const { data } = await apiInstance.post("/v1/hot-deals", payload)
  return data
}

export async function getHotDeals(params = {}) {
  const { data } = await apiInstance.get("/v1/hot-deals", { params })
  return data?.data ?? []
}

export async function getHotDealById(hotDealId) {
  const { data } = await apiInstance.get(`/v1/hot-deals/${hotDealId}`)
  return data?.data ?? null
}
