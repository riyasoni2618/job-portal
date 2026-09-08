import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ className = "" }) => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className={`relative inline-flex items-center justify-center p-2 rounded-xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7209b7] cursor-pointer ${
                isDark
                    ? "bg-[#161e2e] border-gray-700/80 text-amber-300 hover:bg-[#1e293b] hover:text-amber-200 shadow-xs"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-[#7209b7] shadow-xs"
            } ${className}`}
        >
            {isDark ? (
                <Sun className="h-4 w-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
            ) : (
                <Moon className="h-4 w-4 transition-transform duration-300 -rotate-12 hover:rotate-0" />
            )}
            <span className="sr-only">
                {isDark ? "Switch to light mode" : "Switch to dark mode"}
            </span>
        </button>
    );
};

export default ThemeToggle;
