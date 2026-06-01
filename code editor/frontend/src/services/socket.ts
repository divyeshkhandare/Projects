import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = useAuthStore.getState().accessToken || localStorage.getItem('accessToken');
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: false,
    });

    socket.on('connect', () => console.log('[Socket] Connected:', socket!.id));
    socket.on('disconnect', (reason) => console.log('[Socket] Disconnected:', reason));
    socket.on('error', (err) => console.error('[Socket] Error:', err));
  }
  return socket;
}

export function connectSocket() {
  getSocket().connect();
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function joinRoom(projectId: string) {
  getSocket().emit('room:join', { projectId });
}

export function leaveRoom(projectId: string) {
  getSocket().emit('room:leave', { projectId });
}

export function emitCursorChange(projectId: string, fileId: string, position: { lineNumber: number; column: number }) {
  getSocket().emit('editor:cursor', { projectId, fileId, position });
}

export function emitEditorChange(projectId: string, fileId: string, changes: unknown, version: number) {
  getSocket().emit('editor:change', { projectId, fileId, changes, version });
}

export function emitSelection(projectId: string, fileId: string, selection: unknown) {
  getSocket().emit('editor:selection', { projectId, fileId, selection });
}

export function emitChatMessage(projectId: string, message: string) {
  getSocket().emit('chat:message', { projectId, message });
}

export function emitFileSaved(projectId: string, fileId: string) {
  getSocket().emit('file:saved', { projectId, fileId });
}
