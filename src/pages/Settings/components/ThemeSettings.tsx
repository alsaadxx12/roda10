import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Palette, Image as ImageIcon, Save, Check, Loader2, Upload, Sparkles, DollarSign, LayoutGrid, Zap } from 'lucide-react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import SettingsCard from '../../../components/SettingsCard';
// Firebase storage removed in favor of Base64 storage

interface ThemePreset {
  name: string;
  gradient: string;
}

const THEME_PRESETS: ThemePreset[] = [
  { name: 'افتراضي', gradient: 'from-emerald-700 via-emerald-800 to-green-900' },
  { name: 'محيطي', gradient: 'from-blue-600 via-cyan-600 to-teal-600' },
  { name: 'غروب', gradient: 'from-red-500 via-orange-500 to-yellow-500' },
  { name: 'غابة', gradient: 'from-green-600 via-teal-700 to-green-800' },
  { name: 'ملكي', gradient: 'from-purple-600 via-violet-700 to-purple-800' },
  { name: 'أنيق', gradient: 'from-gray-700 via-gray-800 to-gray-900' },
  { name: 'وردي', gradient: 'from-pink-500 via-rose-500 to-red-500' },
  { name: 'سماوي', gradient: 'from-sky-400 via-cyan-400 to-blue-400' },
  { name: 'ليموني', gradient: 'from-lime-400 via-yellow-400 to-green-400' },
  { name: 'برتقالي', gradient: 'from-orange-400 via-amber-500 to-red-500' },
  { name: 'ياقوتي', gradient: 'from-fuchsia-600 via-pink-600 to-rose-500' },
  { name: 'معدني', gradient: 'from-slate-500 via-slate-600 to-slate-700' },
  { name: 'أكوا', gradient: 'from-cyan-300 via-sky-400 to-blue-400' },
  { name: 'ماغما', gradient: 'from-red-700 via-orange-600 to-amber-500' },
  { name: 'نيون', gradient: 'from-lime-400 via-green-500 to-emerald-600' },
  { name: 'أرجواني', gradient: 'from-violet-500 via-purple-500 to-fuchsia-500' },
  { name: 'كهربائي', gradient: 'from-blue-400 via-indigo-500 to-purple-600' },
  { name: 'استوائي', gradient: 'from-teal-400 via-cyan-500 to-sky-600' },
  { name: 'خريفي', gradient: 'from-amber-400 via-orange-500 to-red-600' },
  { name: 'غسق', gradient: 'from-slate-800 via-gray-800 to-zinc-900' },
  { name: 'ياقوت أزرق', gradient: 'from-blue-800 via-indigo-900 to-purple-900' },
  { name: 'زمرد', gradient: 'from-emerald-700 via-green-800 to-teal-900' },
  { name: 'عقيق', gradient: 'from-red-800 via-rose-900 to-pink-900' },
  { name: 'جمشت', gradient: 'from-violet-800 via-purple-900 to-fuchsia-900' },
  { name: 'فجر', gradient: 'from-sky-300 via-blue-400 to-indigo-400' },
  { name: 'شفق', gradient: 'from-rose-300 via-pink-400 to-purple-400' },
  { name: 'صيف', gradient: 'from-yellow-300 via-orange-400 to-red-400' },
  { name: 'ربيع', gradient: 'from-lime-300 via-green-400 to-teal-400' },
  { name: 'شاطئ', gradient: 'from-cyan-200 via-sky-300 to-blue-300' },
  { name: 'حلوى', gradient: 'from-pink-300 via-fuchsia-400 to-purple-400' },
  { name: 'محيط هادئ', gradient: 'from-gray-600 via-slate-700 to-gray-800' },
  { name: 'مجرة', gradient: 'from-gray-900 via-purple-900 to-blue-900' },
];


