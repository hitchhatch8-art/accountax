import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../lib/formatters';
import { TrendingUp, Users, Wallet, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

const StatsGrid: React.FC = () => {
  const { language } = useLanguage();
  const { invoices, expenses, clients } = useStore();

  const totalSalesHT = invoices.filter(inv => inv.status !== 'draft').reduce((sum, inv) => sum + inv.totalHT, 0);
  const totalExpensesHT = expenses.reduce((sum, e) => sum + e.totalHT, 0);
  const netProfitHT = totalSalesHT - totalExpensesHT;
  
  const activeClients = clients.filter(c => c.status === 'active').length;

  const profitColor = netProfitHT >= 0 ? 'bg-emerald-500' : 'bg-rose-500';
  const profitPercentageStyle = netProfitHT >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500';

  const stats = [
    {
      title: language === 'fr' ? 'Chiffre d\'Affaires HT' : 'رقم المعاملات',
      value: formatCurrency(totalSalesHT, 'DH'),
      icon: TrendingUp,
      color: 'bg-indigo-500',
      tag: 'Revenus',
      tagStyle: 'bg-indigo-500/10 text-indigo-500'
    },
    {
      title: language === 'fr' ? 'Dépenses HT' : 'المصروفات',
      value: formatCurrency(totalExpensesHT, 'DH'),
      icon: TrendingDown,
      color: 'bg-amber-500',
      tag: 'Coûts',
      tagStyle: 'bg-amber-500/10 text-amber-500'
    },
    {
      title: language === 'fr' ? 'Bénéfice Net HT' : 'الربح الصافي',
      value: formatCurrency(netProfitHT, 'DH'),
      icon: Wallet,
      color: profitColor,
      tag: netProfitHT >= 0 ? '+ Profit' : '- Perte',
      tagStyle: profitPercentageStyle
    },
    {
      title: language === 'fr' ? 'Clients Actifs' : 'العملاء النشطون',
      value: activeClients.toString(),
      icon: Users,
      color: 'bg-blue-500',
      tag: 'Base',
      tagStyle: 'bg-blue-500/10 text-blue-500'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <motion.div
          key={idx}
          whileHover={{ y: -4, scale: 1.01 }}
          className="glass-card p-6 border-t-border relative overflow-hidden group hover:bg-surface-hover transition-all"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-surface rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform"></div>
          
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${stat.color} bg-opacity-10 shadow-lg shadow-indigo-500/5`}>
              <stat.icon size={20} className={stat.color.replace('bg-', 'text-')} />
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${stat.tagStyle}`}>
              {stat.tag}
            </span>
          </div>

          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">{stat.title}</p>
            <h4 className="text-2xl font-black tracking-tight">{stat.value}</h4>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsGrid;
