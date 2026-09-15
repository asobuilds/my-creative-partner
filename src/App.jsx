import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import StudioWorkspace from './components/studio/StudioWorkspace';
import { InspirationView, LeaderboardView, FeedbackView, FAQView, ProfileView } from './components/SecondaryViews';
import { AuthModal, SettingsModal } from './components/Modals';
import { useResponsive } from './hooks/useResponsive';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { isMobile } = useResponsive();

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column-reverse' : 'row',
      height: '100vh', width: '100vw',
      background: '#090d16', color: '#fff',
      overflow: 'hidden', fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'landing' && (
          <LandingPage onLaunch={() => setActiveTab('canvas')} onOpenAuth={() => setIsAuthOpen(true)} />
        )}
        {activeTab === 'canvas' && <StudioWorkspace />}
        {activeTab === 'inspiration' && <InspirationView />}
        {activeTab === 'leaderboard' && <LeaderboardView />}
        {activeTab === 'feedback' && <FeedbackView />}
        {activeTab === 'faq' && <FAQView />}
        {activeTab === 'profile' && <ProfileView currentUser={currentUser} setCurrentUser={setCurrentUser} />}
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onAuthSuccess={setCurrentUser} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}