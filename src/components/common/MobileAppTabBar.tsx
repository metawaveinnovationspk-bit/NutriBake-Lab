import React from 'react';
import { useApp } from '../../context/AppContext';
import { ViewMode } from '../../types';
import { Home, Cookie, Sparkles, Heart, Activity, BookmarkCheck } from 'lucide-react';

interface TabItem {
  mode: ViewMode;
  label: string;
  icon: React.FC<{ className?: string }>;
  badge?: number | string;
  isSpecial?: boolean;
}

export const MobileAppTabBar: React.FC = () => {
  const { viewMode, navigateTo, savedProductIds } = useApp();

  const tabs: TabItem[] = [
    {
      mode: 'home',
      label: 'Home',
      icon: Home
    },
    {
      mode: 'products',
      label: 'Bakes',
      icon: Cookie
    },
    {
      mode: 'nutrition',
      label: 'Nutrition',
      icon: Activity
    },
    {
      mode: 'recommendations',
      label: 'Match Me',
      icon: Sparkles,
      isSpecial: true
    },
    {
      mode: 'family',
      label: 'Family',
      icon: Heart
    },
    {
      mode: 'dashboard',
      label: 'My Treats',
      icon: BookmarkCheck,
      badge: savedProductIds.length > 0 ? savedProductIds.length : undefined
    }
  ];

  return (
    <nav 
      aria-label="Mobile Application Navigation Bar"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-xl border-t border-[#E6D9CC]/90 shadow-[0_-4px_24px_rgba(61,38,30,0.06)] pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 px-1.5 sm:px-4"
    >
      <div className="max-w-md sm:max-w-lg mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = viewMode === tab.mode;
          const Icon = tab.icon;

          return (
            <button
              key={tab.mode}
              type="button"
              onClick={() => {
                navigateTo(tab.mode);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all duration-200 select-none min-h-[48px] touch-manipulation active:scale-90 ${
                isActive 
                  ? 'text-[#3D261E]' 
                  : 'text-[#3D261E]/55 hover:text-[#3D261E]/85'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Icon Container with subtle active pill or badge */}
              <div className="relative flex items-center justify-center">
                {isActive && (
                  <span 
                    className="absolute inset-0 -m-1 bg-[#EAE0D2] rounded-full -z-10 animate-in fade-in zoom-in-95 duration-200" 
                    aria-hidden="true" 
                  />
                )}
                
                <Icon 
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive 
                      ? tab.isSpecial 
                        ? 'text-[#C97D36] stroke-[2.2] scale-110' 
                        : 'text-[#3D261E] stroke-[2.2] scale-110'
                      : tab.isSpecial
                        ? 'text-[#C97D36]/80 stroke-[1.8]'
                        : 'stroke-[1.8]'
                  }`} 
                />

                {/* Badge for Saved Treats or notifications */}
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 bg-[#C86B52] text-white text-[9.5px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span 
                className={`text-[10px] sm:text-[11px] font-medium tracking-tight mt-1 whitespace-nowrap transition-colors ${
                  isActive 
                    ? 'font-bold text-[#3D261E]' 
                    : 'text-[#3D261E]/70'
                }`}
              >
                {tab.label}
              </span>

              {/* Tiny active dot indicator */}
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#C97D36] mt-0.5" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
