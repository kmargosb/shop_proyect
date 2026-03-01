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
    const isJSONBody =
      options.body && !(options.body instanceof FormData);

    let response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: "include",

      headers: {
        ...(isJSONBody && {
          "Content-Type": "application/json",
        }),
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

      // retry original request
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: "include",

        headers: {
          ...(isJSONBody && {
            "Content-Type": "application/json",
          }),
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
    console.error("Error de red:", error);
    return null;
  }
}

//Descargar Factura

export async function downloadInvoice(orderId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/invoice`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (!res.ok) {
    throw new Error("No se pudo descargar la factura");
  }

  const blob = await res.blob();

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice-${orderId}.pdf`;
  a.click();

  window.URL.revokeObjectURL(url);
}