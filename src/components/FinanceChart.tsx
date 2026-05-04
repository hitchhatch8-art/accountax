import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const FinanceChart: React.FC = () => {
  const { language } = useLanguage();
  const { invoices, expenses } = useStore();

  const chartData = useMemo(() => {
    // Group invoices and expenses by month
    const months: Record<string, { income: number; expense: number }> = {};
    
    // Initialize last 6 months
    const date = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = { income: 0, expense: 0 };
    }

    // Add Invoices (Income)
    invoices.forEach(inv => {
      const parts = inv.date.split('-'); // YYYY-MM-DD
      if (parts.length >= 2) {
        const key = `${parts[0]}-${parts[1]}`;
        if (months[key]) {
          months[key].income += inv.totalTTC;
        }
      }
    });

    // Add Expenses
    expenses.forEach(exp => {
      const parts = exp.date.split('-'); // YYYY-MM-DD
      if (parts.length >= 2) {
        const key = `${parts[0]}-${parts[1]}`;
        if (months[key]) {
          months[key].expense += exp.totalTTC;
        }
      }
    });

    // Format for Recharts
    const formatter = new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'ar-MA', { month: 'short' });
    
    return Object.keys(months).map(key => {
      const [year, month] = key.split('-');
      const d = new Date(parseInt(year), parseInt(month) - 1, 1);
      return {
        name: formatter.format(d),
        Revenus: months[key].income,
        Dépenses: months[key].expense
      };
    });
  }, [invoices, expenses, language]);

  // Read theme variables for chart colors
  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#a1a1aa' : '#71717a'; // zinc-400 / zinc-500
  const gridColor = isDark ? '#27272a' : '#f4f4f5'; // zinc-800 / zinc-100

  return (
    <div className="glass-card p-6 border-t-border h-full flex flex-col min-h-[300px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
          {language === 'fr' ? 'Évolution Financière' : 'التطور المالي'}
        </h3>
        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md">
          {language === 'fr' ? '6 Derniers Mois' : 'آخر 6 أشهر'}
        </span>
      </div>

      <div className="flex-1 w-full h-full min-h-[200px]" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: textColor, fontSize: 10, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: textColor, fontSize: 10 }}
              tickFormatter={(value) => `${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--color-surface)', 
                borderColor: 'var(--color-border)',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
              }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              labelStyle={{ color: textColor, marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}
            />
            <Area 
              type="monotone" 
              dataKey="Revenus" 
              name={language === 'fr' ? 'Revenus' : 'المداخيل'}
              stroke="#6366f1" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorIncome)" 
            />
            <Area 
              type="monotone" 
              dataKey="Dépenses" 
              name={language === 'fr' ? 'Dépenses' : 'المصروفات'}
              stroke="#f43f5e" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorExpense)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinanceChart;
