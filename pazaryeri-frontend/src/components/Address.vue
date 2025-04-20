<template>
    <div class="address-content">
    <div class="section-title">
      <h2>Adreslerim</h2>
      <button class="edit-btn" @click="showAddAddressForm = true">
        Yeni Adres Ekle
      </button>
    </div>

    <div v-if="addresses.length === 0" class="empty-state">
      <p>Henüz kayıtlı adresiniz bulunmamaktadır.</p>
      <button class="btn-save" @click="showAddAddressForm = true">
        Adres Ekle
      </button>
    </div>

    <div v-else class="address-list">
      <div
        v-for="(address, index) in addresses"
        :key="index"
        class="address-card"
      >
        <div class="address-card-header">
          <h3>{{ address.addressTitle || "Adres" }}</h3>
          <div class="address-badges">
            <span v-if="address.isDefault" class="default-badge"
              >Varsayılan</span
            >
          </div>
        </div>

        <div class="address-card-body">
          <p class="address-name">{{ address.fullName }}</p>
          <p class="address-details">{{ address.fullAddress }}</p>
          <p class="address-location">
            {{ address.neighborhood }}, {{ address.district }}/{{
              address.city
            }}
          </p>
          <p class="address-phone">{{ address.phone }}</p>
        </div>

        <div class="address-card-actions">
          <button class="btn-action" @click="editAddress(address.id, index)">
            Düzenle
          </button>
          <button
            class="btn-action"
            @click="setDefaultAddressById(address.id)"
            v-if="!address.isDefault"
          >
            Varsayılan Yap
          </button>
          <button class="btn-action delete" @click="deleteAddress(address.id)">
            Sil
          </button>
        </div>
      </div>
    </div>

    <!-- Adres Ekleme/Düzenleme Formu -->
    <div v-if="showAddAddressForm" class="address-form-modal">
      <div class="address-form-content">
        <div class="modal-header">
          <h3>
            {{
              editingAddressIndex === -1 ? "Yeni Adres Ekle" : "Adresi Düzenle"
            }}
          </h3>
          <button class="close-btn" @click="cancelAddressForm">&times;</button>
        </div>

        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label for="addressTitle">Adres Başlığı</label>
              <input
                type="text"
                id="addressTitle"
                v-model="addressForm.addressTitle"
                placeholder="Örn: Ev, İş"
                class="form-control"
                required
              />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="addressFullTitle">Tam Başlık</label>
              <input
                type="text"
                id="addressFullTitle"
                v-model="addressForm.fullName"
                placeholder="Örn: İstanbuldaki Evim"
                class="form-control"
                required
              />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="addressPhone">Telefon</label>
              <input
                type="tel"
                id="addressPhone"
                v-model="addressForm.phone"
                class="form-control"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="addressCity">İl</label>
              <select
                id="addressCity"
                v-model="addressForm.city"
                class="form-control"
                @change="getDistricts(addressForm.city)"
                required
              >
                <option value="">Seçiniz</option>
                <option
                  v-for="province in formProvinces"
                  :key="province.id"
                  :value="province.name"
                >
                  {{ province.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="addressDistrict">İlçe</label>
              <select
                id="addressDistrict"
                v-model="addressForm.district"
                class="form-control"
                required
              >
                <option value="">Seçiniz</option>
                <option
                  v-for="district in formDistricts"
                  :key="district.id"
                  :value="district.name"
                >
                  {{ district.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="addressNeighborhood">Mahalle</label>
              <input
                type="text"
                id="addressNeighborhood"
                v-model="addressForm.neighborhood"
                class="form-control"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="addressLine1">Adres Satırı</label>
              <input
                type="text"
                id="addressLine1"
                v-model="addressForm.fullAddress"
                class="form-control"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group checkbox-group">
              <label class="checkbox-container">
                Bu adresi varsayılan adresim yap
                <input type="checkbox" v-model="addressForm.isDefault" />
                <span class="checkmark"></span>
              </label>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="cancelAddressForm">İptal</button>
          <button class="btn-save" @click="saveAddress">Kaydet</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import axios from "axios";
import apiClient from "@/api";
import { useToast } from "vue-toast-notification";
const showAddAddressForm = ref(false);
const editingAddressIndex = ref(-1);
const addresses = defineModel();
const toast = useToast();

const addressForm = ref({
  addressTitle: "",
  fullName: "",
  phone: "",
  city: "",
  district: "",
  neighborhood: "",
  fullAddress: "",
  isDefault: false,
});

onMounted(() => {
  axios
    .get("https://turkiyeapi.herokuapp.com/api/v1/provinces")
    .then((response) => {
      formProvinces.value = response.data.data;
    });
});

const formProvinces = ref([]);
const formDistricts = ref([]);

const deleteAddress = (id) => {
  apiClient
    .delete(`/address/${id}`, {
    })
    .then(() => {
      // defineModel kullanıldığında, doğrudan model değerini güncelleyebiliriz
      addresses.value = addresses.value.filter(address => address.id !== id);
      toast.success("Adres başarıyla silindi.");
    })
    .catch((error) => {
      console.error("Error deleting address:", error);
      if (error.response && error.response.data) {
        const errorMsg = error.response.data.message || "Adres silinirken bir hata oluştu.";
        toast.error(errorMsg);
      } else {
        toast.error("Adres silinirken bir hata oluştu.");
      }
    });
};

const saveAddress = () => {
  if (editingAddressIndex.value === -1) {
    apiClient
      .post("/address/user", addressForm.value, {
      })
      .then((response) => {
        // Yeni adresi ekleyin ve modeli güncelleyin
        addresses.value = [...addresses.value, response.data];
        toast.success("Adres başarıyla kaydedildi.");
        cancelAddressForm();
      })
      .catch((error) => {
        console.error("Error saving address:", error);
        if (error.response && error.response.data) {
          if (error.response.data.message) {
            toast.error(error.response.data.message);
          } else if (error.response.data.errors) {
            const errorMessages = Object.values(error.response.data.errors).flat();
            errorMessages.forEach(errMsg => toast.error(errMsg));
          } else {
            toast.error("Adres kaydedilirken bir hata oluştu.");
          }
        } else {
          toast.error("Adres kaydedilirken bir hata oluştu.");
        }
      });
  } else {
    apiClient
      .patch(`/address/${addressForm.value.id}`, addressForm.value, {
      })
      .then((response) => {
        // Var olan adresi güncelleyin ve modeli güncelleyin
        const updatedAddresses = [...addresses.value];
        updatedAddresses[editingAddressIndex.value] = response.data;
        addresses.value = updatedAddresses;
        toast.success("Adres başarıyla güncellendi.");
        cancelAddressForm();
      })
      .catch((error) => {
        console.error("Error updating address:", error);
        if (error.response && error.response.data) {
          if (error.response.data.message) {
            toast.error(error.response.data.message);
          } else if (error.response.data.errors) {
            const errorMessages = Object.values(error.response.data.errors).flat();
            errorMessages.forEach(errMsg => toast.error(errMsg));
          } else {
            toast.error("Adres güncellenirken bir hata oluştu.");
          }
        } else {
          toast.error("Adres güncellenirken bir hata oluştu.");
        }
      });
  }
};

const getDistricts = (province) => {
  axios
    .get(
      `https://turkiyeapi.herokuapp.com/api/v1/districts?province=${province}`
    )
    .then((response) => {
      formDistricts.value = response.data.data;
    });
};

const setDefaultAddressById = (id) => {
  apiClient
    .patch(
      `/address/${id}/set-default`,
      {},
    )
    .then(() => {
      // Tüm adreslerin isDefault değerini güncelle
      const updatedAddresses = addresses.value.map(address => ({
        ...address,
        isDefault: address.id === id
      }));
      addresses.value = updatedAddresses;
      toast.success("Varsayılan adres başarıyla değiştirildi.");
    })
    .catch((error) => {
      console.error("Error setting default address:", error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Varsayılan adres ayarlanırken bir hata oluştu.");
      }
    });
};

const editAddress = (id, index) => {
  editingAddressIndex.value = index;
  addressForm.value = { ...addresses.value[index] };
  showAddAddressForm.value = true;
};

const cancelAddressForm = () => {
  showAddAddressForm.value = false;
  editingAddressIndex.value = -1;
  addressForm.value = {
    addressTitle: "",
    fullName: "",
    phone: "",
    city: "",
    district: "",
    neighborhood: "",
    fullAddress: "",
    isDefault: false,
  };
};
</script>
<style>
.address-content {
  width: 100%;
}

.address-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.address-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1.5rem;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.address-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #4a90e2;
}

.address-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.address-card-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.address-badges {
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

.address-card-body {
  margin-bottom: 1rem;
  min-height: 120px;
}

.address-name {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.address-details,
.address-location,
.address-phone {
  color: #666;
  font-size: 0.9rem;
  margin: 0.2rem 0;
}

.address-location {
  word-wrap: break-word;
}

.address-card-actions {
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

.address-form-modal {
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

.address-form-content {
  background-color: #fff;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
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
  max-height: 60vh;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
}

.checkbox-group {
  display: flex;
  align-items: center;
}
</style>