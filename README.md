# TikGifty - A'dan Z'ye TikTok Canlı Yayın Etkileşim ve Oyun Platformu

TikGifty, TikTok yayıncılarının canlı yayınlarını daha interaktif, eğlenceli ve kazançlı hale getirmelerini sağlayan tam kapsamlı bir platformdur. TikFinity gibi popüler platformların özelliklerini modern web teknolojileri ile sunar. İzleyicilerin gönderdiği TikTok hediyeleri, yaptığı takipler, beğeniler ve sohbet (chat) komutları ile ekranda eylemler (sesler, animasyonlar, metin okuma - TTS) tetiklenebilir veya "Türkiye Harita Savaşı", "Beyblade", "Pixel Conquest" gibi stratejik izleyici oyunları oynatılabilir.

---

## 💾 Veritabanı Yapısı (Database)

Projede veritabanı olarak **PostgreSQL**, veritabanı yönetimi ve iletişimi (ORM) için ise **Prisma** kullanılmaktadır.

*   **Neden PostgreSQL?** Dünyanın en gelişmiş açık kaynaklı, ilişkisel (Relational) veritabanı sistemidir. Kullanıcı hesapları, bakiyeler (wallets), ayarlar ve abonelik sistemleri gibi kritik, birbirine bağlı ve yapısal verilerin kaybolmadan, en yüksek güvenlik ile saklanmasını sağlar. (Büyük verilerde dahi çökme yapmaz, ACID standartlarına tam uyar.)
*   **Prisma ORM Nedir?** Node.js tarafında veritabanına doğrudan SQL sorguları yazmak yerine tiplerin korunduğu (Type-Safe) bir köprüdür. `prisma/schema.prisma` dosyasında tablolarınız tasarlanır ve bu tasarım kodlara otomatik olarak güvenli bir şekilde aktarılır. Bu sayede veritabanı kaynaklı çökmelerin önüne geçilir.

---

## 💻 Kullanılan Teknolojiler (Tech Stack)

### 🎨 Frontend (Kullanıcı Arayüzü / Önyüz)
*   **React 18:** Modern ve bileşen bazlı arayüz yapısı.
*   **Vite:** Yeni nesil, inanılmaz hızlı frontend derleyici ve geliştirme sunucusu.
*   **TypeScript:** Statik tip kontrolleri ile hataları kod yazarken yakalamayı sağlayan JavaScript üst kümesi.
*   **Tailwind CSS:** Hızlı, responsive (mobil uyumlu) ve modern tasarımlar yapabilmeyi sağlayan utility-first CSS framework'ü.
*   **Framer Motion (`motion/react`):** Akıcı sayfa geçişleri, modal açılışları ve ekran üstü (overlay) şov animasyonları için güçlü animasyon kütüphanesi.
*   **Zustand / Context API:** Uygulama içi (oyun durumları, kullanıcı ayarları) durum (state) yönetimi.

