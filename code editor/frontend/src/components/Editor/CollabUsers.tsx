import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { getSocket } from '@/services/socket';

interface RoomUser {
  id: string;
  username: string;
  color: string;
  avatar?: string;
}

interface Props {
  projectId: string;
}

export default function CollabUsers({ projectId }: Props) {
  const [users, setUsers] = useState<RoomUser[]>([]);

  useEffect(() => {
    const socket = getSocket();

    socket.on('room:users', ({ users: roomUsers }: { users: RoomUser[] }) => {
      setUsers(roomUsers);
    });

    socket.on('room:user-joined', ({ user }: { user: RoomUser }) => {
      setUsers((prev) => {
        if (prev.find((u) => u.id === user.id)) return prev;
        return [...prev, user];
      });
    });

    socket.on('room:user-left', ({ socketId }: { socketId: string }) => {
      setUsers((prev) => prev.filter((u) => u.id !== socketId));
    });

    return () => {
      socket.off('room:users');
      socket.off('room:user-joined');
      socket.off('room:user-left');
    };
  }, [projectId]);

  if (users.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 glass-card px-3 py-2 z-40">
      <Users className="w-3.5 h-3.5 text-editor-muted" />
      <div className="flex -space-x-1.5">
        {users.slice(0, 5).map((user) => (
          <div
            key={user.id}
            title={`@${user.username}`}
            className="w-6 h-6 rounded-full border-2 border-editor-surface flex items-center justify-center text-[10px] font-bold text-white"
            style={{ backgroundColor: user.color }}
          >
            {user.username[0]?.toUpperCase()}
          </div>
        ))}
        {users.length > 5 && (
          <div className="w-6 h-6 rounded-full border-2 border-editor-surface bg-editor-highlight flex items-center justify-center text-[9px] text-editor-muted">
            +{users.length - 5}
          </div>
        )}
      </div>
      <span className="text-xs text-editor-muted">{users.length} online</span>
    </div>
  );
}
