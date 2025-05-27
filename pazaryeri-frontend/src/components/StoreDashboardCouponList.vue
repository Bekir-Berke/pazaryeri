<template>
  <div class="coupon-list-container">
    <!-- Başlık ve Yeni Kupon Ekleme Butonu -->
    <div class="section-header d-flex align-items-center justify-content-between mb-4">
      <h4 class="section-title mb-0">Kuponlar</h4>
      <div class="section-actions">
        <button class="btn btn-primary" @click="openNewCouponModal">
          <i class="bi bi-plus-lg me-1"></i> Yeni Kupon Ekle
        </button>
      </div>
    </div>

    <!-- Filtreler ve Arama -->
    <div class="filters-container mb-4">
      <div class="row g-3">
        <div class="col-md-4">
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-search"></i></span>
            <input
              type="text"
              class="form-control"
              placeholder="Kupon kodu ara..."
              v-model="searchQuery"
              @input="filterCoupons"
            />
          </div>
        </div>
        <div class="col-md-3">
          <select class="form-select" v-model="statusFilter" @change="filterCoupons">
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="expired">Süresi Dolmuş</option>
            <option value="used">Kullanılmış</option>
            <option value="inactive">Devre Dışı</option>
          </select>
        </div>
        <div class="col-md-3">
          <select class="form-select" v-model="typeFilter" @change="filterCoupons">
            <option value="all">Tüm Kupon Tipleri</option>
            <option value="PERCENTAGE">Yüzde İndirim</option>
            <option value="FIXED_AMOUNT">Sabit Tutar</option>
            <option value="FREE_SHIPPING">Ücretsiz Kargo</option>
          </select>
        </div>
        <div class="col-md-2">
          <button class="btn btn-outline-secondary w-100" @click="resetFilters">
            Filtreleri Sıfırla
          </button>
        </div>
      </div>
    </div>
    <!-- Kuponlar Bulunamadıysa -->
    <div v-if="coupons.length === 0" class="no-data-container">
      <div class="no-data-content">
        <i class="bi bi-tag"></i>
        <h5>Kupon Bulunamadı</h5>
        <p>Henüz kupon oluşturmadınız veya arama kriterlerinize uygun kupon yok.</p>
        <button class="btn btn-primary" @click="openNewCouponModal">
          Yeni Kupon Oluştur
        </button>
      </div>
    </div>

    <!-- Kuponlar Tablosu -->
    <div v-else class="table-responsive coupon-table">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>Kod</th>
            <th>Tip</th>
            <th>Değer</th>
            <th>Başlangıç Tarihi</th>
            <th>Bitiş Tarihi</th>
            <th>Kullanım</th>
            <th>Durum</th>
            <th class="text-end">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="coupon in coupons" :key="coupon.id" :class="{'expired-coupon': isCouponExpired(coupon)}">
            <td>
              <div class="coupon-code">{{ coupon.code }}</div>
            </td>
            <td>
              <span class="badge bg-info">{{ formatCouponType(coupon.type) }}</span>
            </td>
            <td>
              <div class="coupon-value">{{ formatCouponValue(coupon) }}</div>
            </td>
            <td>{{ formatDate(coupon.startDate) }}</td>
            <td>{{ formatDate(coupon.endDate) }}</td>
            <td>
              <div class="coupon-usage">
                {{ coupon.usedCount }} / {{ coupon.usageLimit || '∞' }}
              </div>
            </td>
            <td>
              <span :class="getCouponStatusClass(coupon)">
                {{ getCouponStatus(coupon) }}
              </span>
            </td>
            <td class="text-end">
              <div class="action-buttons">
                <button class="btn btn-sm btn-outline-info" title="Düzenle" @click="editCoupon(coupon)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger ms-1" title="Sil" @click="deleteCoupon(coupon)">
                  <i class="bi bi-trash"></i>
                </button>
                <button 
                  class="btn btn-sm ms-1" 
                  :class="coupon.isActive ? 'btn-outline-warning' : 'btn-outline-success'"
                  :title="coupon.isActive ? 'Devre Dışı Bırak' : 'Aktifleştir'"
                  @click="toggleCouponStatus(coupon)"
                >
                  <i class="bi" :class="coupon.isActive ? 'bi-pause-fill' : 'bi-play-fill'"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Sayfalama -->
    <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
      <nav aria-label="Kupon Sayfaları">
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
              <i class="bi bi-chevron-left"></i>
            </a>
          </li>
          <li 
            v-for="page in paginationItems" 
            :key="page" 
            class="page-item"
            :class="{ active: page === currentPage, disabled: page === '...' }"
          >
            <a class="page-link" href="#" @click.prevent="page !== '...' && changePage(page)">
              {{ page }}
            </a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
              <i class="bi bi-chevron-right"></i>
            </a>
          </li>
        </ul>
      </nav>
    </div>
    
    <!-- Yeni Kupon Ekleme Modalı -->
    <div v-if="showModal" class="modal-backdrop show"></div>
    <div v-if="showModal" class="modal show d-block" id="newCouponModal" tabindex="-1" aria-labelledby="newCouponModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="newCouponModalLabel">{{ isEditing ? 'Kuponu Düzenle' : 'Yeni Kupon Oluştur' }}</h5>
            <button type="button" class="btn-close" @click="closeModal" aria-label="Kapat"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveCoupon">
              <div class="row g-3">
                <!-- Kupon Kodu -->
                <div class="col-md-6">
                  <label for="couponCode" class="form-label">Kupon Kodu*</label>
                  <div class="input-group">
                    <input 
                      type="text" 
                      class="form-control" 
                      id="couponCode" 
                      v-model="newCoupon.code" 
                      required
                      placeholder="Örn: YAZ2023"
                    >
                    <button class="btn btn-outline-secondary" type="button" @click="generateRandomCode">
                      <i class="bi bi-shuffle"></i>
                    </button>
                  </div>
                  <small class="text-muted">Kupon kodu benzersiz olmalıdır.</small>
                </div>

                <!-- Kupon Tipi -->
                <div class="col-md-6">
                  <label for="couponType" class="form-label">Kupon Tipi*</label>
                  <select class="form-select" id="couponType" v-model="newCoupon.type" required>
                    <option value="">Seçiniz</option>
                    <option value="PERCENTAGE">Yüzde İndirim (%)</option>
                    <option value="FIXED_AMOUNT">Sabit Tutar (₺)</option>
                    <option value="FREE_SHIPPING">Ücretsiz Kargo</option>
                  </select>
                </div>

                <!-- Kupon Değeri -->
                <div class="col-md-6" v-if="newCoupon.type && newCoupon.type !== 'FREE_SHIPPING'">
                  <label for="couponValue" class="form-label">Değer*</label>
                  <div class="input-group">
                    <input 
                      type="number" 
                      class="form-control" 
                      id="couponValue" 
                      v-model="newCoupon.value" 
                      required 
                      min="1" 
                      :max="newCoupon.type === 'PERCENTAGE' ? 100 : null"
                      step="1"
                    >
                    <span class="input-group-text">{{ newCoupon.type === 'PERCENTAGE' ? '%' : '₺' }}</span>
                  </div>
                </div>

                <!-- Minimum Sepet Tutarı -->
                <div class="col-md-6">
                  <label for="minOrderAmount" class="form-label">Minimum Sipariş Tutarı</label>
                  <div class="input-group">
                    <input 
                      type="number" 
                      class="form-control" 
                      id="minOrderAmount" 
                      v-model="newCoupon.minOrderAmount" 
                      min="0"
                      step="0.01"
                    >
                    <span class="input-group-text">₺</span>
                  </div>
                </div>

                <!-- Maksimum İndirim Tutarı (yüzde indirimler için) -->
                <div class="col-md-6" v-if="newCoupon.type === 'PERCENTAGE'">
                  <label for="maxDiscount" class="form-label">Maksimum İndirim Tutarı</label>
                  <div class="input-group">
                    <input 
                      type="number" 
                      class="form-control" 
                      id="maxDiscount" 
                      v-model="newCoupon.maxDiscount" 
                      min="0"
                      step="0.01"
                    >
                    <span class="input-group-text">₺</span>
                  </div>
                  <small class="text-muted">Boş bırakılırsa, indirim sınırı olmayacaktır.</small>
                </div>

                <!-- Başlangıç ve Bitiş Tarihleri -->
                <div class="col-md-6">
                  <label for="startDate" class="form-label">Başlangıç Tarihi*</label>
                  <input 
                    type="datetime-local" 
                    class="form-control" 
                    id="startDate" 
                    v-model="newCoupon.startDate" 
                    required
                  >
                </div>

                <div class="col-md-6">
                  <label for="endDate" class="form-label">Bitiş Tarihi*</label>
                  <input 
                    type="datetime-local" 
                    class="form-control" 
                    id="endDate" 
                    v-model="newCoupon.endDate" 
                    required
                  >
                </div>

                <!-- Kullanım Limiti -->
                <div class="col-md-6">
                  <label for="usageLimit" class="form-label">Toplam Kullanım Limiti</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="usageLimit" 
                    v-model="newCoupon.usageLimit" 
                    min="1"
                    step="1"
                  >
                  <small class="text-muted">Boş bırakılırsa, sınırsız kullanılabilir.</small>
                </div>

                <!-- Kişi Başı Kullanım Limiti -->
                <div class="col-md-6">
                  <label for="perUserLimit" class="form-label">Kişi Başı Kullanım Limiti</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="perUserLimit" 
                    v-model="newCoupon.perUserLimit" 
                    min="1"
                    step="1"
                  >
                  <small class="text-muted">Boş bırakılırsa, kişi başı sınırsız kullanılabilir.</small>
                </div>

                <!-- Hedefleme Tipi -->
                <div class="col-md-12">
                  <label class="form-label">Kupon Hedefleme Tipi</label>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" id="targetingTypeAll" v-model="newCoupon.targetingType" value="all">
                    <label class="form-check-label" for="targetingTypeAll">
                      Tüm Ürünler
                    </label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" id="targetingTypeCategory" v-model="newCoupon.targetingType" value="category">
                    <label class="form-check-label" for="targetingTypeCategory">
                      Kategori Bazlı
                    </label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" id="targetingTypeBrand" v-model="newCoupon.targetingType" value="brand">
                    <label class="form-check-label" for="targetingTypeBrand">
                      Marka Bazlı
                    </label>
                  </div>
                </div>

                <!-- Kategoriler - Sadece kategori bazlı seçildiğinde görünür -->
                <div class="col-md-12" v-if="newCoupon.targetingType === 'category'">
                  <label for="categories" class="form-label">Kategoriler</label>
                  <select class="form-select" id="categories" v-model="newCoupon.categoryIds" multiple>
                    <option v-for="category in categories" :key="category.id" :value="category.id">
                      {{ getCategoryFullPath(category) }}
                    </option>
                  </select>
                  <small class="text-muted">Kuponu belirli kategorilerdeki ürünlere uygulamak için seçin.</small>
                </div>

                <!-- Markalar - Sadece marka bazlı seçildiğinde görünür -->
                <div class="col-md-12" v-if="newCoupon.targetingType === 'brand'">
                  <label for="brands" class="form-label">Markalar</label>
                  <select class="form-select" id="brands" v-model="newCoupon.brandIds" multiple>
                    <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                      {{ brand.name }}
                    </option>
                  </select>
                  <small class="text-muted">Kuponu belirli markalardaki ürünlere uygulamak için seçin.</small>
                </div>

                <!-- Açıklama -->
                <div class="col-12">
                  <label for="description" class="form-label">Açıklama</label>
                  <textarea 
                    class="form-control" 
                    id="description" 
                    v-model="newCoupon.description" 
                    rows="3"
                    placeholder="Kupon hakkında detaylı bilgi (isteğe bağlı)"
                  ></textarea>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">İptal</button>
            <button type="button" class="btn btn-primary" @click="saveCoupon" :disabled="isSaving">
              <span v-if="isSaving" class="spinner-border spinner-border-sm me-1" role="status"></span>
              {{ isEditing ? 'Güncelle' : 'Kuponu Kaydet' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import apiClient from '@/api';

// Kupon verileri
const coupons = defineModel({ default: () => [] })
const filteredCoupons = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const statusFilter = ref('all');
const typeFilter = ref('all');

// Yeni kupon verileri
const newCoupon = ref({
  id: null,
  code: '',
  type: '',
  value: '',
  minOrderAmount: null,
  maxDiscount: null,
  startDate: new Date().toISOString().slice(0, 16),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  usageLimit: null,
  perUserLimit: null,
  description: '',
  isActive: true,
  categoryIds: [], // Kategori IDleri için dizi
  brandIds: [], // Marka IDleri için dizi
  targetingType: 'all' // Varsayılan olarak tüm ürünlere uygula
});

const isSaving = ref(false);
const showModal = ref(false);
const isEditing = ref(false);

// Sayfalama değişkenleri
const currentPage = ref(1);
const pageSize = ref(10);
const totalPages = ref(1);
const filterCoupons = () => {
  let result = [...coupons.value];
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(coupon => 
      coupon.code.toLowerCase().includes(query) ||
      (coupon.description && coupon.description.toLowerCase().includes(query))
    );
  }
    if (statusFilter.value !== 'all') {
    const now = new Date();
    
    switch (statusFilter.value) {
      case 'active':
        result = result.filter(coupon => 
          coupon.isActive && 
          new Date(coupon.endDate) > now &&
          (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)
        );
        break;
      case 'expired':
        result = result.filter(coupon => new Date(coupon.endDate) < now);
        break;
      case 'used':
        result = result.filter(coupon => 
          coupon.usageLimit && coupon.usedCount >= coupon.usageLimit
        );
        break;
      case 'inactive':
        result = result.filter(coupon => !coupon.isActive);
        break;
    }
  }
    if (typeFilter.value !== 'all') {
    result = result.filter(coupon => coupon.type === typeFilter.value);
  }
  
  // Toplam sayfa sayısını güncelle
  totalPages.value = Math.ceil(result.length / pageSize.value);
  
  // Sayfalama
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  
  filteredCoupons.value = result.slice(startIndex, endIndex);
  
  // Eğer mevcut sayfa boş ise ilk sayfaya dön
  if (filteredCoupons.value.length === 0 && currentPage.value > 1 && totalPages.value > 0) {
    currentPage.value = 1;
    filterCoupons();
  }
}
// Sayfalama düzeni
const paginationItems = computed(() => {
  const items = [];
  const maxVisiblePages = 5;
  
  if (totalPages.value <= maxVisiblePages) {
    for (let i = 1; i <= totalPages.value; i++) {
      items.push(i);
    }
  } else {
    items.push(1);
    
    if (currentPage.value > 3) {
      items.push('...');
    }
    
    const startPage = Math.max(2, currentPage.value - 1);
    const endPage = Math.min(totalPages.value - 1, currentPage.value + 1);
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(i);
    }
    
    if (currentPage.value < totalPages.value - 2) {
      items.push('...');
    }
    
    items.push(totalPages.value);
  }
  
  return items;
});

