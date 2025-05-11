<template>
  <div class="checkout-container">
    <div class="checkout-header">
      <h2>Ödeme Sayfası</h2>
      <div class="cart-badge">
        <i class="bi bi-cart"></i>
        <span>{{ cartCount }}</span>
      </div>
    </div>

    <!-- Sepet Özeti Bölümü -->
    <div class="checkout-section">
      <h3>Sepet Özeti</h3>
      <div class="cart-summary">
        <div v-for="item in cartStore.cart" :key="item.id" class="cart-item" >
          <div class="cart-item-image">
            <router-link :to="{ name: 'product', params: { id: item.product.id } }" >
              <img :src="item.product.imageUrl || 'https://via.placeholder.com/60'" alt="Ürün görseli">
            </router-link>
          </div>
          <div class="cart-item-details">
            <h4>{{ item.product.name }}</h4>
            <p class="cart-item-price">{{ formatPrice(item.price) }} x {{ item.quantity }}</p>
            <p class="cart-item-tax">KDV: {{ formatPrice(calculateTax(item.price, item.product.vatRate)) }}</p>
          </div>
          <div class="cart-item-total">
            {{ formatPrice(item.price * item.quantity)}}
          </div>
        </div>
        <div class="cart-vat-total">
          <span>Toplam KDV:</span>
          <span>{{ formatPrice(totalVatAmount) }}</span>
        </div>

        <div v-if="couponStore.couponCode.type" class="cart-summary-row discount-row">
          <span>İndirim ({{ couponStore.couponCode.code }} - {{ couponStore.couponCode.desc }})</span>
          <span>-{{ formatDiscountAmount() }}</span>
        </div>
        
        <div class="cart-total">
          <span>Kargo:</span>
          <span>{{ formatPrice(shippingCost) }}</span>
        </div>

        <div class="cart-grand-total">
          <strong>Genel Toplam:</strong>
          <strong>{{ formatPrice(grandTotal) }}</strong>
        </div>
      </div>
    </div>

    <div class="checkout-section">
      <h3>Teslimat Adresi</h3>
      <div v-if="!showAddressForm" class="form-group">
        <div class="address-cards">
          <div v-for="address in user.addresses" :key="address.id" 
               class="address-card" 
               :class="{ 'selected': orderDto.addressId === address.id }"
               @click="orderDto.addressId = address.id">
            <h5>{{ address.fullName }}</h5>
            <p v-if="address.fullAdress">{{ address.fullAdress }}</p>
            <div class="address-card-footer">
              <span class="badge" v-if="orderDto.addressId === address.id">Seçildi</span>
            </div>
          </div>
        </div>
        <div class="new-address-action">
          <button @click="showAddressForm = true" class="btn-new-address">
            <i class="bi bi-plus-circle"></i> Farklı Adres Kullanmak İstiyorum
          </button>
        </div>
      </div>
      
      <!-- Yeni adres formu -->
      <div v-else class="address-form">
        <div class="form-fields">
          <div class="form-row">
            <div class="form-field">
              <label for="addressTitle">Adres Başlığı</label>
              <input 
                type="text" 
                id="addressTitle" 
                v-model="newAddress.addressTitle" 
                placeholder="Örn: Ev, İş"
              >
            </div>
            <div class="form-field">
              <label for="fullName">Tam Başlık</label>
              <input 
                type="text" 
                id="fullName" 
                v-model="newAddress.fullName" 
                placeholder="Ad Soyad"
              >
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-field">
              <label for="phone">Telefon Numarası</label>
              <input 
                type="text" 
                id="phone" 
                v-model="newAddress.phone" 
                placeholder="05XX XXX XX XX"
              >
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-field">
              <label for="city">İl</label>
              <select
                id="city"
                v-model="newAddress.city"
                class="form-control"
                required
                @change="getDistricts(newAddress.city)"
              >
                <option value="">Seçiniz</option>
                <option
                  v-for="province in provinces"
                  :key="province.id"
                  :value="province.name"
                >
                  {{ province.name }}
                </option>
              </select>
            </div>
            <div class="form-field">
              <label for="district">İlçe</label>
              <select
                id="city"
                v-model="newAddress.district"
                class="form-control"
                required
              >
                <option value="">Seçiniz</option>
                <option
                  v-for="district in districts"
                  :key="district.id"
                  :value="district.name"
                >
                  {{ district.name }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-field">
              <label for="neighborhood">Mahalle</label>
              <input 
                type="text" 
                id="neighborhood" 
                v-model="newAddress.neighborhood" 
                placeholder="Mahalle"
              >
            </div>
          </div>
          
          <div class="form-field full-width">
            <label for="fullAddress">Açık Adres</label>
            <textarea 
              id="fullAddress" 
              v-model="newAddress.fullAddress" 
              placeholder="Sokak, Apartman No, Daire No"
              rows="3"
            ></textarea>
          </div>
          <div class="form-actions">
            <div class="save-address-option">
              <input type="checkbox" id="saveAddressOption" v-model="saveAddressChecked">
              <label for="saveAddressOption">Adres bilgilerimi kaydet</label>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button @click="showAddressForm = false" class="btn-cancel">
            İptal
          </button>
          <button @click="saveNewAddress" class="btn-save">
            Adresi Kullan
          </button>
        </div>
      </div>
    </div>

    <div class="checkout-section">
      <h3>Ödeme Bilgileri</h3>
      <div class="form-group">
        <div v-if="!showCardForm" class="payment-cards">
          <div v-for="card in user.cards" :key="card.id" 
               class="payment-card" 
               :class="{ 
                 'selected': orderDto.cardId === card.id,
                 'card-visa': card.cardType?.toLowerCase() === 'visa',
                 'card-mastercard': card.cardType?.toLowerCase() === 'mastercard',
                 'card-amex': card.cardType?.toLowerCase() === 'american express',
                 'card-troy': card.cardType?.toLowerCase() === 'troy'
               }"
               @click="orderDto.cardId = card.id">
            <div class="card-chip"></div>
            <h5>{{ formatCardNumber(card.cardNumber) }}</h5>
            <div class="card-info">
              <span v-if="card.cardHolderName">{{ card.cardHolderName }}</span>
              <span v-if="card.expiryMonth && card.expiryYear">{{ card.expiryMonth + "/" + card.expiryYear }}</span>
            </div>
            <div class="card-type" v-if="card.cardType">{{ card.cardType }}</div>
            <div class="address-card-footer">
              <span class="badge" v-if="orderDto.cardId === card.id">Seçildi</span>
            </div>
          </div>
        </div>
        
        <!-- Yeni kart formu -->
        <div v-else class="card-form">
          <div class="form-fields">
            <div class="form-row">
              <div class="form-field">
                <label for="cardHolderName">Kart Üzerindeki İsim</label>
                <input 
                  type="text" 
                  id="cardHolderName" 
                  v-model="newCard.cardHolderName" 
                  placeholder="Kart üzerindeki adınız"
                >
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-field">
                <label for="cardNumber">Kart Numarası</label>
                <input 
                  type="text" 
                  id="cardNumber" 
                  v-model="newCard.cardNumber" 
                  placeholder="Kart numarası"
                  @input="formatCardInput"
                  :class="{
                    'card-visa': newCard.cardBrand === 'Visa',
                    'card-mastercard': newCard.cardBrand === 'Mastercard',
                    'card-amex': newCard.cardBrand === 'American Express',
                    'card-troy': newCard.cardBrand === 'Troy'
                  }"
                >
                <small v-if="newCard.cardBrand" class="card-info-text">
                  {{ newCard.cardBrand }} - {{ newCard.cartIssuer }}
                </small>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-field">
                <label for="expiryMonth">Ay</label>
                <select
                  id="expiryMonth"
                  v-model="newCard.expiryMonth"
                  class="form-control"
                  required
                >
                  <option value="">Ay</option>
                  <option v-for="month in 12" :key="month" :value="String(month).padStart(2, '0')">
                    {{ String(month).padStart(2, '0') }}
                  </option>
                </select>
              </div>
              <div class="form-field">
                <label for="expiryYear">Yıl</label>
                <select
                  id="expiryYear"
                  v-model="newCard.expiryYear"
                  class="form-control"
                  required
                >
                  <option value="">Yıl</option>
                  <option v-for="year in 10" :key="year" :value="String(new Date().getFullYear() + year - 1).slice(-2)">
                    {{ new Date().getFullYear() + year - 1 }}
                  </option>
                </select>
              </div>
              <div class="form-field">
                <label for="cvv">CVV</label>
                <input 
                  type="text" 
                  id="cvv" 
                  v-model="newCard.cvv" 
                  placeholder="CVV"
                  maxlength="3"
                >
              </div>
            </div>
            
            <div class="form-actions">
              <div class="save-card-option">
                <input type="checkbox" id="saveCardOption" v-model="saveCardChecked">
                <label for="saveCardOption">Kart bilgilerimi kaydet</label>
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <button @click="showCardForm = false" class="btn-cancel">
              İptal
            </button>
            <button @click="saveNewCard" class="btn-save">
              Kartı Kullan
            </button>
          </div>
        </div>
        
        <div v-if="!showCardForm" class="new-card-action">
          <button @click="showCardForm = true" class="btn-new-address">
            <i class="bi bi-plus-circle"></i> Farklı Kart Kullanmak İstiyorum
          </button>
        </div>
      </div>
    </div>

    <div class="checkout-footer">
      <button class="btn-checkout" @click="checkout()">
        Ödemeyi Tamamla
      </button>
    </div>
  </div>
