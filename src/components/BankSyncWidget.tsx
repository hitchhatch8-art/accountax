import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { RefreshCcw, Plus } from 'lucide-react';
import BankImportModal from './BankImportModal';

const initialBanks = [
  { id: 1, name: 'Attijariwafa Bank', logo: 'AWB', color: 'bg-yellow-600', status: 'Ready' },
  { id: 2, name: 'CIH Bank', logo: 'CIH', color: 'bg-blue-600', status: 'Soon' },
];

const BankSyncWidget = () => {
  const { language } = useLanguage();
  const [banks] = useState(initialBanks);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImport = () => {
    setIsModalOpen(true);
  };

  return (
    <div id="bank-sync-widget" className="glass-card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">
          {language === 'fr' ? 'Import Relevés Bancaires' : 'استيراد الكشوفات البنكية'}
        </h3>
        <RefreshCcw size={20} className="text-zinc-500" />
      </div>
      
      <div className="space-y-4 flex-1">
        {banks.map((bank) => (
          <div key={bank.id} className="flex items-center justify-between p-4 rounded-2xl bg-surface border border-t-border hover:bg-surface-hover transition-all group overflow-hidden relative">
            
            {/* Manual Import Badge for Ready Banks */}
            {bank.status === 'Ready' && (
              <div className="absolute top-0 right-0 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded-bl-lg">
                Manual Import
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${bank.color} flex items-center justify-center font-bold text-white text-xs shadow-lg`}>
                {bank.logo}
              </div>
              <div>
                <p className="font-semibold text-sm group-hover:text-foreground transition-colors flex items-center gap-2">
                  {bank.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${bank.status === 'Ready' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`}></div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
                    {language === 'fr' 
                      ? (bank.status === 'Ready' ? 'Prêt pour l\'import' : 'API Bientôt') 
                      : (bank.status === 'Ready' ? 'جاهز للاستيراد' : 'قريباً (API مباشر)')}
                  </p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleImport}
              className={`p-2 rounded-xl transition-all ${bank.status === 'Ready' ? 'bg-surface text-dim hover:bg-indigo-500 hover:text-white' : 'opacity-0 disabled cursor-default'}`}
              disabled={bank.status !== 'Ready'}
            >
              {bank.status === 'Ready' && <RefreshCcw size={16} />}
            </button>
          </div>
        ))}
      </div>
      
      <button 
        onClick={handleImport}
        className="w-full mt-6 py-4 rounded-2xl border border-dashed border-t-border-strong text-dimmer hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-sm font-bold flex justify-center items-center gap-2"
      >
        <Plus size={18} />
        {language === 'fr' ? 'Importer un fichier bancaire' : 'استيراد ملف بنكي'}
      </button>

      <BankImportModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default BankSyncWidget;
