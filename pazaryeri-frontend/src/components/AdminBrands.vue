<template>
  <div class="admin-brands-container">
    <!-- Header -->
    <div class="header">
      <h1 class="title">Markalar</h1>
      <button @click="openAddModal" class="btn-primary">
        <i class="fas fa-plus"></i> Yeni Marka Ekle
      </button>
    </div>

    <!-- Filters -->
    <div class="filters">
      <div class="search-container">
        <input
          type="text"
          v-model="searchQuery"
          @input="debouncedSearch"
          placeholder="Marka ara..."
          class="search-input"
        />
        <button v-if="searchQuery" @click="clearSearch" class="btn-clear">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="sort-container">
        <label for="sort">Sırala:</label>
        <select id="sort" v-model="sortOption" class="sort-select">
          <option value="nameAsc">Ada Göre (A-Z)</option>
          <option value="nameDesc">Ada Göre (Z-A)</option>
          <option value="newest">En Yeni</option>
          <option value="oldest">En Eski</option>
        </select>
      </div>
    </div>

    <!-- Loading and Error -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Markalar yükleniyor...</p>
    </div>

    <div v-else-if="error" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredBrands.length === 0" class="empty-state">
      <i class="fas fa-box-open"></i>
      <p>Hiç marka bulunamadı</p>
      <button @click="openAddModal" class="btn-secondary">
        Yeni Marka Ekle
      </button>
    </div>

    <!-- Brands Table -->
    <div v-else class="table-container">
      <table class="brands-table">
        <thead>
          <tr>
            <th>Marka Adı</th>
            <th>Ürün Sayısı</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="brand in paginatedBrands" :key="brand.id">
            <td>{{ brand.name }}</td>
            <td>{{ brand._count.products || 0 }}</td>
            <td class="actions">
              <button
                @click="editBrand(brand)"
                class="btn-icon"
                title="Düzenle"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                @click="confirmDelete(brand)"
                class="btn-icon delete"
                title="Sil"
              >
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          :disabled="currentPage === 1"
          @click="currentPage = 1"
          class="page-btn"
        >
          <i class="fas fa-angle-double-left"></i>
        </button>
        <button
          :disabled="currentPage === 1"
          @click="currentPage--"
          class="page-btn"
        >
          <i class="fas fa-angle-left"></i>
        </button>
        <span class="page-info">
          Sayfa {{ currentPage }} / {{ totalPages }}
        </span>
        <button
          :disabled="currentPage === totalPages"
          @click="currentPage++"
          class="page-btn"
        >
          <i class="fas fa-angle-right"></i>
        </button>
        <button
          :disabled="currentPage === totalPages"
          @click="currentPage = totalPages"
          class="page-btn"
        >
          <i class="fas fa-angle-double-right"></i>
        </button>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <h2>{{ editingBrand ? 'Markayı Düzenle' : 'Yeni Marka Ekle' }}</h2>
          <button @click="closeModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveBrand">
            <div class="form-group">
              <label for="brandName">Marka Adı*</label>
              <input
                id="brandName"
                type="text"
                v-model="brandForm.name"
                :class="{'error': formErrors.name}"
                placeholder="Marka adını girin"
              />
            </div>
            <div class="form-actions">
              <button
                type="button"
                @click="closeModal"
                class="btn-secondary"
                :disabled="isSaving"
              >
                İptal
              </button>
              <button
                type="submit"
                class="btn-primary"
                :disabled="isSaving"
              >
                <i v-if="isSaving" class="fas fa-spinner fa-spin"></i>
                {{ isSaving ? 'Kaydediliyor...' : (editingBrand ? 'Güncelle' : 'Kaydet') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script setup>
import { ref, computed, onMounted } from "vue";
import apiClient from "@/api";
import Swal from "sweetalert2";

// Markalar ve durum değişkenleri
const brands = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref("");
const sortOption = ref("nameAsc");
const currentPage = ref(1);
const pageSize = 10;

// Modal ve form durumları
const showModal = ref(false);
const editingBrand = ref(null);
const brandForm = ref({
  name: "",
});
const logoPreview = ref(null);
const logoFile = ref(null);
const formErrors = ref({});
const isSaving = ref(false);

// Markaları getir
const fetchBrands = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await apiClient.get("/admin/brands");
    brands.value = response.data;
    loading.value = false;
  } catch (err) {
    console.error("Error fetching brands:", err);
    error.value =
      "Markalar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.";
    loading.value = false;
  }
};

