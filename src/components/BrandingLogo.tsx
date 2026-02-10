import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface BrandingLogoProps {
    className?: string;
    size?: number;
    showGlow?: boolean;
    onClick?: () => void;
    navigateHome?: boolean;
}

const BrandingLogo: React.FC<BrandingLogoProps> = ({
    className = "",
    size,
    showGlow,
    onClick,
    navigateHome = true
}) => {
    const { customSettings } = useTheme();
    const navigate = useNavigate();

    const logoUrl = customSettings.logoUrl;
    const logoText = customSettings.logoText;
    const finalSize = size || customSettings.logoSize || 32;
    const finalShowGlow = showGlow !== undefined ? showGlow : customSettings.showLogoGlow;

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (navigateHome) {
            navigate('/');
        }
    };

    if (logoUrl) {
        return (
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center cursor-pointer ${className}`}
                onClick={handleClick}
            >
                <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-auto object-contain transition-all duration-500"
                    style={{
                        height: `${finalSize}px`,
                        filter: finalShowGlow ? 'drop-shadow(0 0 12px rgba(255,255,255,0.8))' : 'none'
                    }}
                    onError={(e: any) => (e.currentTarget.style.display = 'none')}
                />
            </motion.div>
        );
    }

    if (logoText) {
        return (
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center cursor-pointer ${className}`}
                onClick={handleClick}
            >
                <span
                    className="font-black text-white tracking-wider drop-shadow-md transition-all duration-500"
                    style={{
                        fontSize: `${finalSize / 2}pt`,
                        textShadow: finalShowGlow ? '0 0 12px rgba(255,255,255,0.6)' : 'none'
                    }}
                >
                    {logoText}
                </span>
            </motion.div>
        );
    }

    return null;
};

export default BrandingLogo;
