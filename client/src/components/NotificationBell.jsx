import { useState } from 'react';
import { useSocket } from '../context/SocketContext';

export default function NotificationBell() {
  const { notifications, markAllRead } = useSocket();
  const [open, setOpen] = useState(false);

  const unread = notifications.filter(n => !n.isRead).length;

  const typeIcon = {
    task: '📋',
    payment: '💰',
    registration: '🎟️',
    announcement: '📢',
    incident: '🚨',
  };

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open) markAllRead(); }}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border z-50 overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h3 className="font-bold text-gray-800">Notifications</h3>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <p className="text-3xl mb-2">🔕</p>
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id}
                  className={`px-4 py-3 border-b hover:bg-gray-50 transition ${!n.isRead ? 'bg-blue-50' : ''}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{typeIcon[n.type] || '🔔'}</span>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}