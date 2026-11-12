// Cliente HTTP do painel Conliz.
// A sessão vive em cookies HttpOnly + CSRF double-submit: o backend exige o header
// X-XSRF-TOKEN em todo método não seguro (PATCH/POST/PUT/DELETE).

export const CSRF_COOKIE = "XSRF-TOKEN";
export const CSRF_HEADER = "X-XSRF-TOKEN";
export const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

/** Lê um cookie pelo nome; devolve "" quando não existe (SSR, cookie ausente). */
export function readCookie(cookieString, name) {
  if (!cookieString) return "";
  for (const part of String(cookieString).split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    if (part.slice(0, index).trim() === name) {
      return decodeURIComponent(part.slice(index + 1).trim());
    }
  }
  return "";
}

/**
 * Monta os headers de uma requisição: JSON quando há corpo, e o token CSRF
 * sempre que o método altera estado.
 */
export function buildHeaders(method, body, cookieString) {
  const headers = {};
  if (body !== undefined && body !== null) {
    headers["Content-Type"] = "application/json";
  }
  if (!SAFE_METHODS.includes(String(method || "GET").toUpperCase())) {
    const token = readCookie(cookieString, CSRF_COOKIE);
    if (token) headers[CSRF_HEADER] = token;
  }
  return headers;
}

/** fetch autenticado: cookies de sessão + CSRF automático. */
export async function apiFetch(url, options = {}) {
  const method = options.method || "GET";
  const cookieString = typeof document !== "undefined" ? document.cookie : "";
  const headers = { ...buildHeaders(method, options.body, cookieString), ...(options.headers || {}) };

  const response = await fetch(url, { ...options, method, headers, credentials: "same-origin" });

  if (response.status === 401 && typeof window !== "undefined") {
    window.location.href = "/gestao-conliz-acesso";
  }
  return response;
}