</template>

<script setup>
import {computed, onMounted, ref, watch} from "vue";
import { useRoute } from "vue-router";
import apiClient from "@/api.js";
import axios from "axios";
import {useCartStore, useCouponStore} from "@/stores/counter.js";
import Swal from "sweetalert2";
import {useToast} from "vue-toast-notification";

const cartStore = useCartStore();
const couponStore = useCouponStore();
const router = useRoute();
const provinces = ref([]);
const districts = ref([]);
const cartCount = computed(() => {
  return cartStore.cart.map(item => item.quantity).reduce((a, b) => a + b, 0);
});

const calculateTax = (price, vatRate) => {
  if (!price || !vatRate) return 0;
  const taxAmount = price * (vatRate / (100 + parseFloat(vatRate)));
  return taxAmount;
};

// Helper function to get eligible items for the coupon
const getEligibleItems = () => {
  if (!couponStore.couponCode.type) return [];
  
  let eligibleItems = [...cartStore.cart];
  
  if (couponStore.couponCode.storeId) {
    eligibleItems = eligibleItems.filter(item => 
      item.product && item.product.store && 
      item.product.store.id === couponStore.couponCode.storeId
    );
  }
  
  if (couponStore.couponCode.categoryIds && couponStore.couponCode.categoryIds.length > 0) {
    eligibleItems = eligibleItems.filter(item => {
      if (!item.product || !item.product.categories) return false;
      
      const productCategoryIds = item.product.categories.map(pc => 
        pc.category ? pc.category.id : null
      ).filter(id => id !== null);
      
      return productCategoryIds.some(catId => 
        couponStore.couponCode.categoryIds.includes(catId)
      );
    });
  }
  
  if (couponStore.couponCode.productIds && couponStore.couponCode.productIds.length > 0) {
    eligibleItems = eligibleItems.filter(item => 
      couponStore.couponCode.productIds.includes(item.productId)
    );
  }
  
  return eligibleItems;
};

