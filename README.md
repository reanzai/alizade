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
*   **Firebase:** Google ile giriş (Authentication) ve Firestore veritabanı (kullanıcı profilleri, ayarlar ve oyun skorları için).
*   **MongoDB (Mongoose):** Alternatif veri saklama ve kullanıcı yönetimi (Self-hosted mod için).

## 📂 Proje Yapısı

```text
├── public/                 # Statik dosyalar (robots.txt, sitemap.xml vb.)
├── src/                    # Frontend (React) kaynak kodları
│   ├── components/         # Yeniden kullanılabilir UI bileşenleri (Oyunlar, Overlay vb.)
│   ├── App.tsx             # Ana React bileşeni ve uygulamanın kalbi
│   ├── main.tsx            # React uygulamasının başlangıç noktası
│   ├── firebase.ts         # Firebase yapılandırması ve yardımcı fonksiyonlar
│   ├── index.css           # Global Tailwind CSS stilleri
│   └── i18n.ts             # Dil ve çeviri yapılandırması
├── server.ts               # Backend (Express & Socket.IO) başlangıç noktası
├── index.html              # Ana HTML şablonu (SEO etiketleri içerir)
├── package.json            # Proje bağımlılıkları ve script'ler
├── vite.config.ts          # Vite yapılandırma dosyası
└── README.md               # Proje dökümantasyonu
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
