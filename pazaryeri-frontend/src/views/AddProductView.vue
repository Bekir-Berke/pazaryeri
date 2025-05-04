<template>
  <div class="add-product-container">
    <h1>Yeni Ürün Ekle</h1>
    
    <form @submit.prevent="submitProduct" class="product-form">
      <!-- Temel Ürün Bilgileri -->
      <div class="form-group">
        <label for="name">Ürün Adı *</label>
        <input type="text" id="name" v-model="product.name" required />
      </div>
      
      <div class="form-group">
        <label for="description">Ürün Açıklaması *</label>
        <textarea id="description" v-model="product.description" rows="4" required></textarea>
      </div>
      
      <div class="form-row">
        <div class="form-group half">
          <label for="price">Fiyat (TL) *</label>
          <input type="number" id="price" v-model="product.price" step="0.01" min="0" required />
        </div>
        
        <div class="form-group half">
          <label for="stock">Stok Miktarı *</label>
          <input type="number" id="stock" v-model="product.stock" min="0" required />
        </div>
      </div>
      
      <!-- Vergi Oranı Girişi -->
      <div class="form-group">
        <label for="taxRate">Vergi Oranı (%) *</label>
        <input 
          type="number" 
          id="taxRate" 
          v-model="product.vatRate" 
          step="0.01" 
          min="0" 
          max="100" 
          placeholder="Örn: 18.00"
          @blur="formatVatRate"
          required 
        />
        <small class="form-hint">KDV oranını yüzde olarak giriniz (Örn: 18.00)</small>
      </div>

      <div class="total-price-display" v-if="product.price > 0 && product.vatRate > 0">
        <span class="total-price-label">KDV Dahil Fiyat:</span>
        <span class="total-price-value">{{ formatPriceWithTax(product.price, product.vatRate) }} TL</span>
      </div>
      
      <!-- Varyant Ekleme Bölümü -->
      <div class="form-group">
        <h3>Ürün Varyantları</h3>
        <p class="form-hint">Renk, beden, desen gibi farklı özelliklerde ürün seçenekleri ekleyebilirsiniz.</p>
        
        <div v-for="(variant, index) in product.variants" :key="index" class="variant-row">
          <div class="variant-header">
            <h4>Varyant #{{ index + 1 }}</h4>
            <button type="button" @click="removeVariant(index)" class="remove-btn">Kaldır</button>
          </div>
          
          <div class="variant-fields">
            <div class="form-group">
              <label :for="'variant-name-' + index">Varyant Adı *</label>
              <input type="text" :id="'variant-name-' + index" v-model="variant.name" placeholder="Örn: Kırmızı, XL, 256GB" required />
            </div>
            
            <div class="form-group">
              <label :for="'variant-sku-' + index">Stok Kodu (SKU)</label>
              <input type="text" :id="'variant-sku-' + index" v-model="variant.sku" placeholder="Varyanta özel stok kodu" />
            </div>
            
            <div class="form-row">
              <div class="form-group half">
                <label :for="'variant-price-' + index">Fiyat (TL)</label>
                <input type="number" :id="'variant-price-' + index" v-model="variant.price" step="0.01" min="0" placeholder="Ana ürün fiyatından farklıysa" />
                <small class="form-hint">Boş bırakırsanız ana ürün fiyatı kullanılır</small>
              </div>
              
              <div class="form-group half">
                <label :for="'variant-stock-' + index">Stok Miktarı *</label>
                <input type="number" :id="'variant-stock-' + index" v-model="variant.stock" min="0" required />
              </div>
            </div>
            
            <div class="form-group">
              <label :for="'variant-image-' + index">Varyant Görseli</label>
              <div class="file-upload-container">
                <label class="custom-file-upload">
                  <input 
                    type="file" 
                    :id="'variant-image-' + index" 
                    @change="handleVariantImageUpload($event, index)" 
                    accept="image/*"
                  />
                  <span>Dosya Seçin</span>
                </label>
                <span class="file-name" v-if="variant.imagePreview">{{ getFileNameFromUrl(variant.imagePreview) }}</span>
              </div>
              
              <div class="image-preview-small" v-if="variant.imagePreview">
                <div class="preview-item-small">
                  <img :src="variant.imagePreview" :alt="`Varyant ${index+1}`" />
                  <button type="button" @click="removeVariantImage(index)" class="remove-image">X</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <button type="button" @click="addVariant" class="add-btn">Yeni Varyant Ekle</button>
      </div>
      
      <!-- Marka Seçimi -->
      <div class="form-group">
        <label for="brand">Marka *</label>
        <select id="brand" v-model="product.brandId" required>
          <option value="" disabled selected>Marka seçiniz</option>
          <option v-for="brand in brands" :key="brand.id" :value="brand.id">{{ brand.name }}</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="sku">SKU *</label>
        <input type="text" id="sku" v-model="product.sku" required />
      </div>
      <!-- Kategori Seçimi -->
      <div class="form-group">
        <label for="category">Kategori *</label>
        <select id="category" v-model="product.categories[0].categoryId" required>
          <option value="" disabled selected>Kategori seçiniz</option>
          <option v-for="category in leafCategories" :key="category.id" :value="category.id">
            {{ getCategoryPath(category) }}
          </option>
        </select>
      </div>
      
      <!-- Ürün Özellikleri -->
      <div class="form-group">
        <h3>Ürün Özellikleri</h3>
        <div v-for="(attribute, index) in product.attributes" :key="index" class="attribute-row">
          <input type="text" v-model="attribute.name" placeholder="Özellik (Örn: Renk)" class="attribute-name" />
          <input type="text" v-model="attribute.value" placeholder="Değer (Örn: Kırmızı)" class="attribute-value" />
          <button type="button" @click="removeAttribute(index)" class="remove-btn">Kaldır</button>
        </div>
        <button type="button" @click="addAttribute" class="add-btn">Yeni Özellik Ekle</button>
      </div>
      
      <!-- Resim Yükleme -->
      <div class="form-group">
        <label for="images">Ürün Görselleri (En fazla 4 adet) *</label>
        <div class="file-upload-container">
          <label class="custom-file-upload">
            <input 
              type="file" 
              id="images" 
              @change="handleFileUpload" 
              multiple 
              accept="image/*"
              ref="fileInput"
            />
            <span>Dosya Seçin</span>
          </label>
          <span class="file-count" v-if="selectedFiles.length > 0">{{ selectedFiles.length }} dosya seçildi</span>
        </div>
        <div class="image-preview" v-if="imagePreviewUrls.length > 0">
          <div v-for="(url, index) in imagePreviewUrls" :key="index" class="preview-item">
            <img :src="url" :alt="`Preview ${index+1}`" />
            <button type="button" @click="removeImage(index)" class="remove-image">X</button>
          </div>
        </div>
        <div v-if="imagePreviewUrls.length >= 4" class="max-images-warning">
          Maksimum görsel sayısına ulaştınız (4)
        </div>
        <button 
          type="button" 
          class="add-more-images" 
          @click="addMoreImages"
          v-if="imagePreviewUrls.length > 0 && imagePreviewUrls.length < 4"
        >
          Daha Fazla Görsel Ekle
        </button>
      </div>
      
      <!-- Diğer Detaylar -->
      <div class="form-row">
        <div class="form-group half">
          <label for="weight">Ağırlık (kg)</label>
          <input type="number" id="weight" v-model="product.weight" step="0.01" min="0" />
        </div>
        
        <div class="form-group half">
          <label for="barcode">Barkod</label>
          <input type="text" id="barcode" v-model="product.barcode" />
        </div>

        <div class="form-group half toggle-group">
          <label for="isActive">Ürünü Hemen Satışa Açılsın Mı?</label>
          <div class="toggle-switch">
            <input type="checkbox" id="isActive" v-model="product.isActive" class="toggle-input" />
            <label for="isActive" class="toggle-label">
              <span class="toggle-inner"></span>
              <span class="toggle-switch-inner"></span>
            </label>
            <div class="toggle-status">{{ product.isActive ? 'Evet' : 'Hayır' }}</div>
          </div>
        </div>
      </div>

      <div class="form-group toggle-group">
        <label for="isFeature">Ürün Profilinizde Öne Çıkarılsın Mı?</label>
        <div class="toggle-switch">
          <input type="checkbox" id="isFeature" v-model="product.isFeature" class="toggle-input" />
          <label for="isFeature" class="toggle-label">
            <span class="toggle-inner"></span>
            <span class="toggle-switch-inner"></span>
          </label>
          <div class="toggle-status">{{ product.isFeature ? 'Evet' : 'Hayır' }}</div>
        </div>
      </div>
      
      <!-- Gönder Butonu -->
      <div class="form-actions">
        <button type="button" @click="router.back()" class="cancel-btn">İptal</button>
        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? 'Yükleniyor...' : 'Ürünü Kaydet' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/api';

