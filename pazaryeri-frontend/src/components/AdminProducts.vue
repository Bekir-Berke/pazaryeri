<template>
  <div>
    <!-- Header with search and filters -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input
              type="text"
              class="form-control"
              placeholder="Ürün ara..."
              v-model="searchQuery"
              @input="handleSearch"
          >
          <button class="btn btn-primary" type="button">
            <i class="bi bi-search"></i>
          </button>
        </div>
      </div>
      <div class="col-md-6 text-end">
        <div class="btn-group me-2">
          <button
              class="btn"
              :class="[filter === 'ALL' ? 'btn-primary' : 'btn-outline-primary']"
              @click="setFilter('ALL')"
          >
            Tümü
          </button>
          <button
              class="btn"
              :class="[filter === 'ACTIVE' ? 'btn-primary' : 'btn-outline-primary']"
              @click="setFilter('ACTIVE')"
          >
            Aktif
          </button>
          <button
              class="btn"
              :class="[filter === 'OUT_OF_STOCK' ? 'btn-primary' : 'btn-outline-primary']"
              @click="setFilter('OUT_OF_STOCK')"
          >
            Stokta Yok
          </button>
        </div>
        <button class="btn btn-success" @click="showAddProductModal = true">
          <i class="bi bi-plus"></i> Yeni Ürün
        </button>
      </div>
    </div>

    <!-- Products Table -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center my-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Yükleniyor...</span>
          </div>
        </div>
        <div v-else-if="filteredProducts.length === 0" class="text-center my-5">
          <i class="bi bi-box fs-1 text-muted"></i>
          <p class="mt-3">Ürün bulunamadı</p>
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
            <tr>
              <th scope="col" width="60">Görsel</th>
              <th scope="col">Ürün Bilgisi</th>
              <th scope="col">Mağaza / Marka</th>
              <th scope="col">Fiyat</th>
              <th scope="col">Stok</th>
              <th scope="col">Durum</th>
              <th scope="col" width="100">İşlem</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="product in filteredProducts" :key="product.id">
              <td>
                <div class="product-image">
                  <img v-if="product.imageUrl" :src="product.imageUrl" alt="Ürün" class="product-thumbnail">
                  <div v-else class="product-no-image">
                    <i class="bi bi-image"></i>
                  </div>
                </div>
              </td>
              <td>
                <div class="product-name">{{ product.name }}</div>
                <div class="text-muted small">
                  SKU: {{ product.sku || 'Belirtilmemiş' }}
                  <span v-if="product.barcode">| EAN: {{ product.barcode }}</span>
                </div>
              </td>
              <td>
                <div>{{ product.store?.name || 'Belirtilmemiş' }}</div>
                <div class="text-muted small">{{ product.brand?.name || 'Belirtilmemiş' }}</div>
              </td>
              <td>
                <div>{{ formatPrice(product.vatPrice) }} ₺</div>
                <div class="text-muted small">KDV: %{{ product.vatRate }}</div>
              </td>
              <td>{{ product.stock }}</td>
              <td>
                  <span class="badge" :class="getStatusBadgeClass(product)">
                    {{ getStatusText(product) }}
                  </span>
              </td>
              <td>
                <div class="d-flex">
                  <button class="btn btn-sm btn-outline-primary me-1" @click="editProduct(product)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="confirmDeleteProduct(product)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card-footer d-flex justify-content-between align-items-center">
        <div>
          Toplam: <strong>{{ totalProducts }}</strong> ürün
        </div>
        <nav v-if="totalPages > 1">
          <ul class="pagination mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                <i class="bi bi-chevron-left"></i>
              </a>
            </li>
            <li
                v-for="page in displayedPages"
                :key="page"
                class="page-item"
                :class="{ active: page === currentPage }"
            >
              <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
                <i class="bi bi-chevron-right"></i>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Add/Edit Product Modal -->
    <div class="modal fade" :class="{ show: showAddProductModal }" tabindex="-1" style="display: block" v-if="showAddProductModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle' }}</h5>
            <button type="button" class="btn-close" @click="closeProductModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveProduct">
              <div class="row">
                <div class="col-md-8 mb-3">
                  <label for="productName" class="form-label">Ürün Adı *</label>
                  <input type="text" class="form-control" id="productName" v-model="productForm.name" required>
                </div>
                <div class="col-md-4 mb-3">
                  <label for="productPrice" class="form-label">Fiyat *</label>
                  <div class="input-group">
                    <input type="number" class="form-control" id="productPrice" v-model="productForm.price" step="0.01" min="0" required>
                    <span class="input-group-text">₺</span>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label for="productDescription" class="form-label">Açıklama</label>
                <textarea class="form-control" id="productDescription" rows="3" v-model="productForm.description"></textarea>
              </div>

              <div class="row">
                <div class="col-md-4 mb-3">
                  <label for="productStock" class="form-label">Stok *</label>
                  <input type="number" class="form-control" id="productStock" v-model="productForm.stock" min="0" required>
                </div>
                <div class="col-md-4 mb-3">
                  <label for="productSku" class="form-label">SKU</label>
                  <input type="text" class="form-control" id="productSku" v-model="productForm.sku">
                </div>
                <div class="col-md-4 mb-3">
                  <label for="productBarcode" class="form-label">Barkod</label>
                  <input type="text" class="form-control" id="productBarcode" v-model="productForm.barcode">
                </div>
              </div>

              <div class="row">
                <div class="col-md-4 mb-3">
                  <label for="productVatRate" class="form-label">KDV Oranı (%)</label>
                  <input type="number" class="form-control" id="productVatRate" v-model="productForm.vatRate" min="0" max="100">
                </div>
                <div class="col-md-4 mb-3">
                  <label for="productStoreId" class="form-label">Mağaza *</label>
                  <select class="form-select" id="productStoreId" v-model="productForm.storeId" required>
                    <option value="" disabled>Mağaza seçin</option>
                    <option v-for="store in stores" :key="store.id" :value="store.id">{{ store.name }}</option>
                  </select>
                </div>
                <div class="col-md-4 mb-3">
                  <label for="productBrandId" class="form-label">Marka</label>
                  <select class="form-select" id="productBrandId" v-model="productForm.brandId">
                    <option value="" disabled>Marka seçin</option>
                    <option v-for="brand in brands" :key="brand.id" :value="brand.id">{{ brand.name }}</option>
                  </select>
                </div>
              </div>

              <div class="mb-3">
                <label for="productImageUrl" class="form-label">Görsel URL</label>
                <input type="url" class="form-control" id="productImageUrl" v-model="productForm.imageUrl">
              </div>

              <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" id="productIsActive" v-model="productForm.isActive">
                <label class="form-check-label" for="productIsActive">
                  Ürün aktif
                </label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeProductModal">İptal</button>
            <button type="button" class="btn btn-primary" @click="saveProduct" :disabled="formSubmitting">
              <span v-if="formSubmitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showAddProductModal"></div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" :class="{ show: showDeleteConfirm }" tabindex="-1" style="display: block" v-if="showDeleteConfirm">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Ürün Sil</h5>
            <button type="button" class="btn-close" @click="showDeleteConfirm = false"></button>
          </div>
          <div class="modal-body">
            <p>
              <strong>{{ productToDelete?.name }}</strong> ürününü silmek istediğinize emin misiniz?
            </p>
            <p class="text-danger">Bu işlem geri alınamaz!</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteConfirm = false">İptal</button>
            <button type="button" class="btn btn-danger" @click="deleteProduct" :disabled="deleteSubmitting">
              <span v-if="deleteSubmitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
              Ürünü Sil
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showDeleteConfirm"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import apiClient from '@/api.js'
import Swal from 'sweetalert2';

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalProducts = ref(0);
const totalPages = computed(() => Math.ceil(totalProducts.value / itemsPerPage.value));

