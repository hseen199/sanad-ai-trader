
    import React from 'react';
    import { motion } from 'framer-motion';
    import { Github, Twitter, Send } from 'lucide-react';
    import { useTranslation } from 'react-i18next';
    import { Link } from 'react-router-dom';
    
    const Footer = () => {
      const { t } = useTranslation();
    
      return (
        <footer className="border-t border-blue-500/10 mt-20 backdrop-blur-sm bg-slate-950/30">
          <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">SANAD AI</h3>
                <p className="text-blue-200 text-sm">
                  {t('hero_description')}
                </p>
              </div>
    
              <div>
                <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-sm text-blue-200">
                  <li><Link to="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
                  <li><a href="#features" className="hover:text-blue-400 transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition-colors">Support</a></li>
                </ul>
              </div>
    
              <div>
                <h4 className="text-white font-semibold mb-4">Resources</h4>
                <ul className="space-y-2 text-sm text-blue-200">
                  <li><Link to="/how-to-start" className="hover:text-blue-400 transition-colors">{t('how_to_start')}</Link></li>
                  <li><a href="#" className="hover:text-blue-400 transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition-colors">Terms</a></li>
                </ul>
              </div>
    
              <div>
                <h4 className="text-white font-semibold mb-4">Follow Us</h4>
                <div className="flex gap-3">
                  <motion.a
                    whileHover={{ scale: 1.1, y: -2 }}
                    href="#"
                    className="w-10 h-10 rounded-lg glass-button flex items-center justify-center transition-colors"
                  >
                    <Twitter className="w-5 h-5 text-blue-400" />
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.1, y: -2 }}
                    href="#"
                    className="w-10 h-10 rounded-lg glass-button flex items-center justify-center transition-colors"
                  >
                    <Github className="w-5 h-5 text-blue-400" />
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.1, y: -2 }}
                    href="#"
                    className="w-10 h-10 rounded-lg glass-button flex items-center justify-center transition-colors"
                  >
                    <Send className="w-5 h-5 text-blue-400" />
                  </motion.a>
                </div>
              </div>
            </div>
    
            <div className="border-t border-blue-500/10 mt-8 pt-8 text-center">
              <p className="text-sm text-blue-300">
                © 2025 SANAD AI Trader. Powered by SNDX.
              </p>
            </div>
          </div>
        </footer>
      );
    };
    
    export default Footer;
  