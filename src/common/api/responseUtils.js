function createNormalizedApiError({
  message,
  status = null,
  code = null,
  method = null,
  url = null,
  body = null,
}) {
  const normalizedError = new Error(message)
  normalizedError.status = status
  normalizedError.code = code
  normalizedError.method = method
  normalizedError.url = url
  normalizedError.body = body

  return normalizedError
}

export function unwrapApiResponseBody(response, fallbackMessage = "데이터를 불러오지 못했습니다.") {
  const body = response?.data

  if (body?.success === true) {
    return body.data
  }

  if (body?.success === false) {
    const message = body?.error?.message || body?.message || fallbackMessage
    throw createNormalizedApiError({
      message,
      status: response?.status ?? null,
      code: body?.error?.code ?? null,
      method: response?.config?.method?.toUpperCase?.() ?? null,
      url: response?.config?.url ?? null,
      body,
    })
  }

  return body
}

export function normalizeApiError(error, fallbackMessage) {
  const message =
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage

  return createNormalizedApiError({
    message,
    status: error?.response?.status ?? null,
    code: error?.response?.data?.error?.code || error?.code || null,
    method: error?.config?.method?.toUpperCase?.() ?? null,
    url: error?.config?.url ?? null,
    body: error?.response?.data ?? null,
  })
}
