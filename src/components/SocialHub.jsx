import React, { useState, useEffect } from 'react';
import { Heart, Send, Users, Sparkles, Clock, MessageSquare, PlusCircle } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function SocialHub({ onImportPrompt }) {
  const [statuses, setStatuses] = useState([]);
  const [friends, setFriends] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [promptRecipe, setPromptRecipe] = useState('');
  const [activeChatFriend, setActiveChatFriend] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    socket.on('statuses:init', (data) => setStatuses(data));
    socket.on('friends:init', (data) => setFriends(data));

    socket.on('status:new', (status) => {
      setStatuses((prev) => [status, ...prev]);
    });

    socket.on('status:updated', (updatedStatus) => {
      setStatuses((prev) => prev.map((s) => s.id === updatedStatus.id ? updatedStatus : s));
    });

    return () => {
      socket.off('statuses:init');
      socket.off('friends:init');
      socket.off('status:new');
      socket.off('status:updated');
    };
  }, []);

  const handlePostStatus = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    socket.emit('status:post', {
      author: 'You (Creator)',
      content: newPost,
      promptRecipe: promptRecipe
    });

    setNewPost('');
    setPromptRecipe('');
  };

  const handleLike = (id) => {
    socket.emit('status:like', id);
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChatFriend) return;
    setChatMessages((prev) => [...prev, { sender: 'You', text: chatInput, time: 'Just now' }]);
    setChatInput('');
  };

  return (
    <div style={{ padding: '30px', color: '#fff', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-[#00f0ff]', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users color="#00f0ff" /> Creative Ecosystem & 24h Status Feed
          </h2>
          <p style={{ margin: '4px 0 0 0', opacity: 0.7 }}>Share 3D builds, inspire peers, and collaborate in real-time.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Main Feed Column */}
        <div>
          {/* Post New Status Card */}
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(0, 240, 255, 0.2)', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#00f0ff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlusCircle size={18} /> Post a 24-Hour Creative Status
            </h3>
            <form onSubmit={handlePostStatus} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What did you imagine or build today?"
                rows={2}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: '#fff', outline: 'none', resize: 'none' }}
              />
              <input
                type="text"
                value={promptRecipe}
                onChange={(e) => setPromptRecipe(e.target.value)}
                placeholder="Attach Prompt Recipe (e.g., gold flying car with plasma thrusters)"
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: '#fff', outline: 'none' }}
              />
              <button type="submit" style={{ alignSelf: 'flex-end', background: 'linear-gradient(135deg, #00f0ff, #3b82f6)', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Send size={14} /> Share Status
              </button>
            </form>
          </div>

          {/* Status Updates List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {statuses.map((item) => (
              <div key={item.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <img src={item.avatar} alt={item.author} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{item.author}</h4>
                    <span style={{ fontSize: '0.75rem', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> Expires in 24 hours
                    </span>
                  </div>
                </div>

                <p style={{ margin: '0 0 12px 0', fontSize: '0.95rem', lineHeight: 1.5 }}>{item.content}</p>

                {item.promptRecipe && (
                  <div style={{ background: 'rgba(0, 240, 255, 0.1)', border: '1px dashed rgba(0,240,255,0.4)', padding: '10px 14px', borderRadius: '10px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#38bdf8' }}>🎨 Recipe: "{item.promptRecipe}"</span>
                    <button onClick={() => onImportPrompt(item.promptRecipe)} style={{ background: '#00f0ff', color: '#000', border: 'none', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Sparkles size={12} /> Build in 3D
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <button onClick={() => handleLike(item.id)} style={{ background: 'transparent', border: 'none', color: '#ff4757', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                    <Heart size={16} fill={item.likes > 0 ? '#ff4757' : 'none'} /> {item.likes} Encouragements
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Column: Friends & Direct Chat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#00f0ff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} /> Collaborators & Friends
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {friends.map((friend) => (
                <div key={friend.id} onClick={() => setActiveChatFriend(friend)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', borderRadius: '10px', background: activeChatFriend?.id === friend.id ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{friend.name}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Building: {friend.building}</div>
                  </div>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', background: friend.status === 'Online' ? 'rgba(46, 213, 115, 0.2)' : 'rgba(255,255,255,0.1)', color: friend.status === 'Online' ? '#2ed573' : '#aaa' }}>
                    {friend.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Peer Chat Drawer */}
          {activeChatFriend && (
            <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(0, 240, 255, 0.3)', display: 'flex', flexDirection: 'column', height: '300px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={14} /> Chat with {activeChatFriend.name}
              </h4>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                {chatMessages.map((msg, idx) => (
                  <div key={idx} style={{ background: msg.sender === 'You' ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '8px', fontSize: '0.8rem', alignSelf: msg.sender === 'You' ? 'flex-end' : 'flex-start' }}>
                    {msg.text}
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendChatMessage} style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type plan..."
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px', color: '#fff', outline: 'none', fontSize: '0.8rem' }}
                />
                <button type="submit" style={{ background: '#00f0ff', border: 'none', borderRadius: '8px', padding: '0 10px', color: '#000', cursor: 'pointer' }}>
                  <Send size={12} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
