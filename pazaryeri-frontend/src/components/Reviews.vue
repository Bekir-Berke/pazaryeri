<template>
  <div class="user-reviews-container">
    <h2 class="reviews-title">Değerlendirmelerim</h2>
    
    <!-- Değerlendirme filtreleri -->
    <div class="reviews-filters">
      <div class="filter-group">
        <label>Sıralama:</label>
        <select v-model="sortOption" class="filter-select">
          <option value="newest">En Yeni</option>
          <option value="oldest">En Eski</option>
          <option value="highest">En Yüksek Puan</option>
          <option value="lowest">En Düşük Puan</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Puan:</label>
        <div class="star-filter">
          <span 
            v-for="star in 5" 
            :key="star"
            @click="toggleStarFilter(star)"
            :class="{ 'active': starFilter.includes(star) }"
            class="filter-star"
          >★</span>
        </div>
        <button 
          v-if="starFilter.length > 0" 
          @click="starFilter = []" 
          class="btn-clear-filter"
        >
          Temizle
        </button>
      </div>
    </div>
    
    <!-- Değerlendirme listesi -->
    <div v-if="filteredReviews.length > 0" class="reviews-list">
      <div v-for="review in filteredReviews" :key="review.id" class="review-card">
        <div class="review-product">
          <img 
            v-if="review.orderItem.product?.imageUrl" 
            :src="review.orderItem.product.imageUrl" 
            :alt="review.orderItem.product?.name" 
            class="product-image"
          >
          <div v-else class="no-image">Görsel Yok</div>
          <div class="product-info">
            <h4 class="product-name">{{ review.orderItem.product?.name }}</h4>
            <p v-if="review.variant" class="product-variant">{{ review.variant.name }}</p>
          </div>
        </div>
        
        <div class="review-content">
          <div class="review-header">
            <div class="review-rating">
              <span v-for="star in 5" :key="star" class="star" :class="{ 'filled': star <= review.rating }">★</span>
            </div>
            <div class="review-date">{{ formatDate(review.createdAt) }}</div>
          </div>
          
          <p class="review-comment">{{ review.comment }}</p>
          
          <div class="review-actions">
            <button @click="editReview(review)" class="btn-edit">
              <i class="bi bi-pencil"></i> Düzenle
            </button>
            <button @click="confirmDeleteReview(review.id)" class="btn-delete">
              <i class="bi bi-trash"></i> Sil
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Değerlendirme yok mesajı -->
    <div v-else class="no-reviews">
      <i class="bi bi-chat-square-text"></i>
      <p>Henüz değerlendirme yapmamışsınız.</p>
    </div>
    
    <!-- Düzenleme Modalı -->
    <div v-if="showEditModal" class="edit-modal-overlay">
      <div class="edit-modal">
        <h3>Değerlendirmeyi Düzenle</h3>
        
        <div class="modal-product-info">
          <img 
            v-if="currentReview.product?.imageUrl" 
            :src="currentReview.product.imageUrl" 
            :alt="currentReview.product.name"
          >
          <div v-else class="no-image">Görsel Yok</div>
          <div class="product-info">
            <h4>{{ currentReview.product?.name }}</h4>
            <p v-if="currentReview.variant">{{ currentReview.variant.name }}</p>
          </div>
        </div>
        
        <div class="rating-select">
          <p>Puanınız:</p>
          <div class="stars">
            <span 
              v-for="i in 5" 
              :key="i" 
              @click="editedRating = i"
              :class="{'star-selected': i <= editedRating}"
              class="star"
            >★</span>
          </div>
        </div>
        
        <div class="review-comment-edit">
          <p>Yorumunuz:</p>
          <textarea 
            v-model="editedComment" 
            placeholder="Bu ürün hakkındaki düşüncelerinizi paylaşın..."
            rows="4"
          ></textarea>
        </div>
        
        <div class="modal-actions">
          <button @click="closeEditModal" class="btn-cancel">İptal</button>
          <button 
            @click="updateReview" 
            :disabled="!editedRating" 
            class="btn-submit"
          >
            Güncelle
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits } from 'vue';
import Swal from 'sweetalert2';

const reviews = defineModel();


// Filtreleme ve sıralama için durum değişkenleri
const sortOption = ref('newest');
const starFilter = ref([]);

// Düzenleme modalı için durum değişkenleri
const showEditModal = ref(false);
const currentReview = ref({});
const editedRating = ref(0);
const editedComment = ref('');

// Filtrelenmiş ve sıralanmış değerlendirmeler
const filteredReviews = computed(() => {
  let result = [...reviews.value];
  
  // Yıldız filtresini uygula
  if (starFilter.value.length > 0) {
    result = result.filter(review => starFilter.value.includes(review.rating));
  }
  
  // Sıralama seçeneğini uygula
  switch (sortOption.value) {
    case 'newest':
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'oldest':
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case 'highest':
      result.sort((a, b) => b.rating - a.rating);
      break;
    case 'lowest':
      result.sort((a, b) => a.rating - b.rating);
      break;
  }
  
  return result;
});

