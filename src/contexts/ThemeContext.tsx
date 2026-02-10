import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

type Theme = 'light' | 'dark';

interface CustomSettings {
  logoUrl: string;
  logoText?: string;
  faviconUrl?: string;
  headerGradient: string;
  logoSize?: number;
  showLogoGlow?: boolean;
  settledColor?: string;
  settledColorSecondary?: string;
  settledRibbonColor?: string;
}

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  customSettings: CustomSettings;
  setCustomSettings: (settings: CustomSettings) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_SETTINGS: CustomSettings = {
  logoUrl: '',
  logoText: '',
  faviconUrl: '',
  headerGradient: 'from-emerald-700 via-emerald-800 to-green-900',
  logoSize: 32,
  showLogoGlow: false,
  settledColor: '#064e3b',
  settledColorSecondary: '#022c22',
  settledRibbonColor: '#10b981'
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light'; // Default to light theme
  });

  const [customSettings, setCustomSettingsState] = useState<CustomSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const settingsRef = doc(db, 'settings', 'theme');

    const unsubscribe = onSnapshot(settingsRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as CustomSettings;
        setCustomSettingsState(data);
      } else {
        // If no settings exist in Firestore, create them with defaults
        setDoc(settingsRef, DEFAULT_SETTINGS).catch(e => console.error("Error creating default theme settings:", e));
      }
    }, (error) => {
      console.error("Error listening to theme settings:", error);
      // Fallback to default if there's an error
      setCustomSettingsState(DEFAULT_SETTINGS);
    });

    return () => unsubscribe();
  }, []);

  // Update favicon, apple-touch-icon, and dynamic PWA manifest
  useEffect(() => {
    const iconUrl = customSettings.faviconUrl || customSettings.logoUrl;
    if (iconUrl) {
      // Update favicon
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = iconUrl;

      // Update all apple-touch-icons
      document.querySelectorAll("link[rel='apple-touch-icon']").forEach((el) => {
        (el as HTMLLinkElement).href = iconUrl;
      });

      // Generate dynamic manifest with custom icon
      const manifest = {
        id: 'com.fly4all.acc',
        name: customSettings.logoText || 'RODA10',
        short_name: customSettings.logoText || 'RODA10',
        description: 'نظام إدارة متكامل للأعمال والحجوزات والمبيعات',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#2563eb',
        orientation: 'portrait',
        categories: ['business', 'finance', 'travel'],
        icons: [
          { src: iconUrl, sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: iconUrl, sizes: 'any', type: 'image/png', purpose: 'maskable' },
          { src: iconUrl, sizes: '512x512', type: 'image/png', purpose: 'any' },
        ],
        shortcuts: [
          { name: 'تسجيل الحضور', url: '/attendance-standalone', icons: [{ src: iconUrl, sizes: '192x192' }] },
          { name: 'لوحة التحكم', url: '/dashboard', icons: [{ src: iconUrl, sizes: '192x192' }] },
        ],
      };
      const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
      const manifestUrl = URL.createObjectURL(blob);

      let manifestLink: HTMLLinkElement | null = document.querySelector("link[rel='manifest']");
      if (manifestLink) {
        manifestLink.href = manifestUrl;
      }
    }
  }, [customSettings.logoUrl, customSettings.faviconUrl, customSettings.logoText]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('theme', newTheme);
  };

  const setCustomSettings = async (newSettings: CustomSettings) => {
    try {
      const settingsRef = doc(db, 'settings', 'theme');
      await setDoc(settingsRef, newSettings, { merge: true });
      // The onSnapshot listener will update the state, so no need for setCustomSettingsState here
    } catch (e) {
      console.error("Failed to save custom theme settings to Firestore", e);
      throw e; // Re-throw to be caught by the calling component
    }
  };

  useEffect(() => {
    setTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, customSettings, setCustomSettings }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
