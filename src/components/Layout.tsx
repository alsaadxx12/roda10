import React, { useState, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Popover from '@radix-ui/react-popover';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useExchangeRate } from '../contexts/ExchangeRateContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';
import { Settings, LogOut, User, Bell, CreditCard, ChevronDown, Shield, Phone, Smartphone, Briefcase, CircleAlert as AlertCircle, Clock, RefreshCw, Sun, Moon } from 'lucide-react';
import { db } from '../lib/firebase';
import { getWhatsAppSettings } from '../lib/collections/whatsapp';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { useWhatsAppApi } from '../pages/Settings/hooks/useWhatsAppApi';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';
import { menuItems } from '../lib/constants';
import GlobalModals from './GlobalModals';
import useIssues from '../hooks/useIssues';
import useMastercardIssues from '../pages/MastercardIssues/hooks/useMastercardIssues';

import { useNotifications } from '../hooks/useNotifications';
import { subscribeToLeaves, updateLeaveStatus } from '../lib/collections/leaves';
import { LeaveRequest } from '../pages/Leaves/types';
import { ClipboardList } from 'lucide-react';
import BrandingLogo from './BrandingLogo';

const NOTIFICATION_SOUNDS = [
  { id: 'notification_high_pitch_alert', url: 'https://actions.google.com/sounds/v1/office/notification_high_pitch_alert.ogg' },
  { id: 'mechanical_clock_ring', url: 'https://actions.google.com/sounds/v1/alarms/mechanical_clock_ring.ogg' },
  { id: 'alarm_clock', url: 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg' },
  { id: 'digital_watch_alarm', url: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg' },
  { id: 'bell_ding', url: 'https://actions.google.com/sounds/v1/alarms/bell_ding.ogg' },
  { id: 'buzzer', url: 'https://actions.google.com/sounds/v1/alarms/buzzer.ogg' },
  { id: 'beep_short', url: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg' },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { employee, signOut, checkPermission, user } = useAuth();
  const { t } = useLanguage();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme, customSettings } = useTheme();
  const { showNotification } = useNotification();
  const { currentRate } = useExchangeRate();

  // Initialize Push Notifications
  useNotifications();

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }
    setDeferredPrompt(null);
  };


  const [whatsappAccounts, setWhatsappAccounts] = useState<Array<{
    id?: string;
    instance_id: string;
    token: string;
    name?: string;
    is_active?: boolean;
  }>>([]);
  const [selectedAccount, setSelectedAccount] = useState<{
    instance_id: string;
    token: string;
  } | null>(null);
  const { fetchWhatsAppAccount } = useWhatsAppApi();
  const [whatsappAccountInfo, setWhatsappAccountInfo] = useState<any>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [notificationSettings, setNotificationSettings] = useState({
    exchangeRateNotifications: true,
    exchangeRateSoundEnabled: true,
    notificationSound: 'notification_high_pitch_alert'
  });
  const { issues } = useIssues();
  const { issues: mastercardIssues } = useMastercardIssues();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isIssuesPopoverOpen, setIsIssuesPopoverOpen] = useState(false);
  const pendingIssues = issues.filter((issue: any) => issue.status === 'pending' || issue.status === 'in_progress');
  const pendingMastercardIssues = mastercardIssues.filter((issue: any) => issue.status === 'pending' || issue.status === 'in_progress');
  const isManagerOrAdmin = employee?.permission_group?.permissions?.isAdmin === true ||
    employee?.permission_group?.name?.includes('مدير') ||
    employee?.permission_group?.name?.toLowerCase().includes('manager') ||
    checkPermission('leaves', 'approve');

  const pendingLeaves = leaveRequests.filter(leave => {
    if (leave.status !== 'pending') return false;
    if (employee?.permission_group?.permissions?.isAdmin === true) return true;
    if (isManagerOrAdmin) return leave.departmentId === employee?.departmentId;
    return leave.employeeId === user?.uid;
  });
  const allPendingIssues = [...pendingIssues, ...pendingMastercardIssues, ...pendingLeaves];
  const [departmentName, setDepartmentName] = useState('');

  useEffect(() => {
    if (employee?.departmentId) {
      const fetchDept = async () => {
        try {
          const deptRef = doc(db, 'departments', employee.departmentId);
          const deptSnap = await getDoc(deptRef);
          if (deptSnap.exists()) {
            setDepartmentName(deptSnap.data().name);
          }
        } catch (e) {
          console.error("Error fetching department name:", e);
        }
      };
      fetchDept();
    } else {
      setDepartmentName('');
    }
  }, [employee?.departmentId]);


  useEffect(() => {
    // Other layout effects
    const activeMenuItem = menuItems.find(item => {
      if (item.path && location.pathname === item.path) return true;
      if (item.subItems) {
        return item.subItems.some(subItem => location.pathname.startsWith(subItem.path));
      }
      return false;
    });
    if (activeMenuItem) {
      // Logic for title if needed
    }
  }, [location.pathname, t]);

  useEffect(() => {
    const settingsRef = doc(db, 'notification_settings', 'global');
    const unsubscribe = onSnapshot(settingsRef, (doc: any) => {
      if (doc.exists()) {
        const data = doc.data();
        setNotificationSettings({
          exchangeRateNotifications: data.exchangeRateNotifications !== false,
          exchangeRateSoundEnabled: data.exchangeRateSoundEnabled !== false,
          notificationSound: data.notificationSound || 'notification_high_pitch_alert'
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const fetchAccountInfo = async (instanceId: string, token: string) => {
    try {
      const accountInfo = await fetchWhatsAppAccount(instanceId, token);
      if (accountInfo && !accountInfo.error) {
        setWhatsappAccountInfo(accountInfo);
      } else {
        throw new Error(accountInfo.error || "فشل جلب معلومات الحساب");
      }
    } catch (error: any) {
      console.error('Error fetching account info:', error);
      setWhatsappAccountInfo(null);
    }
  };

  const handleAccountSelect = (account: any) => {
    setSelectedAccount(account);
    (window as any).selectedWhatsAppAccount = account;
    const event = new CustomEvent('whatsappAccountUpdated', { detail: { account } });
    window.dispatchEvent(event);
    fetchAccountInfo(account.instance_id, account.token);
    setIsUserMenuOpen(false);
  };

  const loadWhatsAppAccounts = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const accounts = await getWhatsAppSettings(user.uid);

      if (accounts && accounts.length > 0) {
        const formattedAccounts = accounts.map((account: any) => ({
          id: account.id,
          instance_id: account.instance_id,
          token: account.token,
          name: account.name || account.instance_id,
          is_active: account.is_active
        }));

        setWhatsappAccounts(formattedAccounts);

        const activeAccount = formattedAccounts.find((account: any) => account.is_active);
        if (activeAccount) {
          handleAccountSelect(activeAccount);
        } else {
          handleAccountSelect(formattedAccounts[0]);
        }
      }
    } catch (error) {
      console.error('Error loading WhatsApp accounts:', error);
    }
  }, [user?.uid, fetchWhatsAppAccount]);

  const prevLeaveRequestsCount = useRef(0);

  useEffect(() => {
    loadWhatsAppAccounts();

    // Subscribe to leaves if manager
    let unsubscribeLeaves: () => void;
    if (user?.role === 'admin' || user?.role === 'manager') {
      unsubscribeLeaves = subscribeToLeaves((leaves) => {
        // Detect new requests
        const pendingCount = leaves.filter(l => l.status === 'pending').length;
        if (pendingCount > prevLeaveRequestsCount.current) {
          const newRequest = leaves.find(l => l.status === 'pending' && !leaveRequests.find(old => old.id === l.id));
          if (newRequest) {
            showNotification(
              'info',
              'طلب إجازة جديد',
              `قدم ${newRequest.employeeName} طلب إجازة (${newRequest.type === 'full_day' ? 'كاملة' : 'زمنية'})`,
              10000
            );

            // Browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('طلب إجازة جديد', {
                body: `${newRequest.employeeName}: ${newRequest.reason}`,
                icon: '/favicon.ico',
                tag: 'leave-request'
              });
            }
          }
        }
        prevLeaveRequestsCount.current = pendingCount;
        setLeaveRequests(leaves);
      });
    }

    return () => {
      if (unsubscribeLeaves) unsubscribeLeaves();
    };
  }, [user?.uid, user?.role, loadWhatsAppAccounts, leaveRequests.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    console.log('[Layout] Setting up exchange rate change listener...');

    if ('Notification' in window && Notification.permission === 'default') {
      const hasAskedBefore = localStorage.getItem('notificationPermissionAsked');
      if (!hasAskedBefore) {
        setTimeout(() => {
          Notification.requestPermission().then((permission) => {
            console.log('[Layout] Notification permission:', permission);
            localStorage.setItem('notificationPermissionAsked', 'true');
            if (permission === 'granted') {
              showNotification(
                'success',
                'تم تفعيل الإشعارات',
                'سيتم إرسال إشعار عند تحديث سعر الصرف حتى لو كان المتصفح مصغر',
                5000
              );
            }
          });
        }, 3000);
      }
    }

    const handleExchangeRateChange = (event: CustomEvent) => {
      console.log('[Layout] Exchange rate change event received!', event.detail);

      const { oldRate, newRate } = event.detail;
      const change = newRate - oldRate;
      const changePercent = ((change / oldRate) * 100).toFixed(2);
      const isIncrease = change > 0;

      const title = 'تم تغيير سعر الصرف';
      const message = `تم ${isIncrease ? 'رفع' : 'خفض'} سعر الصرف من ${oldRate.toLocaleString('en-US')} إلى ${newRate.toLocaleString('en-US')} دينار (${isIncrease ? '+' : ''}${changePercent}%)`;

      console.log('[Layout] Showing notification:', title, message);

      if (notificationSettings.exchangeRateSoundEnabled) {
        try {
          console.log('[Layout] Playing notification sound...');
          const sound = NOTIFICATION_SOUNDS.find(s => s.id === notificationSettings.notificationSound);
          const soundUrl = sound?.url || NOTIFICATION_SOUNDS[0].url;

          const audio = new Audio(soundUrl);
          audio.volume = 0.7;

          audio.oncanplaythrough = () => console.log('[Layout] Audio loaded successfully');
          audio.onerror = (e) => console.error('[Layout] Audio load error:', e);
          audio.onended = () => console.log('[Layout] Audio playback finished');

          audio.play()
            .then(() => console.log('[Layout] Audio playing...'))
            .catch(e => {
              console.error('[Layout] Audio play failed:', e);
              const fallbackAudio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
              fallbackAudio.volume = 0.7;
              fallbackAudio.play().catch(err => console.error('[Layout] Fallback audio failed:', err));
            });
        } catch (e) {
          console.error('[Layout] Audio creation failed:', e);
        }
      } else {
        console.log('[Layout] Sound disabled by user');
      }

      showNotification(
        isIncrease ? 'warning' : 'success',
        title,
        message,
        10000
      );

      if ('Notification' in window) {
        console.log('[Layout] Notification permission status:', Notification.permission);
        if (Notification.permission === 'granted') {
          try {
            console.log('[Layout] Creating browser notification...');
            const notification = new Notification(title, {
              body: message,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              requireInteraction: true,
              silent: false,
              tag: 'exchange-rate-update'
            });
            console.log('[Layout] Browser notification created successfully');

            notification.onclick = () => {
              window.focus();
              notification.close();
            };
          } catch (e) {
            console.error('[Layout] Browser notification failed:', e);
          }
        } else if (Notification.permission === 'default') {
          console.log('[Layout] Requesting notification permission...');
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              new Notification(title, {
                body: message,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                requireInteraction: true,
                silent: false,
                tag: 'exchange-rate-update'
              });
            }
          });
        } else {
          console.log('[Layout] Notification permission denied by user');
        }
      } else {
        console.log('[Layout] Browser does not support notifications');
      }
    };

    window.addEventListener('exchange-rate-changed', handleExchangeRateChange as EventListener);
    console.log('[Layout] Exchange rate listener attached successfully');

    return () => {
      console.log('[Layout] Removing exchange rate listener...');
      window.removeEventListener('exchange-rate-changed', handleExchangeRateChange as EventListener);
    };
  }, [showNotification, notificationSettings.exchangeRateSoundEnabled, notificationSettings.notificationSound]);

  const handleLeaveAction = async (e: React.MouseEvent, leaveId: string, status: 'approved' | 'rejected') => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await updateLeaveStatus(leaveId, status, user!.uid, employee?.name || 'مدير');
      showNotification('success', status === 'approved' ? 'تمت الموافقة' : 'تم الرفض', 'تم تحديث حالة الطلب بنجاح');
    } catch (error) {
      console.error(error);
      showNotification('error', 'فشل الإجراء', 'حدث خطأ أثناء تحديث الحالة');
    }
  };

  const priorityConfig = {
    high: { label: 'عاجلة', icon: <AlertCircle className="w-4 h-4" />, color: 'bg-red-500/10 text-red-500', cardBg: 'bg-gradient-to-tr from-red-50 to-white border-red-200', cardBgDark: 'dark:from-red-900/20 dark:to-gray-800/10 dark:border-red-800/50' },
    medium: { label: 'متوسطة', icon: <Clock className="w-4 h-4" />, color: 'bg-yellow-500/10 text-yellow-500', cardBg: 'bg-gradient-to-tr from-yellow-50 to-white border-yellow-200', cardBgDark: 'dark:from-yellow-900/20 dark:to-gray-800/10 dark:border-yellow-800/50' },
    low: { label: 'عادية', icon: <Clock className="w-4 h-4" />, color: 'bg-blue-500/10 text-blue-500', cardBg: 'bg-gradient-to-tr from-blue-50 to-white border-blue-200', cardBgDark: 'dark:from-blue-900/20 dark:to-gray-800/10 dark:border-blue-800/50' },
    open_transfer_pending: { label: 'تحويل معلق', icon: <RefreshCw className="w-4 h-4" />, color: 'bg-purple-500/10 text-purple-500', cardBg: 'bg-gradient-to-tr from-purple-50 to-white border-purple-200', cardBgDark: 'dark:from-purple-900/20 dark:to-gray-800/10 dark:border-purple-800/50' },
  };

  const hasPendingIssuesPermission = checkPermission('المشاكل المعلقة', 'view');
  const hasMastercardIssuesPermission = checkPermission('مشاكل بوابة الماستر', 'view');

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-[#1a1d29] dark:via-[#1f2937] dark:to-[#111827] flex flex-col transition-colors duration-200 text-right h-screen overflow-hidden">
      {/* Clean Minimal Header */}
      <header className={`flex-shrink-0 z-50 safe-top relative`}>
        {/* Background with gradient */}
        <div className={`absolute inset-0 bg-gradient-to-r ${customSettings.headerGradient} dark:from-gray-900 dark:via-gray-900 dark:to-gray-900`} />
        {/* Subtle bottom border glow */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative flex items-center justify-between px-3 md:px-5 h-[52px] text-white">
          {/* Left Side - User & Notifications */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* User Avatar Button */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 h-9 bg-white/[0.08] hover:bg-white/[0.15] rounded-full transition-all duration-300 group"
              >
                {employee?.image ? (
                  <img src={employee.image} alt={employee.name} className="w-7 h-7 rounded-full object-cover ring-1.5 ring-white/25" />
                ) : (
                  <div className="w-7 h-7 bg-white/15 rounded-full flex items-center justify-center">
                    <span className="text-[11px] font-semibold text-white/90">{employee?.name?.charAt(0) || 'U'}</span>
                  </div>
                )}
                <span className="hidden sm:inline text-[13px] font-medium text-white/90 whitespace-nowrap">{employee?.name || 'المستخدم'}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-white/50 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                {pendingLeaves.length > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                )}
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-black/20 border border-gray-200/80 dark:border-gray-700/50 z-50 overflow-hidden" style={{ animation: 'fadeSlideIn 0.2s ease-out' }}>
                  {/* User Info Header */}
                  <div className="p-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/80 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      {employee?.image ? (
                        <img src={employee.image} alt={employee.name} className="w-11 h-11 rounded-xl object-cover shadow-sm" />
                      ) : (
                        <div className="w-11 h-11 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-sm shadow-sm">
                          {employee?.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[14px] text-gray-900 dark:text-white truncate">{employee?.name || 'المستخدم'}</div>
                        <div className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5">{employee?.email || 'user@example.com'}</div>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Accounts */}
                  {whatsappAccounts.length > 0 && (
                    <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
                      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1 mb-1.5">حسابات واتساب</div>
                      <div className="space-y-0.5">
                        {whatsappAccounts.map((account: any) => (
                          <button
                            key={account.instance_id}
                            onClick={() => handleAccountSelect(account)}
                            className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-[12px] font-medium transition-colors ${selectedAccount?.instance_id === account.instance_id
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                              }`}
                          >
                            <div className="flex items-center gap-2">
                              <Smartphone className="w-3.5 h-3.5" />
                              <span className="truncate">{account.name}</span>
                            </div>
                            {selectedAccount?.instance_id === account.instance_id && (
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Info Cards */}
                  <div className="px-3 py-2.5 space-y-0.5">
                    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px]">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-400 dark:text-gray-500">القسم:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{departmentName || 'غير محدد'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px]">
                      <Shield className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-400 dark:text-gray-500">الصلاحية:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{employee?.permission_group?.name || 'موظف'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px]">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-400 dark:text-gray-500">الهاتف:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{employee?.phone || 'غير محدد'}</span>
                    </div>
                  </div>

                  {/* Action Links */}
                  <div className="px-2 py-2 border-t border-gray-100 dark:border-gray-800">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors text-[13px] font-medium"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span>الملف الشخصي</span>
                    </Link>
                    <Link
                      to="/leaves"
                      className="flex items-center justify-between px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors text-[13px] font-medium"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2.5">
                        <ClipboardList className="w-4 h-4 text-gray-400" />
                        <span>طلبات الإجازات</span>
                      </div>
                      {pendingLeaves.length > 0 && (
                        <span className="bg-blue-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
                          {pendingLeaves.length}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-2.5 px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors text-[13px] font-medium"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span>الإعدادات</span>
                    </Link>

                    <div className="my-1.5 mx-2 border-t border-gray-100 dark:border-gray-800" />

                    {showInstallButton && (
                      <button
                        onClick={() => { handleInstallClick(); setIsUserMenuOpen(false); }}
                        className="flex items-center gap-2.5 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-colors w-full text-[13px] font-medium"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>تثبيت التطبيق</span>
                      </button>
                    )}
                    <button
                      onClick={() => toggleTheme()}
                      className="flex items-center gap-2.5 px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors w-full text-[13px] font-medium"
                    >
                      {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-400" />}
                      <span>{theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}</span>
                    </button>
                    <button
                      onClick={() => signOut().catch((error: any) => console.error('Error during sign out:', error))}
                      className="flex items-center gap-2.5 px-3 py-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors w-full text-[13px] font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            {(hasPendingIssuesPermission || hasMastercardIssuesPermission || user?.role === 'admin' || user?.role === 'manager') && (
              <Popover.Root open={isIssuesPopoverOpen} onOpenChange={setIsIssuesPopoverOpen}>
                <Popover.Trigger asChild>
                  <button
                    className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${allPendingIssues.length > 0
                      ? 'bg-red-500/15 hover:bg-red-500/25'
                      : 'bg-white/[0.08] hover:bg-white/[0.15]'
                      }`}
                    title="الاشعارات والمشاكل المعلقة"
                  >
                    <Bell className={`w-[18px] h-[18px] transition-all duration-300 ${allPendingIssues.length > 0 ? 'text-red-300' : 'text-white/70'}`} />
                    {allPendingIssues.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg shadow-red-500/30">
                        {allPendingIssues.length}
                      </span>
                    )}
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    sideOffset={8}
                    align="center"
                    collisionPadding={16}
                    className={`z-50 w-[300px] sm:w-[340px] max-h-[80vh] rounded-2xl shadow-2xl shadow-black/20 border overflow-hidden flex flex-col ${theme === 'dark'
                      ? 'bg-gray-900 border-gray-700/50 text-white'
                      : 'bg-white border-gray-200/80 text-gray-900'
                      }`}
                    style={{ animation: 'fadeSlideIn 0.2s ease-out' }}
                  >
                    {/* Notification Header */}
                    <div className={`px-4 py-3 border-b flex items-center justify-between shrink-0 ${theme === 'dark' ? 'border-gray-800 bg-gray-800/50' : 'border-gray-100 bg-gray-50/80'}`}>
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-blue-500" />
                        <h3 className="font-semibold text-[13px]">التنبيهات</h3>
                        {allPendingIssues.length > 0 && (
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                            {allPendingIssues.length}
                          </span>
                        )}
                      </div>
                      <Link
                        to="/pending-issues"
                        onClick={() => setIsIssuesPopoverOpen(false)}
                        className="text-[11px] font-medium text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        عرض الكل
                      </Link>
                    </div>

                    {/* Scrollable Notifications */}
                    <ScrollArea.Root className="w-full flex-1 min-h-[200px] overflow-hidden">
                      <ScrollArea.Viewport className="w-full max-h-[400px] sm:max-h-[480px] p-2">
                        {allPendingIssues.length > 0 ? (
                          <div className="space-y-1.5">
                            {allPendingIssues.map((issue: any) => {
                              const isMastercardIssue = 'refundAmount' in issue;
                              const isLeaveRequest = 'type' in issue && 'status' in issue && !('title' in issue);
                              const linkTo = isLeaveRequest ? "/leaves" : (isMastercardIssue ? "/mastercard-issues" : "/pending-issues");
                              const priority = isLeaveRequest
                                ? { label: 'إجازة', icon: <ClipboardList className="w-4 h-4" />, color: 'bg-indigo-500/10 text-indigo-500' }
                                : (priorityConfig[issue.priority as keyof typeof priorityConfig] || priorityConfig.low);

                              return (
                                <Link
                                  to={linkTo}
                                  key={issue.id}
                                  onClick={() => setIsIssuesPopoverOpen(false)}
                                  className={`group block p-3 rounded-xl transition-all duration-200 ${theme === 'dark'
                                    ? 'hover:bg-gray-800/80'
                                    : 'hover:bg-gray-50'
                                    }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isLeaveRequest ? 'bg-indigo-500/10 text-indigo-500' :
                                      isMastercardIssue ? 'bg-purple-500/10 text-purple-500' :
                                        'bg-blue-500/10 text-blue-500'
                                      }`}>
                                      {isLeaveRequest ? <ClipboardList className="w-4 h-4" /> :
                                        isMastercardIssue ? <CreditCard className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-[12px] truncate mb-0.5">
                                        {isLeaveRequest ? `طلب إجازة: ${issue.employeeName}` : issue.title}
                                      </h4>
                                      <p className={`text-[11px] line-clamp-1 mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {isLeaveRequest ? issue.reason : (issue.description || 'بلا وصف')}
                                      </p>
                                      <div className="flex items-center gap-2">
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${priority.color}`}>
                                          {priority.label}
                                        </span>
                                        {isLeaveRequest && (
                                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${issue.deductSalary ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                            {issue.deductSalary ? 'خصم' : 'بدون خصم'}
                                          </span>
                                        )}
                                      </div>

                                      {isLeaveRequest && isManagerOrAdmin && issue.employeeId !== user?.uid ? (
                                        <div className="flex gap-2 mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                                          <button
                                            onClick={(e) => handleLeaveAction(e, issue.id, 'approved')}
                                            className="flex-1 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[11px] font-semibold transition-colors"
                                          >
                                            موافقة
                                          </button>
                                          <button
                                            onClick={(e) => handleLeaveAction(e, issue.id, 'rejected')}
                                            className="flex-1 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-[11px] font-semibold transition-colors"
                                          >
                                            رفض
                                          </button>
                                        </div>
                                      ) : isLeaveRequest && (
                                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-center">
                                          <span className="text-[10px] font-medium text-amber-500">قيد الانتظار</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                              <Bell className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                            </div>
                            <p className={`text-[12px] font-medium ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>لا توجد تنبيهات</p>
                          </div>
                        )}
                      </ScrollArea.Viewport>
                      <ScrollArea.Scrollbar className="flex select-none touch-none p-0.5 bg-transparent w-1" orientation="vertical">
                        <ScrollArea.Thumb className="flex-1 bg-gray-300/30 dark:bg-gray-600/30 rounded-full" />
                      </ScrollArea.Scrollbar>
                    </ScrollArea.Root>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            )}

            {/* Theme Toggle - visible on desktop */}
            <button
              onClick={() => toggleTheme()}
              className="hidden md:flex w-9 h-9 rounded-full items-center justify-center bg-white/[0.08] hover:bg-white/[0.15] transition-all duration-300"
              title={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
            >
              {theme === 'dark' ? <Sun className="w-[18px] h-[18px] text-amber-300" /> : <Moon className="w-[18px] h-[18px] text-white/70" />}
            </button>
          </div>

          {/* Center - Exchange Rate */}
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/[0.08] rounded-full transition-all duration-300 hover:bg-white/[0.12]">
              <CreditCard className="w-3.5 h-3.5 text-white/40" />
              <span className="text-[13px] font-semibold text-white/90 tabular-nums">
                {currentRate ? currentRate.toLocaleString() : '...'}
              </span>
            </div>
          </div>

          {/* Right Side - Logo */}
          <div className="flex items-center flex-shrink-0">
            <BrandingLogo navigateHome={false} />
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          isCollapsed={isSidebarCollapsed}
          onCollapseChange={setIsSidebarCollapsed}
        />

        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 relative ${!isSidebarOpen
            ? 'mr-0'
            : isSidebarCollapsed
              ? 'md:mr-20'
              : 'md:mr-64'
            } bg-slate-50 dark:bg-transparent pb-20 md:pb-6`}
        >
          <div className="w-full h-full max-w-[1920px] mx-auto p-4 md:p-6 space-y-6">
            {children}
          </div>
        </main>
      </div>

      <MobileBottomNav />
      <GlobalModals />
    </div >
  );
};

export default Layout;
