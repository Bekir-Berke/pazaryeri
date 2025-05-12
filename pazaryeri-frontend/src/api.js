import axios from "axios";
import router from "./router";

const apiClient = axios.create({
  baseURL:"http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// İstek interceptor'ı
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Yanıt interceptor'ı
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response && 
      error.response.status === 401 && 
      (originalRequest.url === "/auth/me" || originalRequest.url.endsWith("/auth/me"))
    ) {
      return Promise.resolve({ 
        data: { 
          isLoggedIn: false, 
          message: "Kullanıcı giriş yapmamış" 
        } 
      });
    }
    if (
      error.response && 
      error.response.status === 401 && 
      !originalRequest._retry &&
      (error.response.data.message === "Token bulunamadı" || 
       error.response.data.message === "Token geçersiz")
    ) {
      originalRequest._retry = true;
      
      try {
        console.log("Token yenileniyor...");
        
        // Refresh token endpoint'ini çağırıyoruz
        const response = await axios.get("http://localhost:3000/auth/refresh", {
          withCredentials: true
        });
        
        console.log("Token yenilendi:", response.data);
        
        // Kısa bir gecikme ile token'ın cookie'lere yazılmasını bekleyin
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Orijinal isteği tekrar gönder
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token hatası:", refreshError);
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;