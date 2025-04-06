<template>
  <div class="account-container">
    <div class="account-header">
      <h1>Hesap Bilgilerim</h1>
      <p>Kişisel bilgilerinizi görüntüleyebilir ve düzenleyebilirsiniz</p>
    </div>

    <div class="account-content">
      <div class="account-sidebar">
        <div class="user-profile">
          <h3>{{ user.firstName }} {{ user.lastName }}</h3>
          <p>{{ user.email }}</p>
        </div>

        <div class="navigation-menu">
          <ul>
            <li :class="{ active: activeTab === 'profile' }">
              <a href="#" @click.prevent="activeTab = 'profile'"
                >Profil Bilgileri</a
              >
            </li>
            <li :class="{ active: activeTab === 'orders' }">
              <a href="#" @click.prevent="activeTab = 'orders'">Siparişlerim</a>
            </li>
            <li :class="{ active: activeTab === 'addresses' }">
              <a href="#" @click.prevent="activeTab = 'addresses'"
                >Adreslerim</a
              >
            </li>
            <li :class="{ active: activeTab === 'favorites' }">
              <a href="#" @click.prevent="activeTab = 'favorites'"
                >Favorilerim</a
              >
            </li>
            <li :class="{ active: activeTab === 'payment' }">
              <a href="#" @click.prevent="activeTab = 'payment'"
                >Ödeme Yöntemlerim</a
              >
            </li>
            <li :class="{ active: activeTab === 'password' }">
              <a href="#" @click.prevent="activeTab = 'password'"
                >Şifre Değiştir</a
              >
            </li>
            <li>
              <a href="#" class="logout" @click.prevent="logout">Çıkış Yap</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="account-details">
        <!-- Profil Bilgileri Tab -->
        <div v-if="activeTab === 'profile'">
          <div class="section-title">
            <h2>Profil Bilgileri</h2>
            <button class="edit-btn" @click="editMode = !editMode">
              {{ editMode ? "İptal" : "Düzenle" }}
            </button>
          </div>

          <div class="info-block" v-if="!editMode">
            <div class="info-row">
              <div class="info-item">
                <label>İsim</label>
                <p>{{ user.firstName }}</p>
              </div>
              <div class="info-item">
                <label>Soyisim</label>
                <p>{{ user.lastName }}</p>
              </div>
            </div>

            <div class="info-row">
              <div class="info-item">
                <label>E-posta</label>
                <p>{{ user.email }}</p>
              </div>
            </div>
          </div>

          <!-- Edit Form -->
          <div class="edit-form" v-if="editMode">
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">İsim</label>
                <input
                  type="text"
                  id="firstName"
                  v-model="editForm.firstName"
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <label for="lastName">Soyisim</label>
                <input
                  type="text"
                  id="lastName"
                  v-model="editForm.lastName"
                  class="form-control"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="email">E-posta</label>
                <input
                  type="email"
                  id="email"
                  v-model="editForm.email"
                  class="form-control"
                />
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-save" @click="saveProfile">
                Kaydet
              </button>
              <button
                type="button"
                class="btn-cancel"
                @click="editMode = false"
              >
                İptal
              </button>
            </div>
          </div>

          <div class="section-title">
            <h2>Üyelik Bilgileri</h2>
          </div>

          <div class="membership-info">
            <div class="info-item">
              <label>Üyelik Tarihi</label>
              <p>{{ createdAt }}</p>
            </div>
            <div class="info-item">
              <label>Üyelik Durumu</label>
              <p
                class="status"
                :class="{ active: user.isActive, inactive: !user.isActive }"
              >
                {{ isActive }}
              </p>
            </div>
          </div>

          <div class="section-title">
            <h2>İletişim Tercihleri</h2>
          </div>

          <div class="preferences">
            <div class="preference-item">
              <label class="checkbox-container">
                E-posta bildirimleri
                <input
                  type="checkbox"
                  v-model="preferences.emailNotifications"
                />
                <span class="checkmark"></span>
              </label>
            </div>
            <div class="preference-item">
              <label class="checkbox-container">
                SMS bildirimleri
                <input type="checkbox" v-model="preferences.smsNotifications" />
                <span class="checkmark"></span>
              </label>
            </div>
            <div class="preference-item">
              <label class="checkbox-container">
                Kampanya bildirimleri
                <input
                  type="checkbox"
                  v-model="preferences.promotionNotifications"
                />
                <span class="checkmark"></span>
              </label>
            </div>
            <button class="save-preferences-btn" @click="savePreferences">
              Tercihleri Kaydet
            </button>
          </div>
        </div>

        <!-- Placeholder for other tabs -->
        <div v-if="activeTab === 'addresses'">
          <Address v-model="user.addresses"/>
        </div>

        <div v-if="activeTab === 'password'" class="password-section">
          <div class="section-title">
            <h2>Şifre Değiştir</h2>
          </div>

          <div class="password-content">
            <div class="password-info">
              <div class="info-icon">
                <i class="bi bi-shield-lock"></i>
              </div>
              <div class="info-text">
                <h3>Güvenli Şifre Önerileri</h3>
                <ul>
                  <li>En az 6 karakter kullanın</li>
                  <li>Büyük ve küçük harfler ekleyin</li>
                  <li>Rakam ve özel karakter kullanın</li>
                  <li>Kolay tahmin edilebilir bilgiler kullanmayın</li>
                  <li>Farklı hesaplar için aynı şifreyi kullanmayın</li>
                </ul>
              </div>
            </div>
            
            <div class="password-form-container">
              <form @submit.prevent="changePassword" class="password-form">
                <div class="form-group">
                  <label for="currentPassword">Mevcut Şifre</label>
                  <div class="password-input-container">
                    <input
                      :type="showCurrentPassword ? 'text' : 'password'"
                      id="currentPassword"
                      v-model="passwordForm.currentPassword"
                      class="form-control"
                      required
                    />
                    <button 
                      type="button" 
                      class="toggle-password" 
                      @click="showCurrentPassword = !showCurrentPassword"
                    >
                      <i :class="showCurrentPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                    </button>
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="newPassword">Yeni Şifre</label>
                  <div class="password-input-container">
                    <input
                      :type="showNewPassword ? 'text' : 'password'"
                      id="newPassword"
                      v-model="passwordForm.newPassword"
                      class="form-control"
                      required
                      @input="validatePassword"
                    />
                    <button 
                      type="button" 
                      class="toggle-password" 
                      @click="showNewPassword = !showNewPassword"
                    >
                      <i :class="showNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                    </button>
                  </div>
                  <div class="password-strength" v-if="passwordForm.newPassword">
                    <div class="strength-meter">
                      <div 
                        class="strength-bar" 
                        :style="{ width: passwordStrength + '%' }" 
                        :class="getStrengthClass()"
                      ></div>
                    </div>
                    <span class="strength-text" :class="getStrengthClass()">
                      {{ getStrengthText() }}
                    </span>
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="confirmPassword">Yeni Şifre (Tekrar)</label>
                  <div class="password-input-container">
                    <input
                      :type="showConfirmPassword ? 'text' : 'password'"
                      id="confirmPassword"
                      v-model="passwordForm.confirmPassword"
                      class="form-control"
                      required
                    />
                    <button 
                      type="button" 
                      class="toggle-password" 
                      @click="showConfirmPassword = !showConfirmPassword"
                    >
                      <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                    </button>
                  </div>
                  <div class="password-match" v-if="passwordForm.confirmPassword">
                    <i 
                      :class="passwordsMatch ? 'bi bi-check-circle-fill match' : 'bi bi-x-circle-fill no-match'"
                    ></i>
                    <span :class="passwordsMatch ? 'match' : 'no-match'">
                      {{ passwordsMatch ? 'Şifreler eşleşiyor' : 'Şifreler eşleşmiyor' }}
                    </span>
                  </div>
                </div>
                
                <div class="form-actions">
                  <button 
                    type="submit" 
                    class="btn-save"
                    :disabled="isChangingPassword || !isValidForm"
                  >
                    <i class="bi bi-arrow-repeat" v-if="isChangingPassword"></i>
                    <span>{{ isChangingPassword ? 'İşleniyor...' : 'Şifreyi Değiştir' }}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import apiClient from "@/api";