const displayedPages = computed(() => {
  const pages = [];
  const maxPages = 5;
  let startPage = Math.max(1, currentPage.value - Math.floor(maxPages / 2));
  const endPage = Math.min(totalPages.value, startPage + maxPages - 1);

  startPage = Math.max(1, endPage - maxPages + 1);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
});

// Products data
const products = ref([]);
const filteredProducts = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const filter = ref('ALL');

// Related data
const stores = ref([]);
const brands = ref([]);

// For add/edit modal
const showAddProductModal = ref(false);
const editingProduct = ref(null);
const formSubmitting = ref(false);

const productForm = ref({
  name: '',
  description: '',
  price: 0,
  vatRate: 20,
  vatPrice: 0,
  stock: 0,
  sku: '',
  barcode: '',
  imageUrl: '',
  storeId: '',
  brandId: '',
  isActive: true
});

// For delete modal
const showDeleteConfirm = ref(false);
const productToDelete = ref(null);
const deleteSubmitting = ref(false);

// Helper functions
const truncate = (text, length) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

const formatPrice = (price) => {
  return Number(price).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const getStatusBadgeClass = (product) => {
  if (!product.isActive) return 'bg-secondary';
  return product.stock > 0 ? 'bg-success' : 'bg-danger';
};

const getStatusText = (product) => {
  if (!product.isActive) return 'Pasif';
  return product.stock > 0 ? 'Aktif' : 'Stokta Yok';
};

// Fetch products from API
const fetchProducts = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get('/admin/products');

    products.value = response.data || [];
    totalProducts.value = products.value.length;
    applyFilters();
  } catch (error) {
    console.error('Error fetching products:', error);
    Swal.fire({
      icon: 'error',
      title: 'Hata',
      text: 'Ürünler yüklenirken bir hata oluştu.'
    });
  } finally {
    loading.value = false;
  }
};

// Fetch brands
const fetchBrands = async () => {
  try {
    const response = await apiClient.get('/brands');
    brands.value = response.data || [];
  } catch (error) {
    console.error('Error fetching brands:', error);
  }
};

// Fetch stores
const fetchStores = async () => {
  try {
    const response = await apiClient.get('/admin/stores');
    stores.value = response.data || [];
  } catch (error) {
    console.error('Error fetching stores:', error);
  }
};