const cartTotal = computed(() => {
  return cartStore.cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
});

const productTotalPrice = cartTotal;

const discountAmount = computed(() => {
  if (!couponStore.couponCode.type) return 0;
  
  const eligibleItems = getEligibleItems();
  
  const eligibleTotal = eligibleItems.reduce((total, item) => 
    total + (item.quantity * item.price), 0
  );
  
  if (couponStore.couponCode.type === "PERCENTAGE") {
    return eligibleTotal * (Number(couponStore.couponCode.value) / 100);
  } else if (couponStore.couponCode.type === "FIXED_AMOUNT") {
    return Math.min(Number(couponStore.couponCode.value), eligibleTotal);
  }
  
  return 0;
});

const formatDiscountAmount = () => {
  return formatPrice(discountAmount.value);
};

const shippingCost = ref(0);

const grandTotal = computed(() => {
  let total = productTotalPrice.value + shippingCost.value - discountAmount.value;
  return total > 0 ? total : 0;
});

watch(grandTotal, (newVal) => {
  orderDto.value.totalAmount = newVal;
  orderDto.value.paidAmount = newVal;
});

const formatPrice = (price) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(price);
};

const totalVatAmount = computed(() => {
  // Calculate total VAT amount from all items in cart
  return cartStore.cart.reduce((total, item) => {
    // Eğer fiyat KDV dahil ise, KDV tutarını hesapla
    const itemVat = calculateTax(item.price, item.product.vatRate) * item.quantity;
    
    // If eligible for discount, calculate VAT on discounted amount
    if (couponStore.couponCode.type) {
      const eligibleItems = getEligibleItems();
      const isEligible = eligibleItems.some(eligibleItem => 
        eligibleItem.productId === item.productId && 
        (eligibleItem.variantId === item.variantId || (!eligibleItem.variantId && !item.variantId))
      );
      
      if (isEligible) {
        // For percentage discount, apply proportional discount to item
        if (couponStore.couponCode.type === "PERCENTAGE") {
          const discountedPrice = item.price * (1 - (couponStore.couponCode.value / 100));
          return total + calculateTax(discountedPrice, item.product.vatRate) * item.quantity;
        } 
        // For fixed amount, we need to distribute the discount proportionally
        else if (couponStore.couponCode.type === "FIXED_AMOUNT") {
          const eligibleTotal = eligibleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          const discountRatio = Math.min(couponStore.couponCode.value / eligibleTotal, 1);
          const discountedPrice = item.price * (1 - discountRatio);
          return total + calculateTax(discountedPrice, item.product.vatRate) * item.quantity;
        }
      }
    }
    
    // No discount applied to this item
    return total + itemVat;
  }, 0);
});

