
import { LayoutDashboard, Users, FileText, Calendar, Settings, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';
import { NavLink } from 'react-router-dom';
import { useStore } from '../store/useStore';

interface SidebarProps {
  onNavigate?: () => void;
  onUpgradeClick?: () => void;
}

const Sidebar = ({ onNavigate, onUpgradeClick }: SidebarProps) => {
  const { t, direction } = useLanguage();
  const { companyProfile } = useStore();

  const menuItems = [
    { icon: LayoutDashboard, label: t('dashboard'), path: '/' },
    { icon: Users, label: t('clients'), path: '/clients' },
    { icon: FileText, label: t('documents'), path: '/invoices' },
    { icon: Calendar, label: t('expenses'), path: '/expenses' },
    { icon: Settings, label: t('settings'), path: '/settings' },
  ];

  return (
    <aside className={cn(
      "w-72 h-screen flex flex-col border-t-border bg-sidebar backdrop-blur-xl transition-all duration-300",
      direction === 'rtl' ? "border-l" : "border-r"
    )}>
      <div className="p-8">
        <div className="flex items-center gap-3">
          <NavLink to="/" className="w-10 h-10 overflow-hidden rounded-xl shadow-indigo-500/20 shadow-lg border border-t-border-strong group hover:scale-105 transition-transform bg-surface flex items-center justify-center">
            {companyProfile?.logo ? (
              <img src={companyProfile.logo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            )}
          </NavLink>
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 truncate">
              {companyProfile?.name || 'AccounTax'}
            </h1>
            <p className="text-[8px] text-dimmer uppercase tracking-widest font-black">AccounTax Pro</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) => cn(
              "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group",
              isActive 
                ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5" 
                : "text-dimmer hover:bg-surface-hover hover:text-foreground"
            )}
          >
            <item.icon size={20} />
            <span className="font-medium flex-1 text-start">{item.label}</span>
            <ChevronRight size={16} className={cn(direction === 'rtl' && "rotate-180", "opacity-0 group-hover:opacity-100 transition-all")} />
          </NavLink>
        ))}
      </nav>

      <div className="p-6">
        <div className="p-4 rounded-2xl bg-indigo-600/5 border border-indigo-500/10">
          <p className="text-xs text-indigo-400 font-semibold mb-2 uppercase tracking-wider">
            {direction === 'rtl' ? 'الخطة المميزة' : 'Plan Premium'}
          </p>
          <p className="text-[10px] text-zinc-400 mb-4">
            {direction === 'rtl' ? 'وصول كامل لأدوات DGI والبنك' : 'Accès complet aux outils DGI & Bank Sync'}
          </p>
          <button 
            onClick={onUpgradeClick}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors"
          >
            {direction === 'rtl' ? 'ترقية الحساب' : 'Upgrade'}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
