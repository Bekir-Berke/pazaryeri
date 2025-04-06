<template>
  <div class="register-view">
    <div class="container">
      <div class="row justify-content-center align-items-center">
        <div class="col-lg-6 col-md-8 mx-auto">
          <div class="register-card">
            <div class="register-header">
              <h1>Üye Ol</h1>
              <p>Hesabınızı oluşturun ve alışverişe başlayın</p>
            </div>

            <form class="register-form" @submit.prevent="handleRegister">
              <!-- Ad input -->
              <div class="form-group">
                <label for="fullName">Ad</label>
                <div class="input-with-icon">
                  <i class="bi bi-person"></i>
                  <input
                    type="text"
                    id="firstName"
                    v-model="firstName"
                    class="form-control"
                    :class="{ 'is-invalid': fullNameError }"
                    placeholder="Adınızı giriniz"
                    required
                  />
                </div>
                <div class="invalid-feedback" v-if="fullNameError">
                  {{ fullNameError }}
                </div>
              </div>
              <!-- Soyad input -->
              <div class="form-group">
                <label for="fullName">Soyad</label>
                <div class="input-with-icon">
                  <i class="bi bi-person"></i>
                  <input
                    type="text"
                    id="lastName"
                    v-model="lastName"
                    class="form-control"
                    :class="{ 'is-invalid': fullNameError }"
                    placeholder="Soyadınızı giriniz"
                    required
                  />
                </div>
                <div class="invalid-feedback" v-if="fullNameError">
                  {{ fullNameError }}
                </div>
              </div>

              <!-- Email input -->
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
                  />
                </div>
                <div class="invalid-feedback" v-if="emailError">
                  {{ emailError }}
                </div>
              </div>

              <!-- Parola input -->
              <div class="form-group">
                <label for="password">Parola</label>
                <div class="input-with-icon">
                  <i class="bi bi-lock"></i>
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    id="password"
                    v-model="password"
                    class="form-control"
                    :class="{ 'is-invalid': passwordError }"
                    placeholder="Parolanızı giriniz"
                    required
                  />
                  <button
                    type="button"
                    class="password-toggle"
                    @click="showPassword = !showPassword"
                    aria-label="Parolayı göster/gizle"
                  >
                    <i
                      :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
                    ></i>
                  </button>
                </div>
                <div class="invalid-feedback" v-if="passwordError">
                  {{ passwordError }}
                </div>
                <div class="password-strength" v-if="password">
                  <div class="strength-meter">
                    <div
                      class="strength-level"
                      :style="{ width: passwordStrength.percent + '%' }"
                      :class="passwordStrength.class"
                    ></div>
                  </div>
                  <div class="strength-text" :class="passwordStrength.class">
                    {{ passwordStrength.text }}
                  </div>
                </div>
              </div>

              <!-- Parola Tekrar input -->
              <div class="form-group">
                <label for="confirmPassword">Parola Tekrar</label>
                <div class="input-with-icon">
                  <i class="bi bi-lock-fill"></i>
                  <input
                    :type="showConfirmPassword ? 'text' : 'password'"
                    id="confirmPassword"
                    v-model="confirmPassword"
                    class="form-control"
                    :class="{ 'is-invalid': confirmPasswordError }"
                    placeholder="Parolanızı tekrar giriniz"
                    required
                  />
                  <button
                    type="button"
                    class="password-toggle"
                    @click="showConfirmPassword = !showConfirmPassword"
                    aria-label="Parola tekrarını göster/gizle"
                  >
                    <i
                      :class="
                        showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'
                      "
                    ></i>
                  </button>
                </div>
                <div class="invalid-feedback" v-if="confirmPasswordError">
                  {{ confirmPasswordError }}
                </div>
              </div>

              <!-- Koşulları kabul etme checkbox -->
              <div class="form-group form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="acceptTerms"
                  v-model="acceptTerms"
                  :class="{ 'is-invalid': termsError }"
                  required
                />
                <label class="form-check-label" for="acceptTerms">
                  <span class="terms-text">
                    <router-link to="/terms" target="_blank"
                      >Üyelik Koşulları</router-link
                    >'nı ve
                    <router-link to="/privacy" target="_blank"
                      >Gizlilik Politikası</router-link
                    >'nı okudum, kabul ediyorum
                  </span>
                </label>
                <div class="invalid-feedback" v-if="termsError">
                  {{ termsError }}
                </div>
              </div>

              <!-- Kayıt ol butonu -->
              <button
                type="submit"
                class="btn btn-primary register-btn"
                :disabled="isLoading || !isFormValid"
              >
                <span
                  v-if="isLoading"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                {{ isLoading ? "Kayıt Yapılıyor..." : "Üye Ol" }}
              </button>
            </form>

            <div class="register-footer">
              <p>
                Zaten üye misiniz?
                <router-link to="/login">Giriş Yap</router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
  <script setup>
