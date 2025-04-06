<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-illustration">
        <div class="error-code">404</div>
        <div class="icon-container">
        </div>
      </div>
      
      <h1 class="not-found-title">Sayfa Bulunamadı</h1>
      <p class="not-found-message">
        Üzgünüz, aradığınız sayfa bulunamadı veya taşınmış olabilir.
      </p>
      
      <div class="action-buttons">
        <router-link to="/" class="home-btn">
          <i class="bi bi-house-fill"></i> Ana Sayfa'ya Dön
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// İşlevsellik eklemek isterseniz buraya ekleyebilirsiniz
</script>

<style scoped>
.not-found-container {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  background-color: #f7f9fc;
}

.not-found-content {
  max-width: 500px;
  text-align: center;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  padding: 60px 40px;
  animation: fadeIn 0.6s ease-out;
}

.error-illustration {
  position: relative;
  height: 150px;
  margin-bottom: 30px;
}

.error-code {
  font-size: 120px;
  font-weight: 800;
  line-height: 1;
  color: #ff7f00;
  opacity: 0.15;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  text-align: center;
  letter-spacing: -5px;
}

.icon-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.icon-container i {
  font-size: 70px;
  color: #ff7f00;
  animation: bounce 2s ease infinite;
}

.not-found-title {
  font-size: 28px;
  color: #333;
  margin-bottom: 16px;
  font-weight: 600;
}

.not-found-message {
  color: #666;
  font-size: 18px;
  margin: 0 auto 30px;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  justify-content: center;
}

.home-btn {
  background: #ff7f00;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 28px;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(255, 127, 0, 0.2);
}

.home-btn:hover {
  background: #e67300;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(255, 127, 0, 0.3);
}

/* Animasyonlar */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Responsive tasarım */
@media (max-width: 576px) {
  .not-found-content {
    padding: 40px 20px;
  }
  
  .error-code {
    font-size: 100px;
  }
  
  .icon-container i {
    font-size: 60px;
  }
  
  .not-found-title {
    font-size: 24px;
  }
  
  .not-found-message {
    font-size: 16px;
  }
  
  .home-btn {
    padding: 12px 24px;
    font-size: 15px;
  }
}
</style>
