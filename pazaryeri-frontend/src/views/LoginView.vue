<template>
  <div class="login-view">
    <div class="container">
      <div class="row align-items-center">
         <!--
        <div class="col-lg-6 d-none d-lg-block">
          <div class="login-illustration">
            <div class="illustration-content">
              <div class="logo-container mb-4">
                <img src="" alt="Logo" class="img-fluid" onerror="this.src='https://placehold.co/200x80?text=LOGO'">
              </div>
              <h2>Hoş Geldiniz!</h2>
              <p>Hesabınıza giriş yaparak özel fırsatlardan ve kampanyalardan yararlanabilirsiniz.</p>
              <div class="features">
                <div class="feature-item">
                  <i class="bi bi-truck"></i>
                  <span>Hızlı Teslimat</span>
                </div>
                <div class="feature-item">
                  <i class="bi bi-shield-check"></i>
                  <span>Güvenli Alışveriş</span>
                </div>
                <div class="feature-item">
                  <i class="bi bi-heart"></i>
                  <span>Müşteri Memnuniyeti</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        -->
        
        <div class="col-lg-6 col-md-8 mx-auto">
          <div class="login-card">
            <div class="login-header">
              <h1>Giriş Yap</h1>
              <p>Hesabınıza giriş yaparak alışverişe devam edebilirsiniz</p>
            </div>
            
            <form class="login-form" @submit.prevent="handleLogin">
              <div class="form-group">
                <label for="email">E-posta</label>
                <div class="input-with-icon">
                  <i class="bi bi-envelope"></i>
                  <input 
                    type="email" 
                    id="email" 
                    v-model="email" 
                    class="form-control" 
                    :class="{ 'is-invalid': emailError }" 
                    placeholder="E-posta adresinizi giriniz"
                    required
                    ref="emailInput"
                  >
                </div>
                <div class="invalid-feedback" v-if="emailError">
                  {{ emailError }}
                </div>
              </div>
              
              <div class="form-group">
                <label for="password">Şifre</label>
                <div class="input-with-icon">
                  <i class="bi bi-lock"></i>
                  <input 
                    :type="showPassword ? 'text' : 'password'" 
                    id="password" 
                    v-model="password" 
                    class="form-control" 
                    :class="{ 'is-invalid': passwordError }" 
                    placeholder="Şifrenizi giriniz"
                    required
                  >
                  <button 
                    type="button" 
                    class="password-toggle" 
                    @click="showPassword = !showPassword"
                    aria-label="Şifreyi göster/gizle"
                  >
                    <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
                <div class="invalid-feedback" v-if="passwordError">
                  {{ passwordError }}
                </div>
              </div>
              
              <div class="form-options">
                <!--
                <div class="form-check">
                  <input type="checkbox" class="form-check-input" id="rememberMe" v-model="rememberMe">
                  <label class="form-check-label" for="rememberMe">Beni hatırla</label>
                </div>
                -->
                <router-link to="/forgot-password" class="forgot-link">Şifremi Unuttum</router-link>
              </div>
              
              <button type="submit" class="btn btn-primary login-btn" :disabled="isLoading || !isFormValid" @click="login">
                <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap' }}
              </button>
            </form>
            
            <div class="login-footer">
              <p>Henüz üye değil misiniz? <router-link to="/register">Üye Ol</router-link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import apiClient from '@/api';
import router from '@/router';
import Swal from 'sweetalert2'
import { ref, computed, onMounted } from 'vue';
import { useLoggedInStore } from '@/stores/counter';

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loginStore = useLoggedInStore();

const emailError = ref('');
const passwordError = ref('');
const isLoading = ref(false);

const emailInput = ref(null);

// Form geçerliliği kontrolü
const isFormValid = computed(() => {
  return email.value.trim() !== '' && password.value.trim() !== '';
});

// Sayfa yüklendiğinde email alanına odaklan
onMounted(() => {
  if (emailInput.value) {
    emailInput.value.focus();
  }
});

const login = () => {
  isLoading.value = true;
  apiClient.post('/auth/login', {
    email: email.value,
    passwordHash: password.value
  }).then(response => {
    isLoading.value = false;
    Swal.fire({
      icon: 'success',
      title: 'Giriş Başarılı, Ana Sayfaya Yönlendiriliyorsunuz',
      timer: 2000,
    }).then(() => {
      loginStore.login();
      loginStore.setRole('USER');
      router.push('/');
    })
  }).catch(error => {
    Swal.fire({
      icon: 'error',
      title: 'Hata!',
      text: error.response.data.message
    });
    isLoading.value = false;
    console.error(error.response.data);
  });
}

</script>