import apiClient from "@/api";
import Swal from "sweetalert2";
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// Form verileri
const firstName = ref("");
const lastName = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const acceptTerms = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// Hata yönetimi
const fullNameError = ref("");
const emailError = ref("");
const passwordError = ref("");
const confirmPasswordError = ref("");
const termsError = ref("");
const isLoading = ref(false);

// Form geçerliliği kontrolü
const isFormValid = computed(() => {
  return (
    firstName.value.trim() !== "" &&
    lastName.value.trim() !== "" &&
    email.value.trim() !== "" &&
    password.value.trim() !== "" &&
    confirmPassword.value.trim() !== "" &&
    password.value === confirmPassword.value &&
    acceptTerms.value
  );
});

// Parola gücünü hesapla
const passwordStrength = computed(() => {
  if (!password.value) {
    return { percent: 0, class: "", text: "" };
  }

  let strength = 0;
  const pwd = password.value;

  // En az 8 karakter
  if (pwd.length >= 8) strength += 25;

  // Büyük harf içeriyor mu
  if (/[A-Z]/.test(pwd)) strength += 25;

  // Küçük harf içeriyor mu
  if (/[a-z]/.test(pwd)) strength += 25;

  // Sayı veya özel karakter içeriyor mu
  if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength += 25;

  let strengthClass = "";
  let strengthText = "";

  if (strength === 0) {
    strengthClass = "";
    strengthText = "";
  } else if (strength <= 25) {
    strengthClass = "very-weak";
    strengthText = "Çok zayıf";
  } else if (strength <= 50) {
    strengthClass = "weak";
    strengthText = "Zayıf";
  } else if (strength <= 75) {
    strengthClass = "medium";
    strengthText = "Orta";
  } else {
    strengthClass = "strong";
    strengthText = "Güçlü";
  }

  return {
    percent: strength,
    class: strengthClass,
    text: strengthText,
  };
});

// Parola eşleşme kontrolü
watch(confirmPassword, () => {
  if (confirmPassword.value && password.value !== confirmPassword.value) {
    confirmPasswordError.value = "Parolalar eşleşmiyor";
  } else {
    confirmPasswordError.value = "";
  }
});

// Kayıt işlemi
const handleRegister = async () => {
  // Hata mesajlarını temizle
  fullNameError.value = "";
  emailError.value = "";
  passwordError.value = "";
  confirmPasswordError.value = "";
  termsError.value = "";

  // Basit doğrulama
  if (firstName.value.trim().length < 3 && lastName.value.trim().length < 3) {
    fullNameError.value = "Ad soyad en az 3 karakter olmalıdır";
    return;
  }

  if (!validateEmail(email.value)) {
    emailError.value = "Lütfen geçerli bir e-posta adresi giriniz";
    return;
  }

  if (password.value.length < 6) {
    passwordError.value = "Parola en az 6 karakter olmalıdır";
    return;
  }

  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = "Parolalar eşleşmiyor";
    return;
  }

  if (!acceptTerms.value) {
    termsError.value = "Üyelik koşullarını kabul etmelisiniz";
    return;
  }

  try {
    apiClient.post('/auth/register', {
      firstName:firstName.value,
      lastName:lastName.value,
      email:email.value,
      passwordHash:password.value
    }).then((response) => {
      Swal.fire({
        icon: "success",
        title: "Başarılı!",
        text: "Kayıt işlemi başarılı. Giriş yapabilirsiniz.",
        showConfirmButton: false,
        timer: 2000,
      }).then(() => {
        router.push("/login");
      });
    });
  } catch (error) {
    console.error("Kayıt hatası:", error);
  } finally {
    isLoading.value = false;
  }
};