const router = useRouter();
const fileInput = ref(null);

const product = ref({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  vatRate:18.00,
  brandId: null,
  categories: [{
    categoryId:null
  }],
  attributes: [],
  variants: [],
  isActive: false,
  isFeature:false,
  sku: '',
  weight: 0,
  barcode: '',
});

const brands = ref([]);
const allCategories = ref([]);
const leafCategories = computed(() => {
  const result = [];
  
  if (allCategories.value.length) {
    allCategories.value.forEach(topCategory => {
      if (topCategory.children && topCategory.children.length) {
        topCategory.children.forEach(midCategory => {
          if (midCategory.children && midCategory.children.length) {
            // Add all level 2 categories
            midCategory.children.forEach(leafCategory => {
              // Store parent references for building the path
              leafCategory.parentName = midCategory.name;
              leafCategory.topParentName = topCategory.name;
              result.push(leafCategory);
            });
          }
        });
      }
    });
  }
  
  return result;
});
const imagePreviewUrls = ref([]);
const isSubmitting = ref(false);
const selectedFiles = ref([]);

function calculateTotalPrice() {
  return;
}

function formatPriceWithTax(price, taxRate) {
  if (!price || !taxRate) return "0.00";
  
  const taxAmount = (parseFloat(price) * parseFloat(taxRate)) / 100;
  const totalPrice = parseFloat(price) + taxAmount;
  
  return totalPrice.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

onMounted(() => {
  apiClient.get('/brand').then(response => {
    brands.value = response.data;
  }).catch(error => {
    console.error('Error fetching brands:', error);
  });
  apiClient.get('/category').then(response => {
    allCategories.value = response.data;
  }).catch(error => {
    console.error('Error fetching categories:', error);
  });
});

function addAttribute() {
  product.value.attributes.push({ name: '', value: '' });
}

function removeAttribute(index) {
  product.value.attributes.splice(index, 1);
}

function handleFileUpload(event) {
  const files = Array.from(event.target.files);
  
  // Mevcut dosya sayısı ile yeni dosyaların toplamı 4'ten fazla olamamalı
  if (selectedFiles.value.length + files.length > 4) {
    alert("En fazla 4 görsel yükleyebilirsiniz.");
    return;
  }
  
  // Yeni dosyaları mevcut dosyalara ekle
  files.forEach(file => {
    if (selectedFiles.value.length < 4) {
      selectedFiles.value.push(file);
      imagePreviewUrls.value.push(URL.createObjectURL(file));
    }
  });
  
  // Dosya giriş alanını temizle
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

function removeImage(index) {
  // Oluşturulan URL'yi temizle (bellek sızıntısını önlemek için)
  URL.revokeObjectURL(imagePreviewUrls.value[index]);
  
  // Dizilerden öğeyi kaldır
  imagePreviewUrls.value.splice(index, 1);
  selectedFiles.value.splice(index, 1);
}

function addMoreImages() {
  if (fileInput.value) {
    fileInput.value.click();
  }
}

function formatVatRate() {
  if (product.value.vatRate) {
    product.value.vatRate = parseFloat(product.value.vatRate).toFixed(2);
  }
}

function addVariant() {
  product.value.variants.push({
    name: '',
    sku: '',
    price: null,
    stock: 0,
    imageFile: null,
    imagePreview: null
  });
}

function removeVariant(index) {
  // Varyant görselinin URL nesnesini temizle (bellek sızıntısını önlemek için)
  if (product.value.variants[index].imagePreview) {
    URL.revokeObjectURL(product.value.variants[index].imagePreview);
  }
  
  product.value.variants.splice(index, 1);
}

function handleVariantImageUpload(event, variantIndex) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Önceki görsel URL'sini temizle
  if (product.value.variants[variantIndex].imagePreview) {
    URL.revokeObjectURL(product.value.variants[variantIndex].imagePreview);
  }
  
  // Yeni dosyayı kaydet ve önizleme URL'i oluştur
  product.value.variants[variantIndex].imageFile = file;
  product.value.variants[variantIndex].imagePreview = URL.createObjectURL(file);
}

function removeVariantImage(variantIndex) {
  // URL'yi temizle
  if (product.value.variants[variantIndex].imagePreview) {
    URL.revokeObjectURL(product.value.variants[variantIndex].imagePreview);
  }
  
  // Görsel verilerini temizle
  product.value.variants[variantIndex].imageFile = null;
  product.value.variants[variantIndex].imagePreview = null;
}

function getFileNameFromUrl(url) {
  // URL'den dosya adını çıkarmaya çalış, olmuyorsa "Seçilen dosya" döndür
  return url ? "Seçilen dosya" : "";
}

function submitProduct() {
  if (selectedFiles.value.length === 0) {
    alert("Lütfen en az bir ürün görseli ekleyin.");
    return;
  }
  
  isSubmitting.value = true;
  
  // FormData oluştur
  const formData = new FormData();
  
  // Ürün bilgilerini ekle
  Object.keys(product.value).forEach(key => {
    if (key !== 'attributes' && key !== 'categories' && key !== 'variants') {
      if (key === 'vatRate') {
        formData.append(key, parseFloat(product.value[key]).toFixed(2));
      } else {
        formData.append(key, product.value[key]);
      }
    }
  });
  
  formData.append('categories', JSON.stringify([{
    categoryId: product.value.categories[0].categoryId
  }]));
  
  // Özellikleri JSON string olarak ekle
  formData.append('attributes', JSON.stringify(product.value.attributes));
  
  // Varyantları formData'ya ekle
  // Önce görsel dosyaları olmadan varyant verilerini hazırla
  const variants = product.value.variants.map((variant, index) => {
    const variantData = {
      name: variant.name,
      sku: variant.sku || null,
      price: variant.price || null,
      stock: variant.stock
    };
    return variantData;
  });
  
  formData.append('variants', JSON.stringify(variants));
  
  // Varyant görsellerini ayrı ayrı ekle
  product.value.variants.forEach((variant, index) => {
    if (variant.imageFile) {
      formData.append(`variant-image`, variant.imageFile);
    }
  });
  
  // Görselleri ekle
  selectedFiles.value.forEach(file => {
    formData.append('product-image', file);
  });
  
  // API'ye istek gönder
  apiClient.post('/product', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
    .then(() => {
      alert('Ürün başarıyla kaydedildi!');
      router.push('/products');
    })
    .catch(error => {
      console.error('Error submitting product:', error);
      alert('Ürün kaydedilirken bir hata oluştu.');
    })
    .finally(() => {
      isSubmitting.value = false;
    });
}

function getCategoryPath(category) {
  // Show the full path: Top > Mid > Leaf
  return `${category.topParentName} > ${category.parentName} > ${category.name}`;
}
</script>

<style scoped>
.total-price-display {
  margin-top: 0.8rem;
  padding: 0.6rem;
  background-color: #f0f7ff;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-price-label {
  font-weight: 500;
  color: #555;
}

.total-price-value {
  font-weight: 600;
  color: #4a90e2;
  font-size: 1.05rem;
}

.form-hint {
  font-size: 0.8rem;
  color: #777;
  margin-top: 0.3rem;
}
.add-product-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f2f2f2;
}

.product-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5rem;
}

