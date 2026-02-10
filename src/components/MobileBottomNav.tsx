import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Fingerprint, Wallet, Building2, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';

const MobileBottomNav: React.FC = () => {
    const { theme } = useTheme();
    const location = useLocation();

    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'الرئيسية' },
        { path: '/accounts', icon: Wallet, label: 'الحسابات' },
        { path: '/attendance', icon: Fingerprint, label: 'الحضور', isCenter: true },
        { path: '/companies', icon: Building2, label: 'الشركات' },
        { path: '/profile', icon: User, label: 'الملف' },
    ];

    const isDark = theme === 'dark';

    return (
        <nav
            className={`md:hidden fixed bottom-0 left-0 right-0 z-50 transition-colors duration-300`}
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
        >
            {/* Frosted glass background */}
            <div className={`absolute inset-0 backdrop-blur-2xl ${isDark
                    ? 'bg-gray-950/85'
                    : 'bg-white/85'
                }`} />
            {/* Top border glow */}
            <div className={`absolute top-0 left-0 right-0 h-[1px] ${isDark
                    ? 'bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent'
                    : 'bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent'
                }`} />

            <div className="relative flex justify-around items-end max-w-lg mx-auto px-2 pt-2 pb-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    // Center floating button (Attendance)
                    if (item.isCenter) {
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className="relative -top-5 z-10"
                            >
                                {/* Outer glow ring */}
                                {isActive && (
                                    <motion.div
                                        className={`absolute inset-[-6px] rounded-full ${isDark
                                                ? 'bg-emerald-500/20'
                                                : 'bg-emerald-400/15'
                                            }`}
                                        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                    />
                                )}
                                <motion.div
                                    whileTap={{ scale: 0.9 }}
                                    className={`relative w-[60px] h-[60px] rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl border-[3px] ${isActive
                                            ? isDark
                                                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400/50 shadow-emerald-500/40 text-white'
                                                : 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-300 shadow-emerald-500/30 text-white'
                                            : isDark
                                                ? 'bg-gray-900 border-gray-700 text-emerald-500'
                                                : 'bg-white border-gray-200 text-emerald-600 shadow-lg'
                                        }`}
                                >
                                    <Icon className="w-7 h-7" strokeWidth={2.5} />
                                </motion.div>
                                <span className={`block text-center mt-1 text-[9px] font-black tracking-tight transition-colors duration-300 ${isActive
                                        ? 'text-emerald-500'
                                        : isDark ? 'text-gray-500' : 'text-gray-400'
                                    }`}>
                                    {item.label}
                                </span>
                            </NavLink>
                        );
                    }

                    // Regular nav items
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className="relative flex flex-col items-center gap-0.5 py-1 px-3"
                        >
                            <motion.div
                                whileTap={{ scale: 0.85 }}
                                className="relative flex flex-col items-center"
                            >
                                {/* Active indicator dot */}
                                {isActive && (
                                    <motion.div
                                        layoutId="mobile-nav-indicator"
                                        className={`absolute -top-1.5 w-5 h-[3px] rounded-full ${isDark
                                                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                                                : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                                            }`}
                                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                    />
                                )}

                                <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive
                                        ? isDark
                                            ? 'bg-emerald-500/10 text-emerald-400'
                                            : 'bg-emerald-50 text-emerald-600'
                                        : isDark
                                            ? 'text-gray-500'
                                            : 'text-gray-400'
                                    }`}>
                                    <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : ''
                                        }`} strokeWidth={isActive ? 2.5 : 2} />
                                </div>

                                <span className={`text-[9px] font-black tracking-tight transition-all duration-300 ${isActive
                                        ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                                        : isDark ? 'text-gray-600' : 'text-gray-400'
                                    }`}>
                                    {item.label}
                                </span>
                            </motion.div>
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileBottomNav;