// Sayfa değiştirme
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    filterCoupons();
  }
};

// Filtreleri sıfırla
const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = 'all';
  typeFilter.value = 'all';
  currentPage.value = 1;
  filterCoupons();
};

// Yeni kupon ekleme modalını aç
const openNewCouponModal = () => {
  // Yeni kupon nesnesini sıfırla
  resetNewCoupon();
  // Editing modunu kapat
  isEditing.value = false;
  // Modalı aç
  showModal.value = true;
  // Arka plan kaydırmasını engelle
  document.body.style.overflow = 'hidden';
};

// Modalı kapat
const closeModal = () => {
  showModal.value = false;
  // Arka plan kaydırmasını geri aç
  document.body.style.overflow = '';
};

// Yeni kupon nesnesini sıfırla
const resetNewCoupon = () => {
  newCoupon.value = {
    id: null,
    code: '',
    type: '',
    value: '',
    minOrderAmount: null,
    maxDiscount: null,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    usageLimit: null,
    perUserLimit: null,
    description: '',
    isActive: true,
    categoryIds: [], // Kategori IDleri sıfırla
    brandIds: [], // Marka IDleri sıfırla
    targetingType: 'all'
  };
};

// Rastgele kupon kodu oluştur
const generateRandomCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  newCoupon.value.code = result;
};

