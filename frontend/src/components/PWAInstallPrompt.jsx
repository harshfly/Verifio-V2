import { useState, useEffect } from "react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // 1. Check if running on a mobile device
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isMobileDevice =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ||
      (window.innerWidth <= 768 && "ontouchstart" in window);

    // If NOT mobile, never show this component
    if (!isMobileDevice) return;

    // 2. Check if already installed as standalone PWA
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) return;

    // 3. Check if user already dismissed this session
    if (sessionStorage.getItem("verifio_pwa_dismissed") === "true") return;

    // 4. Detect iOS devices
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // 5. Android/Chrome beforeinstallprompt event
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // If on iOS Safari, show prompt after a brief 2-second delay
    if (isIOSDevice) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      // Toggle iOS instruction modal/sheet
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    // Trigger native browser install prompt (Android/Chrome)
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSGuide(false);
    sessionStorage.setItem("verifio_pwa_dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <>
      {/* ── Mobile Floating Install Banner ───────────────────── */}
      <aside
        aria-label="Install mobile app"
        className="fixed bottom-4 left-4 right-4 z-50 md:hidden animate-fade-up"
      >
        <div className="bg-white/95 backdrop-blur-md border border-neutral-200/90 rounded-2xl p-3.5 shadow-xl shadow-black/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/logo.png?v=2"
              alt="Verifio App Icon"
              className="w-10 h-10 rounded-xl object-contain bg-white border border-neutral-100 p-0.5 shadow-2xs shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[13px] text-black tracking-tight truncate">
                  Install Verifio
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-orange-100 text-orange-700 rounded uppercase">
                  App
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 truncate">
                Direct mobile access & instant PDF check
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-[12px] font-bold rounded-lg shadow-xs shadow-orange-300/40 transition-all cursor-pointer whitespace-nowrap"
            >
              Install
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss install prompt"
              className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-neutral-700 rounded-full transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── iOS Add to Home Screen Instructions Modal ──────────── */}
      {showIOSGuide && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-xs flex flex-col justify-end p-4 animate-fade-in"
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="bg-white rounded-2xl p-5 shadow-2xl space-y-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <img src="/logo.png?v=2" alt="Verifio" className="w-7 h-7 object-contain" />
                <h3 className="font-bold text-[15px] text-black">Install on iPhone / iPad</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-black rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-[13px] text-neutral-700">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  Tap the <strong className="text-black">Share</strong> icon{" "}
                  <span className="inline-block px-1 py-0.5 bg-neutral-100 rounded text-xs font-mono">
                    ⎋
                  </span>{" "}
                  in your Safari bottom bar.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  Scroll down the share sheet and tap{" "}
                  <strong className="text-black">"Add to Home Screen"</strong>{" "}
                  <span className="inline-block px-1 py-0.5 bg-neutral-100 rounded text-xs font-mono">
                    [+]
                  </span>
                  .
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <p>
                  Tap <strong className="text-black">Add</strong> in the top right corner. Done!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-neutral-900 text-white font-semibold text-[13px] rounded-xl hover:bg-black transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

