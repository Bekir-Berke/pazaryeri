import { PrismaClient, Role, StoreStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

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
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });