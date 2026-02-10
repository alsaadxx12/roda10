import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import ExchangeRateChart from './components/ExchangeRateChart';
import RecentVouchers from './components/RecentVouchers';
import { useExchangeRate } from '../../contexts/ExchangeRateContext';
import EmployeeOfTheMonthBanner from '../../components/EmployeeOfTheMonthBanner';
import { motion } from 'framer-motion';
import {
  Building2,
  Wallet,
  CreditCard,
  Calendar,
  Clock,
  Sparkles
} from 'lucide-react';

export default function DashboardContent() {
  const { user, employee } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [stats, setStats] = useState({ total: 0, credit: 0, cash: 0 });
  const { currentRate, history: rateHistory, isLoading: isLoadingRate } = useExchangeRate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const companiesRef = collection(db, 'companies');
        const totalSnapshot = await getCountFromServer(companiesRef);
        const total = totalSnapshot.data().count;

        const creditQuery = query(collection(db, 'companies'), where('paymentType', '==', 'credit'));
        const cashQuery = query(collection(db, 'companies'), where('paymentType', '==', 'cash'));

        const [creditSnapshot, cashSnapshot] = await Promise.all([
          getCountFromServer(creditQuery),
          getCountFromServer(cashQuery)
        ]);

        setStats({ total, credit: creditSnapshot.data().count, cash: cashSnapshot.data().count });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, [user]);

  const formattedRateHistory = useMemo(() => {
    if (!rateHistory) return [];
    return rateHistory
      .map(h => ({
        date: new Date(h.created_at).toLocaleDateString('en-CA'),
        rate: h.rate
      }))
      .slice(0, 30)
      .reverse();
  }, [rateHistory]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 17) return 'مساء الخير';
    return 'مساء الخير';
  };

  const statCards = [
    {
      title: 'إجمالي الكيانات',
      value: stats.total,
      icon: <Building2 className="w-5 h-5" />,
      gradient: 'from-emerald-500 to-teal-600',
      lightBg: 'bg-emerald-50 border-emerald-200',
      darkBg: 'bg-emerald-900/20 border-emerald-800/40',
      iconBg: isDark ? 'bg-emerald-500/15' : 'bg-emerald-100',
      iconColor: isDark ? 'text-emerald-400' : 'text-emerald-600',
    },
    {
      title: 'الشركات النقد',
      value: stats.cash,
      icon: <Wallet className="w-5 h-5" />,
      gradient: 'from-green-500 to-emerald-600',
      lightBg: 'bg-green-50 border-green-200',
      darkBg: 'bg-green-900/20 border-green-800/40',
      iconBg: isDark ? 'bg-green-500/15' : 'bg-green-100',
      iconColor: isDark ? 'text-green-400' : 'text-green-600',
    },
    {
      title: 'الشركات الآجل',
      value: stats.credit,
      icon: <CreditCard className="w-5 h-5" />,
      gradient: 'from-amber-500 to-orange-600',
      lightBg: 'bg-amber-50 border-amber-200',
      darkBg: 'bg-amber-900/20 border-amber-800/40',
      iconBg: isDark ? 'bg-amber-500/15' : 'bg-amber-100',
      iconColor: isDark ? 'text-amber-400' : 'text-amber-600',
    },
  ];

  const containerAnim = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemAnim = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <motion.div className="space-y-5" variants={containerAnim} initial="hidden" animate="show">

      {/* Welcome Header */}
      <motion.div
        variants={itemAnim}
        className={`relative rounded-2xl overflow-hidden border ${isDark ? 'bg-gray-800/50 border-gray-700/60' : 'bg-white border-gray-200'}`}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${isDark ? 'from-emerald-900/15 via-transparent to-blue-900/10' : 'from-emerald-50/80 via-transparent to-blue-50/30'}`} />
        <div className="relative p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-100/80'}`}>
              <Sparkles className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <div>
              <h1 className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {getGreeting()}{employee?.name ? `, ${employee.name}` : ''}
              </h1>
              <div className={`flex items-center gap-3 mt-1 text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {currentTime.toLocaleDateString('ar-EG-u-nu-latn', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {currentTime.toLocaleTimeString('ar-EG-u-nu-latn', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          {/* Mini exchange rate badge */}
          <div className={`hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl border ${isDark ? 'bg-gray-700/40 border-gray-600/50' : 'bg-gray-50 border-gray-200'}`}>
            <span className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>سعر الصرف</span>
            <span className={`text-lg font-black font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{currentRate.toLocaleString()}</span>
            <span className={`text-[10px] font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>د.ع</span>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {statCards.map((card) => (
          <motion.div
            key={card.title}
            variants={itemAnim}
            className={`relative group rounded-xl p-4 border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${isDark ? card.darkBg : card.lightBg}`}
          >
            {/* Subtle gradient overlay */}
            <div className={`absolute -top-1/3 -right-1/4 w-2/3 h-2/3 bg-gradient-to-br ${card.gradient} rounded-full opacity-[0.06] blur-3xl group-hover:opacity-[0.1] transition-opacity`} />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${card.iconBg}`}>
                  <div className={card.iconColor}>{card.icon}</div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {card.title}
                </span>
              </div>
              <p className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${card.gradient}`}>
                {card.value.toLocaleString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Exchange Rate Chart */}
      <motion.div variants={itemAnim}>
        <ExchangeRateChart
          data={formattedRateHistory}
          currentRate={currentRate}
          isLoading={isLoadingRate}
        />
      </motion.div>

      <motion.div variants={itemAnim}>
        <EmployeeOfTheMonthBanner />
      </motion.div>

      {/* Recent Vouchers */}
      <motion.div variants={itemAnim}>
        <RecentVouchers />
      </motion.div>
    </motion.div>
  );
}
