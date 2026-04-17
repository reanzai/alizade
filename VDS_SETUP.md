# TikGifty VDS Kurulum Rehberi (Linux)

Bu rehber, TikGifty uygulamasını kendi Linux VDS sunucunuzda nasıl tam donanımlı (Full Stack) bir şekilde çalıştıracağınızı anlatır.

## 1. Gereksinimler
- Ubuntu 20.04 veya 22.04 VDS
- Node.js (v18+)
- MongoDB
- Nginx (Ters vekil sunucu için)
- Domain adresi (Örn: tikgifty.com)

## 2. Temel Kurulumlar

### Node.js Kurulumu
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y node.js
```

### MongoDB Kurulumu
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### PM2 (Süreç Yöneticisi) Kurulumu
```bash
sudo npm install -g pm2
```

## 3. Uygulama Kurulumu

1. Proje dosyalarını VDS'e yükleyin veya git ile çekin.
2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
3. `.env` dosyasını oluşturun:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://127.0.0.1:27017/tikgifty
   JWT_SECRET=senin_cok_gizli_anahtarin
   NODE_ENV=production
   VITE_SELF_HOSTED=true
   ```
4. Uygulamayı derleyin (Build):
   ```bash
   npm run build
   ```

## 4. Uygulamayı Başlatma
Uygulamayı PM2 ile arka planda sürekli çalışacak şekilde başlatın:
```bash
pm2 start server.ts --interpreter tsx --name tikgifty
pm2 save
pm2 startup
```

## 5. Nginx ve SSL Ayarları (Son Kullanıcıya Sunum)

### Nginx Yapılandırması
`/etc/nginx/sites-available/tikgifty` dosyasını oluşturun:
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
Sembolik link oluşturun ve Nginx'i yeniden başlatın:
```bash
sudo ln -s /etc/nginx/sites-available/tikgifty /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL (Certbot) Kurulumu
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tikgifty.com -d www.tikgifty.com
```

## 6. Önemli Notlar
- **TikTok Bağlantısı:** Sunucunuzun IP adresi TikTok tarafından engellenmiş olabilir. Eğer bağlantı hatası alıyorsanız, kaliteli bir proxy kullanmanız gerekebilir.
- **Güvenlik:** MongoDB'ye dışarıdan erişimi kapatın (Default olarak kapalıdır).
- **Güncellemeler:** Kodda değişiklik yaptığınızda `npm run build` komutunu çalıştırıp PM2'yi (`pm2 restart tikgifty`) yeniden başlatmayı unutmayın.
