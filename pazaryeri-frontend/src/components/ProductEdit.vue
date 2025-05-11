<template>
  <div class="modal-overlay" v-if="isOpen" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Ürün Düzenle</h2>
        <button class="close-button" @click="closeModal">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading-spinner">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Yükleniyor...</span>
          </div>
        </div>

        <form v-else @submit.prevent="saveProduct" class="edit-form">
          <!-- Temel Ürün Bilgileri -->
          <div class="form-section">
            <h3>Temel Bilgiler</h3>

            <div class="form-group">
              <label for="productName">Ürün Adı*</label>
              <input
                type="text"
                id="productName"
                v-model="productCopy.name"
                class="form-control"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="productPrice">Fiyat (₺)*</label>
                <input
                  type="number"
                  id="productPrice"
                  v-model="productCopy.price"
                  class="form-control"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div class="form-group">
                <label for="productVatRate">KDV Oranı (%)*</label>
                <input
                  type="number"
                  id="productVatRate"
                  v-model="productCopy.vatRate"
                  class="form-control"
                  step="0.01"
                  min="0"
                  max="100"
                  @blur="formatVatRate"
                  required
                />
              </div>

              <div class="form-group">
                <label for="productStock">Stok*</label>
                <input
                  type="number"
                  id="productStock"
                  v-model="productCopy.stock"
                  class="form-control"
                  min="0"
                  required
                />
              </div>
            </div>

            <div
              class="price-with-tax"
              v-if="productCopy.price > 0 && productCopy.vatRate > 0"
            >
              <span class="price-label">KDV Dahil Fiyat:</span>
              <span class="price-value"
                >{{
                  calculatePriceWithTax(productCopy.price, productCopy.vatRate)
                }}
                ₺</span
              >
            </div>

            <div class="form-group">
              <label for="productSku">SKU*</label>
              <input
                type="text"
                id="productSku"
                v-model="productCopy.sku"
                class="form-control"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="productBrand">Marka</label>
                <select
                  id="productBrand"
                  v-model="productCopy.brand.id"
                  class="form-control"
                >
                  <option
                    v-for="brand in brands"
                    :key="brand.id"
                    :value="brand.id"
                  >
                    {{ brand.name }}
                  </option>
                </select>
              </div>

              <div class="form-group checkbox-group">
                <div class="form-check">
                  <input
                    type="checkbox"
                    id="isActive"
                    v-model="productCopy.isActive"
                    @change="toggleActive"
                    class="form-check-input"
                  />
                  <label for="isActive" class="form-check-label">Aktif</label>
                </div>
                <div class="form-check">
                  <input
                    type="checkbox"
                    id="isFeature"
                    v-model="productCopy.isFeature"
                    class="form-check-input"
                  />
                  <label for="isFeature" class="form-check-label"
                    >Öne Çıkan</label
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Açıklama -->
          <div class="form-section">
            <h3>Açıklama</h3>
            <div class="form-group">
              <textarea
                id="productDescription"
                v-model="productCopy.description"
                class="form-control"
                rows="4"
                placeholder="Ürün açıklaması..."
              ></textarea>
            </div>
          </div>

          <div class="form-section">
            <h3>Özellikler</h3>
            <div class="attributes-list">
              <div
                v-for="(attr, index) in productCopy.attributes"
                :key="index"
                class="attribute-item"
              >
                <div class="form-row">
                  <input
                    type="text"
                    v-model="attr.name"
                    class="form-control"
                    placeholder="Öznitelik adı"
                  />
                  <input
                    type="text"
                    v-model="attr.value"
                    class="form-control"
                    placeholder="Değer"
                  />
                  <button
                    type="button"
                    class="btn-remove"
                    @click="removeAttribute(index)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              class="btn btn-sm btn-outline"
              @click="addAttribute"
            >
              <i class="bi bi-plus"></i> Öznitelik Ekle
            </button>
          </div>

          <!-- Resim Yükleme -->
          <div class="form-section">
            <h3>Ürün Görseli</h3>
            <div class="image-upload">
              <div class="current-image" v-if="productCopy.imageUrl">
                <img :src="productCopy.imageUrl" :alt="productCopy.name" />
              </div>
              <div class="upload-controls">
                <input
                  type="file"
                  id="imageUpload"
                  @change="handleImageUpload"
                  accept="image/*"
                  ref="fileInput"
                />
                <label for="imageUpload" class="btn btn-outline">
                  <i class="bi bi-upload"></i> Görsel Seç
                </label>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger"
                  @click="removeImage"
                  v-if="productCopy.imageUrl"
                >
                  <i class="bi bi-trash"></i> Görseli Kaldır
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeModal">İptal</button>
        <button class="btn btn-primary" @click="saveProduct" :disabled="saving">
          <span
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
            v-if="saving"
          ></span>
          Kaydet
        </button>
      </div>
    </div>
  </div>
</template>
  
<script setup>
import { ref, watch, onMounted } from "vue";
import apiClient from "@/api";

const props = defineProps(["isOpen", "product"]);

const emit = defineEmits(["close", "update"]);

const loading = ref(false);
const saving = ref(false);
const brands = ref([]);
const fileInput = ref(null);
const productCopy = ref(null);

watch(() => props.product, (newProduct) => {
  if (newProduct) {
    productCopy.value = JSON.parse(JSON.stringify(newProduct));
  }
}, { immediate: true, deep: true });

