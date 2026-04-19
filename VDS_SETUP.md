========================================
TIKGIFTY - VDS DEPLOYMENT GUIDE (PROD)
Domain: https://tikgifty.com
Stack: React (Vite) + Node.js (Express) + Socket.IO + Prisma + PostgreSQL + Nginx + PM2
========================================

📦 1. GEREKLİ KURULUMLAR (VDS)

sudo apt update && sudo apt upgrade -y

Node.js (20+ önerilir)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

PM2
sudo npm install -g pm2

Nginx
sudo apt install nginx -y

PostgreSQL
sudo apt install postgresql postgresql-contrib -y


========================================
🛢️ 2. POSTGRESQL SETUP
========================================

sudo -u postgres psql

CREATE DATABASE tikgifty;
CREATE USER tikgifty_user WITH ENCRYPTED PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE tikgifty TO tikgifty_user;

\q


========================================
⚙️ 3. .ENV AYARI (BACKEND)
========================================

/var/www/tikgifty/.env

DATABASE_URL="postgresql://tikgifty_user:strong_password_here@localhost:5432/tikgifty"
JWT_SECRET="super_secret_key"
PORT=3000


========================================
🧠 4. PRISMA SETUP
========================================

npx prisma generate
npx prisma migrate deploy


========================================
🚀 5. BACKEND BUILD & RUN
========================================

npm install
npm run build   (varsa ts -> js compile)

PM2 ile çalıştır:

pm2 start dist/server.js --name tikgifty-backend
pm2 save
pm2 startup


========================================
🌐 6. FRONTEND BUILD (VITE)
========================================

npm install
npm run build

Çıktı:
dist/


========================================
🌍 7. NGINX CONFIG (KRİTİK)
========================================

/etc/nginx/sites-available/tikgifty

server {
    listen 80;
    server_name tikgifty.com www.tikgifty.com;

    root /var/www/tikgifty/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}


Aktif et:

sudo ln -s /etc/nginx/sites-available/tikgifty /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx


========================================
🧩 8. DOMAIN DNS
========================================

A RECORD:
@   → VDS IP
www → VDS IP


========================================
🔥 9. SIK SORUNLAR (ÇÖZÜM)
========================================

❌ Cannot GET /
→ backend port 3000 yanlış veya frontend build yok

❌ 404 login/register
→ nginx /api proxy eksik

❌ socket bağlanmıyor
→ /socket.io proxy yok

❌ frontend boş
→ dist/index.html yok veya yanlış root


========================================
🚀 10. ÇALIŞTIRMA SIRASI
========================================

1. PostgreSQL kur
2. .env doldur
3. prisma migrate
4. npm run build (frontend)
5. pm2 backend başlat
6. nginx restart
7. domain bağla


========================================
✔ SON DURUM
========================================

- Frontend: /var/www/tikgifty/dist
- Backend: PM2 (3000)
- DB: PostgreSQL
- Proxy: Nginx
- Domain: tikgifty.com

========================================