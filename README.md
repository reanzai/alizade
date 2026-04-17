# TikGifty - TikTok Canlı Yayın Etkileşim Paneli

TikGifty, TikTok canlı yayıncıları için geliştirilmiş, izleyici etkileşimini artırmayı hedefleyen kapsamlı bir web uygulamasıdır. Canlı yayın sırasında gelen hediyeleri, yorumları, beğenileri ve takipleri anlık olarak takip eder; ekranda özel uyarılar (ses, GIF, TTS) gösterir ve izleyicilerin katılabileceği interaktif oyunlar (Kelime Oyunu, Beyblade, Pixel Conquest) sunar.

## 🚀 Kullanılan Teknolojiler

### Frontend (İstemci)
*   **React (Vite):** Hızlı ve modern kullanıcı arayüzü geliştirme altyapısı.
*   **TypeScript:** Statik tip kontrolü ile güvenli ve hatasız kod yazımı.
*   **Tailwind CSS:** Hızlı, esnek ve modern UI/UX tasarımı.
*   **Framer Motion:** Akıcı ve dinamik arayüz animasyonları.
*   **Socket.IO Client:** Sunucu ile gerçek zamanlı (real-time) çift yönlü iletişim.
*   **React Helmet Async:** SEO optimizasyonu ve dinamik meta etiket yönetimi.
*   **Lucide React:** Modern ve hafif ikon seti.
*   **i18next:** Çoklu dil (yerelleştirme) desteği.
*   **Swiper:** Modern ve dokunmatik destekli kaydırma (carousel) bileşenleri.

### Backend (Sunucu)
*   **Node.js & Express:** Hızlı ve ölçeklenebilir REST API ve sunucu altyapısı.
*   **Socket.IO:** TikTok canlı yayın verilerini anlık olarak istemciye iletme.
*   **TikTok Live Connector:** TikTok canlı yayınlarına bağlanıp anlık verileri (hediye, yorum, beğeni vb.) çekmek için kullanılan açık kaynaklı kütüphane.
*   **Multer:** Kullanıcıların özel ses ve görsel dosyalarını yükleyebilmesi için dosya yükleme yönetimi.

### Veritabanı ve Kimlik Doğrulama
*   **PostgreSQL:** Uygulamanın ana veritabanı olarak seçildi (User, Wallet ve Settings verileri için).
*   **Prisma ORM:** Tip güvenliği ve veritabanı sorgu yönetimi için kullanılan modern SQL arayüzü.
*   **Firebase (Opsiyonel):** Google ile giriş (Authentication) desteği. (Sistem artık öncelikli olarak PostgreSQL & Express tabanlı 'Self-hosted' mimariyi kullanmaktadır).

## 🛠️ Yapılan Son Güncellemeler (PostgreSQL Geçişi)

Projeye eklenen ve güncellenen temel özellikler:

1.  **MongoDB'den PostgreSQL'e Geçiş:**
    *   Veritabanı altyapısı MongoDB'den tamamen PostgreSQL'e taşındı.
    *   `prisma/schema.prisma` yapılandırması PostgreSQL ve UUID (Benzersiz Kimlik) sistemine göre optimize edildi.
    *   Mongoose bağımlılığı projeden kaldırıldı ve tüm veritabanı işlemleri `@prisma/client` üzerinden yönetilmeye başlandı.

2.  **Prisma Entegrasyonu:**
    *   `PrismaClient` kullanılarak `User`, `Wallet` ve `Settings` modelleri oluşturuldu.
    *   `prisma.config.ts` üzerinden dinamik veritabanı bağlantı yönetimi sağlandı.

3.  **Backend (Sunucu) Modernizasyonu:**
    *   Kayıt, giriş ve kullanıcı verisi çekme işlemleri PostgreSQL/Prisma altyapısına uyarlandı.
    *   Ayarlar (`Settings`) yönetimi, tüm konfigürasyonu (Hediye ayarları, oyun tabloları vb.) tek bir tabloda tutacak şekilde `upsert` (varsa güncelle, yoksa oluştur) mimarisine dönüştürüldü.
    *   NoSQL'e özgü filtreler (mongo-sanitize vb.) kaldırılarak SQL güvenliği için gerekli önlemler alındı.

4.  **Frontend (İstemci) Uyarlamaları:**
    *   Uygulama artık varsayılan olarak `IS_SELF_HOSTED` modunda çalışarak PostgreSQL tabanlı backend ile konuşmaktadır.
    *   Hediye ayarları ve oyun lider tabloları gibi dağınık API çağrıları merkezi `/api/settings` endpoint'inde birleştirildi.
    *   Veri yapılarındaki `_id` bağımlılığı `id` yapısına güncellenerek SQL uyumluluğu sağlandı.

## 📂 Proje Yapısı

```text
├── prisma/                 # Veritabanı şeması ve migrasyon dosyaları
├── public/                 # Statik dosyalar (robots.txt, sitemap.xml vb.)
├── src/                    # Frontend (React) kaynak kodları
│   ├── components/         # UI bileşenleri (Oyunlar, Overlay vb.)
│   ├── App.tsx             # Ana React bileşeni (Uygulamanın kalbi)
│   ├── firebase.ts         # Firebase yardımcı fonksiyonları
│   └── i18n.ts             # Dil ve çeviri yapılandırması
├── server.ts               # Backend (Express & Socket.IO & Prisma)
├── prisma.config.ts        # Prisma veritabanı bağlantı ayarları
├── .env.example            # Gerekli değişkenlerin (DATABASE_URL vb.) şablonu
└── package.json            # Bağımlılıklar ve script'ler
```

## ⚙️ Nasıl Çalışır?

1.  **Bağlantı:** Kullanıcı, TikGifty paneline giriş yapar ve TikTok kullanıcı adını girerek "Bağlan" butonuna tıklar.
2.  **Veri Çekme (Backend):** Node.js sunucusu, `tiktok-live-connector` kütüphanesini kullanarak belirtilen TikTok hesabının canlı yayınına WebSocket üzerinden bağlanır.
3.  **Olay Dinleme (Event Listening):** Sunucu; canlı yayındaki sohbetleri, gönderilen hediyeleri, beğenileri ve yeni takipçileri dinlemeye başlar.
4.  **Gerçek Zamanlı İletim:** Yakalanan her olay (event), `Socket.IO` aracılığıyla anında React frontend'ine (istemciye) iletilir.
5.  **Görselleştirme ve Etkileşim (Frontend):** Frontend, gelen bu verileri işler:
    *   Ekranda özel hediye uyarıları (Alerts) çıkarır.
    *   Yazı-Sese (TTS - Text-to-Speech) özelliği ile gelen mesajları okur.
    *   İzleyicilerin gönderdiği hediyelere veya yorumlara göre oyunları (Beyblade, Pixel Conquest vb.) tetikler ve günceller.
6.  **OBS Entegrasyonu:** Kullanıcılar, "Overlay" modunu kullanarak kendilerine özel oluşturulan URL'yi OBS (Open Broadcaster Software) gibi yayın programlarına "Tarayıcı Kaynağı" (Browser Source) olarak ekler ve grafikleri doğrudan yayın ekranına yansıtır.

## 🛠 Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için:

1.  Bağımlılıkları yükleyin:
    ```bash
    npm install
    ```
2.  Geliştirme sunucusunu başlatın (Hem frontend hem backend aynı anda çalışır):
    ```bash
    npm run dev
    ```
3.  Tarayıcınızda `http://localhost:3000` adresine gidin.
