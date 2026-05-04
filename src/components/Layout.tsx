import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import PricingModal from './PricingModal';
import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useLanguage } from '../contexts/LanguageContext';
import { AlertCircle } from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const { user } = useStore();
  const { language } = useLanguage();

  const isTrialExpired = user?.plan === 'STARTER' && user?.trialEndsAt && new Date(user.trialEndsAt) < new Date();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)} 
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 lg:relative lg:z-0
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar 
          onNavigate={() => setSidebarOpen(false)} 
          onUpgradeClick={() => setPricingOpen(true)}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 relative">
        <Topbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto relative">
          
          {isTrialExpired && (
            <div className="absolute inset-0 z-40 bg-overlay backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
              <div className="bg-card border border-red-500/20 p-8 rounded-3xl max-w-md shadow-2xl relative">
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle size={32} />
                </div>
                <h2 className="text-2xl font-black mb-4">
                  {language === 'fr' ? 'Période d\'essai terminée' : 'انتهت فترة التجربة المجانية'}
                </h2>
                <p className="text-dimmer mb-8 leading-relaxed">
                  {language === 'fr' 
                    ? 'Vous avez épuisé vos 30 jours d\'essai gratuit du plan Starter. Veuillez mettre à niveau vers un plan payant pour continuer à utiliser toutes les fonctionnalités.'
                    : 'لقد استنفذت 30 يوماً من خطة Starter المجانية. يرجى الترقية إلى خطة مدفوعة للاستمرار في استخدام كافة المميزات.'}
                </p>
                <button 
                  onClick={() => setPricingOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 w-full rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
                >
                  {language === 'fr' ? 'Mettre à niveau maintenant' : 'ترقية الحساب الآن'}
                </button>
              </div>
            </div>
          )}

          <div className={`p-6 md:p-10 space-y-10 ${isTrialExpired ? 'pointer-events-none opacity-20 blur-sm select-none' : ''}`}>
            <Outlet />
          </div>
        </main>
      </div>
      <PricingModal isOpen={pricingOpen} onClose={() => setPricingOpen(false)} />
    </div>
  );
};

export default Layout;
