import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, wasOffline, setWasOffline } = useOnlineStatus();
  const [showRestored, setShowRestored] = useState(false);
  const [checking, setChecking] = useState(false);

  // When internet comes back online after being offline, show brief confirmation
  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
        setWasOffline(false);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline, setWasOffline]);

  const handleManualCheck = async () => {
    setChecking(true);
    try {
      // Quick fetch with cache-bust to verify active internet
      await fetch('/?_ping=' + Date.now(), { method: 'HEAD', cache: 'no-store' });
      if (navigator.onLine) {
        setShowRestored(true);
        setTimeout(() => setShowRestored(false), 4000);
      }
    } catch {
      // Still offline
    } finally {
      setTimeout(() => setChecking(false), 600);
    }
  };

  // If online and not in restored notification mode, don't show
  if (isOnline && !showRestored) {
    return null;
  }

  // Internet Restored Toast (bottom-left, above mobile tab bar on mobile/tablet)
  if (isOnline && showRestored) {
    return (
      <div 
        id="internet-restored-notification"
        className="fixed bottom-20 lg:bottom-4 left-4 right-4 sm:right-auto z-50 animate-in fade-in slide-in-from-bottom-3 duration-300 max-w-sm"
      >
        <div className="flex items-center gap-3 px-4 py-3 bg-[#334D2E] text-white rounded-2xl shadow-xl border border-[#486D42] backdrop-blur-md">
          <div className="p-2 rounded-xl bg-white/15 text-white shrink-0">
            <Wifi className="w-4 h-4" />
          </div>
          <div className="text-left pr-1">
            <div className="text-xs font-bold tracking-wide">Internet Restored</div>
            <div className="text-[11px] text-white/80">Online synchronization re-established.</div>
          </div>
        </div>
      </div>
    );
  }

  // Offline Notification (bottom-left) - Exactly as requested: "No Internet Connected"
  return (
    <div 
      id="no-internet-notification"
      className="fixed bottom-20 lg:bottom-4 left-4 right-4 sm:right-auto z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-sm"
    >
      <div className="flex items-start sm:items-center gap-3 px-4 py-3.5 bg-[#2A1C18] text-[#FAF5ED] rounded-2xl shadow-2xl border border-[#C86B52]/50 backdrop-blur-md">
        <div className="p-2.5 rounded-xl bg-[#C86B52]/25 text-[#E68A73] shrink-0 mt-0.5 sm:mt-0 flex items-center justify-center">
          <WifiOff className="w-4 h-4 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#FAF5ED] tracking-wide">
              No Internet Connected
            </span>
            <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-[#C86B52]/30 text-[#FFBAA8] border border-[#C86B52]/40">
              Cached Mode
            </span>
          </div>
          <p className="text-[11px] text-[#FAF5ED]/75 leading-tight mt-0.5">
            Website is using cached data. All bakery formulas & pages remain viewable.
          </p>
        </div>
        <button
          onClick={handleManualCheck}
          disabled={checking}
          title="Check connection"
          className="p-2 text-[#FAF5ED]/70 hover:text-white hover:bg-white/10 rounded-xl transition-all shrink-0 active:scale-95"
          aria-label="Retry network connection"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin text-[#C86B52]' : ''}`} />
        </button>
      </div>
    </div>
  );
};