const getProvinces = () => {
  axios.get("https://turkiyeapi.herokuapp.com/api/v1/provinces")
    .then(response => {
      provinces.value = response.data.data;
      console.log('Provinces:', provinces.value);
    })
    .catch(error => {
      console.error('Error fetching provinces:', error);
    });
}
const getDistricts = (province) => {
  axios
    .get(
      `https://turkiyeapi.herokuapp.com/api/v1/districts?province=${province}`
    )
    .then((response) => {
      districts.value = response.data.data;
    });
};

const checkBIN = (binNumber) => {
  axios.get(`https://bin.bekirberke.tr/bin/${binNumber}`)
    .then(response => {
      if (response.data) {
        newCard.value.cardBrand = response.data.brand || '';
        newCard.value.cartIssuer = response.data.issuer || 'Bilinmiyor';
        newCard.value.cardType = response.data.type || '';
        
        const firstDigit = binNumber.charAt(0);
        if (firstDigit === '4') {
          newCard.value.cardBrand = 'Visa';
        } else if (firstDigit === '5') {
          newCard.value.cardBrand = 'Mastercard';
        } else if (firstDigit === '3') {
          newCard.value.cardBrand = 'American Express';
        } else if (firstDigit === '9') {
          newCard.value.cardBrand = 'Troy';
        }
      }
    })
    .catch(error => {
      console.error('Error fetching BIN information:', error);
    });
};

const orderDto = ref({
  addressId: null,
  cardId: null,
  phone: null,
});

const user = ref({});
const formatCardNumber = (cardNumber) => {
  if (!cardNumber) return '';
  const lastFourDigits = cardNumber.slice(-4);
  const maskedPart = cardNumber.slice(0, -4).replace(/\d/g, '*');
  const formattedNumber = (maskedPart + lastFourDigits).match(/.{1,4}/g)?.join(' ') || '';
  return formattedNumber;
};

