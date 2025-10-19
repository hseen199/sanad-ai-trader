
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, MoreVertical, Trash2, Shield, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from '@/components/ui/use-toast';

const mockUsers = [
  { id: 1, wallet: 'USER_1_WALLET_ADDRESS_MOCK', balance: 5420.50, profit: 15.2, trades: 120, status: 'Active' },
  { id: 2, wallet: 'USER_2_WALLET_ADDRESS_MOCK', balance: 12300.10, profit: 25.8, trades: 250, status: 'Active' },
  { id: 3, wallet: 'USER_3_WALLET_ADDRESS_MOCK', balance: 850.00, profit: -5.1, trades: 45, status: 'Inactive' },
  { id: 4, wallet: 'USER_4_WALLET_ADDRESS_MOCK', balance: 25000.75, profit: 42.0, trades: 512, status: 'Active' },
];

const UserManagement = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // In a real app, you'd fetch this from your backend
    setUsers(mockUsers);
  }, []);

  const handleAction = (action, userId) => {
    toast({
      title: "🚧 قيد التنفيذ",
      description: `تم طلب إجراء "${action}" للمستخدم ${userId}. هذه الميزة غير منفذة بعد.`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="gradient-border p-6 rounded-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">إدارة المستخدمين ({users.length})</h3>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-300 uppercase bg-slate-900/50">
            <tr>
              <th scope="col" className="px-6 py-3">المحفظة</th>
              <th scope="col" className="px-6 py-3">الرصيد</th>
              <th scope="col" className="px-6 py-3">الربح/الخسارة (30ي)</th>
              <th scope="col" className="px-6 py-3">الحالة</th>
              <th scope="col" className="px-6 py-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-700 hover:bg-slate-800/50">
                <td className="px-6 py-4 font-mono text-white">{user.wallet.substring(0, 10)}...</td>
                <td className="px-6 py-4">${user.balance.toFixed(2)}</td>
                <td className={`px-6 py-4 font-semibold ${user.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {user.profit.toFixed(1)}%
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${user.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {user.status === 'Active' ? 'نشط' : 'غير نشط'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">فتح القائمة</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-900 border-gray-700 text-white">
                      <DropdownMenuItem onClick={() => handleAction('View', user.id)} className="cursor-pointer hover:bg-slate-800">
                        <Eye className="mr-2 h-4 w-4" /> عرض التفاصيل
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('Suspend', user.id)} className="cursor-pointer hover:bg-slate-800">
                        <Shield className="mr-2 h-4 w-4" /> تعليق الحساب
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('Delete', user.id)} className="cursor-pointer text-red-400 hover:!text-red-400 hover:!bg-red-500/20">
                        <Trash2 className="mr-2 h-4 w-4" /> حذف الحساب
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default UserManagement;
  