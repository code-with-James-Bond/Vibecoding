
import React, { useState, useEffect, Suspense, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import ModelViewer from './components/ModelViewer';
import AdminPanel from './components/AdminPanel';
import CustomCursor from './components/CustomCursor';
import { subscribeToModels } from './services/firebase';
import { ModelData } from './types';

const ADMIN_EMAIL = "jamesjames00741@gmail.com";
const ADMIN_PASS = "James Bond 27";

// Fix: Define the missing Navbar component used in the Storefront component
const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-8 sm:px-16 py-12 flex justify-between items-center mix-blend-difference pointer-events-none">
      <div className="pointer-events-auto">
        <Link to="/" className="text-xl font-serif tracking-tighter text-white">Luxe Archive</Link>
      </div>
      <div className="pointer-events-auto flex gap-8 items-center">
        <span className="text-[9px] font-sans font-black uppercase tracking-[0.4em] text-white/40">v2.7.0</span>
      </div>
    </nav>
  );
};

const ProductCard: React.FC<{ model: ModelData; index: number; onOpen: (m: ModelData) => void }> = ({ model, index, onOpen }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 1.2, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group cursor-pointer flex flex-col h-full"
      onClick={() => onOpen(model)}
    >
      <div className="aspect-[4/5] bg-[#0c0c0c] relative overflow-hidden rounded-[0.5rem] border border-white/[0.05] transition-all duration-700 group-hover:border-white/20">
        {model.thumbnailUrl && !imgError ? (
          <img 
            src={model.thumbnailUrl} 
            className="w-full h-full object-cover transition-transform duration-[2s] ease-[0.16, 1, 0.3, 1] group-hover:scale-105" 
            alt={model.name}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[9px] font-sans font-bold uppercase tracking-[0.5em] text-white/10">No Visualization</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-700" />
      </div>
      <div className="mt-8 px-1 flex justify-between items-baseline">
        <div>
          <h2 className="text-2xl font-serif tracking-tight text-white mb-1">{model.name}</h2>
          <p className="text-[8px] font-sans font-bold uppercase tracking-[0.4em] text-white/30 italic">Ref: {model.public_id.slice(-8)}</p>
        </div>
        <div className="text-[9px] font-sans font-bold uppercase tracking-widest text-white/20">Asset</div>
      </div>
    </motion.div>
  );
};

const LoginModal: React.FC<{ isOpen: boolean; onClose: () => void; onLogin: () => void }> = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      onLogin();
      onClose();
    } else {
      setError('Authorization Failed.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 20 }}
            className="w-full max-w-md bg-[#0c0c0c] rounded-[1rem] p-12 shadow-2xl border border-white/10 relative z-10"
          >
            <h2 className="text-3xl font-serif text-white mb-1">Access</h2>
            <p className="text-[9px] font-sans font-black text-white/20 uppercase tracking-[0.4em] mb-12">Vault Synchronization</p>
            
            <form onSubmit={handleLogin} className="space-y-8">
              <div>
                <label className="text-[8px] font-sans font-black uppercase tracking-widest text-white/40 block mb-3">Identifier</label>
                <input 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-lg px-6 py-4 text-xs font-sans text-white outline-none focus:border-white/20 transition-all"
                  placeholder="vault@archive.luxe" required
                />
              </div>
              <div>
                <label className="text-[8px] font-sans font-black uppercase tracking-widest text-white/40 block mb-3">Passcode</label>
                <input 
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-lg px-6 py-4 text-xs font-sans text-white outline-none focus:border-white/20 transition-all"
                  placeholder="••••••••" required
                />
              </div>
              {error && <p className="text-[8px] font-sans font-black text-red-500 uppercase tracking-widest text-center">{error}</p>}
              <button type="submit" className="w-full bg-white text-black font-sans font-black uppercase tracking-[0.3em] py-5 rounded-lg hover:bg-gray-100 transition-all">
                Authenticate
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Storefront = () => {
  const [models, setModels] = useState<ModelData[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.8, smoothWheel: true });
    lenisRef.current = lenis;
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    const unsubscribe = subscribeToModels((data) => {
      console.log("Archive data received:", data.length, "items");
      setModels(data);
    });
    
    if (localStorage.getItem('luxe_auth') === 'true') setIsLoggedIn(true);

    return () => { unsubscribe(); lenis.destroy(); };
  }, []);

  useEffect(() => {
    if (selectedModel || showLogin) {
      lenisRef.current?.stop();
      document.body.style.overflow = 'hidden';
    } else {
      lenisRef.current?.start();
      document.body.style.overflow = 'auto';
    }
  }, [selectedModel, showLogin]);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col selection:bg-white selection:text-black text-white font-sans">
      <Navbar />

      <main className="flex-grow pt-48 sm:pt-64 pb-32 max-w-[1400px] mx-auto w-full px-8 sm:px-16">
        <header className="mb-40 sm:mb-64">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}>
            <h1 className="text-[12vw] sm:text-[9vw] font-serif tracking-tighter text-white leading-[0.8] mb-12">
              The Archive
            </h1>
            <div className="h-[1px] w-16 bg-white/20 mb-12" />
            <p className="max-w-md text-white/40 font-sans font-medium text-lg leading-relaxed uppercase tracking-tight">
              Curating spatial excellence for the modern digital era. High-fidelity volumes only.
            </p>
          </motion.div>
        </header>

        {models.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-32">
            <AnimatePresence>
              {models.map((model, idx) => (
                <ProductCard key={model.id} model={model} index={idx} onOpen={setSelectedModel} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-20 border-t border-white/5">
             <p className="text-[9px] font-sans font-black uppercase tracking-[1em] text-white/10 text-center">Synchronizing Vault Data...</p>
          </div>
        )}
      </main>

      <footer className="w-full pb-16 pt-32 flex flex-col items-center">
        <button 
          onClick={() => isLoggedIn ? navigate('/admin') : setShowLogin(true)}
          className="text-[9px] font-sans font-black uppercase tracking-[0.6em] text-white/10 hover:text-white/40 transition-colors"
        >
          {isLoggedIn ? 'Authorized Access' : 'System Administration'}
        </button>
      </footer>

      <AnimatePresence>
        {selectedModel && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black flex flex-col"
          >
            <div className="absolute top-12 left-12 right-12 flex justify-between items-start z-[2001]">
              <div>
                <h2 className="text-4xl font-serif text-white mb-2">{selectedModel.name}</h2>
                <p className="text-[10px] font-sans font-black uppercase tracking-[0.5em] text-white/20 italic">High-Fidelity Spatial Archive</p>
              </div>
              <button 
                onClick={() => setSelectedModel(null)}
                className="group flex items-center gap-4 text-white/40 hover:text-white transition-colors"
              >
                <span className="text-[9px] font-sans font-black uppercase tracking-widest">Close Visualization</span>
                <div className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center group-hover:border-white/40 transition-all">
                  ✕
                </div>
              </button>
            </div>
            
            <div className="flex-grow">
              <ModelViewer modelUrl={selectedModel.modelUrl} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LoginModal 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)} 
        onLogin={() => { setIsLoggedIn(true); localStorage.setItem('luxe_auth', 'true'); navigate('/admin'); }} 
      />
    </div>
  );
};

// Fix: Create and export the main App component that handles routing as default to fix index.tsx error
const App = () => {
  return (
    <HashRouter>
      <CustomCursor />
      <Routes>
        <Route path="/" element={<Storefront />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
