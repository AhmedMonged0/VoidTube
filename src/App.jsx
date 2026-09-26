import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import WatchPage from './pages/WatchPage';
import BookmarksPage from './pages/BookmarksPage';
import ChannelPage from './pages/ChannelPage';
import AudioFocusPage from './pages/AudioFocusPage';
import LibraryPage from './pages/LibraryPage';
import ExplorePage from './pages/ExplorePage';
import SettingsPage from './pages/SettingsPage';
import WatchLaterDrawer from './components/WatchLaterDrawer';
import DownloadsDrawer from './components/DownloadsDrawer';
import InstanceSelectorModal from './components/InstanceSelectorModal';
import InstallAppBanner from './components/InstallAppBanner';
import UpdateToast from './components/UpdateToast';
import ApkDownloadModal from './components/ApkDownloadModal';
import UpdateModal from './components/UpdateModal';
import ToastNotification from './components/ToastNotification';
import MobileBottomNav from './components/MobileBottomNav';
import Sidebar from './components/Sidebar';
import MiniPlayer from './components/Player/MiniPlayer';
import MobileSearchOverlay from './components/MobileSearchOverlay';
import Footer from './components/Footer';
import { Shield, Zap } from 'lucide-react';

function AppContent() {
  const { nav } = useApp();
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
      case 'channel':
        return <ChannelPage />;
      case 'audio':
      case 'focus':
        return <AudioFocusPage />;
      case 'library':
        return <LibraryPage />;
      case 'explore':
        return <ExplorePage />;
      case 'bookmarks':
        return <BookmarksPage />;
      case 'settings':
        return <SettingsPage />;
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
      <UpdateModal />
      <ToastNotification />

      {/* Floating MiniPlayer (YouTube-style) */}
      <MiniPlayer />

      {/* Fullscreen Mobile Search Overlay */}
      <MobileSearchOverlay />

      {/* Global Comprehensive Footer */}
      <Footer onOpenApkModal={() => setIsApkModalOpen(true)} />
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
