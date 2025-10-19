
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GlobalSettings from '@/components/admin/GlobalSettings';
import UserManagement from '@/components/admin/UserManagement';

const AdminDashboard = () => {
  return (
    <Tabs defaultValue="users" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 border border-gray-700/50">
        <TabsTrigger value="users">إدارة المستخدمين</TabsTrigger>
        <TabsTrigger value="settings">الإعدادات العامة</TabsTrigger>
      </TabsList>

      <TabsContent value="users" className="mt-6">
        <UserManagement />
      </TabsContent>

      <TabsContent value="settings" className="mt-6">
        <GlobalSettings />
      </TabsContent>
    </Tabs>
  );
};

export default AdminDashboard;
  