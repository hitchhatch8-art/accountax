import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { formatCurrency } from '../lib/formatters';
import { useStore, type Invoice } from '../store/useStore';

interface InvoiceTemplateProps {
  invoice: Invoice;
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ invoice }) => {
  const { direction, language } = useLanguage();
  const { companyProfile, clients } = useStore();

  return (
    <div 
      className={`bg-white text-zinc-900 p-12 w-[210mm] min-h-[297mm] mx-auto shadow-2xl overflow-hidden`}
      id="invoice-document"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-16">
        <div>
          <div className="w-24 h-24 mb-4 overflow-hidden rounded-xl border border-zinc-100 p-2 flex items-center justify-center bg-zinc-50">
            {companyProfile?.logo ? (
              <img src={companyProfile.logo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            )}
          </div>
          <h1 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter">{companyProfile?.name || ''}</h1>
          {companyProfile?.phone && <p className="text-sm text-zinc-500 font-medium">{companyProfile.phone}</p>}
        </div>
        <div className={direction === 'rtl' ? 'text-start' : 'text-end'}>
          <h2 className="text-4xl font-black text-indigo-600 mb-2 uppercase tracking-tighter">
            {language === 'fr' ? 'FACTURE' : 'فاتورة'}
          </h2>
          <div className="space-y-1">
            <p className="text-sm font-bold text-zinc-900">N° {invoice.number}</p>
            <p className="text-sm text-zinc-500">{invoice.date}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-16 mb-16 text-start">
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-2">
            {language === 'fr' ? 'ÉMETTEUR' : 'المُصدر'}
          </h3>
          <div className="text-sm space-y-1">
            <p className="font-bold text-zinc-900 underline underline-offset-4 decoration-indigo-200">{companyProfile?.name || ''}</p>
            <p className="text-zinc-600 text-xs italic max-w-[250px]">{companyProfile?.address || ''}</p>
            <div className="pt-2 text-[10px] text-zinc-500 font-mono">
              <p>ICE: {companyProfile?.ice || ''}</p>
              <p>IF: {companyProfile?.ifNum || ''} | RC: {companyProfile?.rc || ''}</p>
            </div>

          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-2">
            {language === 'fr' ? 'CLIENT' : 'العميل'}
          </h3>
          <div className="text-sm space-y-1">
            <p className="font-bold text-zinc-900 text-lg">{invoice.clientName}</p>
            {(() => {
              const client = clients.find(c => c.id === invoice.clientId);
              return client?.ice ? (
                <div className="pt-2 text-[10px] text-zinc-500 font-mono uppercase">
                  <p>ICE: {client.ice}</p>
                  {client.address && <p>{client.address}</p>}
                </div>
              ) : null;
            })()}
          </div>
        </div>
      </div>

      <div className="mb-16">
        <table className="w-full text-start">
          <thead>
            <tr className="border-b-2 border-zinc-900 text-xs font-black uppercase tracking-wider text-zinc-900">
              <th className="py-4 text-start">{language === 'fr' ? 'Désignation' : 'البيان'}</th>
              <th className="py-4 text-center">{language === 'fr' ? 'Qté' : 'الكمية'}</th>
              <th className="py-4 text-center">{language === 'fr' ? 'P.U (HT)' : 'الثمن'}</th>
              <th className="py-4 text-center">TVA</th>
              <th className="py-4 text-right">{language === 'fr' ? 'Montant HT' : 'المجموع صافي'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {invoice.items.map((item, idx) => (
              <tr key={idx} className="text-sm">
                <td className="py-6 font-semibold text-zinc-900">{item.description}</td>
                <td className="py-6 text-center">{item.quantity}</td>
                <td className="py-6 text-center">{formatCurrency(item.priceHT, '')}</td>
                <td className="py-6 text-center">{item.tvaRate}%</td>
                <td className="py-6 text-right font-bold text-zinc-900">{formatCurrency(item.quantity * item.priceHT, '')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <div className="w-80 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">{language === 'fr' ? 'Total HT' : 'المجموع الصافي'}</span>
            <span className="font-bold">{formatCurrency(invoice.totalHT, invoice.currency)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">{language === 'fr' ? 'Total TVA' : 'مجموع الضريبة'}</span>
            <span className="font-bold">+{formatCurrency(invoice.totalTVA, invoice.currency)}</span>
          </div>
          <div className="h-px bg-zinc-900 my-4"></div>
          <div className="flex justify-between items-center py-2 px-4 bg-indigo-50 rounded-xl">
            <span className="text-sm font-black text-indigo-900 uppercase">{language === 'fr' ? 'Total TTC' : 'المجموع الكلي'}</span>
            <span className="text-xl font-black text-indigo-600">
              {formatCurrency(invoice.totalTTC, invoice.currency)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-20 pt-20 border-t border-zinc-100">
        <div className="grid grid-cols-2 gap-8 grayscale opacity-80">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-10">Cachet de la Société</p>
            <div className="w-32 h-32 border-2 border-dashed border-zinc-200 rounded-full flex items-center justify-center">
               <span className="text-[8px] text-zinc-300 uppercase tracking-tighter">Place seal here</span>
            </div>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-10">Signature du Gérant</p>
             <div className="italic font-serif text-2xl text-zinc-300 pr-4 pt-10 lowercase">{companyProfile?.name?.split(' ')[0] || ''}</div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-16 text-center text-[10px] text-zinc-400 space-y-1">
        <p>Merci de votre confiance. En cas de retard de paiement, une pénalité de 10% sera appliquée.</p>
        <p className="font-bold">{companyProfile?.name || ''} • RC {companyProfile?.rc || ''} • IF {companyProfile?.ifNum || ''} • ICE {companyProfile?.ice || ''}</p>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