<style scoped>
.login-view {
  padding: 60px 0;
  background: linear-gradient(135deg, #f7f9fc 0%, #edf1f7 100%);
  min-height: calc(100vh - 140px);
  display: flex;
  align-items: center;
}

.login-illustration {
  background: linear-gradient(135deg, #ff7f00 0%, #ff9a44 100%);
  border-radius: 16px;
  padding: 40px;
  color: white;
  height: 100%;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 15px 35px rgba(255, 127, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.login-illustration::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='rgba(255,255,255,0.1)' fill-rule='evenodd'/%3E%3C/svg%3E") repeat;
  opacity: 0.15;
}

.illustration-content {
  position: relative;
  z-index: 2;
  text-align: center;
}

.illustration-content h2 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
}

.illustration-content p {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2.5rem;
  opacity: 0.9;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 3rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-align: left;
  background: rgba(255, 255, 255, 0.15);
  padding: 12px 18px;
  border-radius: 100px;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.5s ease-in-out forwards;
  opacity: 0;
}

.feature-item:nth-child(1) {
  animation-delay: 0.2s;
}

.feature-item:nth-child(2) {
  animation-delay: 0.4s;
}

.feature-item:nth-child(3) {
  animation-delay: 0.6s;
}

.feature-item i {
  font-size: 1.5rem;
}

.login-card {
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.07);
  padding: 40px;
  transition: all 0.3s ease;
  transform: translateY(0);
  animation: slideIn 0.5s ease-out forwards;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 35px;
}

.login-header h1 {
  font-size: 2rem;
  color: #333;
  font-weight: 600;
  margin-bottom: 15px;
  position: relative;
  display: inline-block;
}

.login-header h1::after {
  content: '';
  position: absolute;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #ff7f00, #ff9a44);
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 3px;
}

.login-header p {
  color: #777;
  font-size: 1rem;
}

.login-form .form-group {
  margin-bottom: 24px;
}

.login-form label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
  font-size: 0.95rem;
}

.input-with-icon {
  position: relative;
}

.input-with-icon i:first-child {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #aaa;
}

.input-with-icon input {
  padding-left: 45px;
  height: 50px;
  border-radius: 8px;
  border: 1px solid #e0e6ed;
  transition: all 0.3s;
}

.input-with-icon input:focus {
  border-color: #ff7f00;
  box-shadow: 0 0 0 3px rgba(255, 127, 0, 0.15);
  outline: none;
}

.password-toggle {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #aaa;
  cursor: pointer;
  padding: 0;
  font-size: 1rem;
}

.password-toggle:hover {
  color: #ff7f00;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.form-check-input:checked {
  background-color: #ff7f00;
  border-color: #ff7f00;
}

.forgot-link {
  color: #ff7f00;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s;
}

.forgot-link:hover {
  color: #e67300;
  text-decoration: underline;
}

.login-btn {
  display: block;
  width: 100%;
  padding: 14px;
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  background: linear-gradient(90deg, #ff7f00, #ff9a44);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.3), rgba(255,255,255,0));
  transition: left 0.7s ease;
}

.login-btn:hover:not(:disabled)::before {
  left: 100%;
}

.login-btn:hover:not(:disabled) {
  background: linear-gradient(90deg, #e67300, #ff8c30);
  transform: translateY(-2px);
}

.login-btn:focus {
  box-shadow: 0 0 0 3px rgba(255, 127, 0, 0.25);
}

.login-btn:disabled {
  background: linear-gradient(90deg, #ffb066, #ffc299);
  cursor: not-allowed;
}

.login-footer {
  text-align: center;
  margin-top: 30px;
  color: #666;
}

.login-footer a {
  color: #ff7f00;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.3s;
}

.login-footer a:hover {
  color: #e67300;
  text-decoration: underline;
}

.invalid-feedback {
  display: block;
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 5px;
}

/* Sosyal medya giriş alanı */
.social-login {
  margin-top: 30px;
}

.social-divider {
  text-align: center;
  margin-bottom: 20px;
  position: relative;
}

.social-divider::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background-color: #e0e6ed;
}

.social-divider span {
  position: relative;
  background-color: #fff;
  padding: 0 15px;
  color: #999;
  font-size: 0.9rem;
}

.social-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 5px;
}

.social-btn {
  border: 1px solid #e0e6ed;
  background-color: white;
  border-radius: 8px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.social-btn i {
  margin-right: 10px;
  font-size: 1.1rem;
}

.google-btn:hover {
  background-color: #f2f2f2;
  border-color: #ddd;
  color: #333;
}

.facebook-btn:hover {
  background-color: #f0f2f7;
  border-color: #ddd;
  color: #3b5998;
}

.apple-btn {
  border: 1px solid #e0e6ed;
  background-color: white;
  color: #555;
}

.apple-btn:hover {
  background-color: #f2f2f2;
  border-color: #ddd;
  color: #000;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

/* Animasyonlar */
@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  0% { opacity: 0; transform: translateX(20px); }
  100% { opacity: 1; transform: translateX(0); }
}

/* Responsive tasarım */
@media (max-width: 991px) {
  .login-view {
    padding: 40px 0;
  }
}

@media (max-width: 768px) {
  .login-view {
    padding: 30px 15px;
  }
  
  .login-card {
    padding: 30px 20px;
  }
  
  .social-buttons {
    gap: 10px;
  }
  
  .social-btn {
    font-size: 0.9rem;
  }
}

@media (max-width: 575px) {
  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .login-card {
    border-radius: 12px;
    padding: 25px 20px;
  }
}
</style>