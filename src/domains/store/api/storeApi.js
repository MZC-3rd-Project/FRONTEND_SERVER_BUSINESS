import apiInstance from "@/common/api/apiInstance.js";
import { demoCreateStore, isDemoModeEnabled } from "@/domains/management/mock/demoBackend.js";



//"http://localhost:8072/api/store"
export async function createStore(data) {
  if (isDemoModeEnabled()) {
    return demoCreateStore(data)
  }
  const response = await apiInstance.post(`/store`, data,{
    headers: {
      "X-User-Id": 505, // headers 지우기
    }
  })
  return response.data
}