.form-group h3 {
  font-size: 1.3rem;
  margin-bottom: 0.8rem;
  color: #444;
}

.form-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.half {
  flex: 1 1 calc(50% - 0.5rem);
  min-width: 250px;
}

label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
  font-size: 0.95rem;
}

input, select, textarea {
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

textarea {
  resize: vertical;
  min-height: 100px;
}

.attribute-row {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 0.8rem;
  align-items: center;
}

.attribute-name, .attribute-value {
  flex: 1;
}

.remove-btn, .add-btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.remove-btn {
  background-color: #f8f8f8;
  border: 1px solid #ddd;
  color: #666;
}

.remove-btn:hover {
  background-color: #ffebeb;
  border-color: #ffb8b8;
  color: #d43939;
}

.add-btn {
  background-color: #f0f7ff;
  border: 1px solid #c5d9f1;
  color: #4a90e2;
  align-self: flex-start;
  margin-top: 0.5rem;
}

.add-btn:hover {
  background-color: #e1f0ff;
  border-color: #a1c4e9;
}

/* Görsel Yükleme İyileştirmeleri */
.file-upload-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.custom-file-upload {
  display: inline-block;
  padding: 0.7rem 1.2rem;
  background-color: #4a90e2;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.custom-file-upload:hover {
  background-color: #357ac2;
}

.custom-file-upload input[type="file"] {
  display: none;
}

.file-count {
  color: #555;
  font-size: 0.9rem;
}

.max-images-warning {
  color: #d43939;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.add-more-images {
  margin-top: 1rem;
  background-color: #f0f7ff;
  border: 1px solid #c5d9f1;
  color: #4a90e2;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.add-more-images:hover {
  background-color: #e1f0ff;
  border-color: #a1c4e9;
}

.image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.preview-item {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(255, 255, 255, 0.8);
  color: #d43939;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s;
}

.remove-image:hover {
  background-color: rgba(255, 255, 255, 0.9);
  transform: scale(1.1);
}

.image-preview-small {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.preview-item-small {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.preview-item-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-name {
  color: #555;
  font-size: 0.9rem;
  margin-left: 0.5rem;
}

/* Varyant stili */
.variant-row {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #f9f9f9;
}

.variant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #eee;
}

.variant-header h4 {
  margin: 0;
  font-size: 1.1rem;
  color: #444;
}

.variant-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.submit-btn, .cancel-btn {
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn {
  background-color: #4a90e2;
  border: none;
  color: white;
}

.submit-btn:hover:not([disabled]) {
  background-color: #357ac2;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  background-color: #b3cdf0;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: #f8f8f8;
  border: 1px solid #ddd;
  color: #666;
}

.cancel-btn:hover {
  background-color: #ebebeb;
}

/* Toggle Switch Styles */
.toggle-group {
  display: flex;
  flex-direction: column;
}

.toggle-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  margin-top: 5px;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.toggle-label {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
  background-color: #ccc;
  border-radius: 34px;
  transition: background-color 0.2s;
  cursor: pointer;
  margin: 0;
}

.toggle-input:checked + .toggle-label {
  background-color: #4a90e2;
}

.toggle-switch-inner {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.2s;
}

.toggle-input:checked + .toggle-label .toggle-switch-inner {
  transform: translateX(24px);
}

.toggle-status {
  margin-left: 10px;
  font-size: 0.9rem;
  color: #555;
  min-width: 40px;
}

.toggle-input:focus + .toggle-label {
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.3);
}

/* Responsive design için düzeltmeler */
@media (max-width: 768px) {
  .toggle-group {
    margin-top: 1rem;
  }
}

@media (max-width: 768px) {
  .add-product-container {
    padding: 1.5rem;
  }
  
  .form-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .half {
    flex: 1 1 100%;
  }
  
  .attribute-row {
    flex-wrap: wrap;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .submit-btn, .cancel-btn {
    width: 100%;
  }
}
</style>