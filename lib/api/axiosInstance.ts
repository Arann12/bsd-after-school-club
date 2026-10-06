/* ============================================================
   BSD After School Club â€” Axios Instance
   ============================================================ */

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

// ---- Base URL dari environment variable ----
// Di .env.local tambahkan: NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

// ---- Create axios instance ----
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* -------------------------------------------------------
   REQUEST INTERCEPTOR
   â€” Otomatis sisipkan Bearer token dari localStorage
------------------------------------------------------- */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Hanya berjalan di client-side
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/* -------------------------------------------------------
   RESPONSE INTERCEPTOR
   â€” Tangani error global (401 â†’ redirect ke login, transient network drop retry)
------------------------------------------------------- */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const config = error.config as (InternalAxiosRequestConfig & { _retryCount?: number }) | undefined;

    // Tangani transient network drop (koneksi dev server single-threaded terputus mendadak atau socket reset)
    // Retry otomatis 1 kali dengan jeda 250ms sebelum melempar error ke komponen UI
    if (!error.response && config && (config._retryCount || 0) < 1) {
      config._retryCount = (config._retryCount || 0) + 1;
      await new Promise((resolve) => setTimeout(resolve, 250));
      return axiosInstance(config);
    }

    if (error.response?.status === 401) {
      // Token expired atau tidak valid â†’ hapus token & redirect ke login
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        window.location.href = "/login";
      }
    }

    // Kembalikan error agar bisa di-handle di setiap pemanggil
    return Promise.reject(error);
  }
);

export default axiosInstance;

