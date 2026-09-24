import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import WatchPage from './pages/WatchPage';
import BookmarksPage from './pages/BookmarksPage';
import WatchLaterDrawer from './components/WatchLaterDrawer';
import DownloadsDrawer from './components/DownloadsDrawer';
import InstanceSelectorModal from './components/InstanceSelectorModal';
import InstallAppBanner from './components/InstallAppBanner';
import UpdateToast from './components/UpdateToast';
import ApkDownloadModal from './components/ApkDownloadModal';
import DownloadModal from './components/Player/DownloadModal';
import MobileBottomNav from './components/MobileBottomNav';
import Sidebar from './components/Sidebar';
import { Shield, Zap } from 'lucide-react';

function AppContent() {
  const { nav, downloadModalVideo, closeDownloadModal } = useApp();
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenApk = () => setIsApkModalOpen(true);
    window.addEventListener('voidtube-open-apk-modal', handleOpenApk);
    return () => window.removeEventListener('voidtube-open-apk-modal', handleOpenApk);
  }, []);

  const renderPage = () => {
    switch (nav.page) {
      case 'watch':
        return <WatchPage />;
      case 'search':
        return <SearchPage />;
      case 'bookmarks':
        return <BookmarksPage />;
      case 'home':
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0c] text-[#f1f1f5]">
      {/* Sticky Top Header (Responsive Desktop & Mobile) */}
      <Header onOpenApkModal={() => setIsApkModalOpen(true)} />

      {/* Main Container with Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-5 lg:px-8 flex gap-4 sm:gap-6 pb-24 md:pb-8">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {renderPage()}
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation Bar (md:hidden) */}
      <MobileBottomNav />

      {/* Slide-out Drawers & Modals */}
      <WatchLaterDrawer />
      <DownloadsDrawer />
      <InstanceSelectorModal />
      <InstallAppBanner onOpenApkModal={() => setIsApkModalOpen(true)} />
      <UpdateToast />
      <ApkDownloadModal isOpen={isApkModalOpen} onClose={() => setIsApkModalOpen(false)} />
      {downloadModalVideo && (
        <DownloadModal
          videoData={downloadModalVideo}
          videoId={downloadModalVideo.videoId || downloadModalVideo.id}
          isOpen={!!downloadModalVideo}
          onClose={closeDownloadModal}
        />
      )}

      {/* Minimalist Cinematic Footer (Desktop view) */}
      <footer className="w-full border-t border-white/[0.05] bg-[#08080a] py-8 mt-16 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-void-500">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-white tracking-wider flex items-center gap-1">
              VOID<span className="text-neon-purple">TUBE</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-void-400">
              <Shield size={13} className="text-emerald-400" />
              Ad-Free & Distraction-Free
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-void-400">
              <Zap size={13} className="text-neon-purple" />
              Invidious Powered
            </span>
          </div>

          <div className="flex items-center gap-4 text-void-400">
            <span>OLED Cinematic Dark Mode</span>
            <span>•</span>
            <span>No Algorithmic Traps</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
