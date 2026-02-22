const API_URL = process.env.NEXT_PUBLIC_API_URL as string

async function refreshAccessToken() {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })

    if (!res.ok) {
      return false
    }

    return true
  } catch {
    return false
  }
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  try {
    let response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: "include",
    })

    /* ============================
       SI ACCESS EXPIRÓ → INTENTAR REFRESH
    ============================ */

    if (response.status === 401) {
      const refreshed = await refreshAccessToken()

      if (!refreshed) {
        // 🔥 NO reload
        // 🔥 NO refresh
        // 🔥 NO loop

        window.location.href = "/login"
        return null
      }

      // Reintentar request original
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: "include",
      })
    }

    /* ============================
       SI DESPUÉS DEL REFRESH SIGUE FALLANDO
    ============================ */

    if (response.status === 401 || response.status === 403) {
      window.location.href = "/login"
      return null
    }

    return response
  } catch (error) {
    console.error("Error de red:", error)
    return null
  }
}