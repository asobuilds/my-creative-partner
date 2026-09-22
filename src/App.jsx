import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import StudioWorkspace from './components/studio/StudioWorkspace';
import ChildMode from './components/studio/ChildMode';
import Onboarding from './components/Onboarding';
import { AuthModal, SettingsModal } from './components/Modals';
import { useResponsive } from './hooks/useResponsive';
import { useStudioStore } from './store/studioStore';
import { useSettingsStore } from './store/settingsStore';
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
import { useAccountStore } from './store/accountStore';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import ParentDashboard from './components/ParentDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [promptInput, setPromptInput] = useState('');
  const { isMobile } = useResponsive();
  const mode = useStudioStore((s) => s.mode);
  const onboarded = useAccountStore((s) => s.onboarded);
  const [showParentDash, setShowParentDash] = useState(false);
  const applyAll = useSettingsStore((s) => s.applyAll);
  useEffect(() => { applyAll(); }, [applyAll]);
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
  const setMode = useStudioStore((s) => s.setMode);
  const onboardingDone = useStudioStore((s) => s.onboardingDone);

  const showOnboarding = !onboardingDone && activeTab === 'canvas';
  const [showTour, setShowTour] = useState(false);
  useEffect(() => {
    try {
      const seen = localStorage.getItem('9jawonderpal.tour-seen') === '1';
      if (!seen) {
        setShowTour(true);
        localStorage.setItem('9jawonderpal.tour-seen', '1');
      }
    } catch (e) {}
  }, []);

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
      {!onboarded && <OnboardingFlow />}
      {showParentDash && <ParentDashboard onClose={() => setShowParentDash(false)} />}
      <KidsLogin open={showKidsLogin} onClose={() => setShowKidsLogin(false)} onSuccess={() => { setShowKidsLogin(false); setActiveTab('canvas'); }} />
      <Celebration />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onAuthSuccess={setCurrentUser} />
      {isSettingsPanelOpen && <SettingsPanel onClose={() => setIsSettingsPanelOpen(false)} onOpenParentDashboard={() => { setIsSettingsPanelOpen(false); setShowParentDash(true); }} />}
      {showOnboarding && <Onboarding />}
    </div>
  );
}
