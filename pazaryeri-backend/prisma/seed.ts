import { PrismaClient, Role, StoreStatus } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // CompanyType verilerini oluştur
  const companyTypes = await Promise.all([
    prisma.companyType.create({
      data: {
        name: 'Limited Şirket',
        taxRate: 18.0,
      },
    }),
    prisma.companyType.create({
      data: {
        name: 'Anonim Şirket',
        taxRate: 20.0,
      },
    }),
    prisma.companyType.create({
      data: {
        name: 'Şahıs Şirket',
        taxRate: 15.0,
      },
    }),
  ]);

  // Admin kullanıcı oluştur
  const adminPassword = await hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
    },
  });

  // Normal kullanıcılar oluştur
  const userPassword = await hash('password123', 10);
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'ahmet@example.com',
        passwordHash: userPassword,
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        role: Role.USER,
        addresses: {
          create: [
            {
              addressTitle: 'Ev',
              fullName: 'Ahmet Yılmaz',
              phone: '5301234567',
              city: 'İstanbul',
              district: 'Kadıköy',
              neighborhood: 'Caferağa',
              fullAddress: 'Moda Cad. No:123 D:5',
              isDefault: true,
            },
            {
              addressTitle: 'İş',
              fullName: 'Ahmet Yılmaz',
              phone: '5301234567',
              city: 'İstanbul',
              district: 'Şişli',
              neighborhood: 'Mecidiyeköy',
              fullAddress: 'Büyükdere Cad. No:45 K:8',
              isDefault: false,
            },
          ],
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'ayse@example.com',
        passwordHash: userPassword,
        firstName: 'Ayşe',
        lastName: 'Demir',
        role: Role.USER,
        addresses: {
          create: [
            {
              addressTitle: 'Ev',
              fullName: 'Ayşe Demir',
              phone: '5329876543',
              city: 'Ankara',
              district: 'Çankaya',
              neighborhood: 'Bahçelievler',
              fullAddress: 'Birinci Cadde No:42 D:7',
              isDefault: true,
            },
          ],
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'mehmet@example.com',
        passwordHash: userPassword,
        firstName: 'Mehmet',
        lastName: 'Kaya',
        role: Role.USER,
        addresses: {
          create: [
            {
              addressTitle: 'Ev',
              fullName: 'Mehmet Kaya',
              phone: '5415556677',
              city: 'İzmir',
              district: 'Karşıyaka',
              neighborhood: 'Bostanlı',
              fullAddress: 'Cemal Gürsel Cad. No:78 D:3',
              isDefault: true,
            },
          ],
        },
      },
    }),
  ]);

  // Mağazalar oluştur
  const storePassword = await hash('store123', 10);
  const stores = await Promise.all([
    prisma.store.create({
      data: {
        email: 'teknomarket@example.com',
        password: storePassword,
        name: 'TeknoMarket',
        ownerEmail: 'owner@teknomarket.com',
        ownerPhone: '5321112233',
        ownerFirstName: 'Kemal',
        ownerLastName: 'Öztürk',
        companyTypeId: companyTypes[0].id,
        taxNumber: '1234567890',
        companyName: 'TeknoMarket Ltd. Şti.',
        taxOffice: 'Kadıköy',
        iban: 'TR123456789012345678901234',
        address: 'Bağdat Cad. No:152, Kadıköy, İstanbul',
        phone: '2163334455',
        status: StoreStatus.APPROVED,
      },
    }),
    prisma.store.create({
      data: {
        email: 'modabutik@example.com',
        password: storePassword,
        name: 'Moda Butik',
        ownerEmail: 'owner@modabutik.com',
        ownerPhone: '5354445566',
        ownerFirstName: 'Zeynep',
        ownerLastName: 'Aydın',
        companyTypeId: companyTypes[2].id,
        taxNumber: '9876543210',
        companyName: null,
        taxOffice: 'Şişli',
        iban: 'TR987654321098765432109876',
        address: 'Nişantaşı, Teşvikiye Mah. Abdi İpekçi Cad. No:23, Şişli, İstanbul',
        phone: '2129998877',
        status: StoreStatus.APPROVED,
      },
    }),
    prisma.store.create({
      data: {
        email: 'evdekor@example.com',
        password: storePassword,
        name: 'Ev Dekor',
        ownerEmail: 'owner@evdekor.com',
        ownerPhone: '5366667788',
        ownerFirstName: 'Ali',
        ownerLastName: 'Yıldız',
        companyTypeId: companyTypes[1].id,
        taxNumber: '5678901234',
        companyName: 'Ev Dekor A.Ş.',
        taxOffice: 'Beşiktaş',
        iban: 'TR567890123456789012345678',
        address: 'Levent Mah. Büyükdere Cad. No:189, Beşiktaş, İstanbul',
        phone: '2123332211',
        status: StoreStatus.APPROVED,
      },
    }),
  ]);

  // Kategoriler oluştur - Üç seviyeli yapı
  // Ana kategoriler
  const elektronik = await prisma.category.create({
    data: {
      name: 'Elektronik',
      description: 'Elektronik ürünler',
      level: 0,
      isActive: true,
    },
  });

  const giyim = await prisma.category.create({
    data: {
      name: 'Giyim',
      description: 'Giyim ürünleri',
      level: 0,
      isActive: true,
    },
  });

  const evYasam = await prisma.category.create({
    data: {
      name: 'Ev & Yaşam',
      description: 'Ev ve yaşam ürünleri',
      level: 0,
      isActive: true,
    },
  });

  // Elektronik alt kategorileri (level 1)
  const bilgisayar = await prisma.category.create({
    data: {
      name: 'Bilgisayar',
      description: 'Bilgisayar ve bilgisayar ekipmanları',
      level: 1,
      isActive: true,
      parentId: elektronik.id,
    },
  });

  const telefon = await prisma.category.create({
    data: {
      name: 'Telefon',
      description: 'Akıllı telefonlar ve aksesuarlar',
      level: 1,
      isActive: true,
      parentId: elektronik.id,
    },
  });

  const tvSes = await prisma.category.create({
    data: {
      name: 'TV & Ses Sistemleri',
      description: 'Televizyon ve ses sistemleri',
      level: 1,
      isActive: true,
      parentId: elektronik.id,
    },
  });

  // Giyim alt kategorileri (level 1)
  const kadinGiyim = await prisma.category.create({
    data: {
      name: 'Kadın Giyim',
      description: 'Kadın giyim ürünleri',
      level: 1,
      isActive: true,
      parentId: giyim.id,
    },
  });

  const erkekGiyim = await prisma.category.create({
    data: {
      name: 'Erkek Giyim',
      description: 'Erkek giyim ürünleri',
      level: 1,
      isActive: true,
      parentId: giyim.id,
    },
  });

  const cocukGiyim = await prisma.category.create({
    data: {
      name: 'Çocuk Giyim',
      description: 'Çocuk giyim ürünleri',
      level: 1,
      isActive: true,
      parentId: giyim.id,
    },
  });

  // Ev & Yaşam alt kategorileri (level 1)
  const mobilya = await prisma.category.create({
    data: {
      name: 'Mobilya',
      description: 'Ev mobilyaları',
      level: 1,
      isActive: true,
      parentId: evYasam.id,
    },
  });

  const mutfak = await prisma.category.create({
    data: {
      name: 'Mutfak',
      description: 'Mutfak ürünleri ve gereçleri',
      level: 1,
      isActive: true,
      parentId: evYasam.id,
    },
  });

  const dekorasyon = await prisma.category.create({
    data: {
      name: 'Dekorasyon',
      description: 'Ev dekorasyon ürünleri',
      level: 1,
      isActive: true,
      parentId: evYasam.id,
    },
  });

  // Elektronik > Bilgisayar alt kategorileri (level 2)
  const laptop = await prisma.category.create({
    data: {
      name: 'Laptop',
      description: 'Dizüstü bilgisayarlar',
      level: 2,
      isActive: true,
      parentId: bilgisayar.id,
    },
  });

  const masaustu = await prisma.category.create({
    data: {
      name: 'Masaüstü Bilgisayar',
      description: 'Masaüstü bilgisayar sistemleri',
      level: 2,
      isActive: true,
      parentId: bilgisayar.id,
    },
  });

  const bilgisayarBilesenler = await prisma.category.create({
    data: {
      name: 'Bilgisayar Bileşenleri',
      description: 'Bilgisayar parçaları ve yedek parçaları',
      level: 2,
      isActive: true,
      parentId: bilgisayar.id,
    },
  });

  // Elektronik > Telefon alt kategorileri (level 2)
  const akillıTelefon = await prisma.category.create({
    data: {
      name: 'Akıllı Telefon',
      description: 'Akıllı telefonlar',
      level: 2,
      isActive: true,
      parentId: telefon.id,
    },
  });

  const telefonAksesuarlar = await prisma.category.create({
    data: {
      name: 'Telefon Aksesuarları',
      description: 'Telefon kılıfları, şarj cihazları vb.',
      level: 2,
      isActive: true,
      parentId: telefon.id,
    },
  });

  // Elektronik > TV & Ses alt kategorileri (level 2)
  const televizyon = await prisma.category.create({
    data: {
      name: 'Televizyon',
      description: 'Televizyon çeşitleri',
      level: 2,
      isActive: true,
      parentId: tvSes.id,
    },
  });

  const sesSistemi = await prisma.category.create({
    data: {
      name: 'Ses Sistemi',
      description: 'Ses sistemleri ve hoparlörler',
      level: 2,
      isActive: true,
      parentId: tvSes.id,
    },
  });

  // Giyim > Kadın Giyim alt kategorileri (level 2)
  const kadinUstGiyim = await prisma.category.create({
    data: {
      name: 'Üst Giyim',
      description: 'Kadın üst giyim ürünleri',
      level: 2,
      isActive: true,
      parentId: kadinGiyim.id,
    },
  });

  const kadinAltGiyim = await prisma.category.create({
    data: {
      name: 'Alt Giyim',
      description: 'Kadın alt giyim ürünleri',
      level: 2,
      isActive: true,
      parentId: kadinGiyim.id,
    },
  });

  // Giyim > Erkek Giyim alt kategorileri (level 2)
  const erkekUstGiyim = await prisma.category.create({
    data: {
      name: 'Üst Giyim',
      description: 'Erkek üst giyim ürünleri',
      level: 2,
      isActive: true,
      parentId: erkekGiyim.id,
    },
  });

  const erkekAltGiyim = await prisma.category.create({
    data: {
      name: 'Alt Giyim',
      description: 'Erkek alt giyim ürünleri',
      level: 2,
      isActive: true,
      parentId: erkekGiyim.id,
    },
  });

  // Ev & Yaşam > Mobilya alt kategorileri (level 2)
  const oturmaOdasi = await prisma.category.create({
    data: {
      name: 'Oturma Odası',
      description: 'Oturma odası mobilyaları',
      level: 2,
      isActive: true,
      parentId: mobilya.id,
    },
  });

  const yatak = await prisma.category.create({
    data: {
      name: 'Yatak Odası',
      description: 'Yatak odası mobilyaları',
      level: 2,
      isActive: true,
      parentId: mobilya.id,
    },
  });

  // Ev & Yaşam > Mutfak alt kategorileri (level 2)
  const pisirme = await prisma.category.create({
    data: {
      name: 'Pişirme',
      description: 'Pişirme gereçleri',
      level: 2,
      isActive: true,
      parentId: mutfak.id,
    },
  });

  const sofra = await prisma.category.create({
    data: {
      name: 'Sofra',
      description: 'Sofra düzeni ve servis ürünleri',
      level: 2,
      isActive: true,
      parentId: mutfak.id,
    },
  });

  // Markalar oluştur
  const brands = await Promise.all([
    prisma.brand.create({
      data: {
        name: 'Apple',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Samsung',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Asus',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Mavi',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Koton',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Bellona',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Karaca',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Korkmaz',
      },
    }),
  ]);

  // Ürünler oluştur - TeknoMarket için ürünler
  const appleIphone = await prisma.product.create({
    data: {
      name: 'iPhone 15 Pro',
      description: 'Apple iPhone 15 Pro 256GB Titanium Blue',
      price: 39999.99,
      stock: 50,
      sku: 'IPH15PRO-256-BLUE',
      barcode: '1234567890123',
      weight: 221.0,
      dimensions: '147.6 x 71.6 x 8.25 mm',
      isActive: true,
      isFeature: true,
      imageUrl: 'https://example.com/images/iphone15pro.jpg',
      brandId: brands[0].id,
      storeId: stores[0].id,
      attributes: {
        create: [
          { name: 'Renk', value: 'Titanium Blue' },
          { name: 'Dahili Hafıza', value: '256GB' },
          { name: 'RAM', value: '8GB' },
          { name: 'İşletim Sistemi', value: 'iOS 17' },
        ],
      },
      categories: {
        create: [
          { categoryId: akillıTelefon.id },
        ],
      },
      images: {
        create: [
          { url: 'https://example.com/images/iphone15pro_1.jpg' },
          { url: 'https://example.com/images/iphone15pro_2.jpg' },
          { url: 'https://example.com/images/iphone15pro_3.jpg' },
        ],
      },
      variants: {
        create: [
          { name: 'iPhone 15 Pro 512GB Titanium Blue', sku: 'IPH15PRO-512-BLUE', price: 44999.99, stock: 30 },
          { name: 'iPhone 15 Pro 256GB Titanium Black', sku: 'IPH15PRO-256-BLACK', price: 39999.99, stock: 45 },
        ],
      },
    },
  });

  const asusLaptop = await prisma.product.create({
    data: {
      name: 'Asus ROG Strix G15',
      description: 'Asus ROG Strix G15 Gaming Laptop, AMD Ryzen 9, RTX 3070, 16GB RAM, 1TB SSD',
      price: 34999.90,
      stock: 25,
      sku: 'ASUS-ROGG15-R9',
      barcode: '9876543210123',
      weight: 2.3,
      dimensions: '360 x 275 x 20.7 mm',
      isActive: true,
      isFeature: true,
      imageUrl: 'https://example.com/images/asus_rog_g15.jpg',
      brandId: brands[2].id,
      storeId: stores[0].id,
      attributes: {
        create: [
          { name: 'İşlemci', value: 'AMD Ryzen 9 5900HX' },
          { name: 'Ekran Kartı', value: 'NVIDIA RTX 3070 8GB' },
          { name: 'RAM', value: '16GB' },
          { name: 'Depolama', value: '1TB SSD' },
          { name: 'Ekran', value: '15.6 inç FHD 300Hz' },
        ],
      },
      categories: {
        create: [
          { categoryId: laptop.id },
        ],
      },
      images: {
        create: [
          { url: 'https://example.com/images/asus_rog_g15_1.jpg' },
          { url: 'https://example.com/images/asus_rog_g15_2.jpg' },
        ],
      },
      variants: {
        create: [
          { name: 'Asus ROG Strix G15 - 32GB RAM', sku: 'ASUS-ROGG15-R9-32GB', price: 37999.90, stock: 15 },
          { name: 'Asus ROG Strix G15 - 2TB SSD', sku: 'ASUS-ROGG15-R9-2TB', price: 36999.90, stock: 20 },
        ],
      },
    },
  });

  const samsungTV = await prisma.product.create({
    data: {
      name: 'Samsung Neo QLED 4K Smart TV',
      description: 'Samsung 65" QN90B Neo QLED 4K Smart TV (2022)',
      price: 29999.90,
      stock: 15,
      sku: 'SAMSUNG-QN90B-65',
      barcode: '8765432109876',
      weight: 28.6,
      dimensions: '1447.9 x 830.9 x 39.1 mm',
      isActive: true,
      isFeature: true,
      imageUrl: 'https://example.com/images/samsung_neo_qled.jpg',
      brandId: brands[1].id,
      storeId: stores[0].id,
      attributes: {
        create: [
          { name: 'Ekran Boyutu', value: '65 inç' },
          { name: 'Çözünürlük', value: '4K UHD' },
          { name: 'HDR', value: 'Quantum HDR 32X' },
          { name: 'Ses', value: 'Dolby Atmos' },
          { name: 'Smart TV', value: 'Tizen' },
        ],
      },
      categories: {
        create: [
          { categoryId: televizyon.id },
        ],
      },
      images: {
        create: [
          { url: 'https://example.com/images/samsung_neo_qled_1.jpg' },
          { url: 'https://example.com/images/samsung_neo_qled_2.jpg' },
        ],
      },
      variants: {
        create: [
          { name: 'Samsung Neo QLED 4K Smart TV 55"', sku: 'SAMSUNG-QN90B-55', price: 24999.90, stock: 20 },
          { name: 'Samsung Neo QLED 4K Smart TV 75"', sku: 'SAMSUNG-QN90B-75', price: 39999.90, stock: 10 },
        ],
      },
    },
  });

  // Moda Butik için ürünler
  const kadinCeket = await prisma.product.create({
    data: {
      name: 'Kadın Deri Ceket',
      description: 'Mavi Siyah Deri Ceket, Kadın',
      price: 1299.99,
      stock: 40,
      sku: 'MAVI-DRCKT-01',
      barcode: '7654321098765',
      weight: 1.2,
      dimensions: 'S,M,L,XL',
      isActive: true,
      isFeature: true,
      imageUrl: 'https://example.com/images/kadin_deri_ceket.jpg',
      brandId: brands[3].id,
      storeId: stores[1].id,
      attributes: {
        create: [
          { name: 'Renk', value: 'Siyah' },
          { name: 'Malzeme', value: 'Suni Deri' },
          { name: 'Tarz', value: 'Casual' },
          { name: 'Mevsim', value: 'Sonbahar/Kış' },
        ],
      },
      categories: {
        create: [
          { categoryId: kadinUstGiyim.id },
        ],
      },
      images: {
        create: [
          { url: 'https://example.com/images/kadin_deri_ceket_1.jpg' },
          { url: 'https://example.com/images/kadin_deri_ceket_2.jpg' },
        ],
      },
      variants: {
        create: [
          { name: 'Kadın Deri Ceket - S', sku: 'MAVI-DRCKT-01-S', price: 1299.99, stock: 10 },
          { name: 'Kadın Deri Ceket - M', sku: 'MAVI-DRCKT-01-M', price: 1299.99, stock: 15 },
          { name: 'Kadın Deri Ceket - L', sku: 'MAVI-DRCKT-01-L', price: 1299.99, stock: 10 },
          { name: 'Kadın Deri Ceket - XL', sku: 'MAVI-DRCKT-01-XL', price: 1299.99, stock: 5 },
        ],
      },
    },
  });

  const erkekJean = await prisma.product.create({
    data: {
      name: 'Erkek Slim Fit Jean',
      description: 'Koton Erkek Lacivert Slim Fit Jean Pantolon',
      price: 399.99,
      stock: 70,
      sku: 'KOTON-JEANS-5123',
      barcode: '6543210987654',
      weight: 0.8,
      dimensions: '29/30/31/32/33/34',
      isActive: true,
      isFeature: false,
      imageUrl: 'https://example.com/images/erkek_jean.jpg',
      brandId: brands[4].id,
      storeId: stores[1].id,
      attributes: {
        create: [
          { name: 'Renk', value: 'Lacivert' },
          { name: 'Stil', value: 'Slim Fit' },
          { name: 'Malzeme', value: '%98 Pamuk, %2 Elastan' },
          { name: 'Bel Tipi', value: 'Normal Bel' },
        ],
      },
      categories: {
        create: [
          { categoryId: erkekAltGiyim.id },
        ],
      },
      images: {
        create: [
          { url: 'https://example.com/images/erkek_jean_1.jpg' },
          { url: 'https://example.com/images/erkek_jean_2.jpg' },
        ],
      },
      variants: {
        create: [
          { name: 'Erkek Slim Fit Jean - 30/32', sku: 'KOTON-JEANS-5123-30-32', price: 399.99, stock: 15 },
          { name: 'Erkek Slim Fit Jean - 32/32', sku: 'KOTON-JEANS-5123-32-32', price: 399.99, stock: 20 },
          { name: 'Erkek Slim Fit Jean - 34/32', sku: 'KOTON-JEANS-5123-34-32', price: 399.99, stock: 15 },
          { name: 'Erkek Slim Fit Jean - 36/32', sku: 'KOTON-JEANS-5123-36-32', price: 399.99, stock: 10 },
        ],
      },
    },
  });

  // Ev Dekor için ürünler
  const koltukTakimi = await prisma.product.create({
    data: {
      name: 'Modern Koltuk Takımı',
      description: 'Bellona Modern 3+3+1 Koltuk Takımı',
      price: 12999.99,
      stock: 8,
      sku: 'BELLONA-KT-352',
      barcode: '5432109876543',
      weight: 120.0,
      dimensions: '240x90x85 cm (3lü) / 220x90x85 cm (3lü) / 90x85x85 cm (Berjer)',
      isActive: true,
      isFeature: true,
      imageUrl: 'https://example.com/images/koltuk_takimi.jpg',
      brandId: brands[5].id,
      storeId: stores[2].id,
      attributes: {
        create: [
          { name: 'Renk', value: 'Krem' },
          { name: 'Materyal', value: 'Kumaş' },
          { name: 'Ayak Tipi', value: 'Ahşap' },
          { name: 'Koltuk Özellikleri', value: 'Yataklı, Sandıklı' },
        ],
      },
      categories: {
        create: [
          { categoryId: oturmaOdasi.id },
        ],
      },
      images: {
        create: [
          { url: 'https://example.com/images/koltuk_takimi_1.jpg' },
          { url: 'https://example.com/images/koltuk_takimi_2.jpg' },
          { url: 'https://example.com/images/koltuk_takimi_3.jpg' },
        ],
      },
      variants: {
        create: [
          { name: 'Modern Koltuk Takımı - Kahverengi', sku: 'BELLONA-KT-352-KAHVE', price: 12999.99, stock: 5 },
          { name: 'Modern Koltuk Takımı - Gri', sku: 'BELLONA-KT-352-GRI', price: 13499.99, stock: 3 },
        ],
      },
    },
  });

  const yemekTakimi = await prisma.product.create({
    data: {
      name: 'Porselen Yemek Takımı',
      description: 'Karaca Fine Pearl 26 Parça Porselen Yemek Takımı',
      price: 2499.99,
      stock: 25,
      sku: 'KARACA-YT-26P',
      barcode: '4321098765432',
      weight: 9.5,
      dimensions: 'Standart',
      isActive: true,
      isFeature: true,
      imageUrl: 'https://example.com/images/yemek_takimi.jpg',
      brandId: brands[6].id,
      storeId: stores[2].id,
      attributes: {
        create: [
          { name: 'Renk', value: 'Beyaz/Altın' },
          { name: 'Malzeme', value: 'Porselen' },
          { name: 'Parça Sayısı', value: '26' },
          { name: 'Bulaşık Makinesi', value: 'Uyumlu' },
        ],
      },
      categories: {
        create: [
          { categoryId: sofra.id },
        ],
      },
      images: {
        create: [
          { url: 'https://example.com/images/yemek_takimi_1.jpg' },
          { url: 'https://example.com/images/yemek_takimi_2.jpg' },
        ],
      },
      variants: {
        create: [
          { name: 'Porselen Yemek Takımı - 12 Parça', sku: 'KARACA-YT-12P', price: 1699.99, stock: 20 },
          { name: 'Porselen Yemek Takımı - 36 Parça', sku: 'KARACA-YT-36P', price: 3299.99, stock: 15 },
        ],
      },
    },
  });

  const tencereSeti = await prisma.product.create({
    data: {
      name: 'Çelik Tencere Seti',
      description: 'Korkmaz Flora 8 Parça Çelik Tencere Seti',
      price: 1799.99,
      stock: 18,
      sku: 'KORKMAZ-TS-8P',
      barcode: '3210987654321',
      weight: 6.8,
      dimensions: 'Standart',
      isActive: true,
      isFeature: false,
      imageUrl: 'https://example.com/images/tencere_seti.jpg',
      brandId: brands[7].id,
      storeId: stores[2].id,
      attributes: {
        create: [
          { name: 'Renk', value: 'Gümüş' },
          { name: 'Malzeme', value: 'Paslanmaz Çelik' },
          { name: 'Parça Sayısı', value: '8' },
          { name: 'Ocak Uyumluluğu', value: 'Tüm Ocak Tipleri' },
        ],
      },
      categories: {
        create: [
          { categoryId: pisirme.id },
        ],
      },
      images: {
        create: [
          { url: 'https://example.com/images/tencere_seti_1.jpg' },
          { url: 'https://example.com/images/tencere_seti_2.jpg' },
        ],
      },
      variants: {
        create: [
          { name: 'Çelik Tencere Seti - 6 Parça', sku: 'KORKMAZ-TS-6P', price: 1499.99, stock: 15 },
          { name: 'Çelik Tencere Seti - 10 Parça', sku: 'KORKMAZ-TS-10P', price: 1999.99, stock: 12 },
        ],
      },
    },
  });
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });