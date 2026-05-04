import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { formatCurrency } from '../lib/formatters';
import { useStore, type InvoiceItem } from '../store/useStore';
import { FileText, Building, User } from 'lucide-react';

interface InvoicePreviewLiteProps {
  data: {
    number: string;
    date: string;
    clientId?: string;
    clientName: string;
    items: InvoiceItem[];
    totalHT: number;
    totalTVA: number;
    totalTTC: number;
    currency: string;
  };
}

const InvoicePreviewLite: React.FC<InvoicePreviewLiteProps> = ({ data }) => {
  const { language, t, direction } = useLanguage();
  const { companyProfile, clients } = useStore();

  const client = clients.find(c => c.name === data.clientName || c.id === data.clientId);
  const companyInitial = companyProfile?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="glass-card p-8 sticky top-24 h-fit border-indigo-500/20 bg-indigo-500/[0.02] shadow-premium overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -z-10 rounded-full"></div>
      
      <div className="flex justify-between items-start mb-8">
        <div>
          {companyProfile?.logo ? (
            <img src={companyProfile.logo} alt="Logo" className="w-12 h-12 rounded-xl object-contain mb-4 border border-t-border-strong" />
          ) : (
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4">{companyInitial}</div>
          )}
          <h4 className="font-bold text-lg">{companyProfile?.name || '---'}</h4>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{companyProfile?.address || '---'}</p>
        </div>
        <div className={direction === 'rtl' ? 'text-start' : 'text-end'}>
          <h3 className="text-2xl font-black text-indigo-400 opacity-50 uppercase tracking-tighter mb-2">
            {language === 'fr' ? 'Facture' : 'فاتورة'}
          </h3>
          <p className="text-xs font-mono font-bold text-zinc-400">{data.number || '#FA-XXXX'}</p>
          <p className="text-xs text-zinc-500 mt-1">{data.date || '---'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-10 pb-8 border-b border-t-border">
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Building size={12} /> {language === 'fr' ? 'Émetteur' : 'المُصدر'}
          </p>
          <p className="text-xs font-bold">{companyProfile?.name || '---'}</p>
          <p className="text-[10px] text-zinc-500 leading-relaxed">
            {companyProfile?.ice ? `ICE: ${companyProfile.ice}` : ''}{companyProfile?.ice && companyProfile?.ifNum ? <br/> : ''}
            {companyProfile?.ifNum ? `IF: ${companyProfile.ifNum}` : ''}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <User size={12} /> {language === 'fr' ? 'Client' : 'العميل'}
          </p>
          <p className="text-xs font-bold text-indigo-400">{data.clientName || '---'}</p>
          <p className="text-[10px] text-zinc-500">ICE: {client?.ice || '---'}</p>
        </div>
      </div>

      <div className="space-y-4 mb-10">
        <table className="w-full text-start text-xs">
          <thead>
            <tr className="text-zinc-500 border-b border-t-border">
              <th className="pb-3 font-bold tracking-wider">{t('itemDescription')}</th>
              <th className="pb-3 font-bold tracking-wider text-right">{t('totalHT')}</th>
            </tr>
          </thead>
          <tbody>
            {data.items.length > 0 ? (
              data.items.map((item, idx) => (
                <tr key={idx} className="border-b border-t-border last:border-0">
                  <td className="py-3">
                    <p className="font-semibold">{item.description || '---'}</p>
                    <p className="text-[10px] text-zinc-500">
                      {item.quantity} x {formatCurrency(item.priceHT, data.currency)} (TVA {item.tvaRate}%)
                    </p>
                  </td>
                  <td className="py-3 text-right font-mono font-bold">
                    {formatCurrency(item.quantity * item.priceHT, data.currency)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="py-10 text-center text-zinc-600 italic">
                  {language === 'fr' ? 'Aucun article ajouté' : 'لا توجد مواد مضافة'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-surface rounded-2xl p-6 space-y-3">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-500">{t('totalHT')}</span>
          <span className="font-mono">{formatCurrency(data.totalHT, data.currency)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-zinc-500">{t('totalTVA')}</span>
          <span className="font-mono">+{formatCurrency(data.totalTVA, data.currency)}</span>
        </div>
        <div className="h-px bg-t-border my-1"></div>
        <div className="flex justify-between items-end">
          <span className="text-sm font-bold">{t('totalTTC')}</span>
          <span className="text-xl font-bold text-indigo-400 font-mono">
            {formatCurrency(data.totalTTC, data.currency)}
          </span>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3 opacity-30 grayscale pointer-events-none">
        <div className="p-2 bg-surface rounded-lg border border-t-border">
          <FileText size={16} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{language === 'fr' ? 'Cachet & Signature' : 'الختم والتوقيع'}</p>
      </div>
    </div>
  );
};

export default InvoicePreviewLite;
