<template>
  <div>
    <div class="orders-container">
      <h2 class="orders-title">Siparişlerim</h2>

      <div v-if="!orders || orders.length === 0" class="no-orders">
        <p>Henüz siparişiniz bulunmamaktadır.</p>
      </div>

      <div v-else class="orders-list">
        <div v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="order-info">
              <h3 class="order-number">Sipariş #{{ order.orderNumber }}</h3>
              <span class="order-date">{{ formatDate(order.createdAt) }}</span>
            </div>
            <div class="order-status" :class="getStatusClass(order.status)">
              {{ translateStatus(order.status) }}
            </div>
          </div>

          <div class="order-items">
            <div v-for="item in order.items" :key="item.id" class="order-item">
              <div class="item-image">
                <img
                  v-if="item.product.imageUrl"
                  :src="item.product.imageUrl"
                  :alt="item.product.name"
                />
                <div v-else class="no-image">Görsel Yok</div>
              </div>
              <div class="item-details">
                <h4 class="item-name">{{ item.product.name }}</h4>
                <p v-if="item.variant" class="item-variant">
                  <span class="variant-label">Varyant:</span>
                  {{ item.variant.name }}
                </p>
                <p class="item-store">Satıcı: {{ item.product.store.name }}</p>
                <p class="item-price">
                  {{
                    formatPrice(
                      item.variant ? item.variant.vatPrice : item.vatPrice
                    )
                  }}
                </p>
                <button
                  v-if="canBeReviewed(item.status, item.Review)"
                  @click="openReviewModal(item)"
                  class="btn-review"
                >
                  {{ item.reviewed ? "Değerlendirmeyi Düzenle" : "Değerlendir" }}
                </button>
              </div>
            </div>
          </div>

          <div class="order-footer">
            <div class="order-total">
              <span>Toplam:</span>
              <span class="total-amount">{{
                formatPrice(order.totalAmount)
              }}</span>
            </div>
            <router-link :to="{ name: 'order', params: { id: order.id } }">
              <button class="btn-details">Detayları Görüntüle</button>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Değerlendirme modal penceresi -->
    <div v-if="showReviewModal" class="review-modal-overlay">
      <div class="review-modal">
        <h3>Ürün Değerlendirmesi</h3>
        <div v-if="currentItem" class="review-product-info">
          <img
            v-if="currentItem.product.imageUrl"
            :src="currentItem.product.imageUrl"
            :alt="currentItem.product.name"
          />
          <div v-else class="no-image">Görsel Yok</div>
          <div class="product-info">
            <h4>{{ currentItem.product.name }}</h4>
            <p v-if="currentItem.variant">
              Varyant: {{ currentItem.variant.name }}
            </p>
          </div>
        </div>

        <div class="rating-select">
          <p>Puanınız:</p>
          <div class="stars">
            <span
              v-for="i in 5"
              :key="i"
              @click="selectedRating = i"
              :class="{ 'star-selected': i <= selectedRating }"
              class="star"
              >★</span
            >
          </div>
        </div>

        <div class="review-comment">
          <p>Yorumunuz:</p>
          <textarea
            v-model="reviewComment"
            placeholder="Bu ürün hakkındaki düşüncelerinizi paylaşın..."
            rows="4"
          ></textarea>
        </div>

        <div class="review-images">
          <p>Fotoğraf Ekleyin (İsteğe Bağlı):</p>
          <div class="image-upload-container">
            <label for="image-upload" class="image-upload-label">
              <i class="bi bi-camera"></i> Fotoğraf Seç
            </label>
            <input 
              type="file" 
              id="image-upload" 
              accept="image/*" 
              multiple 
              @change="handleFileChange" 
              class="image-upload-input"
            >
            <small class="image-hint">En fazla 5 fotoğraf ekleyebilirsiniz</small>
          </div>
          
          <div v-if="selectedFiles.length > 0" class="image-previews">
            <div v-for="(file, index) in selectedFiles" :key="index" class="image-preview-item">
              <img :src="previewUrls[index]" :alt="file.name" class="preview-image">
              <button @click="removeImage(index)" class="remove-image-btn">
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button
            @click="
              showReviewModal = false;
              currentItem = null;
            "
            class="btn-cancel"
          >
            İptal
          </button>
          <button
            @click="submitReview(selectedRating, reviewComment, selectedFiles)"
            :disabled="!selectedRating"
            class="btn-submit"
          >
            Gönder
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import apiClient from "@/api";
import Swal from "sweetalert2";
import { defineModel, ref } from "vue";

const orders = defineModel();
const showReviewModal = ref(false);
const currentItem = ref(null);
const selectedRating = ref(0);
const reviewComment = ref("");
const selectedFiles = ref([]);
const previewUrls = ref([]);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(price);
};

const translateStatus = (status) => {
  const statusMap = {
    PROCESSING: "İşleniyor",
    SHIPPED: "Kargoya Verildi",
    DELIVERED: "Teslim Edildi",
    CANCELLED: "İptal Edildi",
  };
  return statusMap[status] || status;
};

const getStatusClass = (status) => {
  return {
    "status-processing": status === "PROCESSING",
    "status-shipped": status === "SHIPPED",
    "status-delivered": status === "DELIVERED",
    "status-cancelled": status === "CANCELLED",
  };
};

