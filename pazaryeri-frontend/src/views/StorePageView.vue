<template>
  <div class="seller-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <h1 class="display-4 fw-bold">Pazaryerinde<br>Satış <span class="text-primary">Fırsatı</span></h1>
            <p class="lead my-4">Ürünlerinizi milyonlarca müşteriye ulaştırın ve işinizi büyütün</p>
            <router-link to="/store-application">
              <button class="btn btn-lg btn-primary me-3">Hemen Başvur</button>
            </router-link>
            <button class="btn btn-lg btn-outline-secondary">Daha Fazla Bilgi</button>
          </div>
          <div class="col-lg-6 d-none d-lg-block">
            <img src="https://via.placeholder.com/600x400" alt="Satıcı Görseli" class="img-fluid rounded-3 shadow">
          </div>
        </div>
      </div>
    </div>
    
    <!-- Stats Section -->
    <div class="stats-section py-5">
      <div class="container">
        <div class="row text-center g-4">
          <div class="col-md-4">
            <div class="stat-card">
              <div class="stat-number">5M+</div>
              <div class="stat-label">Aktif Müşteri</div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="stat-card">
              <div class="stat-number">10K+</div>
              <div class="stat-label">Satıcı</div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="stat-card">
              <div class="stat-number">50K+</div>
              <div class="stat-label">Günlük Sipariş</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Benefits Section -->
    <div class="benefits-section py-5 bg-light">
      <div class="container">
        <div class="section-heading text-center mb-5">
          <h2>Neden Pazaryeri'nde Satış Yapmalısınız?</h2>
          <p class="text-muted">Tüm avantajlardan yararlanın ve işinizi hızla büyütün</p>
        </div>
        
        <div class="row g-4">
          <div class="col-md-4">
            <div class="benefit-card h-100">
              <div class="benefit-icon">
                <i class="bi bi-graph-up-arrow"></i>
              </div>
              <h3>Geniş Müşteri Ağı</h3>
              <p>Milyonlarca aktif müşteriye ürünlerinizi sunma fırsatı yakalayın</p>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="benefit-card h-100">
              <div class="benefit-icon">
                <i class="bi bi-truck"></i>
              </div>
              <h3>Kolay Lojistik</h3>
              <p>Entegre kargo ve teslimat çözümleriyle lojistik sorunlarınızı ortadan kaldırın</p>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="benefit-card h-100">
              <div class="benefit-icon">
                <i class="bi bi-cash-stack"></i>
              </div>
              <h3>Düzenli Ödeme</h3>
              <p>Güvenli ve zamanında ödemelerle nakit akışınızı planlayın</p>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="benefit-card h-100">
              <div class="benefit-icon">
                <i class="bi bi-shield-check"></i>
              </div>
              <h3>Güvenli Alışveriş</h3>
              <p>Güvenli ödeme altyapısı ile müşterilerinize güven verin</p>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="benefit-card h-100">
              <div class="benefit-icon">
                <i class="bi bi-bar-chart-line"></i>
              </div>
              <h3>Analitik Raporlar</h3>
              <p>Detaylı satış raporlarıyla işinizi daha iyi analiz edin</p>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="benefit-card h-100">
              <div class="benefit-icon">
                <i class="bi bi-megaphone"></i>
              </div>
              <h3>Pazarlama Desteği</h3>
              <p>Reklam ve pazarlama kampanyalarından yararlanın</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- How It Works -->
    <div class="how-it-works py-5">
      <div class="container">
        <div class="section-heading text-center mb-5">
          <h2>Nasıl Çalışır?</h2>
          <p class="text-muted">Satıcı olmak için sadece 4 adım</p>
        </div>
        
        <div class="row">
          <div class="col-lg-10 mx-auto">
            <div class="step-timeline">
              <div class="step-item">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h4>Başvurunuzu Yapın</h4>
                  <p>Formu doldurarak satıcı başvurunuzu iletin</p>
                </div>
              </div>
              
              <div class="step-item">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h4>Hesabınızı Onaylatın</h4>
                  <p>Gerekli belgeleri yükleyin ve onay sürecini tamamlayın</p>
                </div>
              </div>
              
              <div class="step-item">
                <div class="step-number">3</div>
                <div class="step-content">
                  <h4>Ürünlerinizi Ekleyin</h4>
                  <p>Kullanıcı dostu panel ile ürünlerinizi sisteme yükleyin</p>
                </div>
              </div>
              
              <div class="step-item">
                <div class="step-number">4</div>
                <div class="step-content">
                  <h4>Satışa Başlayın</h4>
                  <p>Siparişleri almaya ve kazanç sağlamaya başlayın</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Login/Signup Section -->
    <div class="cta-section py-5 bg-primary text-white">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-7">
            <h2 class="mb-3">Pazaryeri Ailesine Katılın</h2>
            <p class="lead">Hemen başvurun ve satışlarınızı artırmaya başlayın!</p>
          </div>
          <div class="col-lg-5">
            <div class="card shadow">
              <div class="card-body p-4">
                <ul class="nav nav-tabs mb-4" role="tablist">
                  <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="signup-tab" data-bs-toggle="tab" data-bs-target="#signup" type="button" role="tab">Yeni Başvuru</button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button class="nav-link" id="login-tab" data-bs-toggle="tab" data-bs-target="#login" type="button" role="tab">Giriş Yap</button>
                  </li>
                </ul>
                
                <div class="tab-content">
                  <div class="tab-pane fade show active" id="signup" role="tabpanel">
                    <div class="mb-3">
                      <button class="btn btn-primary w-100 py-2">Hemen Başvur</button>
                    </div>
                    <p class="text-center mb-0"><small>Başvuru yapmadan önce <a href="#" class="text-decoration-none">şartları</a> okuyunuz</small></p>
                  </div>
                  <div class="tab-pane fade" id="login" role="tabpanel">
                    <div class="mb-3">
                      <input type="email" class="form-control mb-2" placeholder="E-posta Adresiniz">
                      <input type="password" class="form-control mb-2" placeholder="Şifreniz">
                      <router-link to="/store-login">
                        <button class="btn btn-primary w-100 py-2">Satıcı Paneline Giriş</button>
                      </router-link>
                    </div>
                    <p class="text-center mb-0"><small><a href="#" class="text-decoration-none">Şifremi unuttum</a></small></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- FAQ Section -->
    <div class="faq-section py-5">
      <div class="container">
        <div class="section-heading text-center mb-5">
          <h2>Sıkça Sorulan Sorular</h2>
          <p class="text-muted">Satıcılarımızın en çok merak ettikleri</p>
        </div>
        
        <div class="row">
          <div class="col-lg-8 mx-auto">
            <div class="accordion" id="faqAccordion">
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                    Satıcı olmak için ne gerekiyor?
                  </button>
                </h2>
                <div id="faq1" class="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                  <div class="accordion-body">
                    Pazaryeri'nde satıcı olmak için geçerli bir vergi numarası, kimlik bilgileri ve banka hesabına ihtiyacınız vardır. Başvuru formunu doldurduktan sonra gerekli belgelerinizi sisteme yüklemeniz gerekmektedir.
                  </div>
                </div>
              </div>
              
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                    Komisyon oranları nedir?
                  </button>
                </h2>
                <div id="faq2" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                  <div class="accordion-body">
                    Komisyon oranları ürün kategorilerine göre %1 ile %10 arasında değişmektedir. Detaylı bilgi için satıcı panelindeki komisyon tablosunu inceleyebilirsiniz.
                  </div>
                </div>
              </div>
              
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                    Ödemeler ne zaman yapılır?
                  </button>
                </h2>
                <div id="faq3" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                  <div class="accordion-body">
                    Siparişin teslim edilmesinden sonra 14 iş günü içerisinde ödemeler hesabınıza aktarılır. İsterseniz ödeme dönemlerini satıcı panelinizden haftalık veya aylık olarak düzenleyebilirsiniz.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// You can add any seller-specific logic here
