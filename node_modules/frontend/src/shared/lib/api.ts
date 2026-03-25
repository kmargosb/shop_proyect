const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

/* ============================================
   🔐 REFRESH TOKEN
============================================ */

async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    return res.ok;
  } catch {
    return false;
  }
}

/* ============================================
   🌐 BASE FETCH (PRIVATE - WITH AUTH)
============================================ */

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response | null> {
  try {
    const isJSONBody =
      options.body && !(options.body instanceof FormData);

    let response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(isJSONBody && { "Content-Type": "application/json" }),
        ...(options.headers || {}),
      },
    });

    /* ============================
       ACCESS TOKEN EXPIRED
    ============================ */

    if (response.status === 401) {
      const refreshed = await refreshAccessToken();

      if (!refreshed) {
        window.location.href = "/login";
        return null;
      }

      // retry
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: "include",
        headers: {
          ...(isJSONBody && { "Content-Type": "application/json" }),
          ...(options.headers || {}),
        },
      });
    }

    /* ============================
       STILL UNAUTHORIZED
    ============================ */

    if (response.status === 401 || response.status === 403) {
      window.location.href = "/login";
      return null;
    }

    return response;
  } catch (error) {
    console.error("API error:", error);
    return null;
  }
}

/* ============================================
   🌍 PUBLIC FETCH (NO AUTH LOGIC)
============================================ */

export async function publicFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const res = await fetch(`${API_URL}${endpoint}`, options);

  if (!res.ok) {
    throw new Error(`Public API error: ${res.status}`);
  }

  return res;
}

/* ============================================
   📄 DOWNLOAD PUBLIC INVOICE
============================================ */

export async function downloadInvoice(
  orderId: string,
  email?: string
) {
  let url = `/orders/public/${orderId}/invoice`;

  if (email) {
    url += `?email=${email}`;
  }

  const res = await publicFetch(url, {
    method: "GET",
  });

  const blob = await res.blob();

  const fileURL = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = fileURL;
  link.download = `invoice-${orderId}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(fileURL);
}