// Filtre uygulanmış markalar
const filteredBrands = computed(() => {
  let result = [...brands.value];

  // Arama filtrelemesi
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((brand) => brand.name.toLowerCase().includes(query));
  }

  // Sıralama
  switch (sortOption.value) {
    case "nameAsc":
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "nameDesc":
      result.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "newest":
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case "oldest":
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
  }

  return result;
});

// Sayfalanmış markalar
const paginatedBrands = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize;
  return filteredBrands.value.slice(startIndex, startIndex + pageSize);
});

// Toplam sayfa sayısı
const totalPages = computed(() =>
  Math.ceil(filteredBrands.value.length / pageSize)
);

// Aramayı temizle
const clearSearch = () => {
  searchQuery.value = "";
  currentPage.value = 1;
};

// Arama için debounce
let searchTimeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  currentPage.value = 1;
  searchTimeout = setTimeout(() => {
    // Arama işlemleri burada gerçekleşir
  }, 300);
};

// Markanın baş harfleri
const getInitials = (name) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .substring(0, 2);
};

// Tarihi formatla
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

// Yeni marka ekleme modalını aç
const openAddModal = () => {
  console.log("Modal açılıyor..."); // Debug için
  editingBrand.value = null;
  brandForm.value = {
    name: "",
  };
  logoPreview.value = null;
  logoFile.value = null;
  formErrors.value = {};
  showModal.value = true;
  console.log("showModal değeri:", showModal.value); // Değerin true olduğunu kontrol et
};

// Marka düzenleme modalını aç
const editBrand = (brand) => {
  editingBrand.value = brand;
  brandForm.value = {
    name: brand.name,
  };
  formErrors.value = {};
  showModal.value = true;
};

// Modalı kapat
const closeModal = () => {
  showModal.value = false;
  setTimeout(() => {
    editingBrand.value = null;
    brandForm.value = {
      name: "",
    };
  }, 300);
};

