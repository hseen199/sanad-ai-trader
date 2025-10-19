
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bot, Home } from 'lucide-react';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { Toaster } from '@/components/ui/toaster';

const DevAdminPage = () => {
  return (
    <>
      <Helmet>
        <title>لوحة تحكم المطور - SANAD AI</title>
        <meta name="description" content="لوحة تحكم خاصة للمطورين لإدارة بوت SANAD AI" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-900 text-foreground">
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-gray-700/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center glow-effect">
                  <Bot className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    لوحة تحكم المطور
                  </h1>
                  <p className="text-xs text-yellow-300">SANAD AI Trader</p>
                </div>
              </div>
              <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors">
                <Home size={16} />
                <span>العودة للرئيسية</span>
              </Link>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AdminDashboard />
          </motion.div>
        </main>
        
        <Toaster />
      </div>
    </>
  );
};

export default DevAdminPage;
  