/* ============================================================
   BSD After School Club — Axios Instance
   ============================================================ */

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { clearAllAuth, getLocalUser, getLoginRoute } from "./authHelpers";

// ---- Base URL dari environment variable ----
// Di .env.local tambahkan: NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

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
   — Otomatis sisipkan Bearer token dari localStorage
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
   — Tangani error global (401 → redirect ke login sesuai role)
------------------------------------------------------- */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired atau tidak valid → hapus semua auth & redirect ke login
      if (typeof window !== "undefined") {
        const user = getLocalUser();
        clearAllAuth();
        window.location.href = getLoginRoute(user?.role);
      }
    }

    // Kembalikan error agar bisa di-handle di setiap pemanggil
    return Promise.reject(error);
  }
);

export default axiosInstance;
