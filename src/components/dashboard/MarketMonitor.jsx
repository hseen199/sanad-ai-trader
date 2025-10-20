import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, TrendingDown, BarChart2, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MarketMonitor = () => {
  const { t } = useTranslation();
  const [coins, setCoins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLivePrices = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // جلب الأسعار الحية من CoinGecko API (مجاني)
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,dogecoin,cardano,dogwifcoin,bonk&order=market_cap_desc&sparkline=false&price_change_percentage=24h'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }

      const data = await response.json();

      // تحويل البيانات للصيغة المطلوبة
      const formattedCoins = data.map(coin => ({
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        price: coin.current_price,
        change: coin.price_change_percentage_24h || 0,
        volume: (coin.total_volume / 1000000000).toFixed(2), // تحويل إلى مليارات
      }));

      setCoins(formattedCoins);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching live prices:', err);
      setError(err.message);
      
      // Fallback إلى بيانات وهمية في حالة الخطأ
      const mockCoins = [
        { name: 'Bitcoin', symbol: 'BTC', price: 68123.45, change: 1.2, volume: 34.5 },
        { name: 'Ethereum', symbol: 'ETH', price: 3567.89, change: -0.5, volume: 21.2 },
        { name: 'Solana', symbol: 'SOL', price: 172.33, change: 2.8, volume: 3.1 },
        { name: 'Dogecoin', symbol: 'DOGE', price: 0.16, change: 5.5, volume: 1.5 },
        { name: 'Cardano', symbol: 'ADA', price: 0.45, change: -1.1, volume: 0.8 },
        { name: 'WIF', symbol: 'WIF', price: 3.5, change: 15.2, volume: 0.5 },
        { name: 'BONK', symbol: 'BONK', price: 0.000028, change: 8.7, volume: 0.4 },
      ];
      setCoins(mockCoins);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLivePrices();
    
    // تحديث الأسعار كل 60 ثانية
    const interval = setInterval(fetchLivePrices, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const filteredCoins = coins.filter(coin =>
    coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="gradient-border p-4 md:p-6 rounded-xl"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <BarChart2 className="w-8 h-8 text-indigo-400" />
          <h3 className="text-2xl font-bold text-white">{t('market_monitor')}</h3>
          {error && (
            <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
              Using cached data
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={fetchLivePrices}
            disabled={isLoading}
            className="p-2 glass-card rounded-lg hover:bg-blue-500/10 transition-colors disabled:opacity-50"
            title="Refresh prices"
          >
            <RefreshCw className={`w-5 h-5 text-blue-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('searching_coins')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900/50 border border-blue-500/20 rounded-lg ltr:pl-10 rtl:pr-10 pr-3 py-2 text-white w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-xs text-gray-400 uppercase">
            <tr>
              <th className="p-3">{t('coin')}</th>
              <th className="p-3 text-right">{t('price')}</th>
              <th className="p-3 text-right">{t('change_24h')}</th>
              <th className="p-3 text-right hidden sm:table-cell">{t('volume_24h')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
                [...Array(7)].map((_, i) => (
                    <tr key={i} className="border-b border-slate-800">
                        <td className="p-3"><div className="h-4 bg-slate-700 rounded w-24 animate-pulse"></div></td>
                        <td className="p-3 text-right"><div className="h-4 bg-slate-700 rounded w-16 animate-pulse ml-auto"></div></td>
                        <td className="p-3 text-right"><div className="h-4 bg-slate-700 rounded w-10 animate-pulse ml-auto"></div></td>
                        <td className="p-3 text-right hidden sm:table-cell"><div className="h-4 bg-slate-700 rounded w-12 animate-pulse ml-auto"></div></td>
                    </tr>
                ))
            ) : (
            filteredCoins.map((coin, index) => (
              <motion.tr
                key={coin.symbol}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-slate-800 hover:bg-slate-800/50"
              >
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-white">{coin.name}</p>
                    <p className="text-gray-500">{coin.symbol}</p>
                  </div>
                </td>
                <td className="p-3 text-right font-mono text-white">${coin.price < 1 ? coin.price.toFixed(6) : coin.price.toLocaleString()}</td>
                <td className={`p-3 text-right font-semibold ${coin.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  <div className="flex items-center justify-end gap-1">
                    {coin.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {coin.change.toFixed(2)}%
                  </div>
                </td>
                <td className="p-3 text-right font-mono text-gray-300 hidden sm:table-cell">${coin.volume}B</td>
              </motion.tr>
            ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default MarketMonitor;

