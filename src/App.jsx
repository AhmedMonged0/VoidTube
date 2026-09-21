import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import WatchPage from './pages/WatchPage';
import BookmarksPage from './pages/BookmarksPage';
import WatchLaterDrawer from './components/WatchLaterDrawer';
import InstanceSelectorModal from './components/InstanceSelectorModal';
import InstallAppBanner from './components/InstallAppBanner';
import UpdateToast from './components/UpdateToast';
import { Shield, Zap, Heart } from 'lucide-react';

function AppContent() {
  const { nav } = useApp();

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
      {/* Sticky Top Header */}
      <Header />

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {renderPage()}
      </main>

      {/* Slide-out Drawers & Dialogs */}
      <WatchLaterDrawer />
      <InstanceSelectorModal />
      <InstallAppBanner />
      <UpdateToast />

      {/* Minimalist Cinematic Footer */}
      <footer className="w-full border-t border-white/[0.05] bg-[#08080a] py-8 mt-16">
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
