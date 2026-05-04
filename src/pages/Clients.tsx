import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useStore, type Client } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Search, Trash2, ShieldCheck, ShieldAlert, Mail, Phone } from 'lucide-react';
import ClientForm from '../components/ClientForm';
import ClientDetailsModal from '../components/ClientDetailsModal';
import toast from 'react-hot-toast';

const Clients: React.FC = () => {
  const { language, t } = useLanguage();
  const { clients, deleteClient } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.ice.includes(searchTerm)
  );

  const handleDelete = (id: string, name: string) => {
    if (confirm(language === 'fr' ? `Supprimer ${name} ?` : `حذف ${name}؟`)) {
      deleteClient(id);
      toast.success(language === 'fr' ? 'Client supprimé' : 'تم حذف العميل');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold tracking-tight mb-2"
          >
            {t('clients')}
          </motion.h2>
          <p className="text-zinc-500">
            {language === 'fr' 
              ? `Vous avez ${clients.length} clients au total.` 
              : `لديك ${clients.length} عملاء في المجموع.`}
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus size={18} />
          {t('addClient')}
        </button>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchClients')}
              className="w-full bg-surface border border-t-border rounded-2xl py-3 pl-12 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium"
            />
          </div>
        </div>

        {clients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredClients.map((client) => (
                <motion.div 
                  key={client.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-surface border border-t-border rounded-3xl p-6 hover:bg-surface-hover transition-all group relative"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${client.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {client.status === 'active' ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                    </div>
                    <button 
                      onClick={() => handleDelete(client.id, client.name)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <h3 className="text-lg font-bold mb-1 truncate">{client.name}</h3>
                  <p className="text-xs text-zinc-500 font-mono mb-6">ICE: {client.ice}</p>

                  <div className="space-y-3 pt-4 border-t border-t-border">
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <Mail size={14} className="opacity-30" />
                      <span className="truncate italic opacity-50">{client.email || '---'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <Phone size={14} className="opacity-30" />
                      <span className="truncate italic opacity-50">{client.phone || '---'}</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button 
                      onClick={() => setSelectedClient(client)}
                      className="w-full py-2.5 bg-white/5 hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/20 border border-transparent rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                    >
                      {language === 'fr' ? 'Détails Complet' : 'التفاصيل الكاملة'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-indigo-600/10 rounded-full flex items-center justify-center text-indigo-400 mb-6">
              <Users size={40} />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {searchTerm ? t('searchClients') : (language === 'fr' ? 'Aucun client trouvé' : 'لم يتم العثور على عملاء')}
            </h3>
            <p className="text-zinc-500 max-w-xs mx-auto mb-8">
              {language === 'fr' 
                ? 'Commencez par ajouter votre premier client pour gérer ses factures.' 
                : 'ابدأ بإضافة أول عميل لك لإدارة فواتيره.'}
            </p>
            <button 
              onClick={() => setIsAdding(true)}
              className="text-indigo-400 font-bold hover:underline"
            >
              {language === 'fr' ? 'Créer votre premier client' : 'أنشئ أول عميل لك'}
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <ClientForm 
              onClose={() => setIsAdding(false)} 
              onSave={() => {
                setIsAdding(false);
                toast.success(language === 'fr' ? 'Client ajouté !' : 'تم إضافة العميل !');
              }} 
            />
          </div>
        )}
      </AnimatePresence>

      {selectedClient && (
        <ClientDetailsModal 
          client={selectedClient}
          isOpen={!!selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
};

export default Clients;

