import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useExchangeRate } from '../../contexts/ExchangeRateContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Calendar,
    ArrowLeftRight,
    Coins,
    PlaneTakeoff,
    LogIn,
    Globe2,
    ChevronDown,
    MessageCircle,
    ArrowRight,
    ShieldCheck,
    Send,
    X,
    Zap,
    Building2
} from 'lucide-react';

// Specialized Airport Data
const AIRPORTS = [
    // Iraq State
    { name: 'Baghdad Intl', city: 'Baghdad', country: 'Iraq', iata: 'BGW', flag: '🇮🇶' },
    { name: 'Basra Intl', city: 'Basra', country: 'Iraq', iata: 'BSR', flag: '🇮🇶' },
    { name: 'Erbil Intl', city: 'Erbil', country: 'Iraq', iata: 'EBL', flag: '🇮🇶' },
    { name: 'Sulaimaniyah Intl', city: 'Sulaimaniyah', country: 'Iraq', iata: 'ISU', flag: '🇮🇶' },
    { name: 'Najaf Intl', city: 'Najaf', country: 'Iraq', iata: 'NJF', flag: '🇮🇶' },
    // Turkey State
    { name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', iata: 'IST', flag: '🇹🇷' },
    { name: 'Sabiha Gökçen', city: 'Istanbul', country: 'Turkey', iata: 'SAW', flag: '🇹🇷' },
    { name: 'Ankara Esenboğa', city: 'Ankara', country: 'Turkey', iata: 'ESB', flag: '🇹🇷' },
    { name: 'Antalya Airport', city: 'Antalya', country: 'Turkey', iata: 'AYT', flag: '🇹🇷' },
    // UAE State
    { name: 'Dubai Intl', city: 'Dubai', country: 'UAE', iata: 'DXB', flag: '🇦🇪' },
    { name: 'Abu Dhabi Intl', city: 'Abu Dhabi', country: 'UAE', iata: 'AUH', flag: '🇦🇪' },
    { name: 'Sharjah Intl', city: 'Sharjah', country: 'UAE', iata: 'SHJ', flag: '🇦🇪' },
    // Saudi State
    { name: 'King Khalid Intl', city: 'Riyadh', country: 'Saudi Arabia', iata: 'RUH', flag: '🇸🇦' },
    { name: 'King Abdulaziz Intl', city: 'Jeddah', country: 'Saudi Arabia', iata: 'JED', flag: '🇸🇦' },
    { name: 'Prince Mohammad Intl', city: 'Medina', country: 'Saudi Arabia', iata: 'MED', flag: '🇸🇦' },
    // Middle East
    { name: 'Cairo Intl', city: 'Cairo', country: 'Egypt', iata: 'CAI', flag: '🇪🇬' },
    { name: 'Hamad Intl', city: 'Doha', country: 'Qatar', iata: 'DOH', flag: '🇶🇦' },
    { name: 'Queen Alia Intl', city: 'Amman', country: 'Jordan', iata: 'AMM', flag: '🇯🇴' },
    { name: 'Rafic Hariri Intl', city: 'Beirut', country: 'Lebanon', iata: 'BEY', flag: '🇱🇧' },
    // Europe & USA
    { name: 'London Heathrow', city: 'London', country: 'UK', iata: 'LHR', flag: '🇬🇧' },
    { name: 'Paris CDG', city: 'Paris', country: 'France', iata: 'CDG', flag: '🇫🇷' },
    { name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', iata: 'FRA', flag: '🇩🇪' },
    { name: 'John F Kennedy', city: 'New York', country: 'USA', iata: 'JFK', flag: '🇺🇸' },
    { name: 'Singapore Changi', city: 'Singapore', country: 'Singapore', iata: 'SIN', flag: '🇸🇬' },
].sort((a, b) => a.country.localeCompare(b.country));

const COUNTRIES = Array.from(new Set(AIRPORTS.map(a => a.country))).sort();

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { theme, customSettings } = useTheme();
    const { currentRate: systemRate } = useExchangeRate();
    const [currentTime, setCurrentTime] = useState(new Date());

    // Currency State
    const [usdAmount, setUsdAmount] = useState<string>('');
    const [iqdAmount, setIqdAmount] = useState<string>('');
    const [isUsdToIqd, setIsUsdToIqd] = useState(true);

    // Airport Search State
    const [airportQuery, setAirportQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const [showAirportList, setShowAirportList] = useState(false);

    // Persian Date State
    const [persianInput, setPersianInput] = useState({ year: '1402', month: '11', day: '20' });
    const [convertedGregorian, setConvertedGregorian] = useState('');

    // WhatsApp Chat Modal State
    const [showChat, setShowChat] = useState(false);
    const [chatMessage, setChatMessage] = useState('');

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Conversion Logic
    useEffect(() => {
        if (isUsdToIqd) {
            if (usdAmount) setIqdAmount(Math.round(parseFloat(usdAmount) * systemRate).toLocaleString());
            else setIqdAmount('');
        } else {
            if (iqdAmount) setUsdAmount((parseFloat(iqdAmount.replace(/,/g, '')) / systemRate).toFixed(2));
            else setUsdAmount('');
        }
    }, [usdAmount, iqdAmount, systemRate, isUsdToIqd]);

    // Persian to Gregorian approximation
    useEffect(() => {
        try {
            const y = parseInt(persianInput.year);
            const m = parseInt(persianInput.month);
            const d = parseInt(persianInput.day);
            if (y && m && d) {
                // Approximate j-date to g-date
                setConvertedGregorian(`${y + 621}/${m}/${d} Standard`);
            }
        } catch { /* ignore */ }
    }, [persianInput]);

    const filteredAirports = useMemo(() => {
        return AIRPORTS.filter(airport => {
            const matchesQuery = airport.name.toLowerCase().includes(airportQuery.toLowerCase()) ||
                airport.city.toLowerCase().includes(airportQuery.toLowerCase()) ||
                airport.iata.toLowerCase().includes(airportQuery.toLowerCase());
            const matchesCountry = selectedCountry ? airport.country === selectedCountry : true;
            return matchesQuery && matchesCountry;
        });
    }, [airportQuery, selectedCountry]);

    const toggleCurrencyMode = () => {
        setIsUsdToIqd(!isUsdToIqd);
        setUsdAmount('');
        setIqdAmount('');
    };

    const handleWhatsAppSubmit = () => {
        if (chatMessage.trim()) {
            const url = `https://wa.me/9647700000000?text=${encodeURIComponent(chatMessage)}`;
            window.open(url, '_blank');
            setChatMessage('');
            setShowChat(false);
        }
    };

    return (
        <div className={`min-h-screen font-['Outfit'] antialiased selection:bg-emerald-400 selection:text-white relative overflow-hidden transition-colors duration-700 ${theme === 'dark' ? 'bg-[#010807] text-white' : 'bg-slate-50 text-slate-900'
            }`}>
            {/* Ultra Premium Animated Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.05, 0.08, 0.05]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] right-[10%] w-[800px] h-[800px] bg-emerald-500/10 blur-[150px] rounded-full"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.05, 0.1, 0.05]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[-20%] left-[5%] w-[600px] h-[600px] bg-teal-500/10 blur-[150px] rounded-full"
                />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:60px_60px]" />
            </div>

            <main className="relative z-10 pt-12 pb-32 px-6 max-w-[1500px] mx-auto min-h-screen flex flex-col">
                {/* Hero Header - High Impact */}
                <header className="flex flex-col items-center mb-20 text-center relative">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, type: "spring" }}
                        className="mb-14 relative group"
                    >
                        <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                        {customSettings.logoUrl ? (
                            <img
                                src={customSettings.logoUrl}
                                alt="Logo"
                                className="h-40 md:h-52 w-auto object-contain drop-shadow-[0_0_30px_rgba(16,185,129,0.4)] relative z-10 transition-transform duration-700 group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="w-28 h-28 bg-emerald-600 rounded-[35px] flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)]">
                                    <PlaneTakeoff className="w-14 h-14 text-white" />
                                </div>
                                <span className="text-7xl font-black tracking-tighter bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                                    {customSettings.logoText || 'RODA10'}
                                </span>
                            </div>
                        )}
                    </motion.div>

                    <div className="flex flex-col items-center gap-10">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                            className="px-8 py-3 rounded-full bg-emerald-500/5 border border-emerald-500/10 backdrop-blur-xl flex items-center gap-4 shadow-xl"
                        >
                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping shadow-[0_0_15px_#10b981]" />
                            <span className="text-xs font-black uppercase tracking-[0.4em] text-emerald-400">Enterprise Travel OS v10</span>
                            <div className="w-[1px] h-4 bg-white/10" />
                            <span className="text-sm font-black font-mono text-gray-500">{currentTime.toLocaleTimeString([], { hour12: false })}</span>
                        </motion.div>

                        <button
                            onClick={() => navigate(user ? '/attendance-standalone' : '/login')}
                            className="group relative flex items-center gap-6 bg-[#10b981] hover:bg-[#059669] text-white px-16 py-7 rounded-[30px] font-black text-lg uppercase tracking-[0.2em] transition-all shadow-[0_25px_50px_-12px_rgba(16,185,129,0.4)] hover:shadow-[0_30px_60px_-15px_rgba(16,185,129,0.6)] active:scale-95 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <LogIn size={28} className="transition-all group-hover:rotate-12 group-hover:scale-110" />
                            {user ? 'لوحة التحكم المركزية' : 'Agent Access Terminal'}
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                    {/* LEFT PANEL (2/3) */}
                    <div className="lg:col-span-8 flex flex-col gap-10">

                        {/* 1. Global Intelligence Airport Hub */}
                        <section className="bg-white/[0.02] border border-white/5 rounded-[50px] p-12 hover:bg-white/[0.04] transition-all relative overflow-hidden group shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-6 relative z-10">
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-[0.3em] text-emerald-500 flex items-center gap-3 mb-2">
                                        <Globe2 size={20} className="animate-spin-slow" /> Global Airport Intelligence
                                    </h4>
                                    <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest pl-8">Accessing real-time IATA node database</p>
                                </div>
                                <div className="flex p-1.5 bg-black/40 rounded-2xl backdrop-blur-md border border-white/5">
                                    <button className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white shadow-lg transition-all">Airports</button>
                                    <button className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">Airlines</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
                                <div className="md:col-span-1">
                                    <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-3 mb-2 block">Region/Country</label>
                                    <div className="relative">
                                        <select
                                            value={selectedCountry}
                                            onChange={(e) => setSelectedCountry(e.target.value)}
                                            className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-5 text-xs font-black focus:border-emerald-500/50 outline-none appearance-none cursor-pointer transition-all"
                                        >
                                            <option value="">Select Domain</option>
                                            {COUNTRIES.map(c => <option key={c} value={c} className="bg-[#011410] text-white">{c}</option>)}
                                        </select>
                                        <ChevronDown size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="md:col-span-3">
                                    <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-3 mb-2 block">Intelligence Search</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={airportQuery}
                                            onChange={(e) => { setAirportQuery(e.target.value); setShowAirportList(true); }}
                                            onFocus={() => setShowAirportList(true)}
                                            placeholder="Type Airport Name, City or IATA Code..."
                                            className="w-full bg-black/60 border border-white/10 rounded-2xl px-14 py-5 text-lg font-bold placeholder:text-gray-700 focus:border-emerald-500/50 outline-none transition-all shadow-inner"
                                        />
                                        <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {showAirportList && (airportQuery || selectedCountry) && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="absolute top-full left-0 right-0 mt-6 bg-[#021814] border border-white/10 rounded-[35px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] z-50 max-h-[450px] overflow-y-auto scrollbar-hide backdrop-blur-3xl"
                                        >
                                            <div className="p-4 space-y-3">
                                                {filteredAirports.length > 0 ? filteredAirports.map((air, idx) => (
                                                    <motion.button
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        key={air.iata}
                                                        onClick={() => { setAirportQuery(air.name); setShowAirportList(false); }}
                                                        className="w-full p-6 hover:bg-emerald-500/10 rounded-3xl flex items-center justify-between transition-all group border border-transparent hover:border-emerald-500/20"
                                                    >
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-16 h-16 bg-emerald-500/10 flex items-center justify-center rounded-2xl text-emerald-400 font-black text-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                                {air.iata}
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors">{air.city}</div>
                                                                <div className="text-xs font-bold text-gray-500 flex items-center gap-2">
                                                                    <Building2 size={12} /> {air.name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black text-gray-500 uppercase">{air.country}</div>
                                                            <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{air.flag}</span>
                                                        </div>
                                                    </motion.button>
                                                )) : (
                                                    <div className="py-24 text-center">
                                                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                                            <Zap size={32} className="text-gray-800" />
                                                        </div>
                                                        <p className="text-xs font-black text-gray-700 uppercase tracking-[0.4em]">No matching node detected</p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </section>

                        {/* 2. Pro Exchange Terminal */}
                        <section className="bg-white/[0.02] border border-white/5 rounded-[50px] p-12 hover:bg-white/[0.04] transition-all relative overflow-hidden group shadow-2xl">
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

                            <div className="flex items-center justify-between mb-12 relative z-10">
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-[0.3em] text-emerald-500 flex items-center gap-3 mb-2">
                                        <Coins size={20} /> Pro Exchange Terminal
                                    </h4>
                                    <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest pl-8">Bidirectional financial conversion logic</p>
                                </div>
                                <button onClick={toggleCurrencyMode} className="group p-4 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-2xl border border-emerald-500/20 transition-all active:scale-90 shadow-xl">
                                    <ArrowLeftRight size={22} className={`transition-transform duration-700 ${isUsdToIqd ? '' : 'rotate-180'}`} />
                                </button>
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                <div className="flex-1 w-full space-y-4">
                                    <div className="flex items-center justify-between px-3">
                                        <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{isUsdToIqd ? 'Input: US Dollar' : 'Input: Iraqi Dinar'}</label>
                                        <Zap size={12} className="text-emerald-500 animate-pulse" />
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 rounded-full" />
                                        <input
                                            type="number"
                                            value={isUsdToIqd ? usdAmount : iqdAmount}
                                            onChange={(e) => isUsdToIqd ? setUsdAmount(e.target.value) : setIqdAmount(e.target.value)}
                                            className="w-full bg-black/60 border border-white/10 rounded-3xl p-10 text-5xl font-black outline-none focus:bg-black/80 transition-all shadow-inner text-center"
                                            placeholder="0"
                                        />
                                        <span className="absolute left-8 top-1/2 -translate-y-1/2 text-2xl font-black text-emerald-500/40">{isUsdToIqd ? 'USD' : 'IQD'}</span>
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-center justify-center">
                                    <div className="w-16 h-16 bg-[#021410] rounded-full border border-white/10 flex items-center justify-center shadow-2xl relative">
                                        <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full animate-ping" />
                                        <ArrowRight size={28} className="text-emerald-500 md:rotate-0 rotate-90" />
                                    </div>
                                </div>

                                <div className="flex-1 w-full space-y-4">
                                    <div className="flex items-center justify-between px-3">
                                        <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{isUsdToIqd ? 'Output: IQ Dinar' : 'Output: US Dollar'}</label>
                                        <ShieldCheck size={12} className="text-emerald-500" />
                                    </div>
                                    <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-10 flex flex-col items-center justify-center min-h-[148px] backdrop-blur-md shadow-inner">
                                        <div className="text-5xl font-black text-emerald-400 tracking-tight">
                                            {isUsdToIqd ? (iqdAmount || '0') : (usdAmount || '0')}
                                        </div>
                                        <span className="mt-2 text-xs font-black text-emerald-500/60 uppercase tracking-widest">{isUsdToIqd ? 'IQD Currency' : 'USD Currency'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 flex items-center justify-center gap-10 opacity-60">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">System Rate: {systemRate} IQD</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-teal-500 rounded-full" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Network Secure</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT PANEL (1/3) */}
                    <div className="lg:col-span-4 flex flex-col gap-10">
                        {/* 3. Specialized Persian Chrono */}
                        <section className="bg-white/[0.02] border border-white/5 rounded-[50px] p-10 shadow-2xl relative overflow-hidden">
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500 flex items-center gap-3 mb-10">
                                <Calendar size={20} /> Persian Chrono System
                            </h4>
                            <div className="space-y-8 relative z-10">
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { label: 'Year', key: 'year' },
                                        { label: 'Month', key: 'month' },
                                        { label: 'Day', key: 'day' }
                                    ].map((input) => (
                                        <div key={input.key} className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">{input.label}</label>
                                            <input
                                                type="text"
                                                value={(persianInput as any)[input.key]}
                                                onChange={e => setPersianInput({ ...persianInput, [input.key]: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-center font-black text-xl outline-none focus:border-emerald-500/40 shadow-inner"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-center -my-4 h-10 items-center">
                                    <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                                        <ArrowRight size={20} className="text-emerald-500 rotate-90" />
                                    </motion.div>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                                    <div className="relative p-8 rounded-[35px] bg-[#10b981] text-black text-center shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] border border-white/10">
                                        <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-3">Converted Gregorian</div>
                                        <div className="text-3xl font-black tracking-tight">{convertedGregorian}</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 4. Enterprise Shield */}
                        <div className="bg-[#02120e] border border-white/5 rounded-[50px] p-12 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute -top-20 -right-20 w-64 h-64 border border-emerald-500/5 rounded-full"
                            />
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-8 relative transition-transform group-hover:scale-110 duration-700">
                                <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20" />
                                <ShieldCheck className="w-10 h-10 text-emerald-500 relative z-10" />
                            </div>
                            <h4 className="text-2xl font-black mb-4 tracking-tight">Secured Agency Node</h4>
                            <p className="text-[11px] font-bold text-gray-500 leading-relaxed uppercase tracking-[0.2em] max-w-[200px]">
                                Protocol AES-256 <br /> Military Grade Cryptography
                            </p>
                            <div className="mt-10 flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse delay-75" />
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse delay-150" />
                            </div>
                        </div>

                        {/* 5. Live Market Feed Placeholder */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-[50px] p-10 shadow-2xl">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-8 flex items-center gap-2">
                                <Zap size={14} className="text-emerald-500" /> System Uptime Live
                            </h4>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Main Cluster</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-black">99.98%</span>
                                        <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 w-[99%]" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">B2B API Gate</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-black">Online</span>
                                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Premium WhatsApp Chat Widget */}
            <div className="fixed bottom-12 left-12 z-[100] flex flex-col items-end gap-6">
                <AnimatePresence>
                    {showChat && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(10px)" }}
                            className="w-[380px] bg-[#010c0a] border border-white/10 rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-3xl"
                        >
                            <div className="p-8 bg-emerald-600 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                            <MessageCircle className="text-white w-8 h-8" />
                                        </div>
                                        <div>
                                            <h5 className="text-white font-black text-lg">Support Terminal</h5>
                                            <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest">Online - Ready to help</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowChat(false)} className="text-white/60 hover:text-white transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                    <p className="text-xs font-medium text-gray-300 leading-relaxed italic">
                                        "Welcome to RODA10 Support. How can we assist your agency operations today?"
                                    </p>
                                </div>
                                <div className="relative">
                                    <textarea
                                        value={chatMessage}
                                        onChange={(e) => setChatMessage(e.target.value)}
                                        placeholder="Type your message here..."
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-medium outline-none focus:border-emerald-500/40 min-h-[120px] resize-none pb-14"
                                    />
                                    <button
                                        onClick={handleWhatsAppSubmit}
                                        className="absolute bottom-4 right-4 bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl transition-all shadow-lg active:scale-90"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="px-8 pb-8 text-center">
                                <span className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em]">Official Agency Communication</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    onClick={() => setShowChat(!showChat)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{
                        x: [0, -2, 2, -2, 2, 0],
                    }}
                    transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 5,
                        ease: "easeInOut"
                    }}
                    className="w-24 h-24 bg-[#10b981] rounded-full flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(16,185,129,0.5)] z-50 transition-all hover:bg-emerald-500 group relative"
                >
                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-10" />
                    <MessageCircle size={38} className="text-white relative z-10 transition-transform group-hover:rotate-12" />
                </motion.button>
            </div>

            {/* Minimal High-End Footer */}
            <footer className="mt-20 py-32 border-t border-white/5 bg-black/60 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                <div className="max-w-[1500px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-16 relative z-10">
                    <div className="flex flex-col gap-6 text-center md:text-right">
                        <div className="flex items-center justify-center md:justify-start gap-5">
                            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl">R</div>
                            <span className="text-4xl font-black tracking-tighter uppercase gradation-text">{customSettings.logoText || 'RODA10'}</span>
                        </div>
                        <p className="text-xs font-black text-gray-700 uppercase tracking-[0.5em]">The Next Generation of Flight Business Intelligence.</p>
                    </div>

                    <div className="flex gap-16 text-[10px] font-black uppercase tracking-[0.4em] text-gray-700">
                        <a href="#" className="hover:text-emerald-500 transition-colors">Architecture</a>
                        <a href="#" className="hover:text-emerald-500 transition-colors">Security</a>
                        <a href="#" className="hover:text-emerald-500 transition-colors">Legal</a>
                    </div>

                    <div className="text-[10px] font-black text-gray-800 uppercase tracking-widest bg-white/5 px-6 py-3 rounded-full border border-white/5">
                        © 2024 RODA10 TECHNOLOGY GLOBAL. ALL RIGHTS RESERVED.
                    </div>
                </div>
            </footer>

            <style>{`
                .animate-spin-slow { animation: spin 8s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .gradation-text {
                    background: linear-gradient(to right, #10b981, #2dd4bf);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
