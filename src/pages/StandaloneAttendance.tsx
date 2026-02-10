import React from 'react';
import { useNavigate } from 'react-router-dom';
import AttendanceCard from './Attendance/components/AttendanceCard';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import BrandingLogo from '../components/BrandingLogo';
import { motion } from 'framer-motion';
import { LayoutDashboard, LogOut } from 'lucide-react';

const StandaloneAttendance: React.FC = () => {
  const { theme } = useTheme();
  const { employee, signOut } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col items-center justify-between relative overflow-hidden font-['Tajawal'] ${isDark ? 'bg-[#0a0e1a]' : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20'
      }`}>

      {/* Animated gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute -top-32 -right-32 w-72 h-72 rounded-full blur-[120px] ${isDark ? 'bg-emerald-600/20' : 'bg-emerald-400/15'
            }`}
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 60, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute -bottom-32 -left-32 w-72 h-72 rounded-full blur-[120px] ${isDark ? 'bg-blue-600/15' : 'bg-blue-400/10'
            }`}
        />
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[160px] ${isDark ? 'bg-purple-600/10' : 'bg-indigo-300/10'
            }`}
        />
      </div>

      {/* Top Section — Logo & Greeting */}
      <div className="relative z-10 w-full flex flex-col items-center pt-10 pb-4 px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-3"
        >
          <BrandingLogo size={48} showGlow navigateHome={false} />
          {employee && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center mt-2"
            >
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                مرحباً بك
              </p>
              <h2 className={`text-xl font-bold mt-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {employee.name}
              </h2>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Center — Attendance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <AttendanceCard />
      </motion.div>

      {/* Bottom — Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 w-full max-w-md px-6 pb-10 pt-6"
      >
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 active:scale-95 ${isDark
                ? 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/10'
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm'
              }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            لوحة التحكم
          </button>
          <button
            onClick={() => signOut().catch(console.error)}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 active:scale-95 ${isDark
                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
              }`}
          >
            <LogOut className="w-4 h-4" />
            خروج
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default StandaloneAttendance;