const canBeReviewed = (orderStatus, isReviewed) => {
  return orderStatus === "DELIVERED" && !isReviewed;
};

const openReviewModal = (item) => {
  currentItem.value = item;
  showReviewModal.value = true;
};

const submitReview = async (rating, comment, files) => {
  try {
    const formData = new FormData();
    formData.append("rating", rating);
    formData.append("comment", comment);
    formData.append("orderItemId", currentItem.value.id);
    for (const file of files) {
      formData.append("images", file);
    }

    await apiClient.post("/review", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    // Başarılı olursa, öğeyi güncelle
    currentItem.value.reviewed = true;

    // Modalı kapat
    showReviewModal.value = false;
    currentItem.value = null;

    Swal.fire({
      icon: "success",
      title: "Başarılı",
      text: "Değerlendirmeniz başarıyla gönderildi.",
      confirmButtonText: "Tamam",
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Hata",
      text: "Değerlendirme gönderilirken bir hata oluştu. Lütfen tekrar deneyin.",
      confirmButtonText: "Tamam",
    });
    console.error("Review submission error:", error);
  }
};

const handleFileChange = (event) => {
  const files = event.target.files;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target.result;
      selectedFiles.value.push(file);
      previewUrls.value.push(url);
    };
    reader.readAsDataURL(file);
  }
};

const removeImage = (index) => {
  selectedFiles.value.splice(index, 1);
  previewUrls.value.splice(index, 1);
};
</script>

<style scoped>
.orders-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 0;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.orders-title {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 1.5rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid #e0e0e0;
}

.no-orders {
  text-align: center;
  padding: 3rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  color: #666;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.order-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem;
  background-color: #f6f8fa;
  border-bottom: 1px solid #eaeaea;
}

.order-number {
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 0.3rem 0;
}

.order-date {
  font-size: 0.85rem;
  color: #666;
}

.order-status {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: uppercase;
}

/* Tema uyumlu durum renkleri */
.status-processing {
  background-color: #fff3e6;
  color: #ff7f00;
}

.status-shipped {
  background-color: #e6f7ff;
  color: #0066cc;
}

.status-delivered {
  background-color: #e6fff0;
  color: #00994d;
}

.status-cancelled {
  background-color: #ffebee;
  color: #cc0000;
}

.order-items {
  padding: 1rem;
  border-bottom: 1px solid #eaeaea;
}

.order-item {
  display: flex;
  padding: 0.8rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 1rem;
  background-color: #f0f0f0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 0.8rem;
  text-align: center;
}

.item-details {
  flex: 1;
}

.item-name {
  margin: 0 0 0.3rem 0;
  font-size: 1rem;
  color: #333;
}

.item-variant {
  margin: 0 0 0.3rem 0;
  font-size: 0.85rem;
  color: #666;
}

.variant-label {
  font-weight: 600;
}

.item-store {
  margin: 0 0 0.3rem 0;
  font-size: 0.85rem;
  color: #666;
}

.item-price {
  margin: 0;
  color: #ff7f00; /* Tema rengi */
  font-weight: 600;
  font-size: 0.95rem;
}

.btn-review {
  margin-top: 0.5rem;
  background-color: transparent;
  border: 1px solid #0066cc;
  color: #0066cc;
  padding: 0.3rem 0.7rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-review:hover {
  background-color: #0066cc;
  color: white;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem;
}

.order-total {
  font-size: 1rem;
}

.total-amount {
  font-weight: 600;
  color: #ff7f00; /* Tema rengi */
  margin-left: 0.5rem;
}

.btn-details {
  background-color: transparent;
  border: 1px solid #ff7f00; /* Tema rengi */
  color: #ff7f00; /* Tema rengi */
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-details:hover {
  background-color: #ff7f00; /* Tema rengi */
  color: white;
}

.review-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.review-modal {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.review-modal h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 0.8rem;
}

.review-product-info {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.review-product-info img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 1rem;
}

.product-info h4 {
  margin: 0 0 0.3rem 0;
  font-size: 1rem;
}

.product-info p {
  margin: 0;
  color: #666;
  font-size: 0.85rem;
}

.rating-select {
  margin-bottom: 1.5rem;
}

.stars {
  display: flex;
  gap: 0.5rem;
}

.star {
  font-size: 1.5rem;
  color: #ccc;
  cursor: pointer;
  transition: color 0.2s;
}

.star:hover,
.star-selected {
  color: #ff9900;
}

.review-comment textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
}

.review-images {
  margin-bottom: 1.5rem;
}

.image-upload-container {
  margin-bottom: 0.5rem;
}

.image-upload-label {
  padding: 0.6rem 1rem;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.image-upload-input {
  display: none;
}

.image-hint {
  font-size: 0.8rem;
  color: #666;
}

.image-previews {
  display: flex;
  gap: 0.5rem;
}

.image-preview-item {
  position: relative;
}

.preview-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.remove-image-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-cancel {
  padding: 0.6rem 1.2rem;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
}

.btn-submit {
  padding: 0.6rem 1.2rem;
  background-color: #ff7f00;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-submit:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .order-status {
    align-self: flex-start;
  }

  .order-footer {
    flex-direction: column;
    gap: 1rem;
  }

  .btn-details {
    width: 100%;
  }
}
</style>