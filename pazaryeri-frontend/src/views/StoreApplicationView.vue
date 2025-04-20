<template>
    <div class="store-application">
      <div class="container py-5">
        <div class="application-header text-center mb-5">
          <h1>Pazaryeri Satıcı Başvurusu</h1>
          <p class="lead">Hemen başvurun ve ürünlerinizi milyonlarca müşteriye ulaştırın</p>
        </div>
  
        <div class="application-form-container">
          <form class="application-form">
            <!-- Adım göstergeleri -->
            <div class="form-progress mb-4">
              <div class="progress" style="height: 4px;">
                <div class="progress-bar" role="progressbar" style="width: 20%;" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
              <div class="step-indicators">
                <div class="step active">
                  <div class="step-icon">1</div>
                  <div class="step-label">Hesap</div>
                </div>
                <div class="step">
                  <div class="step-icon">2</div>
                  <div class="step-label">Mağaza</div>
                </div>
                <div class="step">
                  <div class="step-icon">3</div>
                  <div class="step-label">Kişisel</div>
                </div>
                <div class="step">
                  <div class="step-icon">4</div>
                  <div class="step-label">Şirket</div>
                </div>
                <div class="step">
                  <div class="step-icon">5</div>
                  <div class="step-label">Onay</div>
                </div>
              </div>
            </div>
  
            <!-- Step 1: Hesap Bilgileri -->
            <div class="form-step active" id="step1">
              <div class="card">
                <div class="card-header">
                  <h3>Hesap Bilgileri</h3>
                  <p>Satıcı hesabınıza giriş için kullanacağınız bilgiler</p>
                </div>
                <div class="card-body">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label for="email" class="form-label">E-posta Adresi <span class="required">*</span></label>
                      <input type="email" class="form-control" id="email" placeholder="ornek@firma.com" v-model="storeInfo.email" required>
                      <div class="form-text">Bu adres ile giriş yapacaksınız</div>
                    </div>
                    <div class="col-md-6">
                      <label for="password" class="form-label">Şifre <span class="required">*</span></label>
                      <input type="password" class="form-control" id="password" v-model="storeInfo.password"  required>
                      <div class="form-text">En az 8 karakterden oluşmalıdır</div>
                    </div>
                    <div class="col-md-6">
                      <label for="password-confirm" class="form-label">Şifre Tekrar <span class="required">*</span></label>
                      <input type="password" class="form-control" id="password-confirm" required>
                    </div>
                  </div>
                </div>
                <div class="card-footer">
                  <div class="d-flex justify-content-end">
                    <button type="button" class="btn btn-primary next-step">Devam Et</button>
                  </div>
                </div>
              </div>
            </div>
  
            <!-- Step 2: Mağaza Bilgileri -->
            <div class="form-step" id="step2">
              <div class="card">
                <div class="card-header">
                  <h3>Mağaza Bilgileri</h3>
                  <p>Mağazanızın pazaryerimizde görüntülenecek bilgileri</p>
                </div>
                <div class="card-body">
                  <div class="row g-3">
                    <div class="col-md-12">
                      <label for="store-name" class="form-label">Mağaza Adı <span class="required">*</span></label>
                      <input type="text" class="form-control" id="store-name" placeholder="Teknoloji Market" v-model="storeInfo.name"  required>
                    </div>
                  </div>
                </div>
                <div class="card-footer">
                  <div class="d-flex justify-content-between">
                    <button type="button" class="btn btn-outline-secondary prev-step">Geri</button>
                    <button type="button" class="btn btn-primary next-step">Devam Et</button>
                  </div>
                </div>
              </div>
            </div>
  
            <!-- Step 3: Kişisel Bilgiler -->
            <div class="form-step" id="step3">
              <div class="card">
                <div class="card-header">
                  <h3>Kişisel Bilgiler</h3>
                  <p>Mağaza sahibinin bilgileri</p>
                </div>
                <div class="card-body">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label for="owner-first-name" class="form-label">Ad <span class="required">*</span></label>
                      <input type="text" class="form-control" id="owner-first-name" placeholder="Ahmet" v-model="storeInfo.ownerFirstName"  required>
                    </div>
                    <div class="col-md-6">
                      <label for="owner-last-name" class="form-label">Soyad <span class="required">*</span></label>
                      <input type="text" class="form-control" id="owner-last-name" placeholder="Mehmet" v-model="storeInfo.ownerLastName"  required>
                    </div>
                    <div class="col-md-6">
                      <label for="owner-email" class="form-label">Kişisel E-posta <span class="required">*</span></label>
                      <input type="email" class="form-control" id="owner-email" placeholder="ahmet.mehmet@example.com" v-model="storeInfo.ownerEmail"  required>
                    </div>
                    <div class="col-md-6">
                      <label for="owner-phone" class="form-label">Kişisel Telefon <span class="required">*</span></label>
                      <input type="tel" class="form-control" id="owner-phone" placeholder="5321112233" v-model="storeInfo.ownerPhone" required>
                      <div class="form-text">Başında 0 olmadan 10 haneli numaranızı giriniz</div>
                    </div>
                  </div>
                </div>
                <div class="card-footer">
                  <div class="d-flex justify-content-between">
                    <button type="button" class="btn btn-outline-secondary prev-step">Geri</button>
                    <button type="button" class="btn btn-primary next-step">Devam Et</button>
                  </div>
                </div>
              </div>
            </div>
  
            <!-- Step 4: Şirket Bilgileri -->
            <div class="form-step" id="step4">
              <div class="card">
                <div class="card-header">
                  <h3>Şirket Bilgileri</h3>
                  <p>Şirketinizin resmi bilgileri</p>
                </div>
                <div class="card-body">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label for="company-type" class="form-label">Şirket Türü <span class="required">*</span></label>
                      <select class="form-select" id="company-type" v-model="storeInfo.companyTypeId" required>
                        <option value="" disabled selected>Şirket türünü seçiniz</option>
                        <option v-for="type in companyTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
                      </select>
                    </div>
                    <div class="col-md-6">
                      <label for="company-name" class="form-label">Şirket Ünvanı <span class="required">*</span></label>
                      <input type="text" class="form-control" id="company-name" placeholder="TeknolojiMarket Ltd. Şti." v-model="storeInfo.companyName" required>
                    </div>
                    <div class="col-md-6">
                      <label for="tax-number" class="form-label">Vergi Numarası <span class="required">*</span></label>
                      <input type="text" class="form-control" id="tax-number" placeholder="1111111111" v-model="storeInfo.taxNumber" required>
                    </div>
                    <div class="col-md-6">
                      <label for="tax-office" class="form-label">Vergi Dairesi <span class="required">*</span></label>
                      <input type="text" class="form-control" id="tax-office" placeholder="Bayrampaşa" v-model="storeInfo.taxOffice" required>
                    </div>
                    <div class="col-md-12">
                      <label for="iban" class="form-label">IBAN <span class="required">*</span></label>
                      <input type="text" class="form-control" id="iban" placeholder="TR330006100519786457841326" v-model="storeInfo.iban" required>
                      <div class="form-text">TR ile başlayan 26 haneli IBAN numaranız</div>
                    </div>
                    <div class="col-md-12">
                      <label for="address" class="form-label">Adres <span class="required">*</span></label>
                      <textarea class="form-control" id="address" rows="3" placeholder="Esenler Cad. No:50, Bayrampaşa, İstanbul" v-model="storeInfo.address" required></textarea>
                    </div>
                    <div class="col-md-6">
                      <label for="phone" class="form-label">Şirket Telefonu <span class="required">*</span></label>
                      <input type="tel" class="form-control" id="phone" placeholder="2162223344" v-model="storeInfo.phone" required>
                    </div>
                  </div>
                </div>
                <div class="card-footer">
                  <div class="d-flex justify-content-between">
                    <button type="button" class="btn btn-outline-secondary prev-step">Geri</button>
                    <button type="button" class="btn btn-primary next-step">Devam Et</button>
                  </div>
                </div>
              </div>
            </div>
  
            <!-- Step 5: Onay -->
            <div class="form-step" id="step5">
              <div class="card">
                <div class="card-header">
                  <h3>Başvuru Onayı</h3>
                  <p>Bilgilerinizi kontrol edin ve başvurunuzu tamamlayın</p>
                </div>
                <div class="card-body">
                  <div class="confirmation-info">
                    <div class="alert alert-info">
                      <i class="bi bi-info-circle-fill me-2"></i>
                      Başvurunuz gönderildikten sonra ekibimiz tarafından incelenecektir. Onay süreci genellikle 1-3 iş günü sürmektedir.
                    </div>
  
                    <div class="mb-4">
                      <h4 class="mb-3">Mağaza Bilgileri</h4>
                      <table class="table table-sm">
                        <tr>
                          <td width="40%"><strong>Mağaza Adı:</strong></td>
                          <td>{{ storeInfo.name }}</td>
                        </tr>
                        <tr>
                          <td><strong>E-posta:</strong></td>
                          <td>{{ storeInfo.email }}</td>
                        </tr>
                      </table>
                    </div>
  
                    <div class="mb-4">
                      <h4 class="mb-3">Şirket Bilgileri</h4>
                      <table class="table table-sm">
                        <tr>
                          <td width="40%"><strong>Şirket Ünvanı:</strong></td>
                          <td>{{ storeInfo.companyName }}</td>
                        </tr>
                        <tr>
                          <td><strong>Vergi No:</strong></td>
                          <td>{{ storeInfo.taxNumber }}</td>
                        </tr>
                        <tr>
                          <td><strong>Vergi Dairesi:</strong></td>
                          <td>{{ storeInfo.taxOffice }}</td>
                        </tr>
                        <tr>
                          <td><strong>Adres:</strong></td>
                          <td>{{ storeInfo.address }}</td>
                        </tr>
                      </table>
                    </div>
  
                    <div class="form-check mb-4">
                      <input class="form-check-input" type="checkbox" id="terms-check" required>
                      <label class="form-check-label" for="terms-check">
                        <a href="#" class="text-decoration-none">Satıcı sözleşmesini</a> okudum ve kabul ediyorum
                      </label>
                    </div>
                    
                    <div class="form-check mb-4">
                      <input class="form-check-input" type="checkbox" id="privacy-check" required>
                      <label class="form-check-label" for="privacy-check">
                        <a href="#" class="text-decoration-none">KVKK Aydınlatma Metni'ni</a> okudum ve kabul ediyorum
                      </label>
                    </div>
                  </div>
                </div>
                <div class="card-footer">
                  <div class="d-flex justify-content-between">
                    <button type="button" class="btn btn-outline-secondary prev-step">Geri</button>
                    <button type="submit" @click.prevent="companyApplication()" class="btn btn-success">Başvuruyu Tamamla</button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  <script setup>