const checkout = () => {
  const orderData = { ...orderDto.value };
  const selectedAddress = user.value.addresses.find(address => address.id === orderDto.value.addressId);
  if(couponStore.couponCode.id){
    orderData.couponId = couponStore.couponCode.id;
    orderData.couponCode = couponStore.couponCode.code;
  }
  if (selectedAddress) {
    orderData.phone = selectedAddress.phone;
    if (!selectedAddress.id || typeof selectedAddress.id === 'string' && !selectedAddress.id.includes('-')) {
      orderData.address = {
        addressTitle: selectedAddress.addressTitle || 'Geçici Adres',
        fullName: selectedAddress.fullName,
        phone: selectedAddress.phone,
        city: selectedAddress.city,
        district: selectedAddress.district,
        neighborhood: selectedAddress.neighborhood,
        fullAddress: selectedAddress.fullAddress
      };
      delete orderData.addressId;
    }
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Adres Seçimi Gerekli',
      text: 'Lütfen bir teslimat adresi seçiniz'
    });
    return;
  }
  
  const selectedCard = user.value.cards.find(card => card.id === orderDto.value.cardId);
  
  if (selectedCard) {
    if (!selectedCard.id || typeof selectedCard.id === 'string' && !selectedCard.id.includes('-')) {
      orderData.card = {
        cardHolderName: selectedCard.cardHolderName,
        cardNumber: selectedCard.cardNumber.replace(/\s+/g, ''),
        cardBrand: selectedCard.cardBrand || 'Unknown',
        cardType: selectedCard.cardType || 'Unknown',
        cartIssuer: selectedCard.cartIssuer || 'Unknown',
        expiryMonth: selectedCard.expiryMonth,
        expiryYear: selectedCard.expiryYear,
        cvv: selectedCard.cvv
      };
      delete orderData.cardId;
    }
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Ödeme Bilgisi Gerekli',
      text: 'Lütfen bir ödeme yöntemi seçiniz'
    });
    return;
  }
  
  apiClient.post('/order', orderData)
    .then((response) => {
      Swal.fire({
        icon: 'success',
        title: 'Siparişiniz Başarıyla Oluşturuldu',
        text: 'Sipariş numaranız: ' + response.data.orderNumber,
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        cartStore.clearCart();
        couponStore.clearCouponCode();
        router.push({ path: '/' });
      });
    })
    .catch((error) => {
      console.error("Sipariş oluşturulurken hata:", error);
      
      Swal.fire({
        icon: 'error',
        title: 'Sipariş Oluşturulamadı',
        text: error.response?.data?.message || 'Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.'
      });
    });
}

const showAddressForm = ref(false);
const newAddress = ref({
  addressTitle: '',
  fullName: '',
  phone: '',
  city: '',
  district: '',
  neighborhood: '',
  fullAddress: ''
});
const saveAddressChecked = ref(false)

const saveNewAddress = () => {
  if (saveAddressChecked.value) {
    apiClient.post('/address/user', {
      addressTitle: newAddress.value.addressTitle,
      fullName: newAddress.value.fullName,
      phone: newAddress.value.phone,
      city: newAddress.value.city,
      district: newAddress.value.district,
      neighborhood: newAddress.value.neighborhood,
      fullAddress: newAddress.value.fullAddress
    })
    .then(response => {
      const savedAddress = response.data;
      user.value.addresses.push(savedAddress);
      orderDto.value.addressId = savedAddress.id;
      showAddressForm.value = false;
      Swal.fire({
        icon: 'success',
        title: 'Adres Başarıyla Kaydedildi',
        text: 'Yeni adresiniz kaydedildi.',
        timer: 1000,
        showConfirmButton: false
      });
    })
    .catch(error => {
      console.error("Adres kaydedilirken bir hata oluştu:", error);
      Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: 'Adres kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.'
      });
    });
  } else {
    user.value.addresses.push(newAddress.value);
    orderDto.value.addressId = newAddress.value.id;
  }
  showAddressForm.value = false;
  newAddress.value = {
    addressTitle: '',
    fullName: '',
    phone: '',
    city: '',
    district: '',
    neighborhood: '',
    fullAddress: ''
  };
};

const showCardForm = ref(false);
const saveCardChecked = ref(false);
const newCard = ref({
  cardHolderName:'',
  cardNumber:'',
  cardBrand:'',
  cardType:'',   
  cartIssuer:'' ,
  expiryMonth:'',    
  expiryYear:'',   
  cvv:''            
});

