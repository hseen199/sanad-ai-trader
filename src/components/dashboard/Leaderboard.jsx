
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ArrowUp, ArrowDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { accountService } from '@/services/apiService';

const Leaderboard = ({ currentUserProfit, walletAddress }) => {
  const { t } = useTranslation();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/leaderboard`);
        const data = await response.json();
        
        if (data.status === 'success' && data.leaderboard) {
          setLeaderboardData(data.leaderboard);
        } else {
          // Fallback إلى بيانات وهمية
          generateFallbackData();
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        generateFallbackData();
      } finally {
        setLoading(false);
      }
    };
    
    const generateFallbackData = () => {
      let data = [];
      for (let i = 1; i <= 10; i++) {
        data.push({
          rank: i,
          trader: `User_${Math.random().toString(36).substring(2, 8)}`,
          profit: Math.random() * 50 + 5,
          trades: Math.floor(Math.random() * 100 + 20)
        });
      }
      data.sort((a, b) => b.profit - a.profit);
      setLeaderboardData(data.slice(0, 10).map((d, i) => ({...d, rank: i + 1})));
    };

    fetchLeaderboard();
    // تحديث كل 5 دقائق
    const interval = setInterval(fetchLeaderboard, 300000);
    return () => clearInterval(interval);
  }, [currentUserProfit]);
  
  const getRankColor = (rank) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-amber-600';
    return 'text-blue-300';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="gradient-border p-4 md:p-6 rounded-xl"
    >
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h3 className="text-2xl font-bold text-white">{t('top_traders')}</h3>
        </div>

        <div className="space-y-3">
             <div className="grid grid-cols-12 gap-4 px-4 text-xs text-gray-400 uppercase">
                <div className="col-span-2">{t('rank')}</div>
                <div className="col-span-7">{t('trader')}</div>
                <div className="col-span-3 text-right">{t('weekly_profit')}</div>
            </div>
            {leaderboardData.map((user, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`grid grid-cols-12 gap-4 items-center p-3 rounded-lg ${user.trader === 'YOU' ? 'bg-blue-500/20 border border-blue-500' : 'bg-slate-900/50'}`}
                >
                    <div className="col-span-2 flex items-center gap-2">
                        <span className={`font-bold text-lg ${getRankColor(user.rank)}`}>{user.rank}</span>
                        { user.rank <= 3 && <Trophy size={16} className={getRankColor(user.rank)} /> }
                    </div>
                    <div className="col-span-7">
                        <span className="font-semibold text-white">{user.trader === 'YOU' ? t('you') : user.trader}</span>
                    </div>
                    <div className="col-span-3 text-right">
                        <span className={`font-bold ${user.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {user.profit.toFixed(2)}%
                        </span>
                    </div>
                </motion.div>
            ))}
        </div>
    </motion.div>
  );
};

export default Leaderboard;
  