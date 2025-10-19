
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Zap, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';

const GlobalSettings = () => {
  const [tradingEnabled, setTradingEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [newAdminWallet, setNewAdminWallet] = useState('');
  const [adminWallets, setAdminWallets] = useState(() => {
    return JSON.parse(localStorage.getItem('adminWallets') || '[]');
  });

  const saveSettings = () => {
    localStorage.setItem('globalSettings', JSON.stringify({
      tradingEnabled,
      maintenanceMode,
    }));
    toast({
      title: "✅ تم الحفظ",
      description: "تم حفظ الإعدادات العامة بنجاح",
    });
  };

  const addAdminWallet = () => {
    if (newAdminWallet && !adminWallets.includes(newAdminWallet)) {
      const updatedAdmins = [...adminWallets, newAdminWallet];
      setAdminWallets(updatedAdmins);
      localStorage.setItem('adminWallets', JSON.stringify(updatedAdmins));
      setNewAdminWallet('');
      toast({
        title: "✅ تمت الإضافة",
        description: "تمت إضافة محفظة مدير جديدة بنجاح.",
      });
    } else {
      toast({
        title: "⚠️ خطأ",
        description: "المحفظة فارغة أو مضافة بالفعل.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="gradient-border p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">الإعدادات العامة للنظام</h3>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-white font-semibold">تفعيل التداول في النظام</p>
                <p className="text-sm text-gray-400">إيقاف جميع عمليات التداول لكل المستخدمين</p>
              </div>
            </div>
            <Switch checked={tradingEnabled} onCheckedChange={setTradingEnabled} />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-white font-semibold">وضع الصيانة</p>
                <p className="text-sm text-gray-400">إيقاف الوصول للمستخدمين العاديين</p>
              </div>
            </div>
            <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
          </div>
          
          <Button
            onClick={saveSettings}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            حفظ الإعدادات
          </Button>
        </div>
      </div>

       <div className="gradient-border p-6 rounded-xl">
        <h3 className="text-xl font-bold text-white mb-4">إدارة محافظ المدراء</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input 
              type="text" 
              placeholder="أضف عنوان محفظة مدير جديدة"
              value={newAdminWallet}
              onChange={(e) => setNewAdminWallet(e.target.value)}
              className="bg-slate-800 border-gray-600 text-white"
            />
            <Button onClick={addAdminWallet}>إضافة</Button>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-400">المحافظ الحالية:</p>
            {adminWallets.length > 0 ? (
              adminWallets.map(wallet => (
                <div key={wallet} className="p-2 bg-slate-800 rounded-md text-sm font-mono text-gray-300">
                  {wallet}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">لا يوجد محافظ مدراء.</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GlobalSettings;
  