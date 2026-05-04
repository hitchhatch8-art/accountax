import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useStore } from '../store/useStore';
import { X, Save, User, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface ClientFormProps {
  onClose: () => void;
  onSave: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ onClose, onSave }) => {
  const { language, t } = useLanguage();
  const { addClient } = useStore();

  const [name, setName] = useState('');
  const [ice, setIce] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ice) return;

    setSaving(true);
    try {
      await addClient({
        name,
        ice,
        status
      });
      onSave();
    } catch (error: any) {
      console.error('Failed to save client:', error);
      toast.error(error.message || (language === 'fr' ? 'Erreur lors de l\'enregistrement du client' : 'خطأ أثناء حفظ العميل'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-8 border-indigo-500/20 shadow-premium max-w-lg w-full"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">{t('addClient')}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <User size={12} /> {t('clientName')}
          </label>
          <input 
            autoFocus
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-surface border border-t-border-strong rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            placeholder="e.g. SAIDA SARL"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Hash size={12} /> {t('iceNumber')}
          </label>
          <input 
            type="text" 
            value={ice}
            onChange={(e) => setIce(e.target.value)}
            required
            className="w-full bg-surface border border-t-border-strong rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            placeholder="00xxxxxxxxxxxxx"
          />
        </div>

        <div className="flex items-center gap-4 py-4">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t('status')}</span>
          <div className="flex p-1 bg-surface rounded-xl border border-t-border">
            <button 
              type="button"
              onClick={() => setStatus('active')}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${status === 'active' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500'}`}
            >
              {t('active')}
            </button>
            <button 
              type="button"
              onClick={() => setStatus('inactive')}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${status === 'inactive' ? 'bg-red-500/80 text-white shadow-lg' : 'text-zinc-500'}`}
            >
              {t('inactive')}
            </button>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="submit"
            disabled={saving}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            <Save size={18} /> {saving ? (language === 'fr' ? 'Enregistrement...' : 'جاري الحفظ...') : t('saveInvoice')}
          </button>
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-4 bg-surface hover:bg-surface-active text-dimmer hover:text-foreground rounded-2xl transition-all font-bold border border-t-border"
          >
            <X size={18} />
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ClientForm;
