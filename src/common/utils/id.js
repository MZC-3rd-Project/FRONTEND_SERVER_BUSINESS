export function toIdString(value, fallback = "") {
  if (value === null || value === undefined) {
    return fallback
  }

  const normalized = String(value).trim()
  return normalized || fallback
}

export function encodeIdPathSegment(value, fallback = "") {
  return encodeURIComponent(toIdString(value, fallback))
}

export function isNumericId(value) {
  return /^\d+$/.test(toIdString(value))
}
