import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import BrandingLogo from './BrandingLogo';

interface SplashScreenProps {
    onFinish: () => void;
    minDuration?: number;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, minDuration = 2800 }) => {
    const { customSettings } = useTheme();
    const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');

    useEffect(() => {
        const holdTimer = setTimeout(() => setPhase('hold'), 400);
        const exitTimer = setTimeout(() => setPhase('exit'), minDuration - 600);
        const finishTimer = setTimeout(onFinish, minDuration);

        return () => {
            clearTimeout(holdTimer);
            clearTimeout(exitTimer);
            clearTimeout(finishTimer);
        };
    }, [onFinish, minDuration]);

    return (
        <AnimatePresence>
            {phase !== 'exit' ? null : null}
            <motion.div
                key="splash"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#060b18] overflow-hidden"
                style={{ direction: 'rtl' }}
            >
                {/* Background animated gradient orbs */}
                <motion.div
                    animate={{ x: [0, 80, 0], y: [0, 50, 0], scale: [1, 1.3, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-40 -right-40 w-[400px] h-[400px] rounded-full bg-emerald-600/15 blur-[150px]"
                />
                <motion.div
                    animate={{ x: [0, -60, 0], y: [0, 70, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[150px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.15, 0.08] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[180px]"
                />

                {/* Radial grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
                        backgroundSize: '40px 40px',
                    }}
                />

                {/* Main content */}
                <div className="relative z-10 flex flex-col items-center">
                    {/* Logo with reveal animation */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                        className="relative"
                    >
                        {/* Glow ring behind logo */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: [0, 0.4, 0.2], scale: [0.5, 1.2, 1] }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                            className="absolute inset-[-30px] rounded-full bg-emerald-500/10 blur-xl"
                        />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-[-20px] rounded-full border border-dashed border-white/5"
                        />
                        <BrandingLogo size={80} showGlow navigateHome={false} />
                    </motion.div>

                    {/* App name with stagger animation */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.7, ease: 'easeOut' }}
                        className="mt-8 text-center"
                    >
                        <h1 className="text-3xl font-black text-white tracking-tight">
                            {customSettings.logoText || 'RODA10'}
                        </h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            transition={{ delay: 1.1 }}
                            className="text-xs text-white/40 mt-2 font-medium tracking-widest uppercase"
                        >
                            نظام إدارة متكامل
                        </motion.p>
                    </motion.div>

                    {/* Loading indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.3 }}
                        className="mt-12 flex flex-col items-center gap-4"
                    >
                        {/* Animated progress bar */}
                        <div className="w-48 h-[3px] bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: '100%' }}
                                transition={{ duration: 1.2, repeat: Infinity, ease: [0.4, 0, 0.6, 1] }}
                                className="h-full w-1/2 bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent rounded-full"
                            />
                        </div>

                        {/* Pulsing dots */}
                        <div className="flex items-center gap-1.5">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1, 0.8] }}
                                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                                    className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                                />
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Bottom branding */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.2 }}
                    transition={{ delay: 1.5 }}
                    className="absolute bottom-8 text-center"
                >
                    <p className="text-[10px] text-white font-black tracking-[0.4em] uppercase">
                        Powered by RODA
                    </p>
                </motion.div>

                {/* Exit animation — white flash */}
                <AnimatePresence>
                    {phase === 'exit' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                            className="absolute inset-0 bg-[#060b18] z-50"
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    );
};

export default SplashScreen;
