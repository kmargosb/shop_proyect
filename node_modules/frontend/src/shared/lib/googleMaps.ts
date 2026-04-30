let isLoaded = false;
let loadingPromise: Promise<void> | null = null;

export function loadGoogleMaps(): Promise<void> {
  // ✅ ya cargado
  if (isLoaded && typeof window !== "undefined" && (window as any).google) {
    return Promise.resolve();
  }

  // ✅ ya en proceso de carga
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    const existingScript = document.getElementById("google-maps");

    // ✅ si ya existe script
    if (existingScript) {
      if ((window as any).google) {
        isLoaded = true;
        resolve();
      } else {
        existingScript.addEventListener("load", () => {
          isLoaded = true;
          resolve();
        });
      }
      return;
    }

    // 🚀 crear script UNA SOLA VEZ
    const script = document.createElement("script");
    script.id = "google-maps";

    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&v=beta&loading=async`;

    script.async = true;
    script.defer = true;

    script.onload = () => {
      isLoaded = true;
      resolve();
    };

    script.onerror = () => {
      reject(new Error("Error loading Google Maps"));
    };

    document.head.appendChild(script);
  });

  return loadingPromise;
}