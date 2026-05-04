import { useStore } from '../store/useStore';
import { useLanguage } from '../contexts/LanguageContext';
import { Calculator, Download, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../lib/formatters';
import toast from 'react-hot-toast';

const TVACalculator = () => {
  const { language } = useLanguage();
  const { invoices, expenses } = useStore();

  // TVA Collectée (Facturée aux clients) - Ignorer les brouillons
  const tvaCollectee = invoices
    .filter(inv => inv.status !== 'draft')
    .reduce((sum, inv) => sum + inv.totalTVA, 0);

  // TVA Déductible (Payée aux fournisseurs)
  const tvaDeductible = expenses.reduce((sum, exp) => sum + exp.totalTVA, 0);

  // TVA à Payer (Si positif) ou Crédit (Si négatif)
  const tvaDue = tvaCollectee - tvaDeductible;
  const isCredit = tvaDue < 0;

  const handleDownloadXML = () => {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<DeclarationTVA>
  <Periode>${new Date().toISOString().slice(0, 7)}</Periode>
  <TvaCollectee>${tvaCollectee.toFixed(2)}</TvaCollectee>
  <TvaDeductible>${tvaDeductible.toFixed(2)}</TvaDeductible>
  <TvaDue>${Math.max(0, tvaDue).toFixed(2)}</TvaDue>
  <CreditTVA>${isCredit ? Math.abs(tvaDue).toFixed(2) : "0.00"}</CreditTVA>
</DeclarationTVA>`;
    
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Declaration_DGI_${new Date().toISOString().slice(0, 7)}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(language === 'fr' ? 'Fichier XML généré avec succès' : 'تم إنشاء ملف XML بنجاح');
  };

  const handleCloturer = () => {
    const confirmMessage = language === 'fr' 
      ? 'Voulez-vous vraiment clôturer et figer la période de TVA actuelle ?' 
      : 'هل تريد حقاً إغلاق وتجميد فترة الضريبة الحالية؟';
      
    if (window.confirm(confirmMessage)) {
      toast.success(language === 'fr' ? 'Période de déclaration clôturée' : 'تم إغلاق فترة التصريح', {
        icon: '🔒'
      });
    }
  };

  return (
    <div className="glass-card p-6 h-full border-indigo-500/20 bg-indigo-500/[0.02] flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400">
          <Calculator size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold">
            {language === 'fr' ? 'Bilan TVA (Temps Réel)' : 'حصيلة الضريبة (وقتي)'}
          </h3>
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">
            {language === 'fr' ? 'Déclaration DGI' : 'تصريح مديرية الضرائب'}
          </p>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <div className="flex justify-between items-center bg-surface p-3 rounded-lg border border-t-border">
          <span className="text-xs font-bold text-zinc-400">{language === 'fr' ? 'TVA Collectée (Ventes)' : 'الضريبة المحصلة (مبيعات)'}</span>
          <span className="font-mono text-sm text-foreground">+{formatCurrency(tvaCollectee, 'DH')}</span>
        </div>

        <div className="flex justify-between items-center bg-surface p-3 rounded-lg border border-t-border">
          <span className="text-xs font-bold text-zinc-400">{language === 'fr' ? 'TVA Déductible (Achats)' : 'الضريبة المسترجعة (مشتريات)'}</span>
          <span className="font-mono text-sm text-foreground">-{formatCurrency(tvaDeductible, 'DH')}</span>
        </div>

        <div className={`p-4 rounded-2xl border space-y-2 mt-4 ${isCredit ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
          <div className="flex justify-between items-end">
            <span className={`text-sm font-bold ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isCredit 
                ? (language === 'fr' ? 'Crédit de TVA' : 'رصيد ضريبي') 
                : (language === 'fr' ? 'TVA à Payer' : 'الضريبة الواجب أداؤها')}
            </span>
            <span className={`text-2xl font-black font-mono ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(Math.abs(tvaDue), 'DH')}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            <ShieldCheck size={12} />
            {language === 'fr' ? 'Calcul Automatisé' : 'حساب آلي'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        <button 
          onClick={handleDownloadXML}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-surface text-xs font-bold hover:bg-surface-active transition-all border border-t-border"
        >
          <Download size={14} />
          XML DGI
        </button>
        <button 
          onClick={handleCloturer}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-xs font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
        >
          {language === 'fr' ? 'Clôturer' : 'إغلاق الحساب'}
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default TVACalculator;
