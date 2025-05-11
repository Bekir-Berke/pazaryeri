<template>
  <div class="reviews-dashboard">
    <div class="reviews-header">
      <h2 class="reviews-title">Değerlendirmeler</h2>
      
      <!-- Filtering and sorting controls -->
      <div class="reviews-controls">
        <div class="filter-group">
          <label>Sıralama:</label>
          <select v-model="sortOption" class="form-select">
            <option value="newest">En Yeni</option>
            <option value="oldest">En Eski</option>
            <option value="highest">En Yüksek Puan</option>
            <option value="lowest">En Düşük Puan</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Filtreleme:</label>
          <div class="star-filter">
            <span 
              v-for="star in 5" 
              :key="star"
              class="filter-star"
              :class="{ active: ratingFilter.includes(star) }"
              @click="toggleRatingFilter(star)"
            >★</span>
          </div>
          <button 
            v-if="ratingFilter.length > 0" 
            @click="ratingFilter = []" 
            class="clear-filter"
          >
            Temizle
          </button>
        </div>
      </div>
    </div>
    
    <!-- No reviews message -->
    <div v-if="filteredReviews.length === 0" class="no-reviews">
      <i class="fa fa-comment-slash"></i>
      <p>Henüz değerlendirme bulunmamaktadır veya filtreleme kriterlerinize uygun değerlendirme yoktur.</p>
    </div>
    
    <!-- Reviews list -->
    <div v-else class="reviews-list">
      <div v-for="review in filteredReviews" :key="review.id" class="review-card">
        <div class="review-header">
          <div class="review-rating">
            <span v-for="star in 5" :key="star" class="star" :class="{ 'filled': star <= review.rating }">★</span>
          </div>
          <div class="review-date">
            {{ formatDate(review.createdAt) }}
          </div>
        </div>
        
        <div class="review-content">
          <p class="review-comment">{{ review.comment }}</p>
          
          <!-- Review images -->
          <div v-if="review.imageUrls && review.imageUrls.length > 0" class="review-images">
            <div 
              v-for="(imageUrl, index) in review.imageUrls" 
              :key="index" 
              class="image-container"
              @click="openImage(imageUrl)"
            >
              <img :src="imageUrl" :alt="`Review image ${index + 1}`" class="review-image">
            </div>
          </div>
        </div>
        
        <div class="review-footer">
          <div class="review-meta">
            <span class="product-name">
              <i class="fa fa-box"></i> Ürün: {{ review.orderItem.productName }}
            </span>
            <span class="product-variant" v-if="review.orderItem.variantName">
              <i class="fa fa-tag"></i> Varyant: {{ review.orderItem.variantName }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Reply Modal -->
    <div v-if="showReplyModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Değerlendirmeye Yanıt Ver</h3>
          <button @click="showReplyModal = false" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="original-review">
            <div class="review-rating">
              <span v-for="star in 5" :key="star" class="star" :class="{ 'filled': star <= selectedReview.rating }">★</span>
            </div>
            <p class="review-comment">{{ selectedReview.comment }}</p>
          </div>
          
          <div class="reply-form">
            <label for="reply-text">Yanıtınız:</label>
            <textarea 
              id="reply-text" 
              v-model="replyText" 
              placeholder="Değerlendirmeye yanıtınızı yazın..."
              rows="4"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showReplyModal = false" class="cancel-btn">İptal</button>
          <button @click="submitReply" class="submit-btn" :disabled="!replyText.trim()">
            Yanıtı Gönder
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import apiClient from '@/api';

const reviews = defineModel({ default: () => [] });

// Filtering and sorting state
const sortOption = ref('newest');
const ratingFilter = ref([]);
const showReplyModal = ref(false);
const selectedReview = ref({});
const replyText = ref('');

// Computed property for filtered and sorted reviews
const filteredReviews = computed(() => {
  let result = [...reviews.value];
  
  // Apply rating filter
  if (ratingFilter.value.length > 0) {
    result = result.filter(review => ratingFilter.value.includes(review.rating));
  }
  
  // Apply sorting
  switch (sortOption.value) {
    case 'newest':
      return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'oldest':
      return result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case 'highest':
      return result.sort((a, b) => b.rating - a.rating);
    case 'lowest':
      return result.sort((a, b) => a.rating - b.rating);
    default:
      return result;
  }
});

// Toggle a rating in the filter
const toggleRatingFilter = (rating) => {
  const index = ratingFilter.value.indexOf(rating);
  if (index === -1) {
    ratingFilter.value.push(rating);
  } else {
    ratingFilter.value.splice(index, 1);
  }
};

// Format date for display
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Open image in a new tab
const openImage = (imageUrl) => {
  window.open(imageUrl, '_blank');
};

// Handle replying to a review
const replyToReview = (review) => {
  selectedReview.value = review;
  replyText.value = '';
  showReplyModal.value = true;
};

// Submit reply to the review
const submitReply = async () => {
  try {
    // Replace with your actual API endpoint for replying to reviews
    await apiClient.post(`/reviews/${selectedReview.value.id}/reply`, {
      reply: replyText.value
    });
    
    // Update the local review with the reply
    const index = reviews.value.findIndex(r => r.id === selectedReview.value.id);
    if (index !== -1) {
      reviews.value[index].reply = replyText.value;
    }
    
    showReplyModal.value = false;
    alert('Yanıtınız başarıyla gönderildi.');
  } catch (error) {
    console.error('Error submitting reply:', error);
    alert('Yanıt gönderilirken bir hata oluştu.');
  }
};

// Report a review
const reportReview = (review) => {
  // This is a placeholder function. Implement actual reporting functionality here.
  if (confirm('Bu değerlendirmeyi uygunsuz olarak işaretlemek istediğinizden emin misiniz?')) {
    alert('Değerlendirme rapor edildi. Yöneticiler inceleyecektir.');
  }
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

.reviews-dashboard {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.reviews-header {
  margin-bottom: 2rem;
}

.reviews-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a237e;
  margin-bottom: 1.5rem;
}

.reviews-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-group label {
  font-weight: 600;
  color: #555;
  white-space: nowrap;
}

.form-select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

.star-filter {
  display: flex;
  gap: 0.3rem;
}

.filter-star {
  font-size: 1.5rem;
  color: #ddd;
  cursor: pointer;
  transition: color 0.2s;
}

.filter-star:hover,
.filter-star.active {
  color: #ff9800;
}

.clear-filter {
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
  color: #666;
  cursor: pointer;
}

.no-reviews {
  text-align: center;
  padding: 3rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  color: #777;
}

.no-reviews i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #ddd;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.review-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  border: 1px solid #eee;
  transition: transform 0.2s, box-shadow 0.2s;
}

.review-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid #f0f0f0;
}

