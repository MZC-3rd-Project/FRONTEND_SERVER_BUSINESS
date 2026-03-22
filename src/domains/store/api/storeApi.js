import apiInstance from "@/common/api/apiInstance.js";



//"http://localhost:8072/api/store"
export async function createStore(data) {
  const response = await apiInstance.post(`/store`, data,{
    headers: {
      "X-User-Id": 505, // headers 지우기
    }
  })
  return response.data
}
