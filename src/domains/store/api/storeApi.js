import axios from "axios"

// TODO: URL을 입력해주세요
const BASE_URL = "/api" // test용 instance + env로 변경하기

//"http://localhost:8072/api/store"
export async function createStore(data) {
  const response = await axios.post(`${BASE_URL}/store`, data,{
    headers: {
      "X-User-Id": 504, // headers 지우기
    }
  })
  return response.data
}
