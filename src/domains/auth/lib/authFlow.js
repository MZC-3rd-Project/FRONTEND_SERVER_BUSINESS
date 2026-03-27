const DEFAULT_REDIRECT_PATH = "/business/dashboard"
const LOGIN_ROUTE_PATH = "/auth/login"
const AUTH_REDIRECT_STORAGE_KEY = "donmoa.business.auth.redirect"

export function normalizeRedirectPath(value, fallback = DEFAULT_REDIRECT_PATH) {
  if (!value || typeof value !== "string") {
    return fallback
  }

  return value.startsWith("/") ? value : fallback
}

export function isAuthRoutePath(pathname) {
  return typeof pathname === "string" && pathname.startsWith("/auth")
}

export function getCurrentAppPath() {
  if (typeof window === "undefined") {
    return DEFAULT_REDIRECT_PATH
  }

  const { pathname, search, hash } = window.location
  return normalizeRedirectPath(`${pathname}${search}${hash}`)
}

export function storeAuthRedirectPath(path) {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.setItem(
    AUTH_REDIRECT_STORAGE_KEY,
    normalizeRedirectPath(path)
  )
}

export function consumeAuthRedirectPath() {
  if (typeof window === "undefined") {
    return null
  }

  const storedPath = window.sessionStorage.getItem(AUTH_REDIRECT_STORAGE_KEY)
  window.sessionStorage.removeItem(AUTH_REDIRECT_STORAGE_KEY)
  return storedPath ? normalizeRedirectPath(storedPath) : null
}

export function clearAuthRedirectPath() {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.removeItem(AUTH_REDIRECT_STORAGE_KEY)
}

export function buildLoginPageUrl(path = DEFAULT_REDIRECT_PATH) {
  const normalizedPath = normalizeRedirectPath(path)
  return `${LOGIN_ROUTE_PATH}?redirect=${encodeURIComponent(normalizedPath)}`
}

export function buildGatewayLoginUrl(path = DEFAULT_REDIRECT_PATH) {
  const loginPath =
    import.meta.env.VITE_AUTH_LOGIN_PATH ?? "/oauth2/authorization/keycloak"
  const normalizedPath = normalizeRedirectPath(path)
  return `${loginPath}?redirect=${encodeURIComponent(normalizedPath)}`
}

export function redirectToLogin(path = getCurrentAppPath()) {
  if (typeof window === "undefined") {
    return
  }

  const normalizedPath = normalizeRedirectPath(path)
  storeAuthRedirectPath(normalizedPath)

  if (isAuthRoutePath(window.location.pathname)) {
    return
  }

  window.location.assign(buildLoginPageUrl(normalizedPath))
}