import Address from "@/components/Address.vue";
import router from "@/router";
import { useLoggedInStore } from "@/stores/counter";
import axios from "axios";
import { computed, onMounted, ref } from "vue";
import { useToast } from "vue-toast-notification";

const user = ref({});
const activeTab = ref("profile");
const editMode = ref(false);
const editForm = ref({firstName: "", lastName: "", email: ""});
const toast = useToast();
const loginStore = useLoggedInStore();
const preferences = ref({
  emailNotifications: false,
  smsNotifications: false,
  promotionNotifications: false,
});
const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const passwordStrength = ref(0);
const isChangingPassword = ref(false);

const isActive = computed(() => {
  return user.value.isActive ? "Aktif" : "Pasif";
});

const createdAt = computed(() => {
  const date = new Date(user.value.createdAt);
  return date.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
});

const passwordsMatch = computed(() => {
  if (!passwordForm.value.newPassword || !passwordForm.value.confirmPassword) return false;
  return passwordForm.value.newPassword === passwordForm.value.confirmPassword;
});

const isValidForm = computed(() => {
  return (
    passwordForm.value.currentPassword && 
    passwordForm.value.newPassword && 
    passwordForm.value.confirmPassword && 
    passwordsMatch.value && 
    passwordStrength.value >= 40
  );
});