.review-rating {
  display: flex;
  gap: 0.2rem;
}

.star {
  font-size: 1.2rem;
  color: #ddd;
}

.star.filled {
  color: #ff9800;
}

.review-date {
  color: #777;
  font-size: 0.9rem;
}

.review-content {
  margin-bottom: 1.2rem;
}

.review-comment {
  margin: 0 0 1rem;
  line-height: 1.5;
  color: #333;
}

.review-images {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 1rem;
}

.image-container {
  width: 100px;
  height: 100px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.image-container:hover {
  transform: scale(1.05);
}

.review-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.review-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #666;
}

.product-name, .product-variant {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.product-name {
  font-weight: 600;
  color: #1a237e;
}

.review-actions {
  display: flex;
  gap: 0.8rem;
}

.reply-btn, .report-btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.reply-btn {
  background-color: #e3f2fd;
  color: #1976d2;
}

.reply-btn:hover {
  background-color: #bbdefb;
}

.report-btn {
  background-color: #fbe9e7;
  color: #d32f2f;
}

.report-btn:hover {
  background-color: #ffccbc;
}

/* Modal styles */
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
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #1a237e;
  font-size: 1.3rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #777;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
}

.original-review {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
}

.reply-form label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.reply-form textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
}

.modal-footer {
  padding: 1.2rem 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.cancel-btn, .submit-btn {
  padding: 0.7rem 1.5rem;
  border-radius: 4px;
  font-size: 0.95rem;
  cursor: pointer;
  border: none;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #555;
}

.submit-btn {
  background-color: #1976d2;
  color: white;
}

.submit-btn:disabled {
  background-color: #bbdefb;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .reviews-dashboard {
    padding: 1rem;
  }
  
  .reviews-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .review-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .review-actions {
    width: 100%;
  }
  
  .reply-btn, .report-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>