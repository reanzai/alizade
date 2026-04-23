# TikGifty - TikTok Canlı Yayın Etkileşim ve Oyun Platformu

TikGifty, TikTok yayıncılarının canlı yayınlarını daha interaktif, eğlenceli ve kazançlı hale getirmelerini sağlayan tam kapsamlı bir platformdur. TikFinity gibi araçlara güçlü bir alternatif olarak geliştirilmiştir. İzleyicilerin gönderdiği hediyeler, yaptığı takipler, beğeniler ve sohbet komutları ile ekranda eylemler tetikleyebilir (sesler, özel animasyonlar, TTS) veya canlı strateji oyunları oynatabilirsiniz.

## 🚀 Özellikler

- **Gerçek Zamanlı TikTok Entegrasyonu:** Yayına anında bağlanır; chat, hediye, beğeni, takip ve üyelik olaylarını milisaniyeler içinde yakalar.
- **Gelişmiş Eylem ve Tetikleyiciler (Actions & Events):** Gelen özel bir hediyeyi veya belirli bir chat komutunu; ses oynatmaya, ekranda GIF göstermeye veya yazıyı sese çevirme (TTS) işlemine bağlayabilirsiniz.
- **İnteraktif Yayın Oyunları:**
  - 🇹🇷 **Türkiye Harita Savaşı:** İzleyicilerin attığı hediyeler ile illeri ele geçirdiği amansız bir strateji oyunu.
  - ⚔️ **Beyblade Savaşları:** İzleyicilerin beğeni ve hediyelerle arenaya katılıp savaştığı arena oyunu.
  - 🎨 **Pixel Conquest (Piksel Savaşı):** İzleyicilerin pikselleri boyayarak en büyük alanı kapmaya çalıştığı rekabetçi oyun.
  - 🗳️ **Canlı Oylama ve Kelime Oyunları.**
- **OBS & Live Studio Uyumlu Kaplamalar (Overlays):** Şeffaf arka planlı URL kaynakları ile yayın programınıza saniyeler içinde eklenir.

## 💻 Teknoloji Yığını (Tech Stack)

Proje, modern ve ölçeklenebilir bir "Full-Stack" (Tam Yığın) web mimarisi üzerine inşa edilmiştir:

### Frontend (Kullanıcı Arayüzü)
- **React 18 & Vite:** Yüksek performanslı ve hızlı derlenen arayüz.
- **TypeScript:** Tip güvenliği ve ölçeklenebilir kod yapısı.
- **Tailwind CSS:** Hızlı ve esnek stillendirme, modern UI/UX bileşenleri.
- **Framer Motion (`motion/react`):** Akıcı pencereler, modal animasyonları ve oyun içi görsel efektler.
- **Context API & React Hooks:** Yerel durum (state) yönetimi.

### Backend (Sunucu & API)
- **Node.js & Express:** Hızlı yönlendirme yapısı, kimlik doğrulama ve API servisleri.
- **Socket.io (WebSockets):** Sunucu ile Frontend (Overlay ve Dashboard) arasında çift yönlü, anlık, gerçek zamanlı veri aktarımı.
- **tiktok-live-connector:** TikTok'un canlı yayın sunucularına resmi olmayan yoldan bağlanıp WebSocket üzerinden akan hediye/chat verilerini anlamlı bir formata dönüştüren kütüphane.
- **JWT & Bcrypt:** Güvenli kullanıcı kimlik doğrulama, token bazlı oturum yönetimi.

### Database (Veritabanı)
- **PostgreSQL:** Dünyanın en gelişmiş açık kaynaklı, ilişkisel veritabanı yönetim sistemi. Veri tutarlılığı (Data Integrity) ve karmaşık ilişkiler gerektiren kullanıcı verileri için kullanılmıştır.
- **Prisma ORM:** PostgreSQL ile Node.js haberleşmesini sağlayan, tip korumalı mükemmel veritabanı bağdaştırıcısı (ORM). `schema.prisma` üzerinden veritabanı tabloları şemalar halinde yönetilir.

## 🛠️ Sistem Nasıl Çalışıyor? (Mimari Akış)

1. **Bağlantı:** Yayıncı (kullanıcı) platforma TikTok kullanıcı adını (örn: `@yayincii`) girer.
2. **Dinleme:** Backend'de çalışan `tiktok-live-connector`, kullanıcının TikTok yayınına WebSocket üzerinden bağlanarak canlı JSON verilerini (chat stream) dinlemeye başlar.
3. **Gerçek Zamanlı Aktarım:** TikGifty sunucusu, TikTok'tan gelen (Hediye, Chat, Beğeni vb.) verileri temizler ve `Socket.io` aracılığıyla anında tarayıcıya (Frontend) fırlatır.
4. **Eylem Eşleştirme (Trigger Logic):** React uygulaması bu veriyi alır ve yayıncının paneline kaydettiği "Olay Bağlantıları" ile kıyaslar. (Örn: *Eğer gelen Hediye == 'Rose' ise ID'si 1 olan Eylemi tetikle*).
5. **Overlay (Ekrana Yansıtma):** Eşleşen eylemler (Ses çalınması, animasyonlu metin) veya Oyun içi statü değişiklikleri (Haritada bir ilin ele geçirilmesi), yayıncının OBS yazılımındaki `Özel Overlay URL` sekmesinde saniyesinde güncellenir ve yayına yansır.
6. **Kayıt:** Yayıncının elde ettiği gelirler, liderlik tabloları ve puan geçmişi Prisma ORM aracıyla PostgreSQL veritabanına işlenip sonsuza kadar saklanır.

---
*Bu proje, canlı yayın etkileşimini artırmak için gelişmiş web teknolojileri ile izleyici tepkilerini oyunlaştırma prensibi(Gamification) hedeflenerek tasarlanmıştır.*