const saveNewCard = () => {
  if (!newCard.value.cardBrand) {
    let cardBrand = 'Unknown';
    const firstDigit = newCard.value.cardNumber.charAt(0);
    if (firstDigit === '4') {
      cardBrand = 'Visa';
    } else if (firstDigit === '5') {
      cardBrand = 'Mastercard';
    } else if (firstDigit === '3') {
      cardBrand = 'American Express';
    } else if (firstDigit === '9') {
      cardBrand = 'Troy';
    }
    newCard.value.cardBrand = cardBrand;
  }
  
  const cardData = {
    cardHolderName: newCard.value.cardHolderName,
    cardNumber: newCard.value.cardNumber,
    expiryMonth: newCard.value.expiryMonth,
    expiryYear: newCard.value.expiryYear,
    cvv: newCard.value.cvv,
    cardType: newCard.value.cardType,
    cardBrand: newCard.value.cardBrand,
    cardIssuer: newCard.value.cartIssuer
  };
  
  if (saveCardChecked.value) {
    apiClient.post('/card', {
      cardHolderName: cardData.cardHolderName,
      cardNumber: cardData.cardNumber,
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      cvv:cardData.cvv,
      cardType: cardData.cardType,
      cardBrand: cardData.cardBrand,
      cardIssuer: cardData.cardIssuer,
      isDefault:false
    })
    .then(response => {
      const savedCard = response.data;
      user.value.cards.push(savedCard);
      orderDto.value.cardId = savedCard.id;
      showCardForm.value = false;
      
      Swal.fire({
        icon: 'success',
        title: 'Kart Başarıyla Kaydedildi',
        text: 'Yeni kartınız hesabınıza kaydedildi.',
        timer: 1000,
        showConfirmButton: false
      });
    })
    .catch(error => {
      console.error("Kart kaydedilirken bir hata oluştu:", error);
      Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: 'Kart kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.'
      });
    });
  } else {
    user.value.cards.push(cardData);
    orderDto.value.cardId = cardData.id;
    showCardForm.value = false;
  }
  
  newCard.value = {
    cardHolderName: '',
    cardNumber: '',
    cardBrand: '',
    cardType: '',   
    cartIssuer: '',
    expiryMonth: '',    
    expiryYear: '',   
    cvv: ''            
  };
};

const formatCardInput = (event) => {
  let value = event.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  
  if (value.length > 16) {
    value = value.slice(0, 16);
  }
  
  const formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
  
  newCard.value.cardNumber = formattedValue;
  
  const rawCardNumber = formattedValue.replace(/\s+/g, '');
  if (rawCardNumber.length === 6) {
    checkBIN(rawCardNumber);
  } else if (rawCardNumber.length < 6) {
    newCard.value.cardBrand = '';
    newCard.value.cartIssuer = '';
  }
};

onMounted(() => {
  getProvinces();
  apiClient.get('/users/profile').then((response) => {
    user.value = response.data;
  }).catch((error) => {
    console.error("Error fetching user profile:", error);
  });
});
</script>

