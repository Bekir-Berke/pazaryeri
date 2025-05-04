<template>
    <div class="forbidden-container">
      <div class="forbidden-content">
        <div class="error-code">403</div>
        <h1>Erişim Reddedildi</h1>
        <p>Bu sayfayı görüntülemek için gerekli izinlere sahip değilsiniz.</p>
        <div class="actions">
          <router-link to="/" class="btn-home">
            <i class="bi bi-house-door"></i> Ana Sayfaya Dön
          </router-link>
          <button @click="goBack" class="btn-back">
            <i class="bi bi-arrow-left"></i> Geri Dön
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  
  const goBack = () => {
    router.go(-1);
  };
  </script>
  
  <style scoped>
  .forbidden-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
    padding: 20px;
  }
  
  .forbidden-content {
    text-align: center;
    max-width: 600px;
    background-color: #fff;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  }
  
  .error-code {
    font-size: 6rem;
    font-weight: 700;
    color: #dc3545;
    line-height: 1;
    margin-bottom: 20px;
  }
  
  h1 {
    font-size: 2rem;
    color: #333;
    margin-bottom: 15px;
  }
  
  p {
    color: #666;
    font-size: 1.1rem;
    margin-bottom: 30px;
  }
  
  .actions {
    display: flex;
    justify-content: center;
    gap: 15px;
  }
  
  .btn-home, .btn-back {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
    text-decoration: none;
  }
  
  .btn-home {
    background-color: #007bff;
    color: white;
    border: none;
  }
  
  .btn-home:hover {
    background-color: #0069d9;
  }
  
  .btn-back {
    background-color: #f8f9fa;
    color: #495057;
    border: 1px solid #ddd;
  }
  
  .btn-back:hover {
    background-color: #e9ecef;
  }
  
  @media (max-width: 576px) {
    .actions {
      flex-direction: column;
    }
    
    .error-code {
      font-size: 5rem;
    }
    
    h1 {
      font-size: 1.5rem;
    }
  }
  </style>