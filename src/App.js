import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import Studio3DCanvas from './components/Studio3DCanvas';
import { InspirationView, LeaderboardView, FeedbackView, FAQView, ProfileView } from './components/SecondaryViews';
import { AuthModal, SettingsModal } from './components/Modals';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Shared 3D Prompt State
  const [promptInput, setPromptInput] = useState('');
  const [generated3DText, setGenerated3DText] = useState('Synthetix OS');
  const [meshColor, setMeshColor] = useState('#00f0ff');
  const [meshType, setMeshType] = useState('text');

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#090d16', color: '#fff', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main View Switcher Router */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'landing' && (
          <LandingPage
            onLaunch={() => setActiveTab('canvas')}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === 'canvas' && (
          <Studio3DCanvas
            promptInput={promptInput}
            setPromptInput={setPromptInput}
            generated3DText={generated3DText}
            setGenerated3DText={setGenerated3DText}
            meshColor={meshColor}
            setMeshColor={setMeshColor}
            meshType={meshType}
            setMeshType={setMeshType}
          />
        )}

        {activeTab === 'inspiration' && <InspirationView setPromptInput={setPromptInput} setActiveTab={setActiveTab} />}
        {activeTab === 'leaderboard' && <LeaderboardView />}
        {activeTab === 'feedback' && <FeedbackView />}
        {activeTab === 'faq' && <FAQView />}
        {activeTab === 'profile' && <ProfileView currentUser={currentUser} setCurrentUser={setCurrentUser} />}
      </div>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => setCurrentUser(user)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}