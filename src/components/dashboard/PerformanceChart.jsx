import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

const PerformanceChart = () => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);

  useEffect(() => {
    const generateData = () => {
      const points = [];
      let value = 1000;
      
      for (let i = 0; i < 30; i++) {
        value += (Math.random() - 0.4) * 50;
        points.push({
          day: `Day ${i + 1}`,
          value: Math.max(800, value),
          profit: ((value - 1000) / 1000 * 100).toFixed(2),
        });
      }
      
      return points;
    };

    setData(generateData());
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="gradient-border p-6 rounded-xl space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">أداء المحفظة</h3>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-sm font-semibold border border-blue-500/30">
            30 يوم
          </button>
          <button className="px-4 py-2 rounded-lg bg-slate-800 text-gray-400 text-sm">
            7 أيام
          </button>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="day" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #3b82f6',
                borderRadius: '8px',
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-blue-500/20">
        <div className="text-center">
          <p className="text-sm text-blue-300 mb-1">إجمالي الصفقات</p>
          <p className="text-2xl font-bold text-white">{Math.floor(Math.random() * 50 + 100)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-blue-300 mb-1">نسبة النجاح</p>
          <p className="text-2xl font-bold text-green-400">{(65 + Math.random() * 15).toFixed(1)}%</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-blue-300 mb-1">أفضل صفقة</p>
          <p className="text-2xl font-bold text-purple-400">+${(Math.random() * 200 + 100).toFixed(2)}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default PerformanceChart;