// Kuponu kaydet
const saveCoupon = async () => {
  isSaving.value = true;
  
  try {
    // Boş değerleri null olarak ayarla
    const couponData = {...newCoupon.value};
    if (couponData.type === 'FREE_SHIPPING') {
      couponData.value = 0;
    }
    
    // Tarihleri kesin ISO formatına dönüştür (2025-05-07T11:50:27.253Z)
    if (couponData.startDate) {
      // HTML datetime-local değerini tam ISO formatına dönüştür
      const startDate = new Date(couponData.startDate);
      couponData.startDate = startDate.toISOString();
    }
    
    if (couponData.endDate) {
      // HTML datetime-local değerini tam ISO formatına dönüştür
      const endDate = new Date(couponData.endDate);
      couponData.endDate = endDate.toISOString();
    }
    
    // Targeting type kontrolü
    if (couponData.targetingType === 'all') {
      // Tüm ürünlere uygulanacak, categoryIds ve brandIds boş olmalı
      couponData.categoryIds = [];
      couponData.brandIds = [];
    } else if (couponData.targetingType === 'brand') {
      // Sadece marka bazlı, categoryIds boş olmalı
      couponData.categoryIds = [];
      
      // Marka IDleri, Kupon-Ürün ilişkisine dönüştür
      if (couponData.brandIds && couponData.brandIds.length > 0) {
        // Seçilen markalara ait ürünleri bul ve bunların ID'lerini ekle
        const productIds = await getProductsForBrands(couponData.brandIds);
        couponData.productIds = productIds;
      }
    } else if (couponData.targetingType === 'category') {
      // Sadece kategori bazlı, brandIds boş olmalı
      couponData.brandIds = [];
    }
    
    // brandIds alanını kaldır çünkü backend bu alanı beklemiyor
    delete couponData.brandIds;
    
    // targetingType alanını da kaldır çünkü backend bu alanı beklemiyor
    delete couponData.targetingType;
    
    console.log('Gönderilen veri:', JSON.stringify(couponData, null, 2));
    
    let response;
    
    if (isEditing.value) {
      // Kuponu güncelle
      response = await apiClient.put(`/coupon/${couponData.id}`, couponData);
      
      if (response.status === 200) {
        // Başarıyla güncellendiğinde modalı kapat
        closeModal();
        
        // Coupons listesinde ilgili kuponu güncelle
        const index = coupons.value.findIndex(c => c.id === couponData.id);
        if (index !== -1) {
          coupons.value[index] = response.data;
        }
        
        // Başarılı mesaj göster
        alert('Kupon başarıyla güncellendi.');
      }
    } else {
      // Yeni kupon oluştur
      response = await apiClient.post('/coupon', couponData);
      
      if (response.status === 201) {
        // Başarıyla kaydedildiğinde modalı kapat
        closeModal();
        coupons.value.push(response.data);
        // Başarılı mesaj gösterilebilir
        alert('Kupon başarıyla oluşturuldu.');
      }
    }
    
    // Filtreleri yeniden uygula
    filterCoupons();
  } catch (error) {
    console.error('Kupon kaydedilirken hata oluştu:', error);
    console.error('Hata detayı:', error.response?.data);
    alert('Kupon kaydedilirken bir hata oluştu: ' + (error.response?.data?.message || error.message));
  } finally {
    isSaving.value = false;
  }
};

