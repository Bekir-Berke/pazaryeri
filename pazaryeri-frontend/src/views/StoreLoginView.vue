<template>
  <div class="store-login">
    <div class="container py-5">
      <div class="login-container">
        <div class="card">
          <div class="card-header text-center">
            <h2>Mağaza Paneli Girişi</h2>
            <p class="text-muted">Mağaza panelinize erişmek için giriş yapın</p>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="email" class="form-label">E-posta Adresi</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="email"
                  placeholder="ornek@magazaniz.com"
                  required
                  :class="{ 'is-invalid': errors.email }"
                />
                <div class="invalid-feedback" v-if="errors.email">
                  {{ errors.email }}
                </div>
              </div>

              <div class="mb-3">
                <label for="password" class="form-label">Şifre</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="password"
                  placeholder="Şifreniz"
                  required
                  :class="{ 'is-invalid': errors.password }"
                />
                <div class="invalid-feedback" v-if="errors.password">
                  {{ errors.password }}
                </div>
              </div>

              <div
                class="d-flex justify-content-between align-items-center mb-3"
              >
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="remember-me"
                    v-model="rememberMe"
                  />
                  <label class="form-check-label" for="remember-me">
                    Beni hatırla
                  </label>
                </div>
                <a href="#" class="text-decoration-none">Şifremi unuttum</a>
              </div>

              <div v-if="loginError" class="alert alert-danger">
                {{ loginError }}
              </div>

              <div class="d-grid gap-2">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="isLoading"
                >
                  <span
                    v-if="isLoading"
                    class="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Giriş Yap
                </button>
              </div>
            </form>
          </div>
          <div class="card-footer text-center">
            <p class="mb-0">
              Henüz mağaza hesabınız yok mu?
              <a href="/store-application" class="text-decoration-none"
                >Hemen başvurun</a
              >
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
  <script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/api";
import Swal from "sweetalert2";
import { useLoggedInStore } from "@/stores/counter";

const router = useRouter();
const email = ref("");
const password = ref("");
const rememberMe = ref(false);
const isLoading = ref(false);
const loginError = ref("");
const errors = ref({
  email: "",
  password: "",
});

const validateForm = () => {
  let isValid = true;
  errors.value = {
    email: "",
    password: "",
  };

  if (!email.value) {
    errors.value.email = "E-posta adresi gereklidir";
    isValid = false;
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    errors.value.email = "Geçerli bir e-posta adresi giriniz";
    isValid = false;
  }

  if (!password.value) {
    errors.value.password = "Şifre gereklidir";
    isValid = false;
  } else if (password.value.length < 6) {
    errors.value.password = "Şifre en az 6 karakter olmalıdır";
    isValid = false;
  }

  return isValid;
};

const handleLogin = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  loginError.value = "";

  try {
    await apiClient
      .post("/auth/store-login", {
        email: email.value,
        password: password.value,
      })
      .then((response) => {
        Swal.fire({
          icon: "success",
          title: "Başarılı",
          text: "Giriş başarılı! Yönlendiriliyorsunuz...",
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          useLoggedInStore().login();
          useLoggedInStore().setRole("STORE");
          router.push("/store/dashboard");
        });
      });
  } catch (error) {
    console.error("Login error:", error);

    if (error.response) {
      loginError.value = error.response.data.message;
    } else {
      loginError.value =
        "Giriş yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.";
    }
  } finally {
    isLoading.value = false;
  }
};
</script>
  
  <style scoped>
.store-login {
  background-color: #f8f9fa;
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.login-container {
  max-width: 450px;
  margin: 0 auto;
  width: 100%;
}

.card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
}

.card-header {
  background-color: white;
  border-bottom: 1px solid #f1f1f1;
  border-radius: 12px 12px 0 0 !important;
  padding: 25px;
}

.card-header h2 {
  color: #ff7f00;
  font-weight: 700;
  margin-bottom: 10px;
}

.card-body {
  padding: 30px;
}

.card-footer {
  background-color: white;
  border-top: 1px solid #f1f1f1;
  border-radius: 0 0 12px 12px !important;
  padding: 20px;
}

.form-label {
  font-weight: 500;
  color: #495057;
}

.form-control {
  padding: 12px 15px;
  border-radius: 8px;
  border: 1px solid #ced4da;
}

.form-control:focus {
  box-shadow: 0 0 0 0.25rem rgba(255, 127, 0, 0.25);
  border-color: #ff9a44;
}

.btn-primary {
  background-color: #ff7f00;
  border-color: #ff7f00;
  padding: 12px;
  font-weight: 500;
}

.btn-primary:hover {
  background-color: #e67300;
  border-color: #e67300;
}

a {
  color: #ff7f00;
}

a:hover {
  color: #e67300;
}
</style>