// Logo yükleme
const handleLogoUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    Swal.fire({
      title: "Hata",
      text: "Lütfen geçerli bir görsel dosyası yükleyin.",
      icon: "error",
      confirmButtonText: "Tamam",
    });
    return;
  }

  logoFile.value = file;

  // Dosyayı önizleme için oku
  const reader = new FileReader();
  reader.onload = (e) => {
    logoPreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

// Logoyu kaldır
const removeLogo = () => {
  logoFile.value = null;
  logoPreview.value = null;
  brandForm.value.logoUrl = "";
};

// Markayı kaydet
const saveBrand = async () => {
  // Form doğrulama
  formErrors.value = {};

  if (!brandForm.value.name.trim()) {
    formErrors.value.name = "Marka adı gereklidir";
    return;
  }

  isSaving.value = true;

  try {

    const brandData = {
      ...brandForm.value,
    };

    if (editingBrand.value) {
      await apiClient.patch(`/admin/brands/${editingBrand.value.id}`, brandData)
      const index = brands.value.findIndex(
        (b) => b.id === editingBrand.value.id
      );
      if (index !== -1) {
        brands.value[index] = {
          ...brands.value[index],
          ...brandData,
        };
      }

      Swal.fire({
        title: "Başarılı",
        text: "Marka bilgileri güncellendi",
        icon: "success",
        confirmButtonText: "Tamam",
      });
      isSaving.value = false;
    } else {
      const response = await apiClient.post('/admin/brands', brandData)
      const newBrand = await response.data
      brands.value.push(newBrand);

      Swal.fire({
        title: "Başarılı",
        text: "Yeni marka eklendi",
        icon: "success",
        confirmButtonText: "Tamam",
      });
      isSaving.value = false;
    }
  } catch (err) {
    console.error("Error saving brand:", err);
    Swal.fire({
      title: "Hata",
      text: "Marka kaydedilirken bir hata oluştu",
      icon: "error",
      confirmButtonText: "Tamam",
    });
    isSaving.value = false;
  }
  
  closeModal();
};

// Marka durumunu değiştir
const toggleBrandStatus = async (brand) => {
  try {
    const newStatus = !brand.isActive;

    // Simülasyon
    const index = brands.value.findIndex((b) => b.id === brand.id);
    if (index !== -1) {
      brands.value[index].isActive = newStatus;
    }

    Swal.fire({
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 3000,
      icon: "success",
      title: `Marka ${newStatus ? "aktif" : "pasif"} duruma getirildi`,
    });
  } catch (err) {
    console.error("Error toggling brand status:", err);
    Swal.fire({
      title: "Hata",
      text: "Marka durumu değiştirilirken bir hata oluştu",
      icon: "error",
      confirmButtonText: "Tamam",
    });
  }
};

// Markayı silmeyi onayla
const confirmDelete = (brand) => {
  Swal.fire({
    title: "Emin misiniz?",
    text: `"${brand.name}" markasını silmek istediğinize emin misiniz?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Evet, Sil",
    cancelButtonText: "İptal",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      deleteBrand(brand.id);
    }
  });
};

// Markayı sil
const deleteBrand = async (brandId) => {
  try {
    await apiClient.delete(`/admin/brands/${brandId}`)
    brands.value = brands.value.filter((brand) => brand.id !== brandId);

    if (paginatedBrands.value.length === 0 && currentPage.value > 1) {
      currentPage.value--;
    }

    Swal.fire({
      title: "Silindi",
      text: "Marka başarıyla silindi",
      icon: "success",
      confirmButtonText: "Tamam",
    });
  } catch (err) {
    console.error("Error deleting brand:", err);
    Swal.fire({
      title: "Hata",
      text: "Marka silinirken bir hata oluştu",
      icon: "error",
      confirmButtonText: "Tamam",
    });
  }
};

// Sayfa yüklendiğinde markaları getir
onMounted(() => {
  fetchBrands();
});
</script>
  
<style scoped>
.admin-brands-container {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eaeaea;
}

.title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  position: relative;
}

.title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 40px;
  height: 3px;
  background-color: #3498db;
  border-radius: 2px;
}

.filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.search-container {
  position: relative;
  min-width: 250px;
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 2.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.9rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.btn-clear {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.btn-clear:hover {
  opacity: 1;
}

.sort-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-container label {
  font-weight: 500;
  color: #555;
}

.sort-select {
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: white;
  min-width: 180px;
  font-size: 0.9rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  color: #444;
  transition: all 0.2s;
}

.sort-select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.loading, .error-message, .empty-state {
  text-align: center;
  padding: 3rem 0;
  color: #666;
}

.loading .spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #e74c3c;
  background-color: #fef2f2;
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 500px;
  margin: 2rem auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.error-message i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 3rem 2rem;
  max-width: 500px;
  margin: 2rem auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.empty-state i {
  font-size: 3rem;
  color: #cbd5e1;
}

.table-container {
  overflow-x: auto;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
}

.brands-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.brands-table th, .brands-table td {
  padding: 1rem 1.5rem;
  text-align: left;
}

.brands-table tr {
  transition: all 0.2s;
}

.brands-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #444;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
}

.brands-table th:first-child {
  border-top-left-radius: 10px;
}

.brands-table th:last-child {
  border-top-right-radius: 10px;
}

.brands-table tr:last-child td:first-child {
  border-bottom-left-radius: 10px;
}

.brands-table tr:last-child td:last-child {
  border-bottom-right-radius: 10px;
}

.brands-table tr:not(:last-child) td {
  border-bottom: 1px solid #eaeaea;
}

.brands-table tr:hover {
  background-color: #f5f7fa;
}

.actions {
  white-space: nowrap;
  text-align: right;
}

.btn-icon {
  background-color: #f8f9fa;
  border: 1px solid #e5e7eb;
  color: #666;
  cursor: pointer;
  font-size: 16px;
  padding: 0.5rem;
  margin: 0 0.25rem;
  border-radius: 6px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.btn-icon:hover {
  background-color: #eff6ff;
  color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-icon.delete:hover {
  background-color: #fef2f2;
  color: #ef4444;
  border-color: #fee2e2;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.5rem;
  gap: 0.5rem;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #e5e7eb;
  background-color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #555;
}

.page-btn:hover:not(:disabled) {
  background-color: #f8fafc;
  border-color: #cbd5e1;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  padding: 0 1rem;
  font-size: 0.9rem;
  color: #666;
  background-color: #f8f9fa;
  height: 40px;
  display: flex;
  align-items: center;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  transition: all 0.3s;
}

.modal-container {
  background-color: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transform: translateY(0);
  transition: transform 0.3s;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #94a3b8;
  transition: color 0.2s;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.btn-close:hover {
  color: #475569;
  background-color: #f1f5f9;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #444;
  font-size: 0.9rem;
}

.form-group input[type="text"],
.form-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.form-group input.error,
.form-group textarea.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.2);
}

.error-text {
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  display: block;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-text {
  margin-left: 0.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
  min-width: 110px;
  font-size: 0.9rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.btn-secondary {
  background-color: white;
  color: #475569;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #f8fafc;
  color: #334155;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-container, .sort-container {
    width: 100%;
  }
  
  .modal-container {
    width: 90%;
    max-height: 80vh;
  }
  
  .brands-table th, .brands-table td {
    padding: 0.75rem;
  }
  
  .btn-icon {
    margin: 0.25rem;
  }
}
</style>