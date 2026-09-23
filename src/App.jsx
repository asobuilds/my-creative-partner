import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import StudioWorkspace from './components/studio/StudioWorkspace';
import ChildMode from './components/studio/ChildMode';
import Onboarding from './components/Onboarding';
import { AuthModal } from './components/Modals';
import { useResponsive } from './hooks/useResponsive';
import { useStudioStore } from './store/studioStore';
import { useSettingsStore } from './store/settingsStore';
import { useAccountStore } from './store/accountStore';
import SettingsPanel from './components/Settings/SettingsPanel';
import SparkView from './components/Spark/SparkView';
import LeaderboardView from './components/Leaderboard/LeaderboardView';
import FeedbackView from './components/Feedback/FeedbackView';
import Celebration from './components/Celebration/Celebration';
import KidsLogin from './components/KidsLogin';
import GameHub from './components/Games/GameHub';
import WordMatch from './components/Games/WordMatch';
import ShapeSort from './components/Games/ShapeSort';
import ProverbMatch from './components/Games/ProverbMatch';
import StoryOrder from './components/Games/StoryOrder';
import MemoryMatch from './components/Games/MemoryMatch';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import ParentDashboard from './components/ParentDashboard';
import AutoGuide from './components/Guides/AutoGuide';

// Minimal inline FAQ + Profile to fix missing imports
function FAQView() {
  return (
    <div style={{ padding: 40, color: '#fff', overflowY: 'auto', height: '100%' }}>
      <h2 style={{ color: '#ffb700' }}>Frequently Asked Questions</h2>
      <p style={{ color: '#94a3b8' }}>Answers coming soon.</p>
    </div>
  );
}

function ProfileView({ currentUser, setCurrentUser }) {
  return (
    <div style={{ padding: 40, color: '#fff', overflowY: 'auto', height: '100%' }}>
      <h2 style={{ color: '#ffb700' }}>Your Profile</h2>
      {currentUser ? (
        <>
          <p>Username: {currentUser.username}</p>
          <p>Email: {currentUser.email}</p>
          <button onClick={() => setCurrentUser(null)} style={{ padding: '10px 20px', borderRadius: 10, background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', marginTop: 16 }}>Sign Out</button>
        </>
      ) : (
        <p style={{ color: '#94a3b8' }}>Please sign in.</p>
      )}
    </div>
  );
}

// Global guide messages per tab — shown once per child
const TAB_GUIDES = {
  canvas: 'first-visit-create',
  games: 'first-visit-games',
  inspiration: 'first-visit-spark',
};

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [promptInput, setPromptInput] = useState('');
  const { isMobile } = useResponsive();

  const mode = useStudioStore((s) => s.mode);
  const setMode = useStudioStore((s) => s.setMode);
  const applyAll = useSettingsStore((s) => s.applyAll);
  const onboarded = useAccountStore((s) => s.onboarded);
  const activeChild = useAccountStore((s) => s.getActiveChild && s.getActiveChild());

  const [showParentDash, setShowParentDash] = useState(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [showKidsLogin, setShowKidsLogin] = useState(false);
  const [activeGame, setActiveGame] = useState(null);
  const [pendingPrompt, setPendingPrompt] = useState(null);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('9jawonderpal.sidebar') === '1'; } catch (e) { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem('9jawonderpal.sidebar', collapsed ? '1' : '0'); } catch (e) {}
  }, [collapsed]);

  useEffect(() => { applyAll(); }, [applyAll]);

  // KILL_AUDIO_ON_TAB — stop any playing audio when switching tabs
  useEffect(() => {
    return () => {
      try {
        document.querySelectorAll('audio').forEach((a) => { try { a.pause(); a.currentTime = 0; } catch (e) {} });
      } catch (e) {}
    };
  }, [activeTab]);

  const guideKey = TAB_GUIDES[activeTab] || null;

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column-reverse' : 'row', height: '100vh', width: '100vw', background: 'var(--theme-bg)', color: '#fff', overflow: 'hidden', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSettings={() => setIsSettingsPanelOpen(true)}
        onOpenKidsLogin={() => setShowKidsLogin(true)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
      />
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'landing' && (
          <LandingPage onLaunch={() => setActiveTab('canvas')} onOpenAuth={() => setIsAuthOpen(true)} />
        )}
        {activeTab === 'canvas' && (
          <>
            {mode === 'child' ? <ChildMode pendingPrompt={pendingPrompt} onPromptConsumed={() => setPendingPrompt(null)} /> : <StudioWorkspace />}
            <button
              onClick={() => setMode(mode === 'child' ? 'parent' : 'child')}
              style={{ position: 'absolute', bottom: 14, right: 14, zIndex: 40, padding: '8px 14px', borderRadius: 12, background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8', fontSize: 11, fontWeight: 600, cursor: 'pointer', letterSpacing: 0.4 }}
              title="Toggle parent mode (technical view)"
            >
              {mode === 'child' ? 'Parent Mode' : 'Child Mode'}
            </button>
          </>
        )}
        {activeTab === 'games' && !activeGame && <GameHub onLaunchGame={(k) => setActiveGame(k)} />}
        {activeTab === 'games' && activeGame === 'word-match' && <WordMatch onExit={() => setActiveGame(null)} />}
        {activeTab === 'games' && activeGame === 'shape-sort' && <ShapeSort onExit={() => setActiveGame(null)} />}
        {activeTab === 'games' && activeGame === 'proverb-match' && <ProverbMatch onExit={() => setActiveGame(null)} />}
        {activeTab === 'games' && activeGame === 'story-order' && <StoryOrder onExit={() => setActiveGame(null)} />}
        {activeTab === 'games' && activeGame === 'memory-match' && <MemoryMatch onExit={() => setActiveGame(null)} />}
        {activeTab === 'inspiration' && <SparkView onStart={(text) => { setPromptInput(text); setPendingPrompt(text); setActiveTab('canvas'); }} />}
        {activeTab === 'leaderboard' && <LeaderboardView />}
        {activeTab === 'feedback' && <FeedbackView />}
        {activeTab === 'faq' && <FAQView />}
        {activeTab === 'profile' && <ProfileView currentUser={currentUser} setCurrentUser={setCurrentUser} />}
      </div>

      {/* AutoGuide — global mascot guide, one place, no per-file inserts */}
      {guideKey && activeTab !== 'canvas' && <AutoGuide guideKey={guideKey} />}

      {!onboarded && <OnboardingFlow />}
      {showParentDash && <ParentDashboard onClose={() => setShowParentDash(false)} />}
      <KidsLogin open={showKidsLogin} onClose={() => setShowKidsLogin(false)} onSuccess={() => { setShowKidsLogin(false); setActiveTab('canvas'); }} />
      <Celebration />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onAuthSuccess={setCurrentUser} />
      {isSettingsPanelOpen && <SettingsPanel onClose={() => setIsSettingsPanelOpen(false)} onOpenParentDashboard={() => { setIsSettingsPanelOpen(false); setShowParentDash(true); }} />}
    </div>
  );
}
