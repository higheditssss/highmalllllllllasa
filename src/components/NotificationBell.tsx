import { useState, useEffect, useRef } from 'react';
import { Bell, UserPlus, UserCheck, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  deleteNotification,
  timeAgo,
  Notification,
} from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    const [notifs, count] = await Promise.all([getNotifications(), getUnreadCount()]);
    setNotifications(notifs);
    setUnread(count);
  }

  useEffect(() => {
    load();

    // Realtime — ascultă notificări noi
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
      }, () => load())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Închide la click afară
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleOpen = async () => {
    setOpen(prev => !prev);
    if (!open && unread > 0) {
      await markAllAsRead();
      setUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const ICONS = {
    friend_request: <UserPlus className="h-4 w-4 text-primary" />,
    friend_accepted: <UserCheck className="h-4 w-4 text-emerald-400" />,
  };

  const MESSAGES = {
    friend_request: (username: string) => <><span className="font-medium">{username}</span> ți-a trimis o cerere de prietenie</>,
    friend_accepted: (username: string) => <><span className="font-medium">{username}</span> ți-a acceptat cererea de prietenie</>,
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 glass-card rounded-xl shadow-2xl border border-border/50 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <h3 className="text-sm font-semibold">Notificări</h3>
            {notifications.length > 0 && (
              <button
                onClick={async () => { await markAllAsRead(); setUnread(0); setNotifications(prev => prev.map(n => ({ ...n, read: true }))); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                <Check className="h-3 w-3" /> Marchează toate
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                Nicio notificare
              </div>
            ) : (
              notifications.map(notif => (
                <Link
                  key={notif.id}
                  to={`/user/${notif.from_username}`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors group relative',
                    !notif.read && 'bg-primary/5'
                  )}>
                  {/* Avatar */}
                  <div className="flex-shrink-0 mt-0.5">
                    {notif.from_avatar
                      ? <img src={notif.from_avatar} alt={notif.from_username} className="w-8 h-8 rounded-full object-cover" />
                      : <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                          {notif.from_username.charAt(0).toUpperCase()}
                        </div>
                    }
                  </div>

                  {/* Conținut */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">
                      {MESSAGES[notif.type](notif.from_username)}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {ICONS[notif.type]}
                      <span className="text-xs text-muted-foreground">{timeAgo(notif.created_at)}</span>
                    </div>
                  </div>

                  {/* Punct albastru dacă necitit */}
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  )}

                  {/* Buton ștergere */}
                  <button
                    onClick={(e) => handleDelete(notif.id, e)}
                    className="absolute right-2 top-2 p-1 rounded opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all">
                    <X className="h-3 w-3" />
                  </button>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
