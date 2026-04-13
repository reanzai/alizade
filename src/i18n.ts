import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Sidebar
      nav: {
        dashboard: "Dashboard",
        actions: "Actions",
        events: "Events",
        overlay: "Overlay",
        leaderboard: "Leaderboard",
        wordGame: "Word Game",
        beyblade: "Beyblade",
        pixelConquest: "Pixel Conquest",
        pricing: "Pricing",
        settings: "Settings",
        about: "About"
      },
      // Header
      header: {
        search: "Search...",
        freePlan: "Free Plan",
        proCreator: "Pro Creator",
        selfHosted: "Self-Hosted"
      },
      // Pixel Conquest
      pixelConquest: {
        title: "Pixel Conquest",
        desc: "Interactive map conquest game with your viewers",
        openOverlay: "Open Overlay",
        startGame: "Start Game",
        stopGame: "Stop Game",
        activePlayers: "Active Players",
        resetAll: "Reset All",
        noPlayers: "No players yet. Viewers can join by sending gifts.",
        score: "Score",
        gameSettings: "Game Settings",
        gridSize: "Grid Size",
        width: "Width",
        height: "Height",
        warningReset: "Warning: Changing size resets the map.",
        reignMode: "Reign Mode",
        enableReign: "Enable Reign Shield",
        reignDesc: "Dominant player gets an automatic shield.",
        rulers: "RULERS",
        times: "TIMES",
        greatVictory: "GREAT VICTORY",
        mapConquered: "MAP CONQUERED"
      },
      // General
      general: {
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit"
      }
    }
  },
  tr: {
    translation: {
      // Sidebar
      nav: {
        dashboard: "Panel",
        actions: "Eylemler",
        events: "Etkinlikler",
        overlay: "Yayın Ekranı",
        leaderboard: "Sıralama",
        wordGame: "Kelime Oyunu",
        beyblade: "Beyblade",
        pixelConquest: "Piksel Fetih",
        pricing: "Abonelik",
        settings: "Ayarlar",
        about: "Hakkında"
      },
      // Header
      header: {
        search: "Ara...",
        freePlan: "Ücretsiz Plan",
        proCreator: "Pro Yayıncı",
        selfHosted: "Kendi Sunucun"
      },
      // Pixel Conquest
      pixelConquest: {
        title: "Piksel Fetih",
        desc: "İzleyicilerinizle interaktif harita fethetme oyunu",
        openOverlay: "Ekranı Aç",
        startGame: "Oyunu Başlat",
        stopGame: "Oyunu Durdur",
        activePlayers: "Aktif Oyuncular",
        resetAll: "Sıfırla",
        noPlayers: "Henüz oyuncu yok. İzleyiciler hediye göndererek katılabilir.",
        score: "Skor",
        gameSettings: "Oyun Ayarları",
        gridSize: "Harita Boyutu",
        width: "Genişlik",
        height: "Yükseklik",
        warningReset: "Uyarı: Boyut değiştirmek haritayı sıfırlar.",
        reignMode: "Hükümdarlık Modu",
        enableReign: "Kalkanı Aktifleştir",
        reignDesc: "En yüksek skorlu oyuncu otomatik kalkan kazanır.",
        rulers: "HÜKÜMDARLAR",
        times: "KEZ",
        greatVictory: "BÜYÜK ZAFER",
        mapConquered: "HARİTA FETHEDİLDİ"
      },
      // General
      general: {
        save: "Kaydet",
        cancel: "İptal",
        delete: "Sil",
        edit: "Düzenle"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
