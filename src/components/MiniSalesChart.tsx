import React from 'react';
import { useStore } from '../store/useStore';
import { useLanguage } from '../contexts/LanguageContext';
import { formatCurrency } from '../lib/formatters';
import { motion } from 'framer-motion';

const MiniSalesChart: React.FC = () => {
  const { language } = useLanguage();
  const { invoices } = useStore();

  // Simple logic to get last 7 invoices for a chart
  const data = invoices.slice(0, 7).reverse();
  const maxVal = Math.max(...data.map(d => d.totalTTC), 1000);

  return (
    <div className="glass-card p-6 border-t-border h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
          {language === 'fr' ? 'Évolution des ventes' : 'تطور المبيعات'}
        </h3>
        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md">
          {language === 'fr' ? '7 Dernières' : 'آخر 7'}
        </span>
      </div>

      {data.length > 1 ? (
        <div className="flex-1 flex items-end gap-2 min-h-[120px]">
          {data.map((inv) => (
            <div key={inv.id} className="flex-1 flex flex-col items-center gap-2 group cursor-help">
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${(inv.totalTTC / maxVal) * 100}%` }}
                className="w-full bg-indigo-500/20 group-hover:bg-indigo-500/40 rounded-t-lg transition-colors relative"
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card border border-t-border-strong px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {formatCurrency(inv.totalTTC, inv.currency)}
                </div>
              </motion.div>
              <span className="text-[8px] text-zinc-600 font-bold truncate w-full text-center">
                {inv.date.split('-').slice(1).join('/')}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-zinc-500 text-xs italic">
          {language === 'fr' ? 'Pas assez de données' : 'بيانات غير كافية'}
        </div>
      )}
    </div>
  );
};

export default MiniSalesChart;