import { onMounted } from 'vue';

onMounted(() => {
  // Initialize Bootstrap components if needed
  if (typeof bootstrap !== 'undefined') {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
  }
});
</script>

<style scoped>
/* Hero Section */
.hero-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
  overflow: hidden;
}

.hero-section h1 {
  line-height: 1.2;
}

.hero-section .text-primary {
  color: #ff7f00 !important;
}

.hero-section img {
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

/* Stats Section */
.stats-section {
  background-color: #ffffff;
}

.stat-card {
  padding: 25px;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ff7f00;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 1rem;
  color: #555;
}

/* Benefits Section */
.benefits-section {
  background-color: #f8f9fa;
}

.section-heading h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.benefit-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.benefit-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.1);
}

.benefit-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: rgba(255, 127, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.benefit-icon i {
  font-size: 30px;
  color: #ff7f00;
}

.benefit-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 15px;
}

/* How It Works */
.step-timeline {
  position: relative;
  padding: 20px 0;
}

.step-timeline::after {
  content: '';
  position: absolute;
  width: 4px;
  background-color: #f1f1f1;
  top: 0;
  bottom: 0;
  left: 19px;
  margin-left: -2px;
}

.step-item {
  position: relative;
  margin-bottom: 40px;
  padding-left: 60px;
}

.step-number {
  position: absolute;
  left: 0;
  width: 40px;
  height: 40px;
  background-color: #ff7f00;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  z-index: 1;
}

.step-content {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.05);
}

.step-content h4 {
  margin-bottom: 10px;
  font-weight: 600;
}

/* CTA Section */
.cta-section {
  background: linear-gradient(135deg, #ff7f00 0%, #ff9a44 100%);
}

.cta-section .card {
  border: none;
  border-radius: 10px;
}

.cta-section .nav-tabs {
  border-bottom: 1px solid #dee2e6;
}

.cta-section .nav-tabs .nav-link {
  border: none;
  color: #495057;
  background-color: transparent;
  border-bottom: 2px solid transparent;
  padding: 10px 16px;
  font-weight: 500;
}

.cta-section .nav-tabs .nav-link.active {
  border-bottom-color: #ff7f00;
  color: #ff7f00;
}

.cta-section .btn-primary {
  background-color: #ff7f00;
  border-color: #ff7f00;
}

/* FAQ Section */
.accordion-item {
  border: none;
  margin-bottom: 15px;
  border-radius: 8px !important;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0,0,0,0.05);
}

.accordion-button {
  padding: 16px 20px;
  font-weight: 500;
  border-radius: 8px;
}

.accordion-button:not(.collapsed) {
  background-color: #fff;
  color: #ff7f00;
  box-shadow: none;
}

.accordion-button:focus {
  box-shadow: none;
  border-color: rgba(255, 127, 0, 0.2);
}

.accordion-button::after {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23ff7f00'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
}

.accordion-body {
  padding: 16px 20px;
  background-color: #fff;
  border-top: 1px solid #f1f1f1;
}

/* Responsive Adjustments */
@media (max-width: 992px) {
  .hero-section {
    text-align: center;
    padding: 60px 0;
  }
  
  .hero-section .btn-container {
    justify-content: center;
  }
  
  .cta-section {
    text-align: center;
  }
  
  .cta-section .card {
    margin-top: 30px;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 40px 0;
  }
  
  .hero-section h1 {
    font-size: 2.2rem;
  }
  
  .stat-card, .benefit-card {
    margin-bottom: 20px;
  }
  
  .step-timeline::after {
    left: 18px;
  }
}
</style>