// Seçilen markalara ait ürünlerin ID'lerini getir
const getProductsForBrands = async (brandIds) => {
  try {
    // Mağazanın tüm ürünlerini getir
    const response = await apiClient.get('/store/products');
    // Seçilen markalara ait ürünleri filtrele
    const filteredProducts = response.data.filter(product => 
      brandIds.includes(product.brandId)
    );
    // Ürün ID'lerini döndür
    return filteredProducts.map(product => product.id);
  } catch (error) {
    console.error('Marka ürünleri alınırken hata oluştu:', error);
    return [];
  }
};

// Kupon düzenleme
const editCoupon = (coupon) => {
  // Tarihleri datetime-local formatına çevir
  const startDate = new Date(coupon.startDate);
  const endDate = new Date(coupon.endDate);
  
  // Hedefleme tipini belirle
  let targetingType = 'all';
  
  if (coupon.categories && coupon.categories.length > 0) {
    targetingType = 'category';
  } else if (coupon.brands && coupon.brands.length > 0) {
    targetingType = 'brand';
  }
  
  // Kupon verisini form nesnesine kopyala
  newCoupon.value = {
    id: coupon.id,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    minOrderAmount: coupon.minOrderAmount,
    maxDiscount: coupon.maxDiscount,
    startDate: startDate.toISOString().slice(0, 16),
    endDate: endDate.toISOString().slice(0, 16),
    usageLimit: coupon.usageLimit,
    perUserLimit: coupon.perUserLimit,
    description: coupon.description || '',
    isActive: coupon.isActive,
    categoryIds: coupon.categories ? coupon.categories.map(c => c.categoryId) : [],
    brandIds: coupon.brands ? coupon.brands.map(b => b.brandId) : [],
    targetingType: targetingType
  };
  
  // Düzenleme modunu aç
  isEditing.value = true;
  
  // Modalı aç
  showModal.value = true;
  
  // Arka plan kaydırmasını engelle
  document.body.style.overflow = 'hidden';
};