import apiClient from '@/api';
import Swal from 'sweetalert2';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
// Track current step (1-indexed)
const currentStep = ref(1);
const totalSteps = 5;
const route = useRoute();
let storeInfo = ref({
    "email":"",
    "password":"",
    "name":"",
    "ownerEmail":"",
    "ownerPhone":"",
    "ownerFirstName":"",
    "ownerLastName":"",
    "companyTypeId":4,
    "taxNumber": "",
    "companyName": "",
    "taxOffice": "",
    "iban": "",
    "address": "",
    "phone": "",
});
const companyTypes = ref(null);

const companyApplication = () => {
  apiClient.post('/store', storeInfo.value).then((response) => {
    Swal.fire({
      icon: 'success',
      title: 'Başvurunuz başarıyla gönderildi!',
      text: 'Ekibimiz en kısa sürede sizinle iletişime geçecektir.',
      confirmButtonText: 'Tamam'
    }).then(() => {
      // Redirect to home page or another page
      route.push({to: '/'});
    });
  })
}

// Function to go to the next step
const nextStep = () => {
  if (currentStep.value < totalSteps) {
    // Hide current step
    document.getElementById(`step${currentStep.value}`).classList.remove('active');
    
    // Show next step
    currentStep.value++;
    document.getElementById(`step${currentStep.value}`).classList.add('active');
    
    // Update progress bar
    updateProgressBar();
    
    // Update step indicators
    updateStepIndicators();
  }
};

