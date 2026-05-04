import { useState } from 'react';
import { Bell, Search, ChevronDown, Sun, Moon, Menu } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import NotificationPanel from './NotificationPanel';
import { AnimatePresence } from 'framer-motion';

interface TopbarProps {
  onMenuToggle?: () => void;
}

const Topbar = ({ onMenuToggle }: TopbarProps) => {
  const { language, setLanguage, direction } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { notifications, user, logout } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-20 flex items-center justify-between px-4 md:px-8 bg-background/50 backdrop-blur-md border-b border-t-border sticky top-0 z-50">
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Mobile hamburger */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2.5 rounded-xl bg-surface border border-t-border text-dimmer hover:text-foreground transition-all hover:bg-surface-active"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="relative group flex-1 hidden md:block">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder={language === 'fr' ? "Rechercher un client, une facture..." : "بحث عن عميل أو فاتورة..."}
            className="w-full bg-surface border border-t-border rounded-2xl py-2.5 pl-12 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        {/* Theme Toggler */}
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-surface border border-t-border text-dimmer hover:text-foreground transition-all hover:bg-surface-active"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Language Switcher */}
        <div className="flex items-center gap-2 p-1 bg-surface rounded-xl border border-t-border">
          <button 
            onClick={() => setLanguage('fr')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
              language === 'fr' ? "bg-indigo-600 text-white shadow-lg" : "text-dimmer hover:text-foreground"
            )}
          >
            FR
          </button>
          <button 
            onClick={() => setLanguage('ar')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
              language === 'ar' ? "bg-indigo-600 text-white shadow-lg" : "text-dimmer hover:text-foreground"
            )}
          >
            AR
          </button>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={cn(
              "relative p-2.5 rounded-xl bg-surface border border-t-border text-dimmer hover:text-foreground transition-all hover:bg-surface-active",
              showNotifications && "bg-surface-active text-foreground ring-2 ring-indigo-500/50"
            )}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 text-white text-[10px] font-bold rounded-full border-2 border-background flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <>
                {/* Backdrop overlay to close panel and prevent content bleed-through */}
                <div 
                  className="fixed inset-0 z-[90]" 
                  onClick={() => setShowNotifications(false)}
                />
                <NotificationPanel onClose={() => setShowNotifications(false)} />
              </>
            )}
          </AnimatePresence>
        </div>

        <div className={cn(
          "flex items-center gap-3 pl-6 border-t-border relative group cursor-pointer",
          direction === 'rtl' ? "pr-6 border-r" : "pl-6 border-l"
        )}>
          <div className="text-end hidden sm:block">
            <p className="text-sm font-semibold">{user?.name || (language === 'fr' ? 'Utilisateur' : 'مستخدم')}</p>
            <p className="text-xs text-zinc-500">{user?.role === 'accountant' ? (language === 'fr' ? 'Comptable Agréé' : 'محاسب معتمد') : 'Utilisateur'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} alt="Avatar" />
            </div>
          </div>
          <ChevronDown size={16} className="text-zinc-500 px-1" />
          
          <div className="absolute top-full right-0 mt-2 w-48 bg-dropdown border border-t-border-strong rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            <button 
              onClick={logout}
              className="w-full text-start px-4 py-3 text-sm text-red-500 hover:bg-surface-hover rounded-xl transition-colors font-bold"
            >
              {language === 'fr' ? 'Déconnexion' : 'تسجيل الخروج'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