### ⚙️ Backend (Sunucu / Arkayüz)
*   **Node.js & Express:** Hızlı, modern API ve yönlendirme (Routing) mimarisi.
*   **Socket.io (WebSockets):** Sunucu ile Frontend (Kullanıcı ve OBS Overlay'i) arasında çift yönlü, milisaniyelik gecikme ile gerçek zamanlı (Real-Time) veri aktarımı yapan kütüphane.
*   **tiktok-live-connector:** TikTok'un canlı yayın sunucularına bağlanıp Webcast üzerinden akan hediye/chat verilerini makine kodundan JSON formatına çeviren özel modül.
*   **JWT (JSON Web Token) & Bcrypt:** Kullanıcıların güvenle giriş yapmasını ve şifrelerin şifrelenerek veri tabanında saklanmasını sağlayan mimari.
*   **Multer:** Platforma özel resim veya ses yüklemeleri (upload) yapabilmek için dosya sistemi yöneticisi.

---

## 🔄 Sistem A'dan Z'ye Nasıl Çalışıyor? (Mantıksal Akış)

1.  **Bağlantı Kurulumu:** Kullanıcı TikGifty paneline girer ve TikTok kullanıcı adını yazarak "Bağlan" der.
2.  **Arka Plan Dinleme:** Node.js Backend sunucusundaki `tiktok-live-connector` modülü, devreye girer. İlgili kullanıcının yayınına sanki bir izleyici gibi WebSocket bağlantısı kurar. 
3.  **Verinin Alınması:** Yayın sırasında atılan her yorum (Chat), gönderilen her hediye (Gift), Beğeni (Like) ve Takipçi (Follow) anında TikTok sunucularından bizim sunucumuza ping olarak düşer.
4.  **İşleme Teknolojisi:** Node.js backend'imiz bu logları temizler. Eğer hediye atıldıysa, Prisma'ya haber vererek izleyicinin sisteme kayıtlı istatistiklerini günceller.
5.  **Anlık Aktarım (Socket.io):** Backend, bu eşleşen verileri "Hey, 100 Coinlik Rose atıldı!" şeklinde Socket.io kanalı üzerinden OBS'te açık olan (Browser Source) Frontend kaplama (Overlay) ekranlarına anında fırlatır.
6.  **Görsel Şov (Frontend):** React arayüzü bu hediye pingini aldığı an, yayıncının panelinde ayarladığı Eylemlere (Actions & Events) bakar. "Rose gelirse ekranda GIF göster ve ses çıkart" ayarını bulur, React devreye girer, resmi ekranda çizer (Framer Motion ile animasyon katar) ve sesi hoparlöre yansıtır.

---

## 🌍 VPS Kurulum / Yayına Alma ve Son Kullanıcıya Sunma Rehberi

Projeyi kendi VDS/VPS (Virtual Private Server) sunucunuzda (Örn: DigitalOcean, Hetzner, AWS, Vultr vb.) yayınlayıp prodüksiyon ortamında (Son Kullanıcıya) sunmak için aşağıdaki adımları sırasıyla uygulayınız. *(İşletim sistemi olarak **Ubuntu 20.04 veya 22.04 LTS** tavsiye edilir.)*

### 1. Sunucu Hazırlıkları ve Gereksinimlerin Yüklenmesi
Sunucunuza SSH erişimi sağlayın ve sistemi güncelleyin:
```bash
sudo apt update && sudo apt upgrade -y
```

Temel yazılımları (Node.js, NPM, PostgreSQL, Nginx, PM2) kurun:
```bash
# Node.js (v18+) Kurulumu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-install -y nodejs git curl

# PostgreSQL Kurulumu
sudo apt install postgresql postgresql-contrib -y

# PM2 (Arka planda server'ı canlı tutmak için) Kurulumu
sudo npm install -g pm2 tsx

# Nginx Server (Reverse Proxy için) Kurulumu
sudo apt install nginx -y
```

### 2. Veritabanı (PostgreSQL) Başlatılması
Postgres komut satırına girerek kullanıcımızı ve veritabanımızı açalım:
```bash
sudo -i -u postgres
psql

# SQL Komutları (Kendinize göre isim ve şifre belirleyebilirsiniz):
CREATE DATABASE tikgifty;
CREATE USER tikgifty_user WITH PASSWORD 'GUCLU_BIR_SIFRE_YAZIN';
ALTER ROLE tikgifty_user SET client_encoding TO 'utf8';
ALTER ROLE tikgifty_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE tikgifty_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE tikgifty TO tikgifty_user;
\q
exit
```

### 3. Projenin Sunucuya İndirilmesi ve Ayarlanması
Projeyi sunucuya çekin (veya dosyalarınızı SFTP ile sunucuya atın):
```bash
cd /opt
sudo git clone https://github.com/KULLANICI/tikgifty_proje.git tikgifty
cd tikgifty
sudo chown -R $USER:$USER /opt/tikgifty
```

Gerekli modülleri (Dependencies) yükleyin:
```bash
npm install
```

### 4. Çevre Değişkenleri (.env) ve Veritabanı Yüklemesi
Ana dizine bir `.env` dosyası oluşturun:
```bash
nano .env
```
İçerisine şu formatta verileri girin ve kaydedip (CTRL+O, Enter, CTRL+X) çıkın:
```env
DATABASE_URL="postgresql://tikgifty_user:GUCLU_BIR_SIFRE_YAZIN@localhost:5432/tikgifty?schema=public"
JWT_SECRET="sizin_cok_gizli_anahtariniz_12345"
PORT=3000
```

PostgreSQL veritabanını projeye entegre edin (Tabloları çekin/itin):
```bash
npx prisma generate
npx prisma db push
```

### 5. Projenin Derlenmesi ve PM2 ile Başlatılması
React ve Vite projesini üretim ortamı için hazır hale (Build) getirin:
```bash
npm run build
```

TypeScript tabanlı Node.js (Express) sunucumuzu PM2 ile başlatıp, sisteme sonsuza kadar çalışmasını söyleyelim:
```bash
pm2 start server.ts --interpreter tsx --name "tikgifty"
pm2 startup
pm2 save
```
*(Sunucunuz kapatılıp açılsa bile projeniz otomatik ayağa kalkacaktır.)*

### 6. İnternete Açma (Nginx ve Alan Adı - Domain Konfigürasyonu)
Kullanıcılarınızın IP adresi yerine `https://www.tikgifty.com` gibi alan adınızla giriş yapabilmesi için:

```bash
sudo nano /etc/nginx/sites-available/tikgifty
```
Açılan pencereye aşağıdakini yapıştırın (Alan adınızı kendinize göre güncelleyin):
```nginx
server {
    listen 80;
    server_name tikgifty.com www.tikgifty.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Nginx'i aktifleştirin ve yeniden başlatın:
```bash
sudo ln -s /etc/nginx/sites-available/tikgifty /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Güvenli Bağlantı (SSL / HTTPS) Alınması
Son olarak Let's Encrypt ile ücretsiz şekilde SSL sertifikanızı alın (Bu sayede TikTok kamera izinleri, OBS tarayıcı bağlantısı çalışır, güvenilir site ibaresi çıkar):
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d tikgifty.com -d www.tikgifty.com
```

**Tebrikler!** Artık sisteminiz `%100 Production-Ready` (Son kullanıcıya sunulmaya hazır) olarak VDS'inizde çalışıyor. Kullanıcılar `https://tikgifty.com` adresine girebilir, kayıt olabilir ve kendi yayınlarını OBS üzerinden eşzamanlı olarak bağlayıp kullanabilirler.
