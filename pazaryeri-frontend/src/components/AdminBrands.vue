<template>
    <div class="admin-brands-container">
      <div class="header-actions">
        <h2>Markalar</h2>
        <button @click="openAddModal" class="btn-add">
          <i class="bi bi-plus-circle"></i> Yeni Marka Ekle
        </button>
      </div>
  
      <!-- Filtre ve Arama -->
      <div class="filters">
        <div class="search-box">
          <i class="bi bi-search"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Marka ara..."
            @input="debouncedSearch"
          />
          <i v-if="searchQuery" @click="clearSearch" class="bi bi-x-circle clear-search"></i>
        </div>
        <div class="sort-options">
          <select v-model="sortOption">
            <option value="nameAsc">İsim (A-Z)</option>
            <option value="nameDesc">İsim (Z-A)</option>
          </select>
        </div>
      </div>
  
      <!-- Yükleniyor -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Markalar yükleniyor...</p>
      </div>
  
      <!-- Hata Mesajı -->
      <div v-else-if="error" class="error-message">
        <i class="bi bi-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button @click="fetchBrands" class="btn-retry">Tekrar Dene</button>
      </div>
  
      <!-- Sonuç Bulunamadı -->
      <div v-else-if="filteredBrands.length === 0" class="no-results">
        <i class="bi bi-search"></i>
        <p>Arama kriterlerinize uygun marka bulunamadı.</p>
        <button v-if="searchQuery" @click="clearSearch" class="btn-clear">Aramayı Temizle</button>
      </div>
  
      <!-- Marka Listesi -->
      <div v-else class="brands-list">
        <table>
          <thead>
            <tr>
              <th>Marka Adı</th>
              <th>Ürün Sayısı</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="brand in paginatedBrands" :key="brand.id">
              <td class="brand-name">{{ brand.name }}</td>
              <td class="product-count">{{ brand._count.products || 0 }}</td>
              <td class="actions">
                <button @click="editBrand(brand)" class="btn-edit" title="Düzenle">
                  <i class="bi bi-pencil"></i>
                </button>
                <button 
                  @click="toggleBrandStatus(brand)" 
                  class="btn-toggle" 
                  :title="brand.isActive ? 'Pasif Yap' : 'Aktif Yap'"
                >
                  <i class="bi" :class="brand.isActive ? 'bi-toggle-on' : 'bi-toggle-off'"></i>
                </button>
                <button @click="confirmDelete(brand)" class="btn-delete" title="Sil">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Pagination -->
      <div v-if="filteredBrands.length > 0" class="pagination">
        <button 
          @click="currentPage = Math.max(1, currentPage - 1)" 
          :disabled="currentPage === 1"
          class="btn-page"
        >
          <i class="bi bi-chevron-left"></i>
        </button>
        
        <button 
          v-for="page in totalPages" 
          :key="page" 
          @click="currentPage = page"
          :class="{ active: currentPage === page }"
          class="btn-page"
        >
          {{ page }}
        </button>
        
        <button 
          @click="currentPage = Math.min(totalPages, currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="btn-page"
        >
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
  
      <!-- Marka Ekleme/Düzenleme Modal -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <!-- ... modal içeriği ... -->
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import apiClient from '@/api';
  import Swal from 'sweetalert2';
  
  // Markalar ve durum değişkenleri
  const brands = ref([]);
  const loading = ref(true);
  const error = ref(null);
  const searchQuery = ref('');
  const sortOption = ref('nameAsc');
  const currentPage = ref(1);
  const pageSize = 10;
  
  // Modal ve form durumları
  const showModal = ref(false);
  const editingBrand = ref(null);
  const brandForm = ref({
    name: '',
    description: '',
    logoUrl: '',
    isActive: true,
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
      const response = await apiClient.get('/admin/brands');
      brands.value = response.data;
      loading.value = false;
    } catch (err) {
      console.error('Error fetching brands:', err);
      error.value = 'Markalar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
      loading.value = false;
    }
  };
  
  // Filtre uygulanmış markalar
  const filteredBrands = computed(() => {
    let result = [...brands.value];
    
    // Arama filtrelemesi
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      result = result.filter(brand => brand.name.toLowerCase().includes(query));
    }
    
    // Sıralama
    switch (sortOption.value) {
      case 'nameAsc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
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
    searchQuery.value = '';
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
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };
  
  // Tarihi formatla
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  // Yeni marka ekleme modalını aç
  const openAddModal = () => {
    console.log("Modal açılıyor..."); // Debug için
    editingBrand.value = null;
    brandForm.value = {
      name: '',
      description: '',
      logoUrl: '',
      isActive: true,
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
      description: brand.description || '',
      logoUrl: brand.logoUrl || '',
      isActive: brand.isActive,
    };
    logoPreview.value = null;
    logoFile.value = null;
    formErrors.value = {};
    showModal.value = true;
  };
  
  // Modalı kapat
  const closeModal = () => {
    showModal.value = false;
    setTimeout(() => {
      editingBrand.value = null;
      brandForm.value = {
        name: '',
        description: '',
        logoUrl: '',
        isActive: true,
      };
      logoPreview.value = null;
      logoFile.value = null;
      formErrors.value = {};
    }, 300);
  };
  
  // Logo yükleme
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        title: 'Hata',
        text: 'Lütfen geçerli bir görsel dosyası yükleyin.',
        icon: 'error',
        confirmButtonText: 'Tamam'
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
    brandForm.value.logoUrl = '';
  };
  
  // Markayı kaydet
  const saveBrand = async () => {
    // Form doğrulama
    formErrors.value = {};
    
    if (!brandForm.value.name.trim()) {
      formErrors.value.name = 'Marka adı gereklidir';
      return;
    }
    
    isSaving.value = true;
    
    try {
      // Logo yükleme
      let logoUrl = brandForm.value.logoUrl;
      
      if (logoFile.value) {
        // Logo yükleme API çağrısı
        // const formData = new FormData();
        // formData.append('logo', logoFile.value);
        // const uploadResponse = await fetch('/api/upload', {
        //   method: 'POST',
        //   body: formData
        // });
        // const uploadResult = await uploadResponse.json();
        // logoUrl = uploadResult.url;
        
        // Simülasyon
        logoUrl = logoPreview.value;
      }
      
      const brandData = {
        ...brandForm.value,
        logoUrl
      };
      
      if (editingBrand.value) {
        // Marka güncelleme API çağrısı
        // await fetch(`/api/brands/${editingBrand.value.id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(brandData)
        // });
        
        // Simülasyon
        const index = brands.value.findIndex(b => b.id === editingBrand.value.id);
        if (index !== -1) {
          brands.value[index] = {
            ...brands.value[index],
            ...brandData
          };
        }
        
        Swal.fire({
          title: 'Başarılı',
          text: 'Marka bilgileri güncellendi',
          icon: 'success',
          confirmButtonText: 'Tamam'
        });
      } else {
        // Yeni marka ekleme API çağrısı
        // const response = await fetch('/api/brands', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(brandData)
        // });
        // const newBrand = await response.json();
        
        // Simülasyon
        const newBrand = {
          id: Date.now().toString(),
          ...brandData,
          productCount: 0,
          createdAt: new Date().toISOString()
        };
        brands.value.push(newBrand);
        
        Swal.fire({
          title: 'Başarılı',
          text: 'Yeni marka eklendi',
          icon: 'success',
          confirmButtonText: 'Tamam'
        });
      }
      
      closeModal();
    } catch (err) {
      console.error('Error saving brand:', err);
      Swal.fire({
        title: 'Hata',
        text: 'Marka kaydedilirken bir hata oluştu',
        icon: 'error',
        confirmButtonText: 'Tamam'
      });
    } finally {
      isSaving.value = false;
    }
  };
  
  // Marka durumunu değiştir
  const toggleBrandStatus = async (brand) => {
    try {
      const newStatus = !brand.isActive;
      
      // API çağrısı
      // await fetch(`/api/brands/${brand.id}/status`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ isActive: newStatus })
      // });
      
      // Simülasyon
      const index = brands.value.findIndex(b => b.id === brand.id);
      if (index !== -1) {
        brands.value[index].isActive = newStatus;
      }
      
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        icon: 'success',
        title: `Marka ${newStatus ? 'aktif' : 'pasif'} duruma getirildi`
      });
    } catch (err) {
      console.error('Error toggling brand status:', err);
      Swal.fire({
        title: 'Hata',
        text: 'Marka durumu değiştirilirken bir hata oluştu',
        icon: 'error',
        confirmButtonText: 'Tamam'
      });
    }
  };
  
  // Markayı silmeyi onayla
  const confirmDelete = (brand) => {
    Swal.fire({
      title: 'Emin misiniz?',
      text: `"${brand.name}" markasını silmek istediğinize emin misiniz?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet, Sil',
      cancelButtonText: 'İptal',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        deleteBrand(brand.id);
      }
    });
  };
  
  // Markayı sil
  const deleteBrand = async (brandId) => {
    try {
      // API çağrısı
      // await fetch(`/api/brands/${brandId}`, {
      //   method: 'DELETE'
      // });
      
      // Simülasyon
      brands.value = brands.value.filter(brand => brand.id !== brandId);
      
      // Sayfa numarasını ayarla
      if (paginatedBrands.value.length === 0 && currentPage.value > 1) {
        currentPage.value--;
      }
      
      Swal.fire({
        title: 'Silindi',
        text: 'Marka başarıyla silindi',
        icon: 'success',
        confirmButtonText: 'Tamam'
      });
    } catch (err) {
      console.error('Error deleting brand:', err);
      Swal.fire({
        title: 'Hata',
        text: 'Marka silinirken bir hata oluştu',
        icon: 'error',
        confirmButtonText: 'Tamam'
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
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .header-actions h2 {
    margin: 0;
    font-size: 1.8rem;
    color: #333;
  }
  
  .btn-add {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .btn-add:hover {
    background-color: #0069d9;
  }
  
  /* Filtreler */
  .filters {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    gap: 15px;
  }
  
  .search-box {
    flex: 1;
    position: relative;
    max-width: 400px;
  }
  
  .search-box input {
    width: 100%;
    padding: 10px 35px 10px 35px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.95rem;
  }
  
  .search-box .bi-search {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #777;
  }
  
  .clear-search {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #777;
    cursor: pointer;
  }
  
  .clear-search:hover {
    color: #333;
  }
  
  .sort-options select {
    padding: 9px 30px 9px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
    font-size: 0.95rem;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 16px 12px;
  }
  
  /* Yükleniyor */
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-left-color: #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 15px;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .loading p {
    color: #666;
    font-size: 1rem;
  }
  
  /* Hata mesajı */
  .error-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
    color: #721c24;
    text-align: center;
  }
  
  .error-message i {
    font-size: 2.5rem;
    margin-bottom: 15px;
  }
  
  .btn-retry {
    margin-top: 15px;
    padding: 8px 16px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .btn-retry:hover {
    background-color: #c82333;
  }
  
  /* Sonuç Bulunamadı */
  .no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
    color: #666;
    text-align: center;
  }
  
  .no-results i {
    font-size: 2.5rem;
    color: #aaa;
    margin-bottom: 15px;
  }
  
  .btn-clear {
    margin-top: 15px;
    padding: 8px 16px;
    background-color: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 4px;
    color: #444;
    cursor: pointer;
  }
  
  .btn-clear:hover {
    background-color: #e9ecef;
  }
  
  /* Tablo Stili */
  .brands-list {
    overflow-x: auto;
    margin-bottom: 20px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }
  
  thead th {
    background-color: #f8f9fa;
    color: #495057;
    padding: 12px 15px;
    font-weight: 600;
    border-bottom: 2px solid #dee2e6;
  }
  
  tbody td {
    padding: 12px 15px;
    border-bottom: 1px solid #e9ecef;
    vertical-align: middle;
  }
  
  .brand-logo {
    width: 60px;
  }
  
  .brand-logo img {
    width: 40px;
    height: 40px;
    object-fit: contain;
  }
  
  .no-logo {
    width: 40px;
    height: 40px;
    background-color: #f0f0f0;
    color: #666;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    border-radius: 4px;
  }
  
  .brand-name {
    font-weight: 500;
  }
  
  .product-count {
    color: #555;
  }
  
  .status span {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 30px;
    font-size: 0.85rem;
    font-weight: 500;
  }
  
  .status span.active {
    background-color: #d4edda;
    color: #155724;
  }
  
  .status span.inactive {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  .actions {
    display: flex;
    gap: 8px;
  }
  
  .actions button {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    background-color: transparent;
    border: 1px solid;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-edit {
    border-color: #6c757d;
    color: #6c757d;
  }
  
  .btn-edit:hover {
    background-color: #6c757d;
    color: white;
  }
  
  .btn-toggle {
    border-color: #28a745;
    color: #28a745;
    font-size: 1.1rem;
  }
  
  .btn-toggle:hover {
    background-color: #28a745;
    color: white;
  }
  
  .btn-delete {
    border-color: #dc3545;
    color: #dc3545;
  }
  
  .btn-delete:hover {
    background-color: #dc3545;
    color: white;
  }
  
  /* Pagination */
  .pagination {
    display: flex;
    justify-content: center;
    gap: 5px;
    margin-top: 20px;
  }
  
  .btn-page {
    min-width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #dee2e6;
    background-color: white;
    color: #495057;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-page:hover:not(:disabled) {
    background-color: #e9ecef;
    border-color: #dee2e6;
    color: #0056b3;
  }
  
  .btn-page.active {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
  }
  
  .btn-page:disabled {
    color: #adb5bd;
    cursor: not-allowed;
  }
  
  /* Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999; /* Z-index değerini artıralım */
  }
  
  .modal {
    background-color: white;
    border-radius: 8px;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #e9ecef;
  }
  
  .modal-header h3 {
    margin: 0;
    font-size: 1.3rem;
    color: #333;
  }
  
  .btn-close {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6c757d;
  }
  
  .btn-close:hover {
    color: #343a40;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
  }
  
  .form-group input, .form-group textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 0.95rem;
  }
  
  .form-group textarea {
    resize: vertical;
    min-height: 80px;
  }
  
  .error-text {
    color: #dc3545;
    font-size: 0.85rem;
    margin-top: 5px;
  }
  
  .logo-upload {
    display: flex;
    gap: 20px;
    align-items: flex-start;
  }
  
  .preview {
    width: 100px;
    height: 100px;
    border: 1px dashed #ced4da;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  
  .preview img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  
  .no-logo-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #6c757d;
  }
  
  .no-logo-preview i {
    font-size: 1.8rem;
    margin-bottom: 5px;
  }
  
  .upload-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    justify-content: center;
    flex: 1;
  }
  
  .btn-upload {
    padding: 8px 12px;
    background-color: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: #444;
    cursor: pointer;
    font-size: 0.9rem;
  }
  
  .btn-upload:hover {
    background-color: #e9ecef;
  }
  
  .btn-remove {
    padding: 8px 12px;
    background-color: transparent;
    border: 1px solid #dc3545;
    color: #dc3545;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    font-size: 0.9rem;
  }
  
  .btn-remove:hover {
    background-color: #dc3545;
    color: white;
  }
  
  .toggle-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .toggle-switch {
    position: relative;
    width: 50px;
    height: 24px;
    background-color: #e9ecef;
    border-radius: 30px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .toggle-switch.active {
    background-color: #28a745;
  }
  
  .toggle-slider {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background-color: white;
    border-radius: 50%;
    transition: transform 0.2s;
  }
  
  .toggle-switch.active .toggle-slider {
    transform: translateX(26px);
  }
  
  .modal-footer {
    padding: 15px 20px;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  
  .btn-cancel {
    padding: 8px 16px;
    background-color: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 4px;
    color: #555;
    cursor: pointer;
  }
  
  .btn-cancel:hover {
    background-color: #e9ecef;
  }
  
  .btn-save {
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .btn-save:hover:not(:disabled) {
    background-color: #0069d9;
  }
  
  .btn-save:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
  
  .spinner-small {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.2);
    border-left-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .filters {
      flex-direction: column;
      align-items: stretch;
    }
    
    .search-box {
      max-width: 100%;
    }
    
    .logo-upload {
      flex-direction: column;
    }
    
    .preview {
      margin: 0 auto 15px auto;
    }
  }
  </style>