import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import StudioWorkspace from './components/studio/StudioWorkspace';
import ChildMode from './components/studio/ChildMode';
import Onboarding from './components/Onboarding';
import { InspirationView, LeaderboardView, FeedbackView, FAQView, ProfileView } from './components/SecondaryViews';
import { AuthModal, SettingsModal } from './components/Modals';
import { useResponsive } from './hooks/useResponsive';
import { useStudioStore } from './store/studioStore';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [promptInput, setPromptInput] = useState('');
  const { isMobile } = useResponsive();
  const mode = useStudioStore((s) => s.mode);
  const setMode = useStudioStore((s) => s.setMode);
  const onboardingDone = useStudioStore((s) => s.onboardingDone);

  const showOnboarding = !onboardingDone && activeTab === 'canvas';

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column-reverse' : 'row', height: '100vh', width: '100vw', background: '#090d16', color: '#fff', overflow: 'hidden', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
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
        {activeTab === 'canvas' && (
          <>
            {mode === 'child' ? <ChildMode /> : <StudioWorkspace />}
            <button
              onClick={() => setMode(mode === 'child' ? 'parent' : 'child')}
              style={{ position: 'absolute', bottom: 14, right: 14, zIndex: 40, padding: '8px 14px', borderRadius: 12, background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8', fontSize: 11, fontWeight: 600, cursor: 'pointer', letterSpacing: 0.4 }}
              title="Toggle parent mode (technical view)"
            >
              {mode === 'child' ? 'Parent Mode' : 'Child Mode'}
            </button>
          </>
        )}
        {activeTab === 'inspiration' && <InspirationView setPromptInput={setPromptInput} setActiveTab={setActiveTab} />}
        {activeTab === 'leaderboard' && <LeaderboardView />}
        {activeTab === 'feedback' && <FeedbackView />}
        {activeTab === 'faq' && <FAQView />}
        {activeTab === 'profile' && <ProfileView currentUser={currentUser} setCurrentUser={setCurrentUser} />}
      </div>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onAuthSuccess={setCurrentUser} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      {showOnboarding && <Onboarding />}
    </div>
  );
}
