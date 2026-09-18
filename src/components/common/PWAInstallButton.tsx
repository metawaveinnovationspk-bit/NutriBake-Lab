import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop install flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="btn-sweet flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF0E4] hover:bg-[#3D261E] text-[#3D261E] hover:text-white border border-[#E6D9CC] text-xs font-semibold shadow-2xs transition-all"
        title="Install NutriBake App for offline use"
      >
        <Download className="w-3.5 h-3.5 text-[#C97D36]" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="btn-sweet flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF0E4] hover:bg-[#3D261E] text-[#3D261E] hover:text-white border border-[#E6D9CC] text-xs font-semibold shadow-2xs transition-all"
          title="Install on iPhone / iPad"
        >
          <Download className="w-3.5 h-3.5 text-[#C97D36]" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-3xl bg-[#FAF5ED] p-6 shadow-2xl border border-[#E8DDCF] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-serif font-bold text-[#3D261E]">Install NutriBake</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-[#3D261E]/60 hover:bg-black/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-[#3D261E]/80 leading-relaxed">
                Add NutriBake to your Home Screen for instant offline browsing and lightning-fast loading:
              </p>
              <ol className="text-xs text-[#3D261E]/90 space-y-2 list-decimal list-inside bg-white/70 p-3.5 rounded-2xl border border-[#E6D9CC]">
                <li>Tap the <strong className="text-[#C97D36]">Share</strong> button in your Safari toolbar.</li>
                <li>Scroll down and tap <strong className="text-[#C97D36]">Add to Home Screen</strong>.</li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-full bg-[#3D261E] text-white text-xs font-semibold hover:bg-[#2A1C18] transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