// Email doğrulama fonksiyonu
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}
</script>
  
  <style scoped>
.register-view {
  padding: 60px 0;
  background: linear-gradient(135deg, #f7f9fc 0%, #edf1f7 100%);
  min-height: calc(100vh - 140px);
  display: flex;
  align-items: center;
}

.register-illustration {
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

.register-illustration::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='rgba(255,255,255,0.1)' fill-rule='evenodd'/%3E%3C/svg%3E")
    repeat;
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

.register-card {
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.07);
  padding: 40px;
  transition: all 0.3s ease;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h1 {
  font-size: 2rem;
  color: #333;
  font-weight: 600;
  margin-bottom: 15px;
  position: relative;
  display: inline-block;
}

.register-header h1::after {
  content: "";
  position: absolute;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #ff7f00, #ff9a44);
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 3px;
}

.register-header p {
  color: #777;
  font-size: 1rem;
}

.register-form .form-group {
  margin-bottom: 24px;
}

.register-form label {
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

.register-btn {
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

.register-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 0.3),
    rgba(255, 255, 255, 0)
  );
  transition: left 0.7s ease;
}

.register-btn:hover:not(:disabled)::before {
  left: 100%;
}

.register-btn:hover:not(:disabled) {
  background: linear-gradient(90deg, #e67300, #ff8c30);
  transform: translateY(-2px);
}

.register-btn:focus {
  box-shadow: 0 0 0 3px rgba(255, 127, 0, 0.25);
}

.register-btn:disabled {
  background: linear-gradient(90deg, #ffb066, #ffc299);
  cursor: not-allowed;
}

.register-footer {
  text-align: center;
  margin-top: 30px;
  color: #666;
}

.register-footer a {
  color: #ff7f00;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.3s;
}

.register-footer a:hover {
  color: #e67300;
  text-decoration: underline;
}

.invalid-feedback {
  display: block;
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 5px;
}

.form-check {
  position: relative;
  padding-left: 1.5rem;
}

.form-check .form-check-input {
  position: absolute;
  margin-top: 0.25rem;
  margin-left: -1.5rem;
}

.form-check-input:checked {
  background-color: #ff7f00;
  border-color: #ff7f00;
}

.terms-text {
  font-size: 0.9rem;
  color: #555;
}

.terms-text a {
  color: #ff7f00;
  text-decoration: none;
  font-weight: 500;
}

.terms-text a:hover {
  text-decoration: underline;
}

.password-strength {
  margin-top: 10px;
}

.strength-meter {
  height: 4px;
  background-color: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.strength-level {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.strength-level.very-weak {
  background-color: #ff4d4d;
}

.strength-level.weak {
  background-color: #ffa64d;
}

.strength-level.medium {
  background-color: #ffcc4d;
}

.strength-level.strong {
  background-color: #4caf50;
}

.strength-text {
  margin-top: 5px;
  font-size: 0.8rem;
  text-align: right;
}

.strength-text.very-weak {
  color: #ff4d4d;
}

.strength-text.weak {
  color: #ffa64d;
}

.strength-text.medium {
  color: #ffcc4d;
}

.strength-text.strong {
  color: #4caf50;
}

/* Animasyonlar */
@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive tasarım */
@media (max-width: 991px) {
  .register-view {
    padding: 40px 0;
  }
}

@media (max-width: 768px) {
  .register-view {
    padding: 30px 15px;
  }

  .register-card {
    padding: 30px 20px;
  }
}

@media (max-width: 575px) {
  .register-card {
    border-radius: 12px;
    padding: 25px 20px;
  }

  .input-with-icon input {
    height: 45px;
  }

  .register-header h1 {
    font-size: 1.8rem;
  }
}
</style>