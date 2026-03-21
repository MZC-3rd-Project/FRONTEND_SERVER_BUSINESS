import apiInstance from "@/common/api/apiInstance.js"

export async function  getSellerProducts() {
  const { data } = await apiInstance.get("/products");
  console.log(data);
  return data?.data;
}

export async function getCategories() {
  const { data } = await apiInstance.get("/categories/tree")
  return data?.data || []
}


export async function getMyStore() {
  const { data } = await apiInstance.get("/store")
  return data?.data?.[0] ?? null
}

export async function createGoods(payload) {
  console.log(payload)
  const { data } = await apiInstance.post("/goods", payload)
  return data
}

export async function createPerformance(payload) {
  console.log("payload : ",payload);
  const { data } = await apiInstance.post("/performances", payload)
  return data
}

export async function toggleProductStatus(itemId, status) {
  const { data } = await apiInstance.patch(`/items/${itemId}/status`, { status })
  return data
}

export async function deleteProduct(itemId) {
  const { data } = await apiInstance.delete(`/products/${itemId}`)
  return data
}
