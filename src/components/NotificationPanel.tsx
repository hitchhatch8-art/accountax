import React from 'react';
import { useStore, type AppNotification } from '../store/useStore';
import { useLanguage } from '../contexts/LanguageContext';
import { Bell, Check, X, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationPanelProps {
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const { language } = useLanguage();
  const { notifications, markAsRead, clearNotifications } = useStore();

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="text-emerald-500" size={16} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={16} />;
      default: return <Info className="text-indigo-500" size={16} />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute top-full mt-4 right-0 w-80 lg:w-96 bg-modal border border-t-border-strong rounded-2xl shadow-2xl z-[100] overflow-hidden"
    >
      <div className="p-4 border-b border-t-border flex items-center justify-between bg-surface">
        <h3 className="font-bold text-sm">
          {language === 'fr' ? 'Notifications' : 'الإشعارات'}
        </h3>
        <div className="flex gap-2">
          {notifications.length > 0 && (
            <button 
              onClick={clearNotifications}
              className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              {language === 'fr' ? 'Tout effacer' : 'مسح الكل'}
            </button>
          )}
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        <AnimatePresence>
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <motion.div 
                key={n.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`p-4 border-b border-t-border last:border-0 hover:bg-surface-hover transition-colors relative group ${!n.read ? 'bg-indigo-500/[0.03]' : ''}`}
              >
                <div className="flex gap-3">
                  <div className="mt-1">{getIcon(n.type)}</div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold mb-0.5 ${!n.read ? 'text-foreground' : 'text-dim'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      {n.description}
                    </p>
                    <p className="text-[10px] text-zinc-600 mt-2 font-medium">
                      {n.time}
                    </p>
                  </div>
                  {!n.read && (
                    <button 
                      onClick={() => markAsRead(n.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-surface-hover rounded-md self-start"
                    >
                      <Check size={14} className="text-indigo-400" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-12 text-center">
              <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                <Bell size={20} />
              </div>
              <p className="text-sm text-zinc-500">
                {language === 'fr' ? 'Aucune notification' : 'لا توجد إشعارات'}
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {notifications.length > 0 && (
        <div className="p-3 bg-surface text-center border-t border-t-border">
          <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
            {language === 'fr' ? 'Voir tout les rapports' : 'عرض جميع التقارير'}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default NotificationPanel;
