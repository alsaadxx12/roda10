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
    LogIn,
    Globe2,
    ChevronDown,
    MessageCircle,
    ArrowRight,
    ShieldCheck,
    Send,
    X,
    Zap,
    Activity,
    Cpu,
    Radio,
    Terminal,
    Database
} from 'lucide-react';
import BrandingLogo from '../../components/BrandingLogo';

// Specialized Airport Data
const AIRPORTS = [
    // Middle East
    { name: 'Baghdad Intl', city: 'Baghdad', country: 'Iraq', iata: 'BGW', flag: '🇮🇶' },
    { name: 'Basra Intl', city: 'Basra', country: 'Iraq', iata: 'BSR', flag: '🇮🇶' },
    { name: 'Erbil Intl', city: 'Erbil', country: 'Iraq', iata: 'EBL', flag: '🇮🇶' },
    { name: 'Sulaimaniyah Intl', city: 'Sulaimaniyah', country: 'Iraq', iata: 'ISU', flag: '🇮🇶' },
    { name: 'Najaf Intl', city: 'Najaf', country: 'Iraq', iata: 'NJF', flag: '🇮🇶' },
    { name: 'Dubai Intl', city: 'Dubai', country: 'UAE', iata: 'DXB', flag: '🇦🇪' },
    { name: 'Abu Dhabi Intl', city: 'Abu Dhabi', country: 'UAE', iata: 'AUH', flag: '🇦🇪' },
    { name: 'Sharjah Intl', city: 'Sharjah', country: 'UAE', iata: 'SHJ', flag: '🇦🇪' },
    { name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', iata: 'IST', flag: '🇹🇷' },
    { name: 'Sabiha Gökçen', city: 'Istanbul', country: 'Turkey', iata: 'SAW', flag: '🇹🇷' },
    { name: 'King Khalid Intl', city: 'Riyadh', country: 'Saudi Arabia', iata: 'RUH', flag: '🇸🇦' },
    { name: 'King Abdulaziz Intl', city: 'Jeddah', country: 'Saudi Arabia', iata: 'JED', flag: '🇸🇦' },
    { name: 'Queen Alia Intl', city: 'Amman', country: 'Jordan', iata: 'AMM', flag: '🇯🇴' },
    { name: 'Beirut Rafic Hariri', city: 'Beirut', country: 'Lebanon', iata: 'BEY', flag: '🇱🇧' },
    { name: 'Kuwait Intl', city: 'Kuwait City', country: 'Kuwait', iata: 'KWI', flag: '🇰🇼' },
    { name: 'Muscat Intl', city: 'Muscat', country: 'Oman', iata: 'MCT', flag: '🇴🇲' },
    { name: 'Hamad Intl', city: 'Doha', country: 'Qatar', iata: 'DOH', flag: '🇶🇦' },
    { name: 'Bahrain Intl', city: 'Manama', country: 'Bahrain', iata: 'BAH', flag: '🇧🇭' },
    { name: 'Cairo Intl', city: 'Cairo', country: 'Egypt', iata: 'CAI', flag: '🇪🇬' },
    { name: 'Tehran Imam Khomeini', city: 'Tehran', country: 'Iran', iata: 'IKA', flag: '🇮🇷' },

    // Europe
    { name: 'London Heathrow', city: 'London', country: 'UK', iata: 'LHR', flag: '🇬🇧' },
    { name: 'Paris Charles de Gaulle', city: 'Paris', country: 'France', iata: 'CDG', flag: '🇫🇷' },
    { name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', iata: 'FRA', flag: '🇩🇪' },
    { name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands', iata: 'AMS', flag: '🇳🇱' },
    { name: 'Madrid Barajas', city: 'Madrid', country: 'Spain', iata: 'MAD', flag: '🇪🇸' },
    { name: 'Rome Fiumicino', city: 'Rome', country: 'Italy', iata: 'FCO', flag: '🇮🇹' },
    { name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', iata: 'ZRH', flag: '🇨🇭' },
    { name: 'Vienna Intl', city: 'Vienna', country: 'Austria', iata: 'VIE', flag: '🇦🇹' },
    { name: 'Brussels Airport', city: 'Brussels', country: 'Belgium', iata: 'BRU', flag: '🇧🇪' },
    { name: 'Stockholm Arlanda', city: 'Stockholm', country: 'Sweden', iata: 'ARN', flag: '🇸🇪' },
    { name: 'Dublin Airport', city: 'Dublin', country: 'Ireland', iata: 'DUB', flag: '🇮🇪' },
    { name: 'Lisbon Airport', city: 'Lisbon', country: 'Portugal', iata: 'LIS', flag: '🇵🇹' },
    { name: 'Athens Intl', city: 'Athens', country: 'Greece', iata: 'ATH', flag: '🇬🇷' },
    { name: 'Warsaw Chopin', city: 'Warsaw', country: 'Poland', iata: 'WAW', flag: '🇵🇱' },
    { name: 'Prague Václav Havel', city: 'Prague', country: 'Czech Republic', iata: 'PRG', flag: '🇨🇿' },
    { name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark', iata: 'CPH', flag: '🇩🇰' },
    { name: 'Oslo Gardermoen', city: 'Oslo', country: 'Norway', iata: 'OSL', flag: '🇳🇴' },
    { name: 'Helsinki Airport', city: 'Helsinki', country: 'Finland', iata: 'HEL', flag: '🇫🇮' },

    // Asia & Oceania
    { name: 'Tokyo Haneda', city: 'Tokyo', country: 'Japan', iata: 'HND', flag: '🇯🇵' },
    { name: 'Seoul Incheon', city: 'Seoul', country: 'South Korea', iata: 'ICN', flag: '🇰🇷' },
    { name: 'Beijing Capital', city: 'Beijing', country: 'China', iata: 'PEK', flag: '🇨🇳' },
    { name: 'Hong Kong Intl', city: 'Hong Kong', country: 'HK', iata: 'HKG', flag: '🇭🇰' },
    { name: 'Singapore Changi', city: 'Singapore', country: 'Singapore', iata: 'SIN', flag: '🇸🇬' },
    { name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia', iata: 'SYD', flag: '🇦🇺' },
    { name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand', iata: 'AKL', flag: '🇳🇿' },
    { name: 'Delhi Indira Gandhi', city: 'Delhi', country: 'India', iata: 'DEL', flag: '🇮🇳' },
    { name: 'Mumbai Chhatrapati Shivaji', city: 'Mumbai', country: 'India', iata: 'BOM', flag: '🇮🇳' },
    { name: 'Bangkok Suvarnabhumi', city: 'Bangkok', country: 'Thailand', iata: 'BKK', flag: '🇹🇭' },
    { name: 'Kuala Lumpur Intl', city: 'Kuala Lumpur', country: 'Malaysia', iata: 'KUL', flag: '🇲🇾' },
    { name: 'Jakarta Soekarno-Hatta', city: 'Jakarta', country: 'Indonesia', iata: 'CGK', flag: '🇮🇩' },
    { name: 'Manila Ninoy Aquino', city: 'Manila', country: 'Philippines', iata: 'MNL', flag: '🇵🇭' },
    { name: 'Ho Chi Minh Tan Son Nhat', city: 'Ho Chi Minh', country: 'Vietnam', iata: 'SGN', flag: '🇻🇳' },
    { name: 'Karachi Jinnah Intl', city: 'Karachi', country: 'Pakistan', iata: 'KHI', flag: '🇵🇰' },
    { name: 'Colombo Bandaranaike', city: 'Colombo', country: 'Sri Lanka', iata: 'CMB', flag: '🇱🇰' },

    // Americas
    { name: 'New York JFK', city: 'New York', country: 'USA', iata: 'JFK', flag: '🇺🇸' },
    { name: 'Los Angeles Intl', city: 'Los Angeles', country: 'USA', iata: 'LAX', flag: '🇺🇸' },
    { name: 'Toronto Pearson', city: 'Toronto', country: 'Canada', iata: 'YYZ', flag: '🇨🇦' },
    { name: 'Vancouver Intl', city: 'Vancouver', country: 'Canada', iata: 'YVR', flag: '🇨🇦' },
    { name: 'Mexico City Intl', city: 'Mexico City', country: 'Mexico', iata: 'MEX', flag: '🇲🇽' },
    { name: 'São Paulo Guarulhos', city: 'São Paulo', country: 'Brazil', iata: 'GRU', flag: '🇧🇷' },
    { name: 'Buenos Aires Ezeiza', city: 'Buenos Aires', country: 'Argentina', iata: 'EZE', flag: '🇦🇷' },
    { name: 'Santiago Arturo Merino Benítez', city: 'Santiago', country: 'Chile', iata: 'SCL', flag: '🇨🇱' },
    { name: 'Bogotá El Dorado', city: 'Bogotá', country: 'Colombia', iata: 'BOG', flag: '🇨🇴' },
    { name: 'Lima Jorge Chávez', city: 'Lima', country: 'Peru', iata: 'LIM', flag: '🇵🇪' },

    // Africa
    { name: 'Johannesburg OR Tambo', city: 'Johannesburg', country: 'South Africa', iata: 'JNB', flag: '🇿🇦' },
    { name: 'Cape Town Intl', city: 'Cape Town', country: 'South Africa', iata: 'CPT', flag: '🇿🇦' },
    { name: 'Casablanca Mohammed V', city: 'Casablanca', country: 'Morocco', iata: 'CMN', flag: '🇲🇦' },
    { name: 'Nairobi Jomo Kenyatta', city: 'Nairobi', country: 'Kenya', iata: 'NBO', flag: '🇰🇪' },
    { name: 'Addis Ababa Bole', city: 'Addis Ababa', country: 'Ethiopia', iata: 'ADD', flag: '🇪🇹' },
    { name: 'Lagos Murtala Muhammed', city: 'Lagos', country: 'Nigeria', iata: 'LOS', flag: '🇳🇬' },
    { name: 'Algiers Houari Boumediene', city: 'Algiers', country: 'Algeria', iata: 'ALG', flag: '🇩🇿' },
    { name: 'Tunis Carthage', city: 'Tunis', country: 'Tunisia', iata: 'TUN', flag: '🇹🇳' },
].sort((a, b) => a.country.localeCompare(b.country));

const COUNTRIES = Array.from(new Set(AIRPORTS.map(a => a.country))).sort();

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { customSettings } = useTheme();
    const { currentRate: systemRate } = useExchangeRate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState<'search' | 'finance' | 'chrono'>('search');

    // Currency State
    const [usdAmount, setUsdAmount] = useState<string>('');
    const [iqdAmount, setIqdAmount] = useState<string>('');
    const [isUsdToIqd, setIsUsdToIqd] = useState(true);

    // Airport Search State
    const [airportQuery, setAirportQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<string>('');

    // Persian Date State
    const [persianInput, setPersianInput] = useState({ year: '1403', month: '11', day: '21' });
    const [convertedGregorian, setConvertedGregorian] = useState('');

    const toggleCurrencyMode = () => {
        setIsUsdToIqd(!isUsdToIqd);
        setUsdAmount('');
        setIqdAmount('');
    };

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
                setConvertedGregorian(`${y + 621}/${m}/${d} ISO`);
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

    return (
        <div className={`min-h-screen font-['Outfit'] antialiased selection:bg-emerald-500 selection:text-[#010807] relative overflow-hidden bg-[#010807] text-white`}>

            {/* Astra Nova Dynamic Background Core */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(16,185,129,0.05)_0%,_transparent_50%)]" />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3],
                        x: [0, 50, 0],
                        y: [0, 30, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[10%] -left-[10%] w-[100%] h-[100%] bg-[radial-gradient(circle_at_20%_20%,_rgba(16,185,129,0.08)_0%,_transparent_40%)] blur-[100px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.4, 0.2],
                        x: [0, -40, 0],
                        y: [0, -60, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 5 }}
                    className="absolute -bottom-[20%] -right-[10%] w-[100%] h-[100%] bg-[radial-gradient(circle_at_80%_80%,_rgba(20,184,166,0.08)_0%,_transparent_40%)] blur-[100px]"
                />

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

                {/* Noise & Grain */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] contrast-150 brightness-150" />
            </div>

            <main className="relative z-10 px-6 pt-16 pb-40 max-w-[1440px] mx-auto min-h-screen flex flex-col items-center">

                {/* 1. TOP BRANDING & STATUS */}
                <header className="w-full flex flex-col items-center mb-24 animate-in fade-in slide-in-from-top-10 duration-1000">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-emerald-500/50 to-emerald-500/50" />
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="px-6 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-3xl flex items-center gap-3 shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)]"
                        >
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-400">Quantum Network Live</span>
                        </motion.div>
                        <div className="h-[1px] w-24 bg-gradient-to-l from-transparent via-emerald-500/50 to-emerald-500/50" />
                    </div>

                    <div className="relative group mb-12">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-[80px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                        <BrandingLogo size={220} className="relative z-10 scale-110" navigateHome={false} />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col items-center gap-8"
                    >
                        <div className="flex items-center gap-12 text-[#4b5563]">
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Global Time</span>
                                <span className="text-xl font-mono font-black text-emerald-500/80 tracking-widest">{currentTime.toLocaleTimeString([], { hour12: false })}</span>
                            </div>
                            <div className="w-[1px] h-10 bg-white/5" />
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">System Node</span>
                                <span className="text-xl font-mono font-black text-emerald-500/80 tracking-widest">A-X10-99</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate(user ? '/attendance-standalone' : '/login')}
                            className="group relative px-20 py-8 rounded-[35px] bg-emerald-600/10 border border-emerald-500/30 overflow-hidden transition-all hover:bg-emerald-600/20 hover:border-emerald-500/50 shadow-2xl"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <span className="relative z-10 text-xl font-black uppercase tracking-[0.3em] text-emerald-400 group-hover:text-emerald-300 flex items-center gap-6">
                                <LogIn size={24} />
                                {user ? 'لوحة التحكم المركزية' : 'Initiate Agent Access'}
                                <ArrowRight size={20} className="transition-transform group-hover:translate-x-2" />
                            </span>
                        </button>
                    </motion.div>
                </header>

                {/* 2. THE OPERATIONS TERMINAL */}
                <section className="w-full max-w-[1200px] relative animate-in zoom-in-95 duration-700 delay-300">

                    {/* Terminal Frame Decor */}
                    <div className="absolute -top-10 -left-10 w-24 h-24 border-t-2 border-l-2 border-emerald-500/30 rounded-tl-3xl pointer-events-none" />
                    <div className="absolute -bottom-10 -right-10 w-24 h-24 border-b-2 border-r-2 border-emerald-500/30 rounded-br-3xl pointer-events-none" />

                    <div className="bg-[#02120e]/80 border border-white/10 rounded-[50px] overflow-hidden backdrop-blur-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] flex flex-col min-h-[700px]">

                        {/* Terminal Tab Bar */}
                        <div className="flex bg-black/40 border-b border-white/5 p-4 gap-4">
                            {[
                                { id: 'search', label: 'Global Search', icon: Search },
                                { id: 'finance', label: 'Exchange Hub', icon: Coins },
                                { id: 'chrono', label: 'Chrono System', icon: Calendar }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex-1 flex items-center justify-center gap-4 py-5 rounded-3xl transition-all relative overflow-hidden group ${activeTab === tab.id ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-600 hover:bg-white/5 hover:text-gray-400'
                                        }`}
                                >
                                    <tab.icon size={18} className={activeTab === tab.id ? 'animate-pulse' : ''} />
                                    <span className="text-[11px] font-black uppercase tracking-[0.4em]">{tab.label}</span>
                                    {activeTab === tab.id && (
                                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Terminal Content Area */}
                        <div className="flex-1 p-12 relative overflow-hidden">
                            <AnimatePresence mode="wait">
                                {activeTab === 'search' && (
                                    <motion.div
                                        key="search"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="h-full flex flex-col gap-10"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-500">
                                                    <Globe2 size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black uppercase tracking-tighter">IATA Intelligence Hub</h3>
                                                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-1">Direct access to global aviation nodes</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Real-time DB Sync</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                            <div className="md:col-span-6 space-y-3">
                                                <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">Region Override</span>
                                                <div className="relative">
                                                    <select
                                                        value={selectedCountry}
                                                        onChange={(e) => setSelectedCountry(e.target.value)}
                                                        className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-6 text-xs font-black focus:border-emerald-500 outline-none appearance-none transition-all cursor-pointer"
                                                    >
                                                        <option value="">Global Domain</option>
                                                        {COUNTRIES.map(c => <option key={c} value={c} className="bg-[#02120e]">{c}</option>)}
                                                    </select>
                                                    <ChevronDown size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div className="md:col-span-6 space-y-3">
                                                <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">Universal Search Vector</span>
                                                <div className="relative group">
                                                    <input
                                                        type="text"
                                                        value={airportQuery}
                                                        onChange={(e) => setAirportQuery(e.target.value)}
                                                        placeholder="ENTER AIRPORT NAME, CITY OR IATA..."
                                                        className="w-full bg-black/60 border border-white/10 rounded-2xl px-16 py-6 text-lg font-black placeholder:text-gray-800 focus:border-emerald-500 outline-none transition-all shadow-inner"
                                                    />
                                                    <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {(airportQuery || selectedCountry) ? filteredAirports.map((air, idx) => (
                                                    <motion.button
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.03 }}
                                                        key={air.iata}
                                                        className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl flex items-center justify-between group hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all text-right"
                                                    >
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-16 h-16 bg-black/60 rounded-2xl flex items-center justify-center font-black text-2xl text-emerald-500 border border-white/5 transition-all group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-black">
                                                                {air.iata}
                                                            </div>
                                                            <div>
                                                                <div className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tighter">{air.city}</div>
                                                                <div className="text-[10px] font-bold text-gray-600 mt-1 uppercase tracking-widest">{air.name}</div>
                                                            </div>
                                                        </div>
                                                        <span className="text-4xl grayscale group-hover:grayscale-0 transition-all">{air.flag}</span>
                                                    </motion.button>
                                                )) : (
                                                    <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-20">
                                                        <Database size={64} className="text-emerald-500 mb-6" />
                                                        <p className="text-xs font-black uppercase tracking-[0.5em]">Terminal Standby - Input Required</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'finance' && (
                                    <motion.div
                                        key="finance"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="h-full flex flex-col gap-10"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-500">
                                                    <Coins size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black uppercase tracking-tighter">Pro Exchange Terminal</h3>
                                                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-1">Bidirectional high-speed conversion logic</p>
                                                </div>
                                            </div>
                                            <div className="px-6 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center gap-3">
                                                <Zap size={14} className="text-emerald-500" />
                                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Rate: {systemRate} IQD</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 flex flex-col justify-center gap-12 max-w-4xl mx-auto w-full">
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                                                <div className="md:col-span-5 space-y-4">
                                                    <div className="flex items-center justify-between px-3">
                                                        <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Source Entity</span>
                                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">{isUsdToIqd ? 'US DOLLAR' : 'IQ DINAR'}</span>
                                                    </div>
                                                    <div className="relative group">
                                                        <input
                                                            type="number"
                                                            value={isUsdToIqd ? usdAmount : iqdAmount}
                                                            onChange={(e) => isUsdToIqd ? setUsdAmount(e.target.value) : setIqdAmount(e.target.value)}
                                                            className="w-full bg-black/60 border border-white/10 rounded-4xl p-12 text-6xl font-black text-center outline-none focus:bg-emerald-500/5 focus:border-emerald-500/40 transition-all"
                                                            placeholder="0.00"
                                                        />
                                                        <span className="absolute left-8 top-1/2 -translate-y-1/2 text-2xl font-black text-white/10 uppercase tracking-widest">{isUsdToIqd ? '$' : 'IQ'}</span>
                                                    </div>
                                                </div>

                                                <div className="md:col-span-2 flex justify-center">
                                                    <button onClick={toggleCurrencyMode} className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-black shadow-[0_0_50px_-5px_#10b981] transition-all hover:scale-110 active:scale-90 relative">
                                                        <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />
                                                        <ArrowLeftRight size={32} className={`transition-transform duration-700 ${isUsdToIqd ? '' : 'rotate-180'}`} />
                                                    </button>
                                                </div>

                                                <div className="md:col-span-5 space-y-4">
                                                    <div className="flex items-center justify-between px-3">
                                                        <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Conversion Result</span>
                                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">{isUsdToIqd ? 'IQ DINAR' : 'US DOLLAR'}</span>
                                                    </div>
                                                    <div className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-4xl p-12 text-6xl font-black text-center text-emerald-400 backdrop-blur-3xl shadow-inner min-h-[160px] flex items-center justify-center">
                                                        {isUsdToIqd ? (iqdAmount || '0') : (usdAmount || '0')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'chrono' && (
                                    <motion.div
                                        key="chrono"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="h-full flex flex-col gap-10"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-500">
                                                    <Calendar size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black uppercase tracking-tighter">Persian Chrono Matrix</h3>
                                                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-1">Cross-calendar temporal alignment</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">ISO 8601 Compliance</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 flex flex-col items-center justify-center gap-12">
                                            <div className="grid grid-cols-3 gap-8 w-full max-w-3xl">
                                                {[
                                                    { label: 'SOLAR YEAR', key: 'year' },
                                                    { label: 'SOLAR MONTH', key: 'month' },
                                                    { label: 'SOLAR DAY', key: 'day' }
                                                ].map((field) => (
                                                    <div key={field.key} className="space-y-4">
                                                        <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest text-center block">{field.label}</span>
                                                        <input
                                                            type="text"
                                                            value={(persianInput as any)[field.key]}
                                                            onChange={e => setPersianInput({ ...persianInput, [field.key]: e.target.value })}
                                                            className="w-full bg-black/60 border border-white/10 rounded-3xl p-10 text-4xl font-black text-center outline-none focus:border-emerald-500 focus:bg-emerald-500/5 transition-all"
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="w-full max-w-3xl relative">
                                                <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
                                                <div className="relative p-12 bg-emerald-600 rounded-4xl border border-white/20 text-center flex flex-col items-center gap-4 shadow-[0_30px_60px_-15px_rgba(16,185,129,0.4)]">
                                                    <span className="text-[11px] font-black text-black/60 uppercase tracking-[0.4em]">Integrated Gregorian Alignment</span>
                                                    <div className="text-5xl font-black text-black tracking-tight">{convertedGregorian}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Terminal Bottom Bar */}
                        <div className="bg-black/40 border-t border-white/5 p-8 flex items-center justify-between text-[#4b5563] overflow-hidden">
                            <div className="flex items-center gap-12">
                                <div className="flex items-center gap-3">
                                    <Cpu size={14} className="text-emerald-500" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">Core: V10. Astra</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Radio size={14} className="text-emerald-500 animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">Data Link: Active</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Activity size={14} className="text-emerald-500" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">Encrypt: RSA-4096</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-2 w-48 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        animate={{ x: [-192, 192] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="h-full w-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
                                    />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-[0.5em] opacity-40">System Stream</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. ADDITIONAL INTELLIGENCE PANELS */}
                <div className="w-full max-w-[1200px] mt-24 grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="group bg-white/[0.02] border border-white/5 rounded-4xl p-10 hover:bg-white/[0.04] transition-all relative overflow-hidden flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 border border-white/5 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                            <ShieldCheck size={32} />
                        </div>
                        <h4 className="text-xl font-black mb-4 uppercase tracking-tighter">Enterprise Shield</h4>
                        <p className="text-[10px] font-bold text-gray-500 leading-relaxed uppercase tracking-widest pl-2">Authenticated Agency Node Secure Protocol AES-256 Enabled</p>
                    </div>
                    <div className="group bg-white/[0.02] border border-white/5 rounded-4xl p-10 hover:bg-white/[0.04] transition-all relative overflow-hidden flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 border border-white/5 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                            <Zap size={32} />
                        </div>
                        <h4 className="text-xl font-black mb-4 uppercase tracking-tighter">Instant Sync</h4>
                        <p className="text-[10px] font-bold text-gray-500 leading-relaxed uppercase tracking-widest pl-2">Zero Latency Synchronization Global GDS Data Streams</p>
                    </div>
                    <div className="group bg-white/[0.02] border border-white/5 rounded-4xl p-10 hover:bg-white/[0.04] transition-all relative overflow-hidden flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 border border-white/5 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                            <Terminal size={32} />
                        </div>
                        <h4 className="text-xl font-black mb-4 uppercase tracking-tighter">Agent API</h4>
                        <p className="text-[10px] font-bold text-gray-500 leading-relaxed uppercase tracking-widest pl-2">Programmatic Resource Access Universal Travel Interface</p>
                    </div>
                </div>

            </main>

            {/* Support Terminal Widget */}
            <div className="fixed bottom-12 left-12 z-[100] flex flex-col items-end gap-8">
                <AnimatePresence>
                    {showChat && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-[420px] bg-[#010c0a] border border-white/10 rounded-[45px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] overflow-hidden backdrop-blur-3xl"
                        >
                            <div className="p-10 bg-emerald-600 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />
                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner">
                                            <Radio size={32} className="text-white animate-pulse" />
                                        </div>
                                        <div>
                                            <h5 className="text-2xl font-black text-white tracking-tighter uppercase">Operations Support</h5>
                                            <p className="text-black/60 text-[10px] font-black uppercase tracking-[0.3em]">Channel: Secured-Alpha</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowChat(false)} className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition-all">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-10 space-y-8">
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 italic text-sm font-medium text-gray-400">
                                    "RODA10 Neural-Sync Support Active. How can we optimize your agency operations today?"
                                </div>
                                <div className="relative group">
                                    <textarea
                                        value={chatMessage}
                                        onChange={(e) => setChatMessage(e.target.value)}
                                        placeholder="Transmit data..."
                                        className="w-full bg-black/60 border border-white/10 rounded-3xl p-6 text-base font-medium outline-none focus:border-emerald-500/40 min-h-[140px] resize-none pb-20 transition-all"
                                    />
                                    <button
                                        onClick={() => {
                                            if (chatMessage.trim()) {
                                                window.open(`https://wa.me/9647714289278?text=${encodeURIComponent(chatMessage)}`, '_blank');
                                                setChatMessage('');
                                                setShowChat(false);
                                            }
                                        }}
                                        className="absolute bottom-6 right-6 bg-emerald-500 text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-emerald-400 transition-all active:scale-95 flex items-center gap-3"
                                    >
                                        <Send size={16} />
                                        Transmit
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    onClick={() => setShowChat(!showChat)}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-28 h-28 bg-emerald-600/10 border border-emerald-500/20 rounded-[40px] flex items-center justify-center backdrop-blur-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-emerald-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <MessageCircle size={44} className="text-emerald-500 transition-transform group-hover:scale-110" />
                </motion.button>
            </div>

            {/* Premium Astra Footer */}
            <footer className="w-full bg-[#000403] pt-40 pb-20 border-t border-white/5 relative">
                <div className="max-w-[1440px] mx-auto px-12 grid grid-cols-1 md:grid-cols-4 gap-20">
                    <div className="md:col-span-2 space-y-10">
                        <div className="flex items-center gap-6">
                            <BrandingLogo size={56} navigateHome={false} />
                            <span className="text-5xl font-black tracking-tighter uppercase grad-text">{customSettings.logoText || 'RODA10'}</span>
                        </div>
                        <p className="max-w-md text-sm font-bold text-gray-700 leading-relaxed uppercase tracking-widest">
                            The Quantum Architecture for Global Flight Intelligence. Specialized in High-Performance Agency Operating Systems.
                        </p>
                    </div>
                    <div className="space-y-8">
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em]">Network Links</span>
                        <div className="flex flex-col gap-5 text-xs font-black text-gray-800 uppercase tracking-widest">
                            <a href="#" className="hover:text-emerald-500 transition-colors">Core Systems</a>
                            <a href="#" className="hover:text-emerald-400 transition-colors">Data Protocol</a>
                            <a href="#" className="hover:text-emerald-400 transition-colors">Security Node</a>
                        </div>
                    </div>
                    <div className="space-y-8">
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em]">Entity Registry</span>
                        <div className="flex flex-col gap-5 text-xs font-black text-gray-800 uppercase tracking-widest">
                            <a href="#" className="hover:text-emerald-400 transition-colors">Digital Identity</a>
                            <a href="#" className="hover:text-emerald-400 transition-colors">Compliance</a>
                            <a href="#" className="hover:text-emerald-400 transition-colors">Legal Framework</a>
                        </div>
                    </div>
                </div>
                <div className="mt-40 pt-12 border-t border-white/5 text-center">
                    <span className="text-[10px] font-black text-[#1a2522] uppercase tracking-[1em]">
                        © 2024 RODA10 GLOBAL AEROSPACE SYSTEMS GROUP
                    </span>
                </div>
            </footer>

            <style>{`
                .grad-text {
                    background: linear-gradient(135deg, #10b981, #14b8a6);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(16, 185, 129, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(16, 185, 129, 0.3);
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