const loadBrands = async () => {
  try {
    const response = await apiClient.get("/brand");
    brands.value = response.data;
  } catch (error) {
    console.error("Markalar yüklenirken hata oluştu:", error);
    showError("Markalar yüklenirken bir hata oluştu.");
  }
};
onMounted(() => {
  loadBrands();
  console.log("productCopy.value", productCopy.value);
});
const formatVatRate = () => {
  if (productCopy.value.vatRate) {
    productCopy.value.vatRate = parseFloat(productCopy.value.vatRate).toFixed(2);
  }
};

const addAttribute = () => {
  productCopy.value.attributes.push({ name: '', value: '' });
};

const removeAttribute = (index) => {
  productCopy.value.attributes.splice(index, 1);
};

const handleImageUpload = (event) => {
  if (event.target.files.length > 0) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      productCopy.value.imageUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const removeImage = () => {
  productCopy.value.imageUrl = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const saveProduct = async () => {
  saving.value = true;
  try {
    const formData = new FormData();
    formData.append("name", productCopy.value.name);
    formData.append("price", productCopy.value.price);
    formData.append("vatRate", productCopy.value.vatRate);
    formData.append("stock", productCopy.value.stock);
    formData.append("sku", productCopy.value.sku);
    formData.append("brandId", productCopy.value.brand.id);
    formData.append("isActive", productCopy.value.isActive);
    formData.append("isFeature", productCopy.value.isFeature);
    formData.append("description", productCopy.value.description);
    
    // Add attributes as JSON string
    if (productCopy.value.attributes && productCopy.value.attributes.length > 0) {
      formData.append("attributes", JSON.stringify(productCopy.value.attributes));
    }
    
    if (fileInput.value && fileInput.value.files.length > 0) {
      formData.append("image", fileInput.value.files[0]);
    }
    
    await apiClient.patch(`/product/${productCopy.value.id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    emit("update");
    emit("close");
  } catch (error) {
    console.error("Ürün kaydedilirken hata oluştu:", error);
  } finally {
    saving.value = false;
  }
};

const closeModal = () => {
  emit("close");
};
const toggleActive = () => {
  console.log("toggleActive", productCopy.value.isActive);
};

const calculatePriceWithTax = (price, vatRate) => {
  if (!price || !vatRate) return "0.00";

  const taxAmount = (parseFloat(price) * parseFloat(vatRate)) / 100;
  const totalPrice = parseFloat(price) + taxAmount;

  return totalPrice.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
};
</script>
  
<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");
.price-with-tax {
  background-color: #f0f7ff;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-label {
  font-size: 14px;
  color: #495057;
}

.price-value {
  font-weight: 600;
  color: #0056b3;
  font-size: 16px;
}

.modal-overlay {
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

.modal-container {
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  animation: modal-slide-in 0.3s ease;
  font-family: "Inter", sans-serif;
}

@keyframes modal-slide-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.close-button {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.close-button:hover {
  background-color: #f0f2f5;
  color: #495057;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
}

.form-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 16px;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

.form-control {
  display: block;
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  border: 1px solid #ced4da;
  border-radius: 6px;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  border-color: #ff7f00;
  outline: 0;
  box-shadow: 0 0 0 3px rgba(255, 127, 0, 0.15);
}

.checkbox-group {
  display: flex;
  gap: 16px;
  align-items: center;
}

.form-check {
  display: flex;
  align-items: center;
  gap: 6px;
}

.form-check-input {
  margin: 0;
  width: 16px;
  height: 16px;
}

.form-check-label {
  margin: 0;
  font-size: 14px;
  color: #333;
}

.attributes-list {
  margin-bottom: 12px;
}

.attribute-item {
  margin-bottom: 8px;
}

.btn {
  display: inline-flex;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
  padding: 8px 16px;
  font-size: 14px;
  line-height: 1.5;
  border-radius: 6px;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 12px;
}

.btn-primary {
  color: #fff;
  background-color: #ff7f00;
  border-color: #ff7f00;
}

.btn-primary:hover {
  background-color: #ff6a00;
  border-color: #ff6a00;
}

.btn-secondary {
  color: #6c757d;
  background-color: #f8f9fa;
  border-color: #dee2e6;
}

.btn-secondary:hover {
  color: #343a40;
  background-color: #e9ecef;
  border-color: #ced4da;
}

.btn-outline {
  color: #495057;
  background-color: transparent;
  border: 1px solid #ced4da;
}

.btn-outline:hover {
  background-color: #f8f9fa;
}

.btn-outline-danger {
  color: #dc3545;
  border-color: #dc3545;
}

.btn-outline-danger:hover {
  color: #fff;
  background-color: #dc3545;
}

.btn-remove {
  background: transparent;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
}

.btn-remove:hover {
  background-color: #ffe8e8;
}

.image-upload {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.current-image {
  width: 100%;
  height: 150px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.current-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.upload-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.upload-controls input[type="file"] {
  display: none;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    max-height: 95vh;
  }

  .form-row {
    flex-direction: column;
    gap: 16px;
  }

  .upload-controls {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* Spinner */
.spinner-border {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  vertical-align: text-bottom;
  border: 0.2em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border 0.75s linear infinite;
  margin-right: 8px;
}

@keyframes spinner-border {
  to {
    transform: rotate(360deg);
  }
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>