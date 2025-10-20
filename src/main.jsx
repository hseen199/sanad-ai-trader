import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import { Toaster } from '@/components/ui/toaster';
import './i18n';
import { WalletProvider } from '@/contexts/WalletProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WalletProvider>
      <App />
      <Toaster />
    </WalletProvider>
  </React.StrictMode>
);

