<template>
  <div class="card-content">
    <div v-if="cards.length === 0" class="empty-state">
      <p>Kayıtlı kartınız bulunmamaktadır</p>
      <button @click="openAddCardModal" class="btn btn-primary">
        <i class="fas fa-plus-circle"></i> Yeni Kart Ekle
      </button>
    </div>
    <div v-else>
      <div class="card-list-header">
        <h2>Kayıtlı Kartlarım</h2>
        <button @click="openAddCardModal" class="btn btn-primary">
          <i class="fas fa-plus-circle"></i> Yeni Kart Ekle
        </button>
      </div>
      <div class="card-list">
        <div v-for="(card, index) in cards" :key="index" class="card-item">
          <div class="card-item-header">
            <div class="card-info">
              <div class="card-brand">
                <h3>{{ getCardType(card.cardNumber) }}</h3>
                <span class="card-category" v-if="card.category">{{ card.category }}</span>
              </div>
              <span class="bank-name">{{ card.issuer }}</span>
            </div>
            <div class="card-badges">
              <span v-if="card.isDefault" class="default-badge">Varsayılan</span>
              <span class="type-badge">{{ card.type }}</span>
            </div>
          </div>
          <div class="card-item-body">
            <div class="card-number">•••• •••• •••• {{ getLast4Digits(card.cardNumber) }}</div>
            <div class="card-holder">{{ card.cardHolder }}</div>
            <div class="card-expire">Son Kullanma: {{ formatExpireDate(card.expiryMonth, card.expiryYear) }}</div>
          </div>
          <div class="card-details" v-if="card.bin">
            <button class="details-toggle" @click="card.showDetails = !card.showDetails">
              <i class="fas" :class="card.showDetails ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              {{ card.showDetails ? 'Detayları Gizle' : 'Detayları Göster' }}
            </button>
            
            <div v-if="card.showDetails" class="details-content">
              <div class="detail-item">
                <span class="detail-label">Banka:</span>
                <span class="detail-value">{{ card.issuer }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Kart Tipi:</span>
                <span class="detail-value">{{ card.type }} - {{ card.category }}</span>
              </div>
              <div class="detail-item" v-if="card.issuerPhone">
                <span class="detail-label">Telefon:</span>
                <a :href="`tel:${card.issuerPhone}`" class="detail-value">{{ card.issuerPhone }}</a>
              </div>
              <div class="detail-item" v-if="card.issuerUrl">
                <span class="detail-label">Website:</span>
                <a :href="card.issuerUrl" target="_blank" class="detail-value link">{{ new URL(card.issuerUrl).hostname }}</a>
              </div>
              <div class="detail-item">
                <span class="detail-label">Ülke:</span>
                <span class="detail-value">{{ card.country }} ({{ card.alpha_2 }})</span>
              </div>
            </div>
          </div>
          <div class="card-item-actions">
            <button @click="setDefaultCard(card.id)" class="btn-action" v-if="!card.isDefault">
              Varsayılan Yap
            </button>
            <button @click="editCard(card)" class="btn-action">
              Düzenle
            </button>
            <button @click="confirmDeleteCard(card.id)" class="btn-action delete">
              Sil
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Card Modal -->
    <div v-if="showCardModal" class="card-form-modal">
      <div class="card-form-content">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Kart Düzenle' : 'Yeni Kart Ekle' }}</h3>
          <button @click="closeCardModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveCard">
            <div class="form-group">
              <label for="cardHolder">Kart Üzerindeki İsim</label>
              <input type="text" id="cardHolder" v-model="cardForm.cardHolderName" class="form-control" required>
            </div>
            <div class="form-group">
              <label for="cardNumber">Kart Numarası</label>
              <input type="text" id="cardNumber" v-model="cardForm.cardNumber" class="form-control"
                placeholder="XXXX XXXX XXXX XXXX" maxlength="19" @input="formatCardNumber" required>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="expireMonth">Son Kullanma Ayı</label>
                <select id="expireMonth" v-model="cardForm.expiryMonth" class="form-control" required>
                  <option value="" disabled>Ay</option>
                  <option v-for="month in 12" :key="month" :value="Number(month.toString().padStart(2, '0'))">
                    {{ month.toString().padStart(2, '0') }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label for="expireYear">Son Kullanma Yılı</label>
                <select id="expireYear" v-model="cardForm.expiryYear" class="form-control" required>
                  <option value="" disabled>Yıl</option>
                  <option v-for="year in 10" :key="year" :value="(new Date().getFullYear() + year - 1) % 100">
                    {{ new Date().getFullYear() + year - 1 }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label for="cvv">CVV</label>
                <input type="text" id="cvv" v-model="cardForm.cvv" class="form-control" maxlength="3" required>
              </div>
            </div>
            <div class="checkbox-group">
              <input type="checkbox" id="isDefault" v-model="cardForm.isDefault">
              <label for="isDefault">Varsayılan kart olarak ayarla</label>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button @click="closeCardModal" class="btn btn-secondary">İptal</button>
          <button @click="saveCard" class="btn btn-primary">Kaydet</button>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="card-form-modal">
      <div class="card-form-content confirmation-modal">
        <div class="modal-header">
          <h3>Kartı Sil</h3>
          <button @click="closeConfirmModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p>Bu kartı silmek istediğinize emin misiniz?</p>
        </div>
        <div class="modal-footer">
          <button @click="closeConfirmModal" class="btn btn-secondary">İptal</button>
          <button @click="deleteCard" class="btn btn-danger">Sil</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import apiClient from "@/api.js";
import axios from "axios";
import Swal from "sweetalert2";

const cards = defineModel();
const showCardModal = ref(false);
const showConfirmModal = ref(false);
const isEditing = ref(false);
const cardToDeleteId = ref(null);

const cardForm = ref({
  cardHolderName: '',
  cardNumber: '',
  expiryMonth: 0,
  expiryYear: 0,
  cvv: '',
  cardType: '',
  isDefault: false
});
const getBankName = (cardNumber, index) => {
  axios.get(`https://bin.bekirberke.tr/bin/${cardNumber}`)
    .then(response => {
      cards.value[index] = {
        ...cards.value[index],
        issuer: response.data.issuer || 'Bilinmiyor',
        type: response.data.type || '',
        category: response.data.category || '',
        brand: response.data.brand || '',
        issuerPhone: response.data.issuerPhone || '',
        issuerUrl: response.data.issuerUrl || '',
        country: response.data.country || '',
        alpha_2: response.data.alpha_2 || '',
        alpha_3: response.data.alpha_3 || '',
        showDetails: false
      }
    })
    .catch(error => {
      console.error('Error fetching bank name:', error);
      cards.value[index].issuer = 'Bilinmiyor';
    });
}
onMounted(() => {
  cards.value.forEach((card, index) => {
    const bin = card.cardNumber.replace(/\s/g, '').slice(0, 6);
    console.log(bin)
    getBankName(bin, index)
  })
})

function openAddCardModal() {
  resetCardForm();
  isEditing.value = false;
  showCardModal.value = true;
}

function editCard(card) {
  isEditing.value = true;
  cardForm.id = card.id;
  cardForm.cardHolder = card.cardHolder;
  cardForm.cardNumber = card.cardNumber;
  cardForm.expireMonth = card.expireMonth;
  cardForm.expireYear = card.expireYear;
  cardForm.isDefault = card.isDefault;
  cardForm.cvv = '';
  showCardModal.value = true;
}

function closeCardModal() {
  showCardModal.value = false;
}

function resetCardForm() {
  cardForm.id = null;
  cardForm.cardHolder = '';
  cardForm.cardNumber = '';
  cardForm.expireMonth = '';
  cardForm.expireYear = '';
  cardForm.cvv = '';
  cardForm.isDefault = false;
}

function saveCard() {
  cardForm.value.cardType = getCardType(cardForm.cardNumber)
  apiClient.post('/card', cardForm.value).then((response) => {
    Swal.fire({
      icon: 'success',
      title: 'Başarılı',
      text: 'Kart başarıyla kaydedildi.',
      showConfirmButton: false,
      timer: 1500
    })
  }).catch((error) => {
    Swal.fire({
      icon: 'error',
      title: 'Hata',
      text: 'Kart kaydedilirken bir hata oluştu.',
      showConfirmButton: false,
      timer: 1500
    })
  }).finally(() => {
    resetCardForm();
    closeCardModal();
  })


  closeCardModal();
}

function setDefaultCard(cardId) {
  apiClient.patch(`/card/${cardId}`, { isDefault: true }).then((response) => {
    cards.value.forEach(card => {
      if (card.id === cardId) {
        card.isDefault = true;
      } else {
        card.isDefault = false;
      }
    });
    Swal.fire({
      icon: 'success',
      title: 'Başarılı',
      text: 'Varsayılan kart başarıyla ayarlandı.',
      showConfirmButton: false,
      timer: 1500
    })
  }).catch((error) => {
    Swal.fire({
      icon: 'error',
      title: 'Hata',
      text: 'Varsayılan kart ayarlanırken bir hata oluştu.',
      showConfirmButton: false,
      timer: 1500
    })
  })
}

function confirmDeleteCard(cardId) {
  cardToDeleteId.value = cardId;
  showConfirmModal.value = true;
}

function deleteCard() {
  apiClient.delete(`/card/${cardToDeleteId.value}`).then((response) => {
    cards.value = cards.value.filter(card => card.id !== cardToDeleteId.value);
    Swal.fire({
      icon: 'success',
      title: 'Başarılı',
      text: 'Kart başarıyla silindi.',
      showConfirmButton: false,
      timer: 1500
    })
  }).catch((error) => {
    Swal.fire({
      icon: 'error',
      title: 'Hata',
      text: 'Kart silinirken bir hata oluştu.',
      showConfirmButton: false,
      timer: 1500
    })
  })
  closeConfirmModal();
}

function closeConfirmModal() {
  showConfirmModal.value = false;
  cardToDeleteId.value = null;
}

function getLast4Digits(cardNumber) {
  return cardNumber.replace(/\s/g, '').slice(-4);
}

function formatExpireDate(month, year) {
  return `${month}/${year}`;
}

function formatCardNumber(event) {
  let input = event.target.value.replace(/\D/g, '');
  let formattedValue = '';

  for (let i = 0; i < input.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formattedValue += ' ';
    }
    formattedValue += input[i];
  }

  cardForm.cardNumber = formattedValue;
}

function getCardType(cardNumber) {
  const cleanNumber = cardNumber.replace(/\D/g, '');

  if (/^4/.test(cleanNumber)) {
    return 'Visa';
  } else if (/^5[1-5]/.test(cleanNumber)) {
    return 'MasterCard';
  } else if (/^3[47]/.test(cleanNumber)) {
    return 'American Express';
  } else if (/^6(?:011|5)/.test(cleanNumber)) {
    return 'Discover';
  } else if (/^9792/.test(cleanNumber)) {
    return 'Troy';
  } else {
    return 'Kredi Kartı';
  }
}
</script>

<style scoped>
.card-content {
  width: 100%;
}

.card-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.card-item {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1.5rem;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #4a90e2;
}

.card-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.card-item-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.card-info {
  display: flex;
  flex-direction: column;
}

.card-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-category {
  font-size: 0.7rem;
  background-color: #f0f4f8;
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  color: #4a5568;
}

.bank-name {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.2rem;
}

.card-badges {
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

.type-badge {
  background-color: #e2e8f0;
  color: #4a5568;
  font-size: 0.7rem;
  font-weight: 500;
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
}

.card-item-body {
  margin-bottom: 1rem;
  min-height: 80px;
}

.card-number {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  letter-spacing: 1px;
}

.card-holder {
  color: #666;
  font-size: 0.9rem;
  margin: 0.4rem 0;
  text-transform: uppercase;
}

.card-expire {
  color: #666;
  font-size: 0.9rem;
}

.card-details {
  margin-top: 1rem;
  border-top: 1px solid #eee;
  padding-top: 1rem;
}

.details-toggle {
  width: 100%;
  background: none;
  border: none;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #666;
  cursor: pointer;
  font-size: 0.9rem;
}

.details-toggle:hover {
  color: #333;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.details-content {
  margin-top: 1rem;
  display: grid;
  gap: 0.75rem;
  font-size: 0.9rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  color: #666;
  font-weight: 500;
}

.detail-value {
  color: #333;
}

.detail-value.link {
  color: #4a90e2;
  text-decoration: none;
}

.detail-value.link:hover {
  text-decoration: underline;
}

.card-item-actions {
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

.card-form-modal {
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

.card-form-content {
  background-color: #fff;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.confirmation-modal {
  max-width: 400px;
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
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #ff7f00;
  color: white;
}

.btn-primary:hover {
  background-color: #e67300;
}

.btn-secondary {
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e9ecef;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background-color: #c0392b;
}

@media (max-width: 768px) {
  .card-list {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>