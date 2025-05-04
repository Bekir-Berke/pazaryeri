import axios from "axios";
import router from "./router";

const apiClient = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
/*
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
)

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await apiClient.get("/auth/refresh");
        await new Promise(resolve => setTimeout(resolve, 100));
        return apiClient(originalRequest);
      } catch (err) {
        console.error("Refresh token hatası:", err);  
        if (err.response && err.response.status === 401) {
          console.log("Oturum süresi doldu, yeniden giriş yapılmalı");
          await new Promise(resolve => setTimeout(resolve, 300));
          router.push({ name: "login" });
        }
        
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
)
*/
export default apiClient;