const getStrengthClass = () => {
  if (passwordStrength.value < 30) return 'weak';
  if (passwordStrength.value < 60) return 'medium';
  return 'strong';
};

const getStrengthText = () => {
  if (passwordStrength.value < 30) return 'Zayıf';
  if (passwordStrength.value < 60) return 'Orta';
  return 'Güçlü';
};

const validatePassword = () => {
  const password = passwordForm.value.newPassword;
  if (!password) {
    passwordStrength.value = 0;
    return;
  }
  
  let strength = 0;
  
  // Uzunluk kontrolü
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  
  // Karakter türleri
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[a-z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[$@#&!]/.test(password)) strength += 20;
  
  // Şifre gücünü maksimum 100 olacak şekilde sınırlama
  passwordStrength.value = Math.min(100, strength);
};

onMounted(() => {
  apiClient
    .get("/users/profile", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
    .then((response) => {
      user.value = response.data;
      editForm.value = {
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        email: response.data.email,
      };
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
    });
});

const saveProfile = () => {
  apiClient
    .patch("/users/profile", editForm.value, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
    .then((response) => {
      user.value = response.data;
      toast.success("Profil bilgileri başarıyla güncellendi.");
      editMode.value = false;
    })
    .catch((error) => {
      console.error("Error updating profile:", error);
      toast.error("Profil güncellenirken bir hata oluştu.");
    });
};

const logout = () => {
  apiClient.post('/auth/logout', {},{
    headers: {
      Authorization: `Bearer ${localStorage.getItem('refresh_token')}`
    }
  }).then(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    loginStore.logout();
    router.push('/')
  });
};

const changePassword = () => {
  if (!isValidForm.value) return;
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.error("Yeni şifreler eşleşmiyor.");
    return;
  }
  
  isChangingPassword.value = true;
  
  apiClient
    .post(
      "/auth/change-password",
      {
        oldPasswordHash: passwordForm.value.currentPassword,
        newPasswordHash: passwordForm.value.newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    )
    .then(() => {
      toast.success("Şifre başarıyla değiştirildi.");
      passwordForm.value = {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      };
      passwordStrength.value = 0;
      showCurrentPassword.value = false;
      showNewPassword.value = false;
      showConfirmPassword.value = false;
    })
    .catch((error) => {
      console.error("Error changing password:", error);
      
      // API'den gelen hata mesajlarını göster
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Şifre değiştirilirken bir hata oluştu.");
      }
    })
    .finally(() => {
      isChangingPassword.value = false;
    });
};
</script>

<style>
.account-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.account-header {
  margin-bottom: 2rem;
  text-align: center;
}

.account-header h1 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.account-header p {
  color: #666;
}

.account-content {
  display: flex;
  gap: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.account-sidebar {
  width: 280px;
  background-color: #f8f9fa;
  padding: 2rem;
  border-right: 1px solid #eee;
}

.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

.profile-image {
  position: relative;
  margin-bottom: 1rem;
}

.profile-image img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.change-photo-btn {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.change-photo-btn:hover {
  background-color: #3a7bc8;
}

.user-profile h3 {
  margin: 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.user-profile p {
  color: #666;
  font-size: 0.9rem;
}

.navigation-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.navigation-menu li {
  margin-bottom: 0.5rem;
}

.navigation-menu a {
  display: block;
  padding: 0.8rem 1rem;
  color: #555;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s;
}

.navigation-menu a:hover {
  background-color: #f0f0f0;
  color: #333;
}

.navigation-menu li.active a {
  background-color: #ff7f00;
  color: white;
  font-weight: 500;
}

.navigation-menu a.logout {
  color: #e74c3c;
  margin-top: 1rem;
}

.account-details {
  flex: 1;
  padding: 2rem;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.section-title h2 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.edit-btn {
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  color: #555;
  padding: 0.4rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn:hover {
  background-color: #eee;
  color: #333;
}

.info-block {
  margin-bottom: 2rem;
}

.info-row {
  display: flex;
  margin-bottom: 1.5rem;
}

.info-item {
  flex: 1;
  margin-right: 1.5rem;
}

.info-item label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.info-item p {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.membership-info {
  display: flex;
  margin-bottom: 2rem;
}

.status {
  font-weight: 500;
}

.status.active {
  color: #2ecc71;
}

.status.inactive {
  color: #e74c3c;
}

.preferences {
  margin-bottom: 2rem;
}

.preference-item {
  margin-bottom: 1rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 35px;
  cursor: pointer;
  font-size: 1rem;
  user-select: none;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: #eee;
  border-radius: 4px;
}

.checkbox-container:hover input ~ .checkmark {
  background-color: #ccc;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #4a90e2;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 7px;
  top: 3px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* New Form Styles */
.form-row {
  display: flex;
  margin-bottom: 1.5rem;
  gap: 1.5rem;
}

.form-group {
  flex: 1;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-control:focus {
  border-color: #4a90e2;
  outline: none;
}

textarea.form-control {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-save {
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-save:hover {
  background-color: #3a7bc8;
}

.btn-cancel {
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  color: #555;
  border-radius: 4px;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background-color: #eee;
}

.save-preferences-btn {
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;
}

.save-preferences-btn:hover {
  background-color: #3a7bc8;
}

.placeholder-content {
  padding: 2rem;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-top: 1rem;
}

.placeholder-content h2 {
  margin-bottom: 1rem;
  color: #333;
}

.placeholder-text {
  color: #666;
  font-size: 1rem;
}

.password-form {
  max-width: 500px;
  margin: 0 auto;
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.password-form .form-group {
  margin-bottom: 1.5rem;
}

.password-form .btn-save {
  width: 100%;
  margin-top: 1rem;
}

.password-section {
  width: 100%;
}

.password-content {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
}

.password-info {
  width: 30%;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info-icon {
  font-size: 2.5rem;
  color: #4a90e2;
  margin-bottom: 1rem;
}

.info-text h3 {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 1rem;
  text-align: center;
}

.info-text ul {
  padding-left: 1.2rem;
  margin: 0;
}

.info-text li {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.8rem;
}

.password-form-container {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.password-input-container {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #777;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
}

.toggle-password:hover {
  color: #333;
}

.password-strength {
  margin-top: 0.5rem;
}

.strength-meter {
  height: 6px;
  background-color: #f0f0f0;
  border-radius: 3px;
  margin-bottom: 0.3rem;
}

.strength-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s, background-color 0.3s;
}

.strength-bar.weak {
  background-color: #e74c3c;
}

.strength-bar.medium {
  background-color: #f39c12;
}

.strength-bar.strong {
  background-color: #2ecc71;
}

.strength-text {
  font-size: 0.8rem;
}

.strength-text.weak {
  color: #e74c3c;
}

.strength-text.medium {
  color: #f39c12;
}

.strength-text.strong {
  color: #2ecc71;
}

.password-match {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.8rem;
}

.match {
  color: #2ecc71;
}

.no-match {
  color: #e74c3c;
}

.btn-save {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: #ff7f00;
  width: 100%;
}

.btn-save:hover {
  background-color: #e67300;
}

.btn-save:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .password-content {
    flex-direction: column;
  }
  
  .password-info {
    width: 100%;
  }
}

.address-content {
  width: 100%;
}

.address-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.address-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1.5rem;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.address-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #4a90e2;
}

.address-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.address-card-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.address-badges {
  display: flex;
  gap: 0.5rem;
}

.default-badge {
  background-color: #4a90e2;
  color: white;
  font-size: 0.7rem;
  font-weight: 500;
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
}

.address-card-body {
  margin-bottom: 1rem;
  min-height: 120px;
}

.address-name {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.address-details,
.address-location,
.address-phone {
  color: #666;
  font-size: 0.9rem;
  margin: 0.2rem 0;
}

.address-location {
  word-wrap: break-word;
}

.address-card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.btn-action {
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  color: #555;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:hover {
  background-color: #eee;
}

.btn-action.delete {
  color: #e74c3c;
}

.btn-action.delete:hover {
  background-color: #fee;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-top: 1rem;
}

.empty-state p {
  color: #666;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.address-form-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.address-form-content {
  background-color: #fff;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #888;
}

.modal-body {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
}

.checkbox-group {
  display: flex;
  align-items: center;
}

@media (max-width: 768px) {
  .address-list {
    grid-template-columns: 1fr;
  }
}
</style>