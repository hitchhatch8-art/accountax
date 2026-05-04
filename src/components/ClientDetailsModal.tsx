import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useStore, type Client } from '../store/useStore';
import { formatCurrency } from '../lib/formatters';
import { 
  X, ShieldCheck, ShieldAlert, Mail, Phone, MapPin, Hash, 
  FileText, TrendingUp, Clock, CheckCircle2 
} from 'lucide-react';

interface ClientDetailsModalProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
}

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({ client, isOpen, onClose }) => {
  const { language, t } = useLanguage();
  const { invoices } = useStore();

  if (!isOpen) return null;

  // Get all invoices for this client
  const clientInvoices = invoices.filter(inv => inv.clientId === client.id);
  const totalRevenue = clientInvoices.reduce((sum, inv) => sum + inv.totalTTC, 0);
  const paidInvoices = clientInvoices.filter(inv => inv.status === 'paid');
  const pendingInvoices = clientInvoices.filter(inv => inv.status === 'pending' || inv.status === 'draft');
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.totalTTC, 0);
  const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.totalTTC, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'overdue': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-overlay backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-modal border border-t-border-strong w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-[2rem] shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-8 pb-0">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-5">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black ${
                  client.status === 'active' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-black mb-1">{client.name}</h2>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      client.status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {client.status === 'active' 
                        ? (language === 'fr' ? '● Actif' : '● نشط') 
                        : (language === 'fr' ? '● Inactif' : '● غير نشط')
                      }
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2.5 bg-surface hover:bg-surface-active rounded-xl text-dimmer hover:text-foreground transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Scrolling Content */}
          <div className="flex-1 overflow-y-auto px-8 pb-8">
            {/* Client Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-surface border border-t-border rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Hash size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">ICE</span>
                </div>
                <p className="text-sm font-mono font-bold truncate">{client.ice || '---'}</p>
              </div>
              <div className="bg-surface border border-t-border rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Mail size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Email</span>
                </div>
                <p className="text-sm font-medium truncate">{client.email || '---'}</p>
              </div>
              <div className="bg-surface border border-t-border rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Phone size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{t('phone')}</span>
                </div>
                <p className="text-sm font-medium truncate">{client.phone || '---'}</p>
              </div>
              <div className="bg-surface border border-t-border rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-zinc-500">
                  <MapPin size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{t('address')}</span>
                </div>
                <p className="text-sm font-medium truncate">{client.address || '---'}</p>
              </div>
            </div>

            {/* Revenue Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
                <TrendingUp size={18} className="text-indigo-400 mb-2" />
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                  {language === 'fr' ? 'Chiffre Total' : 'المجموع الكلي'}
                </p>
                <p className="text-xl font-black text-indigo-400 font-mono">{formatCurrency(totalRevenue, 'DH')}</p>
              </div>
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
                <CheckCircle2 size={18} className="text-emerald-400 mb-2" />
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                  {language === 'fr' ? 'Encaissé' : 'المحصّل'}
                </p>
                <p className="text-xl font-black text-emerald-400 font-mono">{formatCurrency(totalPaid, 'DH')}</p>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
                <Clock size={18} className="text-amber-400 mb-2" />
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                  {language === 'fr' ? 'En attente' : 'قيد الانتظار'}
                </p>
                <p className="text-xl font-black text-amber-400 font-mono">{formatCurrency(totalPending, 'DH')}</p>
              </div>
            </div>

            {/* Invoice List */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4 flex items-center gap-4">
                <FileText size={14} />
                <span>{language === 'fr' ? `Factures (${clientInvoices.length})` : `الفواتير (${clientInvoices.length})`}</span>
                <div className="h-px flex-1 bg-white/5"></div>
              </h3>

              {clientInvoices.length > 0 ? (
                <div className="bg-surface border border-t-border rounded-2xl overflow-hidden">
                  {clientInvoices.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between p-4 border-b border-t-border last:border-0 hover:bg-surface-hover transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center text-indigo-400">
                          <FileText size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold tracking-wider">{inv.number}</p>
                          <p className="text-[10px] text-zinc-500">{inv.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusColor(inv.status)}`}>
                          {t(inv.status)}
                        </span>
                        <span className="text-sm font-black font-mono min-w-[100px] text-right">
                          {formatCurrency(inv.totalTTC, inv.currency)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center bg-surface border border-t-border rounded-2xl">
                  <FileText size={32} className="mx-auto mb-3 text-zinc-700" />
                  <p className="text-sm text-zinc-500 italic">
                    {language === 'fr' ? 'Aucune facture pour ce client' : 'لا توجد فواتير لهذا العميل'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ClientDetailsModal;