// Kupon silme
const deleteCoupon = async (coupon) => {
  if (confirm(`"${coupon.code}" kodlu kuponu silmek istediğinizden emin misiniz?`)) {
    try {
      const response = await apiClient.delete(`/coupon/${coupon.id}`);
      if (response.status === 200) {
        coupons.value = coupons.value.filter(c => c.id !== coupon.id);
      }
    } catch (error) {
      console.error('Kupon silinirken hata oluştu:', error);
    }
  }
};

// Kupon durumunu değiştir (aktif/deaktif)
const toggleCouponStatus = async (coupon) => {
  try {
    const response = await apiClient.patch(`/store/coupons/${coupon.id}/toggle-status`, {
      isActive: !coupon.isActive
    });
    if (response.status === 200) {
      await fetchCoupons(); // Kuponları yeniden yükle
    }
  } catch (error) {
    console.error('Kupon durumu değiştirilirken hata oluştu:', error);
  }
};

// Kupon tipini formatla
const formatCouponType = (type) => {
  switch (type) {
    case 'PERCENTAGE':
      return 'Yüzde İndirim';
    case 'FIXED_AMOUNT':
      return 'Sabit Tutar';
    case 'FREE_SHIPPING':
      return 'Ücretsiz Kargo';
    default:
      return type;
  }
};