// Yıldız filtresini aç/kapat
const toggleStarFilter = (star) => {
  const index = starFilter.value.indexOf(star);
  if (index === -1) {
    starFilter.value.push(star);
  } else {
    starFilter.value.splice(index, 1);
  }
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

// Değerlendirmeyi düzenle
const editReview = (review) => {
  currentReview.value = review;
  editedRating.value = review.rating;
  editedComment.value = review.comment;
  showEditModal.value = true;
};

// Düzenleme modalını kapat
const closeEditModal = () => {
  showEditModal.value = false;
  currentReview.value = {};
  editedRating.value = 0;
  editedComment.value = '';
};

// Değerlendirmeyi güncelle
const updateReview = async () => {
  try {
    // Buraya API çağrısı ekleyebilirsiniz
    emit('edit', {
      id: currentReview.value.id,
      rating: editedRating.value,
      comment: editedComment.value
    });
    
    // Başarılı mesajı göster
    Swal.fire({
      title: 'Başarılı!',
      text: 'Değerlendirmeniz başarıyla güncellendi.',
      icon: 'success',
      confirmButtonText: 'Tamam'
    });
    
    closeEditModal();
  } catch (error) {
    console.error('Error updating review:', error);
    Swal.fire({
      title: 'Hata!',
      text: 'Değerlendirme güncellenirken bir hata oluştu.',
      icon: 'error',
      confirmButtonText: 'Tamam'
    });
  }
};

// Değerlendirmeyi silmeyi onayla
const confirmDeleteReview = (reviewId) => {
  Swal.fire({
    title: 'Emin misiniz?',
    text: 'Bu değerlendirmeyi silmek istediğinize emin misiniz?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Evet, Sil',
    cancelButtonText: 'İptal',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      deleteReview(reviewId);
    }
  });
};

// Değerlendirmeyi sil
const deleteReview = async (reviewId) => {
  try {
    // Buraya API çağrısı ekleyebilirsiniz
    emit('delete', reviewId);
    
    // Başarılı mesajı göster
    Swal.fire({
      title: 'Silindi!',
      text: 'Değerlendirmeniz başarıyla silindi.',
      icon: 'success',
      confirmButtonText: 'Tamam'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    Swal.fire({
      title: 'Hata!',
      text: 'Değerlendirme silinirken bir hata oluştu.',
      icon: 'error',
      confirmButtonText: 'Tamam'
    });
  }
};
</script>

<style scoped>
.user-reviews-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.reviews-title {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #333;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.8rem;
}

.reviews-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 2rem;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-weight: 600;
  color: #555;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 0.9rem;
}

.star-filter {
  display: flex;
  gap: 5px;
}

.filter-star {
  font-size: 1.5rem;
  color: #ccc;
  cursor: pointer;
  transition: color 0.2s;
}

.filter-star:hover, .filter-star.active {
  color: #ff9900;
}

.btn-clear-filter {
  padding: 5px 10px;
  background-color: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #666;
  cursor: pointer;
}

.btn-clear-filter:hover {
  background-color: #f0f0f0;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-card {
  display: flex;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.review-product {
  width: 150px;
  padding: 15px;
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 1px solid #eaeaea;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 10px;
}

.no-image {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #eee;
  color: #999;
  font-size: 0.8rem;
  border-radius: 4px;
  margin-bottom: 10px;
}

.product-info {
  text-align: center;
}

.product-name {
  font-size: 0.9rem;
  margin: 0 0 5px 0;
}

.product-variant {
  font-size: 0.8rem;
  color: #666;
  margin: 0;
}

.review-content {
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.review-rating {
  display: flex;
  gap: 3px;
}

.star {
  font-size: 1.2rem;
  color: #ccc;
}

.star.filled {
  color: #ff9900;
}

.review-date {
  color: #888;
  font-size: 0.85rem;
}

.review-comment {
  flex: 1;
  margin: 0 0 15px 0;
  line-height: 1.5;
  color: #333;
}

.review-actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
}

.btn-edit, .btn-delete {
  padding: 8px 15px;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
}

.btn-edit {
  background-color: transparent;
  border: 1px solid #0066cc;
  color: #0066cc;
}

.btn-edit:hover {
  background-color: #0066cc;
  color: white;
}

.btn-delete {
  background-color: transparent;
  border: 1px solid #dc3545;
  color: #dc3545;
}

.btn-delete:hover {
  background-color: #dc3545;
  color: white;
}

.no-reviews {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
  color: #777;
  text-align: center;
}

.no-reviews i {
  font-size: 3rem;
  color: #ddd;
  margin-bottom: 15px;
}

/* Modal Stilleri */
.edit-modal-overlay {
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

.edit-modal {
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.edit-modal h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 0.8rem;
}

.modal-product-info {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.modal-product-info img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 1rem;
}

.rating-select {
  margin-bottom: 1.5rem;
}

.rating-select p {
  margin-bottom: 0.5rem;
  font-weight: 600;
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

.star:hover, .star-selected {
  color: #ff9900;
}

.review-comment-edit p {
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.review-comment-edit textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 1.5rem;
}

.btn-cancel {
  padding: 10px 15px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
}

.btn-submit {
  padding: 10px 15px;
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
  .review-card {
    flex-direction: column;
  }
  
  .review-product {
    width: 100%;
    flex-direction: row;
    border-right: none;
    border-bottom: 1px solid #eaeaea;
  }
  
  .product-image, .no-image {
    margin-bottom: 0;
    margin-right: 15px;
  }
  
  .product-info {
    text-align: left;
  }
  
  .reviews-filters {
    flex-direction: column;
    gap: 15px;
  }
}
</style>