// Handle search
const handleSearch = () => {
  currentPage.value = 1;
  applyFilters();
};

// Apply filters based on search query and status filter
const applyFilters = () => {
  let result = [...products.value];

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter(product =>
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.barcode?.toLowerCase().includes(query) ||
        product.store?.name?.toLowerCase().includes(query) ||
        product.brand?.name?.toLowerCase().includes(query)
    );
  }

  // Filter by status
  if (filter.value === 'ACTIVE') {
    result = result.filter(product => product.isActive && product.stock > 0);
  } else if (filter.value === 'OUT_OF_STOCK') {
    result = result.filter(product => product.stock === 0);
  }

  filteredProducts.value = result;
};

// Change current filter
const setFilter = (newFilter) => {
  filter.value = newFilter;
  currentPage.value = 1;
  applyFilters();
};

// Change page
const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchProducts();
};

// Edit product
const editProduct = (product) => {
  editingProduct.value = product;
  productForm.value = {
    name: product.name,
    description: product.description || '',
    price: product.price,
    vatRate: product.vatRate || 20,
    vatPrice: product.vatPrice || 0,
    stock: product.stock,
    sku: product.sku || '',
    barcode: product.barcode || '',
    imageUrl: product.imageUrl || '',
    storeId: product.store?.id || '',
    brandId: product.brand?.id || '',
    isActive: product.isActive !== false
  };
  showAddProductModal.value = true;
};

// Confirm delete product
const confirmDeleteProduct = (product) => {
  productToDelete.value = product;
  showDeleteConfirm.value = true;
};

// Delete product
const deleteProduct = async () => {
  if (!productToDelete.value) return;

  deleteSubmitting.value = true;
  try {
    await apiClient.delete(`/admin/products/${productToDelete.value.id}`);

    Swal.fire({
      icon: 'success',
      title: 'Başarılı',
      text: 'Ürün başarıyla silindi.'
    });

    // Refresh product list
    fetchProducts();
    showDeleteConfirm.value = false;
  } catch (error) {
    console.error('Error deleting product:', error);
    Swal.fire({
      icon: 'error',
      title: 'Hata',
      text: 'Ürün silinirken bir hata oluştu.'
    });
  } finally {
    deleteSubmitting.value = false;
  }
};

// Calculate VAT price automatically when price or VAT rate changes
watch([() => productForm.value.price, () => productForm.value.vatRate], ([newPrice, newVatRate]) => {
  if (newPrice && newVatRate) {
    const price = parseFloat(newPrice);
    const vatRate = parseFloat(newVatRate);
    productForm.value.vatPrice = (price + (price * vatRate / 100)).toFixed(2);
  }
});

// Save product (create/edit)
const saveProduct = async () => {
  formSubmitting.value = true;

  try {
    if (editingProduct.value) {
      // Update existing product
      await apiClient.put(`/admin/products/${editingProduct.value.id}`, productForm.value);

      Swal.fire({
        icon: 'success',
        title: 'Başarılı',
        text: 'Ürün başarıyla güncellendi.'
      });
    } else {
      // Create new product
      await apiClient.post('/admin/products', productForm.value);

      Swal.fire({
        icon: 'success',
        title: 'Başarılı',
        text: 'Ürün başarıyla oluşturuldu.'
      });
    }

    // Refresh product list and close modal
    closeProductModal();
    fetchProducts();
  } catch (error) {
    console.error('Error saving product:', error);
    Swal.fire({
      icon: 'error',
      title: 'Hata',
      text: error.response?.data?.message || 'Ürün kaydedilirken bir hata oluştu.'
    });
  } finally {
    formSubmitting.value = false;
  }
};

// Close product modal and reset form
const closeProductModal = () => {
  showAddProductModal.value = false;
  editingProduct.value = null;
  productForm.value = {
    name: '',
    description: '',
    price: 0,
    vatRate: 20,
    vatPrice: 0,
    stock: 0,
    sku: '',
    barcode: '',
    imageUrl: '',
    storeId: '',
    brandId: '',
    isActive: true
  };
};

// Watch for filter changes
watch([filter], () => {
  applyFilters();
});

// Load products, brands and stores on component mount
onMounted(() => {
  fetchProducts();
  fetchBrands();
  fetchStores();
});
</script>

<style scoped>
.product-image {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #adb5bd;
}

.product-name {
  font-weight: 500;
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
  display: block;
}

.modal.fade:not(.show) {
  display: none;
}

.page-link {
  color: #ff7f00;
}

.page-item.active .page-link {
  background-color: #ff7f00;
  border-color: #ff7f00;
  color: white;
}

.btn-primary {
  background-color: #ff7f00;
  border-color: #ff7f00;
}

.btn-primary:hover,
.btn-primary:active,
.btn-primary:focus {
  background-color: #e67300;
  border-color: #e67300;
}

.btn-outline-primary {
  color: #ff7f00;
  border-color: #ff7f00;
}

.btn-outline-primary:hover,
.btn-outline-primary:active,
.btn-outline-primary:focus {
  background-color: #ff7f00;
  color: white;
  border-color: #ff7f00;
}
</style>