// Kupon değerini formatla
const formatCouponValue = (coupon) => {
  switch (coupon.type) {
    case 'PERCENTAGE':
      return `%${coupon.value}`;
    case 'FIXED_AMOUNT':
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
      }).format(coupon.value);
    case 'FREE_SHIPPING':
      return 'Kargo Bedava';
    default:
      return coupon.value;
  }
};

// Tarihi formatla
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

// Kuponun durumunu kontrol et
const getCouponStatus = (coupon) => {
  const now = new Date();
  
  if (!coupon.isActive) {
    return 'Devre Dışı';
  }
  
  if (new Date(coupon.endDate) < now) {
    return 'Süresi Dolmuş';
  }
  
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return 'Tükendi';
  }
  
  if (new Date(coupon.startDate) > now) {
    return 'Yakında Aktif';
  }
  
  return 'Aktif';
};

// Kupon durumuna göre CSS sınıfı belirle
const getCouponStatusClass = (coupon) => {
  const status = getCouponStatus(coupon);
  
  switch (status) {
    case 'Aktif':
      return 'badge bg-success';
    case 'Yakında Aktif':
      return 'badge bg-info';
    case 'Süresi Dolmuş':
      return 'badge bg-secondary';
    case 'Tükendi':
      return 'badge bg-warning text-dark';
    case 'Devre Dışı':
      return 'badge bg-danger';
    default:
      return 'badge bg-secondary';
  }
};

// Kuponun süresi dolmuş mu kontrol et
const isCouponExpired = (coupon) => {
  return new Date(coupon.endDate) < new Date();
};

// Filtre değişikliklerini izle
watch([searchQuery, statusFilter, typeFilter], () => {
  currentPage.value = 1; // Filtre değiştiğinde ilk sayfaya dön
  filterCoupons();
});

// Kategori ve marka verileri
const categories = ref([]);
const brands = ref([]);

// Kategorileri getir
const fetchCategories = async () => {
  try {
    const response = await apiClient.get('/category');
    categories.value = response.data;
  } catch (error) {
    console.error('Kategoriler yüklenirken hata oluştu:', error);
  }
};

// Markaları getir
const fetchBrands = async () => {
  try {
    const response = await apiClient.get('/brand');
    brands.value = response.data;
  } catch (error) {
    console.error('Markalar yüklenirken hata oluştu:', error);
  }
};

