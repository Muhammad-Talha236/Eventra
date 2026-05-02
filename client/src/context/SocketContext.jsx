import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user || !token) return;

    const newSocket = io('http://localhost:5000', {
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected!');
      newSocket.emit('join', user.id);
    });

    // Real-time notification receive karo
    newSocket.on('notification', (data) => {
      toast.custom((t) => (
        <div className={`bg-white shadow-lg rounded-xl p-4 flex items-start gap-3 border-l-4 border-blue-500 max-w-sm ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
          <span className="text-2xl">🔔</span>
          <div>
            <p className="font-semibold text-gray-800">{data.title}</p>
            <p className="text-sm text-gray-500">{data.message}</p>
          </div>
        </div>
      ), { duration: 5000 });

      setNotifications(prev => [{ ...data, id: Date.now(), isRead: false }, ...prev]);
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [user, token]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, markAllRead }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);