// Function to go to the previous step
const prevStep = () => {
  if (currentStep.value > 1) {
    // Hide current step
    document.getElementById(`step${currentStep.value}`).classList.remove('active');
    
    // Show previous step
    currentStep.value--;
    document.getElementById(`step${currentStep.value}`).classList.add('active');
    
    // Update progress bar
    updateProgressBar();
    
    // Update step indicators
    updateStepIndicators();
  }
};

// Update the progress bar width
const updateProgressBar = () => {
  const progressPercent = ((currentStep.value - 1) / (totalSteps - 1)) * 100;
  document.querySelector('.progress-bar').style.width = `${progressPercent}%`;
  document.querySelector('.progress-bar').setAttribute('aria-valuenow', progressPercent);
};

// Update step indicators (active class)
const updateStepIndicators = () => {
  document.querySelectorAll('.step').forEach((step, index) => {
    if (index + 1 <= currentStep.value) {
      step.classList.add('active');
    } else {
      step.classList.remove('active');
    }
  });
};

// Set up event listeners for next/prev buttons
onMounted(() => {
  // Add click event listeners to all next step buttons
  document.querySelectorAll('.next-step').forEach(button => {
    button.addEventListener('click', nextStep);
  });
  
  // Add click event listeners to all previous step buttons
  document.querySelectorAll('.prev-step').forEach(button => {
    button.addEventListener('click', prevStep);
  });

  apiClient.get('/company').then(response => {
    companyTypes.value = response.data;
  }).catch(error => {
    console.error("Error fetching company types:", error);
  });
});
</script>
  <style scoped>
  .store-application {
    background-color: #f8f9fa;
    min-height: 100vh;
  }
  
  .application-header h1 {
    color: #ff7f00;
    font-weight: 700;
    margin-bottom: 15px;
  }
  
  .application-form-container {
    max-width: 900px;
    margin: 0 auto;
  }
  
  .form-step {
    display: none;
  }
  
  .form-step.active {
    display: block;
  }
  
  .card {
    border: none;
    border-radius: 12px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.08);
    margin-bottom: 30px;
  }
  
  .card-header {
    background-color: white;
    border-bottom: 1px solid #f1f1f1;
    border-radius: 12px 12px 0 0 !important;
    padding: 20px 25px;
  }
  
  .card-header h3 {
    margin-bottom: 5px;
    color: #333;
    font-size: 1.5rem;
    font-weight: 600;
  }
  
  .card-header p {
    margin-bottom: 0;
    color: #6c757d;
  }
  
  .card-body {
    padding: 25px;
  }
  
  .card-footer {
    background-color: white;
    border-top: 1px solid #f1f1f1;
    border-radius: 0 0 12px 12px !important;
    padding: 20px 25px;
  }
  
  .form-label {
    font-weight: 500;
    color: #495057;
  }
  
  .required {
    color: #dc3545;
  }
  
  .form-control, .form-select {
    padding: 10px 15px;
    border-radius: 8px;
    border: 1px solid #ced4da;
  }
  
  .form-control:focus, .form-select:focus {
    box-shadow: 0 0 0 0.25rem rgba(255, 127, 0, 0.25);
    border-color: #ff9a44;
  }
  
  .form-text {
    color: #6c757d;
    font-size: 0.85rem;
    margin-top: 5px;
  }
  
  .btn {
    padding: 10px 25px;
    border-radius: 8px;
    font-weight: 500;
  }
  
  .btn-primary {
    background-color: #ff7f00;
    border-color: #ff7f00;
  }
  
  .btn-primary:hover {
    background-color: #e67300;
    border-color: #e67300;
  }
  
  .btn-success {
    background-color: #198754;
    border-color: #198754;
  }
  
  .btn-outline-secondary {
    color: #6c757d;
    border-color: #ced4da;
  }
  
  .btn-outline-secondary:hover {
    background-color: #f8f9fa;
    color: #495057;
  }
  
  /* Progress Bar Styling */
  .form-progress {
    position: relative;
    margin-bottom: 40px;
  }
  
  .progress {
    height: 4px;
    background-color: #e9ecef;
    border-radius: 4px;
    margin-bottom: 20px;
  }
  
  .progress-bar {
    background-color: #ff7f00;
  }
  
  .step-indicators {
    display: flex;
    justify-content: space-between;
    position: relative;
  }
  
  .step {
    text-align: center;
    position: relative;
    z-index: 1;
  }
  
  .step-icon {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background-color: white;
    border: 2px solid #ced4da;
    color: #6c757d;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 8px;
    font-weight: 600;
    transition: all 0.3s;
  }
  
  .step.active .step-icon {
    background-color: #ff7f00;
    border-color: #ff7f00;
    color: white;
  }
  
  .step-label {
    font-size: 0.85rem;
    color: #6c757d;
    font-weight: 500;
  }
  
  .step.active .step-label {
    color: #ff7f00;
  }
  
  /* Confirmation page styling */
  .confirmation-info {
    padding: 15px;
  }
  
  .confirmation-info h4 {
    color: #495057;
    font-size: 1.2rem;
    font-weight: 600;
    border-bottom: 1px solid #e9ecef;
    padding-bottom: 10px;
  }
  
  .confirmation-info table {
    font-size: 0.95rem;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .step-label {
      font-size: 0.75rem;
    }
    
    .step-icon {
      width: 30px;
      height: 30px;
    }
    
    .card-header h3 {
      font-size: 1.3rem;
    }
  }
  </style>