// Kategori tam yolunu oluştur
const getCategoryFullPath = (category) => {
  let path = category.name;
  let currentCategory = category;
  
  // Eğer kategoride parent bilgisi varsa, bunları ekleyerek tam yolu oluştur
  while (currentCategory.parentId) {
    const parent = categories.value.find(c => c.id === currentCategory.parentId);
    if (parent) {
      path = parent.name + ' > ' + path;
      currentCategory = parent;
    } else {
      break;
    }
  }
  
  return path;
};

onMounted(() => {
  fetchCategories();
  fetchBrands();
});
</script>

<style scoped>
.coupon-list-container {
  background-color: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.section-header {
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.filters-container {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
}

.coupon-table {
  margin-top: 1rem;
}

.coupon-table th {
  font-weight: 600;
  color: #555;
  border-top: none;
  background-color: #f8f9fa;
}

.coupon-table td {
  vertical-align: middle;
}

.coupon-code {
  font-weight: 600;
  font-family: monospace;
  padding: 0.2rem 0.5rem;
  background-color: #f0f0f0;
  border-radius: 4px;
  display: inline-block;
}

.coupon-value {
  font-weight: 500;
}

.coupon-usage {
  color: #555;
  font-size: 0.9rem;
}

.action-buttons .btn {
  padding: 0.25rem 0.5rem;
}

.expired-coupon {
  background-color: #f9f9f9;
  color: #999;
}

.no-data-container {
  text-align: center;
  padding: 3rem 0;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.no-data-content {
  max-width: 400px;
  margin: 0 auto;
}

.no-data-content i {
  font-size: 3rem;
  color: #ccc;
  margin-bottom: 1rem;
}

.no-data-content h5 {
  font-weight: 600;
  color: #555;
  margin-bottom: 0.5rem;
}

.no-data-content p {
  color: #777;
  margin-bottom: 1.5rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.loading-container p {
  margin-top: 1rem;
  color: #666;
}

/* Responsive düzenlemeler */
@media (max-width: 992px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .section-actions {
    margin-top: 1rem;
    width: 100%;
  }
  
  .section-actions .btn {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .coupon-list-container {
    padding: 1rem;
  }
  
  .coupon-table th,
  .coupon-table td {
    font-size: 0.9rem;
  }
  
  .action-buttons .btn {
    padding: 0.2rem 0.4rem;
    font-size: 0.8rem;
  }
}

/* Modal stiller */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1050;
  width: 100%;
  height: 100%;
  overflow: hidden;
  outline: 0;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1040;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  opacity: 0.5;
}

.modal-dialog {
  position: relative;
  width: auto;
  margin: 1.75rem auto;
  pointer-events: none;
  max-width: 800px;
}

.modal.show .modal-dialog {
  transform: none;
  transition: transform 0.3s ease-out;
}

.modal-content {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  pointer-events: auto;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 0.3rem;
  outline: 0;
}

.modal-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  border-top-left-radius: calc(0.3rem - 1px);
  border-top-right-radius: calc(0.3rem - 1px);
}

.modal-body {
  position: relative;
  flex: 1 1 auto;
  padding: 1rem;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  flex-wrap: wrap;
  flex-shrink: 0;
  align-items: center;
  justify-content: flex-end;
  padding: 0.75rem;
  border-top: 1px solid #dee2e6;
  border-bottom-right-radius: calc(0.3rem - 1px);
  border-bottom-left-radius: calc(0.3rem - 1px);
}

.show {
  display: block;
}

.d-block {
  display: block;
}

.btn-close {
  box-sizing: content-box;
  width: 1em;
  height: 1em;
  padding: 0.25em 0.25em;
  color: #000;
  background: transparent url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23000'%3e%3cpath d='M.293.293a1 1 0 011.414 0L8 6.586 14.293.293a1 1 0 111.414 1.414L9.414 8l6.293 6.293a1 1 0 01-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 01-1.414-1.414L6.586 8 .293 1.707a1 1 0 010-1.414z'/%3e%3c/svg%3e") center/1em auto no-repeat;
  border: 0;
  border-radius: 0.25rem;
  opacity: 0.5;
  cursor: pointer;
}

.btn-close:hover {
  color: #000;
  text-decoration: none;
  opacity: 0.75;
}

/* Çoklu seçim kutuları için stil */
select[multiple] {
  height: 150px;
  padding: 0.5rem;
}
</style>
