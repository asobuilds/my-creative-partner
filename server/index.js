import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// In-Memory Social Data Stores (With 24-Hour Auto-Clean)
let statuses = [
  {
    id: 'st-1',
    author: 'Amina (Creator)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    content: 'Just engineered a solar-powered flyer in 3D!',
    promptRecipe: 'gold solar flying car with plasma thrusters',
    likes: 12,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000
  },
  {
    id: 'st-2',
    author: 'Kofi (Builder)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    content: 'Testing structural wireframes for space habitats.',
    promptRecipe: 'blue futuristic hydroponic orbital dome',
    likes: 8,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000
  }
];

let friends = [
  { id: 'f-1', name: 'Amina', status: 'Online', building: 'Solar Flyer' },
  { id: 'f-2', name: 'Kofi', status: 'Building', building: 'Orbital Dome' },
  { id: 'f-3', name: 'Titi', status: 'Offline', building: 'None' }
];

// Clean expired statuses every minute
setInterval(() => {
  const now = Date.now();
  statuses = statuses.filter(s => s.expiresAt > now);
}, 60000);

// Basic Express Health Check Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', activeStatuses: statuses.length, connectedFriends: friends.length });
});

// WebSocket Event Handling
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // Send current statuses on join
  socket.emit('statuses:init', statuses);
  socket.emit('friends:init', friends);

  // Handle New 24-Hour Status Post
  socket.on('status:post', (data) => {
    const newStatus = {
      id: `st-${Date.now()}`,
      author: data.author || 'Anonymous Creator',
      avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      content: data.content,
      promptRecipe: data.promptRecipe || '',
      likes: 0,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    };
    statuses.unshift(newStatus);
    io.emit('status:new', newStatus);
  });

  // Handle Like / Encouragement
  socket.on('status:like', (statusId) => {
    const target = statuses.find(s => s.id === statusId);
    if (target) {
      target.likes += 1;
      io.emit('status:updated', target);
    }
  });

  // Multi-user Spatial Collaboration Sync
  socket.on('collaborate:join', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('collaborate:peer_joined', { socketId: socket.id });
  });

  socket.on('collaborate:spatial_update', (data) => {
    socket.to(data.roomId).emit('collaborate:spatial_render', data);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`[Synthetix Gateway] Server running on http://localhost:${PORT}`);
});