<style scoped>
.cart-vat-total {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
  border-top: 1px dashed #eee;
}
.cart-item-tax {
  color: #888;
  margin: 0;
  font-size: 0.8rem;
  font-style: italic;
}
.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.checkout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.cart-badge {
  background-color: #4a6da7;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkout-section {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Sepet özeti stilleri */
.cart-summary {
  background-color: white;
  border-radius: 6px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.cart-item {
  display: flex;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
  align-items: center;
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item-image {
  width: 60px;
  height: 60px;
  margin-right: 1rem;
  border-radius: 4px;
  overflow: hidden;
}

.cart-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-item-details {
  flex: 1;
}

.cart-item-details h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.cart-item-price {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

.cart-item-total {
  font-weight: bold;
  color: #4a6da7;
}

.cart-total {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #eee;
  font-size: 1.1rem;
}

h2 {
  color: #333;
  margin: 0;
}

h3 {
  color: #444;
  margin-top: 0;
  margin-bottom: 1.2rem;
  font-weight: 500;
}

.form-select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  font-size: 16px;
  background-color: white;
}

/* Select kutusu için stiller */
.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  background-color: white;
  appearance: auto; /* Native görünümü korumak için */
  height: 38px; /* input'larla aynı yüksekliği sağlamak için */
}

/* Form alanı select olduğunda ekstra stillemeler */
.form-field select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Cpath fill='%23333' d='M0 2l4 4 4-4z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.7rem center;
  background-size: 8px 8px;
  padding-right: 2rem;
}

.address-cards, .payment-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.address-card {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.address-card:hover {
  border-color: #bbb;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.payment-card {
  position: relative;
  background: linear-gradient(135deg, #444, #222);
  color: white;
  height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Kart tiplerine göre renkler */
.card-visa {
  background: linear-gradient(135deg, #0057a0, #00338d);
}

.card-mastercard {
  background: linear-gradient(135deg, #ee0b2d, #a9021e);
}

.card-amex {
  background: linear-gradient(135deg, #2671b5, #275e9e);
}

.card-troy {
  background: linear-gradient(135deg, #00a185, #008160);
}

.payment-card.selected {
  box-shadow: 0 0 0 2px white, 0 0 0 4px #4a6da7;
}

.selected {
  border: 2px solid #4a6da7;
  background-color: #f0f5ff;
}

.address-card h5, .payment-card h5 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  letter-spacing: 1px;
}

.address-card p {
  color: #666;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.address-card-footer {
  display: flex;
  justify-content: flex-end;
}

.badge {
  background-color: #4a6da7;
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.card-chip {
  width: 40px;
  height: 30px;
  background: linear-gradient(to bottom, #ccc, #999);
  border-radius: 5px;
  margin-bottom: 1rem;
}

.card-info {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  font-size: 0.8rem;
  opacity: 0.9;
}

.card-type {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}

.checkout-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-checkout {
  background-color: #4a6da7;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-checkout:hover {
  background-color: #3a5d97;
}

.btn-checkout:disabled {
  background-color: #b0b0b0;
  cursor: not-allowed;
}

.new-address-action {
  margin-top: 1rem;
  text-align: center;
}

.btn-new-address {
  background-color: #4a6da7;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-new-address:hover {
  background-color: #3a5d97;
}

.address-form {
  background-color: white;
  border-radius: 6px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.form-fields {
  margin-bottom: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-field {
  flex: 1;
}

.form-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-field input, .form-field textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
}

.form-field textarea {
  resize: none;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.btn-cancel {
  background-color: rgb(191, 35, 35);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-cancel:hover {
  background-color: #999;
}

.btn-save {
  background-color: #4a6da7;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-save:hover {
  background-color: #3a5d97;
}

.card-info-text {
  display: block;
  margin-top: 4px;
  font-size: 0.85rem;
  color: #4a6da7;
}

/* Kredi kartı markalarına göre renkli gösterim */
.form-field input.card-visa {
  border-color: #0057a0;
  background-color: #f0f7ff;
}

.form-field input.card-mastercard {
  border-color: #ee0b2d;
  background-color: #fff6f8;
}

.form-field input.card-amex {
  border-color: #2671b5;
  background-color: #f0f7ff;
}

.form-field input.card-troy {
  border-color: #00a185;
  background-color: #f0faf8;
}

@media (max-width: 768px) {
  .checkout-container {
    padding: 1rem;
  }

  .address-cards, .payment-cards {
    grid-template-columns: 1fr;
  }

  .checkout-section {
    padding: 1rem;
  }
  
  .cart-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .cart-item-image {
    margin-bottom: 0.5rem;
  }
  
  .cart-item-total {
    align-self: flex-end;
    margin-top: 0.5rem;
  }
}

.discount-row {
  color: #4CAF50;
  font-weight: 500;
}

.cart-summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}
.cart-summary-row:last-child {
  border-bottom: none;
}

.cart-summary .cart-total, 
.cart-summary .cart-vat-total,
.cart-summary .discount-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.cart-summary .cart-grand-total strong,
.cart-summary .cart-total strong {
    font-size: 1.1em;
    font-weight: bold;
}

.cart-grand-total {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  margin-top: 10px;
  border-top: 2px solid #333;
  font-size: 1.2em;
  font-weight: bold;
}
</style>