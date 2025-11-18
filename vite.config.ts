import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { Server } from 'socket.io';

export function setupWebSocketServer(server) {
  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log('A user connected');

    // Listen for admin updates
    socket.on('admin-update', (data) => {
      console.log('Admin update received:', data);
      // Broadcast the update to all clients
      socket.broadcast.emit('update', data);
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });

  return io;
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: ['rrwilliams.onrender.com'] // Added allowedHosts to permit the specified host
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
