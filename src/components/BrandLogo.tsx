import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', className = '', onClick }) => {
  const sizeClasses = {
    sm: 'text-lg tracking-wider',
    md: 'text-xl sm:text-2xl tracking-wider',
    lg: 'text-3xl sm:text-4xl tracking-widest',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 focus:outline-none group select-none text-left cursor-pointer ${className}`}
    >
      {/* Dynamic Z1 Icon Badge */}
      <div className="relative flex items-center justify-center font-black rounded-lg bg-gradient-to-br from-[#FF1E27] to-[#B30006] text-white shadow-lg shadow-red-950/40 px-2 py-0.5 transform group-hover:scale-105 transition-transform duration-200">
        <span className="font-extrabold italic text-sm sm:text-base tracking-tighter">Z1</span>
        {/* Subtle accent glow */}
        <div className="absolute inset-0 rounded-lg bg-red-500 opacity-20 filter blur-[2px] pointer-events-none" />
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <span className={`font-black font-brand uppercase text-white leading-none ${sizeClasses[size]}`}>
          MOVIES
        </span>
      </div>
    </button>
  );
};
