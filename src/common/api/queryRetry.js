export function shouldRetryRequest(failureCount, error) {
  const status = error?.status

  if (typeof status === "number" && status >= 400 && status < 500) {
    return false
  }

  return failureCount < 2
}
