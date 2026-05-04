import React, { useState, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useStore, type CompanyProfile } from '../store/useStore';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Building, Bell, CreditCard, Upload, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const { language, t } = useLanguage();
  const { companyProfile, updateCompanyProfile } = useStore();
  const [profile, setProfile] = useState<CompanyProfile>(companyProfile || {
    name: '', ice: '', ifNum: '', rc: '', address: '', phone: '', logo: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState('company');

  const handleInputChange = (field: keyof CompanyProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.error(language === 'fr' ? 'Image trop grande (max 1MB)' : 'الصورة كبيرة جداً (أقصى حد 1 ميجابايت)');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfile(prev => ({ ...prev, logo: base64String }));
        toast.success(language === 'fr' ? 'Logo chargé !' : 'تم تحميل الشعار !');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateCompanyProfile(profile);
    toast.success(t('saveSettings'));
  };

  const sections = [
    { id: 'profile', label: language === 'fr' ? 'Profil' : 'الملف الشخصي', icon: User },
    { id: 'company', label: language === 'fr' ? 'Entreprise' : 'الشركة', icon: Building },
    { id: 'notifications', label: language === 'fr' ? 'Notifications' : 'الإشعارات', icon: Bell },
    { id: 'billing', label: language === 'fr' ? 'Abonnement' : 'الاشتراك', icon: CreditCard },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold tracking-tight mb-2"
        >
          {t('settings')}
        </motion.h2>
        <p className="text-zinc-500">
          {language === 'fr' 
            ? 'Gérez vos préférences et les informations de votre entreprise.' 
            : 'إدارة تفضيلاتك ومعلومات شركتك.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${activeTab === section.id ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5' : 'text-dimmer hover:bg-surface-hover hover:text-foreground'}`}
            >
              <section.icon size={18} />
              <span className="font-semibold text-sm">{section.label}</span>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 relative"
          >
            {activeTab === 'company' && (
              <div className="space-y-10">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">{t('logo')}</label>
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-3xl bg-surface border border-t-border-strong flex items-center justify-center overflow-hidden">
                        {profile.logo ? (
                          <img src={profile.logo} alt="Company Logo" className="w-full h-full object-contain" />
                        ) : (
                          <Building size={40} className="text-zinc-600" />
                        )}
                      </div>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center rounded-3xl transition-all cursor-pointer text-white gap-2"
                      >
                        <Upload size={20} />
                        <span className="text-[10px] font-bold uppercase">{t('changeLogo')}</span>
                      </button>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleLogoUpload}
                      />
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-6">
                    <div className="grid grid-cols-1 gap-6 text-start">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">{t('companyName')}</label>
                        <input 
                          type="text" 
                          value={profile.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full bg-surface border border-t-border-strong rounded-2xl px-4 py-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium" 
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 text-start">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">{t('iceNumber')}</label>
                          <input 
                            type="text" 
                            value={profile.ice}
                            onChange={(e) => handleInputChange('ice', e.target.value)}
                            className="w-full bg-surface border border-t-border-strong rounded-2xl px-4 py-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-mono" 
                          />
                        </div>
                        <div className="space-y-2 text-start">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Identifiant Fiscal (IF)</label>
                          <input 
                            type="text" 
                            value={profile.ifNum}
                            onChange={(e) => handleInputChange('ifNum', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-mono" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-start">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">R.C.</label>
                    <input 
                      type="text" 
                      value={profile.rc}
                      onChange={(e) => handleInputChange('rc', e.target.value)}
                      className="w-full bg-surface border border-t-border-strong rounded-2xl px-4 py-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">{t('phone')}</label>
                    <input 
                      type="text" 
                      value={profile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full bg-surface border border-t-border-strong rounded-2xl px-4 py-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium" 
                    />
                  </div>
                </div>

                <div className="space-y-2 text-start">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">{t('address')}</label>
                  <textarea 
                    rows={3}
                    value={profile.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full bg-surface border border-t-border-strong rounded-2xl px-4 py-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium resize-none" 
                  />
                </div>

                <div className="pt-6 border-t border-t-border flex justify-end">
                  <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20"
                  >
                    <Save size={18} />
                    {t('saveSettings')}
                  </button>
                </div>
              </div>
            )}

            {activeTab !== 'company' && (
              <div className="py-20 text-center text-zinc-500">
                 <SettingsIcon size={40} className="mx-auto mb-4 opacity-20" />
                 <p className="text-sm italic">{language === 'fr' ? 'Cette section sera disponible dans la version Pro.' : 'هذا القسم سيكون متاحاً في النسخة الاحترافية.'}</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
