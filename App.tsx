
import React, { useState, useEffect, Suspense, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import Lenis from 'lenis';
import ModelViewer from './components/ModelViewer';
import AdminPanel from './components/AdminPanel';
import CustomCursor from './components/CustomCursor';
import { subscribeToModels } from './services/firebase';
import { ModelData } from './types';

// Secure Credentials
const ADMIN_EMAIL = "jamesjames00741@gmail.com";
const ADMIN_PASS = "James Bond 27";

const ProductCard: React.FC<{ model: ModelData; index: number; onOpen: (m: ModelData) => void }> = ({ model, index, onOpen }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="group cursor-pointer flex flex-col h-full"
      onClick={() => onOpen(model)}
    >
      <div className="aspect-[4/5] bg-[#f9f9f9] relative overflow-hidden rounded-[2.5rem] border border-black/[0.03]">
        {model.thumbnailUrl && !imgError ? (
          <img 
            src={model.thumbnailUrl} 
            className="w-full h-full object-cover transition-transform duration-[1.5s] ease-[0.16, 1, 0.3, 1] group-hover:scale-110" 
            alt={model.name}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/5">No Preview</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.03] transition-colors duration-700" />
      </div>
      <div className="mt-8 px-2 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tighter text-black leading-none mb-2">{model.name}</h2>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-black/30 italic">Ref. {model.public_id.slice(-8)}</p>
        </div>
        <div className="w-8 h-8 rounded-full border border-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-500">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" /></svg>
        </div>
      </div>
    </motion.div>
  );
};

const LoginModal: React.FC<{ isOpen: boolean; onClose: () => void; onLogin: () => void }> = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      onLogin();
      onClose();
    } else {
      setError('System rejection: Invalid credentials.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="w-full max-w-md bg-white/80 backdrop-blur-3xl rounded-[3rem] p-12 shadow-2xl border border-white/50 relative z-10"
          >
            <h2 className="text-4xl font-[900] tracking-tighter text-black mb-2 uppercase">Entry</h2>
            <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.4em] mb-10">Vault Authorization</p>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-black/40 block mb-3 ml-4">Identifier</label>
                <input 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/5 border border-transparent rounded-2xl px-6 py-5 text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-black/5 transition-all"
                  placeholder="name@archive.luxe" required
                />
              </div>
              <div className="relative">
                <label className="text-[9px] font-black uppercase tracking-widest text-black/40 block mb-3 ml-4">Passcode</label>
                <input 
                  type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/5 border border-transparent rounded-2xl px-6 py-5 text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-black/5 transition-all"
                  placeholder="••••••••" required
                />
                <button 
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-[52px] text-[10px] font-black uppercase tracking-widest text-black/30 hover:text-black"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {error && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-50 p-4 rounded-xl text-center">{error}</p>}
              <button type="submit" className="w-full bg-black text-white font-black uppercase tracking-[0.3em] py-6 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/20">
                Unlock System
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
    const lenis = new Lenis({
      duration: 1.5,
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });
    lenisRef.current = lenis;
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const unsubscribe = subscribeToModels((data) => {
      setModels(data);
    });
    
    if (localStorage.getItem('luxe_auth') === 'true') {
      setIsLoggedIn(true);
    }

    return () => {
      unsubscribe();
      lenis.destroy();
    };
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
    <div className="min-h-screen bg-white flex flex-col selection:bg-black selection:text-white">
      <Navbar />

      <main className="flex-grow pt-48 sm:pt-64 pb-32 max-w-[1400px] mx-auto w-full px-8 sm:px-16">
        <header className="mb-40 sm:mb-64">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-[15vw] sm:text-[10vw] font-[900] tracking-tighter text-black leading-[0.75] mb-12">
              The Luxe<br/>Archive
            </h1>
            <div className="h-[1px] w-24 bg-black mb-12 opacity-10" />
            <p className="max-w-md text-black/40 font-medium text-xl leading-relaxed">
              Curated spatial assets for a high-fidelity digital existence.
            </p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24 sm:gap-x-16 sm:gap-y-40">
          <AnimatePresence>
            {models.map((model, idx) => (
              <ProductCard key={model.id} model={model} index={idx} onOpen={setSelectedModel} />
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Admin Button at Bottom (Subtle/Faded) */}
      <div className="py-32 flex flex-col items-center gap-12 bg-gray-50/30">
        <div className="w-[1px] h-24 bg-gradient-to-b from-transparent to-black/5" />
        <button 
          onClick={() => isLoggedIn ? navigate('/admin') : setShowLogin(true)}
          className="text-[10px] font-black uppercase tracking-[0.8em] text-black/5 hover:text-black/40 transition-all duration-700 hover:tracking-[1em]"
        >
          {isLoggedIn ? "Root Control" : "System Login"}
        </button>
      </div>

      <Footer />

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onLogin={() => {
        setIsLoggedIn(true);
        localStorage.setItem('luxe_auth', 'true');
        navigate('/admin');
      }} />

      <AnimatePresence>
        {selectedModel && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2500] bg-white flex flex-col overflow-y-auto"
            data-lenis-prevent
          >
            {/* Modal Header */}
            <div className="sticky top-0 h-24 px-8 sm:px-16 flex items-center justify-between bg-white/95 backdrop-blur-xl z-[2600] border-b border-black/5">
               <h2 className="text-xl sm:text-2xl font-[900] tracking-tighter text-black uppercase">{selectedModel.name}</h2>
               <button 
                onClick={() => setSelectedModel(null)}
                className="group flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-black/30 hover:text-black transition-all"
               >
                 <span>Exit View</span>
                 <div className="w-12 h-12 border border-black/5 rounded-full flex items-center justify-center group-hover:border-black group-hover:bg-black group-hover:text-white transition-all duration-500">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                 </div>
               </button>
            </div>

            <div className="flex flex-col w-full">
               {/* 3D Viewport - Mandatory Top Position */}
               <div className="w-full h-[65vh] sm:h-[80vh] bg-[#fafafa] relative overflow-hidden">
                  <Suspense fallback={null}>
                    <ModelViewer modelUrl={selectedModel.modelUrl} key={selectedModel.id} />
                  </Suspense>
                  
                  {/* Interaction Instructions */}
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8 opacity-20 pointer-events-none">
                    <span className="text-[9px] font-black uppercase tracking-widest">Orbit</span>
                    <div className="w-10 h-[1px] bg-black" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Detail</span>
                  </div>
               </div>
               
               {/* Information & Download - Strictly Below the Model */}
               <div className="max-w-[1400px] mx-auto w-full px-8 sm:px-16 py-24 sm:py-48">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-32">
                    
                    {/* Details Column */}
                    <div className="lg:col-span-7">
                      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20 mb-10">Narrative</h4>
                        <p className="text-4xl sm:text-5xl lg:text-6xl font-medium text-black leading-[1.1] tracking-tighter mb-20">
                          A high-fidelity spatial volume engineered for seamless integration into next-gen luxury platforms. Optimized for real-time fidelity.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-16 pt-20 border-t border-black/5">
                          <div className="space-y-4">
                            <span className="text-[9px] font-black uppercase tracking-widest text-black/20">Protocol</span>
                            <p className="text-base font-bold uppercase">GLB v2.0 Binary</p>
                          </div>
                          <div className="space-y-4">
                            <span className="text-[9px] font-black uppercase tracking-widest text-black/20">PBR Data</span>
                            <p className="text-base font-bold uppercase">4K Textures / Metallic</p>
                          </div>
                          <div className="space-y-4">
                            <span className="text-[9px] font-black uppercase tracking-widest text-black/20">Spatial Check</span>
                            <p className="text-base font-bold uppercase">Verified Integrity</p>
                          </div>
                          <div className="space-y-4">
                            <span className="text-[9px] font-black uppercase tracking-widest text-black/20">Hash ID</span>
                            <p className="text-base font-bold uppercase truncate">{selectedModel.public_id.slice(-16)}</p>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Action Column */}
                    <div className="lg:col-span-5 flex flex-col items-center">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                        className="w-full p-12 sm:p-20 bg-[#f9f9f9] rounded-[4rem] border border-black/[0.03] text-center sticky top-40"
                      >
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-black/20 block mb-6">Commercial Usage</span>
                        <p className="text-3xl font-[900] tracking-tighter uppercase mb-12 leading-none">Vault Asset<br/>Acquisition</p>
                        
                        <a 
                          href={selectedModel.modelUrl} 
                          download={`${selectedModel.name.replace(/\s+/g, '_')}.glb`}
                          target="_blank" rel="noreferrer"
                          className="w-full bg-black text-white text-[12px] font-black uppercase tracking-[0.3em] py-8 rounded-[2.5rem] transition-all hover:scale-[1.03] active:scale-[0.97] shadow-2xl shadow-black/20 block text-center mb-10"
                        >
                          Acquire Data
                        </a>
                        
                        <div className="h-[1px] w-full bg-black/5 mb-10" />
                        
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-black/30">
                          <span>Verified Link</span>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        </div>
                      </motion.div>
                    </div>

                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <CustomCursor />
    </div>
  );
};

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 h-24 sm:h-32 bg-white/90 backdrop-blur-xl z-[500] px-8 sm:px-16 flex items-center justify-between border-b border-black/5">
    <Link to="/" className="text-3xl font-[900] tracking-tighter text-black uppercase">VAULT</Link>
    <div className="flex gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-black/30">
      <Link to="/" className="text-black transition-all">Archive</Link>
      <Link to="/admin" className="hover:text-black transition-all">System</Link>
    </div>
  </nav>
);

const Footer = () => (
  <footer className="py-40 px-8 sm:px-16 border-t border-black/5 bg-white">
    <div className="max-w-[1400px] mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-20">
      <div className="space-y-6">
        <h3 className="text-2xl font-[900] tracking-tighter uppercase leading-none">Archives of<br/>The Future</h3>
        <p className="text-sm font-medium text-black/30 max-w-xs leading-relaxed italic">Bridging spatial luxury with modern engineering protocols.</p>
      </div>
      <div className="text-[12vw] font-[900] text-black/[0.02] leading-none select-none tracking-tighter italic">LUXE_SYSTEMS</div>
      <div className="flex flex-col gap-6 text-[10px] font-black uppercase tracking-[0.4em] text-black/30">
        <a href="#" className="hover:text-black transition-colors">Instagram</a>
        <a href="#" className="hover:text-black transition-colors">Behance</a>
        <a href="#" className="hover:text-black transition-colors">Private</a>
      </div>
    </div>
  </footer>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Storefront />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