export default function ThemeSettings() {
  const { theme, customSettings, setCustomSettings } = useTheme();
  const [logoUrl, setLogoUrl] = useState(customSettings.logoUrl || '');
  const [logoText, setLogoText] = useState(customSettings.logoText || '');
  const [faviconUrl, setFaviconUrl] = useState(customSettings.faviconUrl || '');
  const [selectedGradient, setSelectedGradient] = useState(customSettings.headerGradient || THEME_PRESETS[0].gradient);
  const [logoSize, setLogoSize] = useState(customSettings.logoSize || 32);
  const [showLogoGlow, setShowLogoGlow] = useState(customSettings.showLogoGlow || false);
  const [settledColor, setSettledColor] = useState(customSettings.settledColor || '#4c1d95');
  const [settledColorSecondary, setSettledColorSecondary] = useState(customSettings.settledColorSecondary || '#312e81');
  const [settledRibbonColor, setSettledRibbonColor] = useState(customSettings.settledRibbonColor || '#8b5cf6');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setCustomSettings({
      logoUrl: logoUrl,
      logoText: logoText,
      faviconUrl: faviconUrl,
      headerGradient: selectedGradient,
      logoSize: logoSize,
      showLogoGlow: showLogoGlow,
      settledColor: settledColor,
      settledColorSecondary: settledColorSecondary,
      settledRibbonColor: settledRibbonColor,
    }).then(async () => {
      // Sync with print settings
      try {
        const printSettingsRef = doc(db, 'settings', 'print');
        const printDocSnap = await getDoc(printSettingsRef);
        if (printDocSnap.exists()) {
          await updateDoc(printSettingsRef, {
            logoUrl: logoUrl,
            companyNameLabel: logoText,
            updatedAt: new Date()
          });
        }
      } catch (e) {
        console.error("Failed to sync with print settings:", e);
      }

      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }).catch((e) => {
      console.error("Failed to save settings:", e);
      setIsSaving(false);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'logo') setIsUploadingLogo(true);
    if (type === 'favicon') setIsUploadingFavicon(true);

    try {
      const { fileToBase64 } = await import('../../../utils/imageUtils');
      // Use smaller max width for favicon
      const maxWidth = type === 'favicon' ? 128 : 800;
      const base64 = await fileToBase64(file, maxWidth);

      if (type === 'logo') setLogoUrl(base64);
      if (type === 'favicon') setFaviconUrl(base64);
    } catch (error) {
      console.error(`Error processing ${type}:`, error);
      alert('فشل معالجة الصورة. يرجى المحاولة مرة أخرى.');
    } finally {
      if (type === 'logo') setIsUploadingLogo(false);
      if (type === 'favicon') setIsUploadingFavicon(false);
    }
  };

  return (
    <div className="space-y-6">
      <SettingsCard
        icon={Palette}
        title="تخصيص الألوان"
        description="اختر نظام الألوان المفضل لديك لواجهة النظام"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              اختر لون الشريط العلوي والجانبي:
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setSelectedGradient(preset.gradient)}
                  className={`relative p-4 rounded-xl border-4 transition-all duration-300 transform hover:scale-105 ${selectedGradient === preset.gradient
                    ? 'border-blue-500 shadow-2xl'
                    : 'border-transparent hover:border-blue-200'
                    }`}
                >
                  <div className={`w-full h-16 rounded-lg bg-gradient-to-r ${preset.gradient}`}></div>
                  <p className="text-center text-sm font-bold mt-3 text-gray-800 dark:text-gray-200">
                    {preset.name}
                  </p>
                  {selectedGradient === preset.gradient && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        icon={ImageIcon}
        title="تخصيص الشعار والأيقونة"
        description="تغيير الشعار والأيقونة المعروضة في النظام والمتصفح"
      >
        <div className="space-y-6">
          {/* Logo Text */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              اسم الشركة (الشعار النصي)
            </label>
            <input
              type="text"
              value={logoText}
              onChange={(e) => setLogoText(e.target.value)}
              placeholder="أدخل اسم الشركة ليظهر كشعار"
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none ${theme === 'dark'
                ? 'bg-gray-900/50 border-gray-700 focus:border-blue-500 text-white'
                : 'bg-white border-gray-200 focus:border-blue-500 text-gray-900'
                }`}
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
              سيتم استخدام هذا النص كشعار في حال عدم توفر صورة أو كبديل سريع.
            </p>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              شعار النظام الرئيسي
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${theme === 'dark'
                ? 'border-gray-600 hover:border-blue-500 bg-gray-900/50'
                : 'border-gray-300 hover:border-blue-500 bg-gray-50'
                } ${isUploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={() => document.getElementById('logo-upload')?.click()}
            >
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'logo')}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-2">
                {isUploadingLogo ? (
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                ) : (
                  <Upload className={`w-10 h-10 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                )}
                <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                  {isUploadingLogo ? 'جاري الرفع...' : 'انقر لرفع شعار النظام'}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF (بحد أقصى 2MB)
                </p>
              </div>
            </div>
          </div>

          {/* Favicon Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              أيقونة المتصفح (Favicon)
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${theme === 'dark'
                ? 'border-gray-600 hover:border-blue-500 bg-gray-900/50'
                : 'border-gray-300 hover:border-blue-500 bg-gray-50'
                } ${isUploadingFavicon ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={() => document.getElementById('favicon-upload')?.click()}
            >
              <input
                id="favicon-upload"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'favicon')}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-2">
                {isUploadingFavicon ? (
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                ) : (
                  <Upload className={`w-10 h-10 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                )}
                <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                  {isUploadingFavicon ? 'جاري الرفع...' : 'انقر لرفع أيقونة المتصفح'}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, ICO (بحد أقصى 1MB)
                </p>
              </div>
            </div>
          </div>

          {/* Logo Size and Glow Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                <ImageIcon className="w-4 h-4 text-blue-500" />
                حجم الشعار: {logoSize}px
              </label>
              <input
                type="range"
                min="20"
                max="100"
                value={logoSize}
                onChange={(e) => setLogoSize(parseInt(e.target.value))}
                className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer dark:bg-blue-900/30 accent-blue-600"
              />
            </div>

            <div className="flex items-center justify-between p-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                <Sparkles className={`w-4 h-4 ${showLogoGlow ? 'text-yellow-500 animate-pulse' : 'text-gray-400'}`} />
                توهج الشعار (Glow)
              </label>
              <button
                onClick={() => setShowLogoGlow(!showLogoGlow)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${showLogoGlow ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showLogoGlow ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
          </div>

          {/* Previews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {logoUrl && (
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">معاينة الشعار:</p>
                <div className={`p-4 rounded-lg flex items-center justify-center h-32 ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-100'
                  }`}>
                  <img
                    src={logoUrl}
                    alt="معاينة الشعار"
                    className="object-contain transition-all duration-300"
                    style={{
                      height: `${logoSize}px`,
                      filter: showLogoGlow ? 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.8))' : 'none'
                    }}
                  />
                </div>
              </div>
            )}
            {logoText && !logoUrl && (
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">معاينة الشعار النصي:</p>
                <div className={`p-4 rounded-lg flex items-center justify-center h-32 ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-100'
                  }`}>
                  <span
                    className="font-black tracking-wider transition-all duration-300"
                    style={{
                      fontSize: `${logoSize / 2}pt`,
                      color: '#4f46e5',
                      textShadow: showLogoGlow ? '0 0 12px rgba(79, 70, 229, 0.6)' : 'none'
                    }}
                  >
                    {logoText}
                  </span>
                </div>
              </div>
            )}
            {faviconUrl && (
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">معاينة الأيقونة:</p>
                <div className={`p-4 rounded-lg flex items-center justify-center h-32 ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-100'
                  }`}>
                  <img src={faviconUrl} alt="معاينة الأيقونة" className="w-16 h-16 object-contain" />
                </div>
              </div>
            )}
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        icon={DollarSign}
        title="تخصيص السندات والحسابات"
        description="التحكم في ألوان السندات المتحاسب عليها وتصميم الحاويات"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                <LayoutGrid className="w-4 h-4 text-purple-500" />
                لون السند (الأساسي)
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settledColor}
                  onChange={(e) => setSettledColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border-2 border-white dark:border-gray-800 shadow-sm"
                />
                <input
                  type="text"
                  value={settledColor}
                  onChange={(e) => setSettledColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border dark:bg-gray-900 dark:border-gray-700 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                <Palette className="w-4 h-4 text-indigo-500" />
                لون السند (الثانوي)
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settledColorSecondary}
                  onChange={(e) => setSettledColorSecondary(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border-2 border-white dark:border-gray-800 shadow-sm"
                />
                <input
                  type="text"
                  value={settledColorSecondary}
                  onChange={(e) => setSettledColorSecondary(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border dark:bg-gray-900 dark:border-gray-700 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                <Zap className="w-4 h-4 text-yellow-500" />
                لون شريط التحاسب
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settledRibbonColor}
                  onChange={(e) => setSettledRibbonColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border-2 border-white dark:border-gray-800 shadow-sm"
                />
                <input
                  type="text"
                  value={settledRibbonColor}
                  onChange={(e) => setSettledRibbonColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border dark:bg-gray-900 dark:border-gray-700 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-700">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-6 flex items-center gap-2 justify-center">
              <Check className="w-5 h-5 text-green-500" />
              معاينة السند المتحاسب عليه (المباشرة):
            </p>
            <div className="max-w-md mx-auto relative rounded-[2rem] shadow-2xl border-4 overflow-hidden h-40 transition-all duration-500 transform hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${settledColor}, ${settledColorSecondary})`,
                borderColor: `${settledColor}44`
              }}>
              {/* Ribbon */}
              <div className="absolute top-0 left-0 w-32 h-32 overflow-hidden pointer-events-none z-20">
                <div className="absolute transform -rotate-45 text-center text-white font-[950] text-[10px] py-1.5 -left-10 top-8 w-44 shadow-2xl uppercase tracking-widest border-y border-white/20 backdrop-blur-md"
                  style={{ background: `linear-gradient(to right, ${settledRibbonColor}ee, ${settledColor}ee, ${settledRibbonColor}ee)` }}>
                  <div className="relative">
                    متحاسب عليه
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-slide" />
                  </div>
                </div>
              </div>

              {/* Card Content Skeleton */}
              <div className="p-8 flex flex-col justify-center h-full gap-3 opacity-40">
                <div className="h-5 w-3/4 bg-white/30 rounded-full"></div>
                <div className="h-3 w-1/2 bg-white/20 rounded-full"></div>
                <div className="flex justify-between items-center mt-4">
                  <div className="h-8 w-24 bg-emerald-500/30 rounded-xl border border-white/10"></div>
                  <div className="h-8 w-16 bg-white/30 rounded-2xl"></div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-4 right-4 text-white/10">
                <DollarSign className="w-16 h-16" />
              </div>
            </div>
          </div>
        </div>
      </SettingsCard>

      <div className="flex items-center justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>جاري الحفظ...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>حفظ التغييرات</span>
            </>
          )}
        </button>
      </div>

      {saveSuccess && (
        <div className="fixed bottom-10 right-10 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-500">
          <Check className="w-6 h-6" />
          <span className="font-bold">تم حفظ الإعدادات بنجاح!</span>
        </div>
      )}
    </div>
  );
}
