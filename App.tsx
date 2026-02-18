
import React, { useState, useEffect, Suspense, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import Lenis from 'lenis';
import ModelViewer from './components/ModelViewer';
import AdminPanel from './components/AdminPanel';
import CustomCursor from './components/CustomCursor';
import { subscribeToModels } from './services/firebase';
import { ModelData } from './types';

// System Credentials
const ADMIN_EMAIL = "jamesjames00741@gmail.com";
const ADMIN_PASS = "James Bond 27";

const ProductCard: React.FC<{ model: ModelData; index: number; onOpen: (m: ModelData) => void }> = ({ model, index, onOpen }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.215, 0.61, 0.355, 1] }}
      className="group cursor-pointer flex flex-col h-full"
      onClick={() => onOpen(model)}
    >
      <div className="aspect-[3/4] bg-[#f5f5f5] relative overflow-hidden rounded-[2.5rem] shadow-sm group-hover:shadow-xl transition-all duration-700">
        {model.thumbnailUrl && !imgError ? (
          <img 
            src={model.thumbnailUrl} 
            className="w-full h-full object-cover transition-transform duration-1000 ease-[0.16, 1, 0.3, 1] group-hover:scale-105" 
            alt={model.name}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50/50">
            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-black/5 italic">No Frame</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.02] transition-colors duration-500" />
        
        {/* Floating Tag */}
        <div className="absolute top-8 right-8 overflow-hidden">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
            className="px-4 py-2 bg-white/80 backdrop-blur-md rounded-full border border-black/5 shadow-sm"
          >
            <span className="text-[8px] font-black uppercase tracking-widest text-black">Explore 3D</span>
          </motion.div>
        </div>
      </div>
      <div className="mt-10 px-4">
        <div className="flex justify-between items-baseline mb-2">
          <h2 className="text-2xl font-bold tracking-tight text-black group-hover:translate-x-1 transition-transform duration-500">{model.name}</h2>
          <span className="text-[9px] font-black text-black/10 uppercase tracking-[0.2em]">0{index + 1}</span>
        </div>
        <div className="h-[1px] w-0 group-hover:w-full bg-black/5 transition-all duration-700" />
        <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-black/30 mt-4">Asset ID: {model.public_id.slice(-8)}</p>
      </div>
    </motion.div>
  );
};

const LoginModal: React.FC<{ isOpen: boolean; onClose: () => void; onLogin: () => void }> = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate system handshake
    await new Promise(r => setTimeout(r, 800));
    
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      onLogin();
      onClose();
    } else {
      setError('System verification failed. Credentials rejected.');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="w-full max-w-md bg-white/90 backdrop-blur-3xl rounded-[3rem] p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-white relative z-10"
          >
            <div className="text-center mb-12">
               <div className="w-16 h-16 bg-black rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-black/20">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
               </div>
               <h2 className="text-3xl font-[900] tracking-tighter text-black uppercase leading-none">Access Control</h2>
               <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.4em] mt-4">Authorized Personnel Only</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[8px] font-black uppercase tracking-widest text-black/30 ml-4">Identifier</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/5 border border-transparent rounded-2xl px-6 py-5 text-sm font-bold outline-none focus:bg-white focus:ring-1 focus:ring-black/10 transition-all"
                  placeholder="name@luxe.vault"
                  required
                />
              </div>
              <div className="space-y-2 relative">
                <label className="text-[8px] font-black uppercase tracking-widest text-black/30 ml-4">Passkey</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/5 border border-transparent rounded-2xl px-6 py-5 text-sm font-bold outline-none focus:bg-white focus:ring-1 focus:ring-black/10 transition-all pr-16"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 bottom-5 text-[9px] font-black uppercase tracking-widest text-black/30 hover:text-black transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              
              <AnimatePresence>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    className="text-[9px] font-black text-red-500 uppercase tracking-widest text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white font-black uppercase tracking-[0.3em] py-6 rounded-[1.5rem] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-black/20 disabled:opacity-50"
              >
                {loading ? 'Validating...' : 'Bypass Guard'}
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

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
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

  const handleAdminClick = () => {
    if (isLoggedIn) {
      navigate('/admin');
    } else {
      setShowLogin(true);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-black selection:text-white">
      {/* Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-black z-[1000] origin-left" style={{ scaleX }} />
      
      <Navbar />

      <main className="flex-grow pt-40 sm:pt-64 pb-32 max-w-[1400px] mx-auto w-full px-8 sm:px-16">
        <header className="mb-40 sm:mb-64">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-6 mb-12">
               <span className="text-[10px] font-black uppercase tracking-[0.6em] text-black/20">Collection v.025</span>
               <div className="h-[1px] w-20 bg-black/10" />
            </div>
            <h1 className="text-[16vw] sm:text-[11vw] font-[900] tracking-tighter text-black leading-[0.75] mb-16">
              Immersive<br/>Spatial
            </h1>
            <p className="max-w-xl text-black/50 font-medium text-2xl leading-relaxed">
              Curating high-fidelity assets for the spatial web. Bridging the gap between code and aesthetic luxury.
            </p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-32 sm:gap-x-20 sm:gap-y-48">
          <AnimatePresence>
            {models.map((model, idx) => (
              <ProductCard key={model.id} model={model} index={idx} onOpen={setSelectedModel} />
            ))}
          </AnimatePresence>
        </div>
        
        {models.length === 0 && (
           <div className="py-40 text-center">
             <span className="text-[10px] font-black uppercase tracking-[1em] text-black/10 animate-pulse">Scanning Archive...</span>
           </div>
        )}
      </main>

      <div className="py-40 flex justify-center items-center flex-col gap-8 bg-[#fafafa]">
        <div className="h-20 w-[1px] bg-gradient-to-b from-transparent to-black/10" />
        <button 
          onClick={handleAdminClick}
          className="text-[10px] font-black uppercase tracking-[0.6em] text-black/10 hover:text-black transition-all duration-700 hover:tracking-[0.8em]"
        >
          {isLoggedIn ? "Root Control" : "System Entry"}
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
            className="fixed inset-0 z-[1000] bg-white flex flex-col overflow-y-auto"
            data-lenis-prevent
          >
            {/* Modal Navigation */}
            <div className="sticky top-0 h-24 px-8 sm:px-16 flex items-center justify-between bg-white/95 backdrop-blur-2xl z-[1001] border-b border-black/5">
               <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                 <h2 className="text-xl sm:text-2xl font-[800] tracking-tighter text-black uppercase">{selectedModel.name}</h2>
               </motion.div>
               <button 
                onClick={() => setSelectedModel(null)}
                className="group flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-black/30 hover:text-black transition-all"
               >
                 <span>Exit View</span>
                 <div className="w-12 h-12 border border-black/5 rounded-full flex items-center justify-center group-hover:border-black group-hover:bg-black group-hover:text-white transition-all duration-500">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                 </div>
               </button>
            </div>

            <div className="flex flex-col w-full">
               {/* 3D Viewport - Mandatory Top Position */}
               <div className="w-full h-[65vh] sm:h-[82vh] bg-[#fdfdfd] relative overflow-hidden">
                  <Suspense fallback={null}>
                    <ModelViewer modelUrl={selectedModel.modelUrl} key={selectedModel.id} />
                  </Suspense>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 0.2, y: 0 }}
                    transition={{ delay: 1 }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-12 pointer-events-none"
                  >
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">Drag to Rotate</span>
                    <div className="w-1 h-1 bg-black rounded-full" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">Pinch to Zoom</span>
                  </motion.div>
               </div>
               
               {/* Metadata Details - Strictly Below */}
               <div className="max-w-[1400px] mx-auto w-full px-8 sm:px-16 py-24 sm:py-48">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 lg:gap-32">
                    <div className="lg:col-span-7">
                      <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                      >
                        <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-black/10 mb-10">Detailed Narrative</h4>
                        <p className="text-4xl sm:text-5xl lg:text-6xl font-medium text-black leading-[1.1] tracking-tighter mb-20">
                          Precision-engineered spatial volume with high-fidelity texture maps. Optimized for web-based AR/VR frameworks.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-20 gap-y-16 pt-20 border-t border-black/5">
                          <div className="space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-black/20 italic">Foundation</span>
                            <p className="text-lg font-bold uppercase tracking-tight">GLB 2.0 Binary</p>
                          </div>
                          <div className="space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-black/20 italic">Optimization</span>
                            <p className="text-lg font-bold uppercase tracking-tight">Draco Compressed</p>
                          </div>
                          <div className="space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-black/20 italic">Materiality</span>
                            <p className="text-lg font-bold uppercase tracking-tight">Physical Based Rendering</p>
                          </div>
                          <div className="space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-black/20 italic">Hash Checksum</span>
                            <p className="text-lg font-bold uppercase tracking-tight truncate">{selectedModel.public_id.slice(0, 16)}</p>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    <div className="lg:col-span-5">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="sticky top-40 p-12 sm:p-20 bg-[#f9f9f9] rounded-[4rem] border border-black/5 text-center shadow-sm"
                      >
                        <div className="mb-12">
                           <p className="text-3xl font-[900] uppercase tracking-tighter">Acquisition</p>
                           <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.4em] mt-4 italic">Standard License v.01</p>
                        </div>
                        
                        <a 
                          href={selectedModel.modelUrl} 
                          download={`${selectedModel.name.replace(/\s+/g, '_')}.glb`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full bg-black text-white text-[13px] font-black uppercase tracking-[0.3em] py-8 rounded-[2.5rem] transition-all hover:scale-[1.03] hover:shadow-2xl shadow-black/20 block text-center mb-8"
                        >
                          Download Data
                        </a>
                        
                        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-black/30">
                          <span>Secure Handshake</span>
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
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
  <nav className="fixed top-0 left-0 right-0 h-24 sm:h-32 bg-white/80 backdrop-blur-xl z-[500] px-8 sm:px-16 flex items-center justify-between border-b border-black/5">
    <Link to="/" className="text-3xl font-[900] tracking-tighter text-black uppercase">Archive</Link>
    <div className="hidden sm:flex gap-16 text-[10px] font-black uppercase tracking-[0.4em] text-black/30">
      <Link to="/" className="text-black hover:tracking-[0.6em] transition-all">Vault</Link>
      <Link to="/admin" className="hover:text-black hover:tracking-[0.6em] transition-all">Systems</Link>
      <a href="#" className="hover:text-black hover:tracking-[0.6em] transition-all italic">Legal</a>
    </div>
    <div className="w-10 h-10 border border-black/10 rounded-full flex items-center justify-center sm:hidden">
      <div className="w-4 h-[1.5px] bg-black" />
    </div>
  </nav>
);

const Footer = () => (
  <footer className="py-40 px-8 sm:px-16 border-t border-black/5 bg-white">
    <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-24">
      <div className="space-y-12">
        <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">Luxe Spatial<br/>Systems</h3>
        <p className="text-lg font-medium text-black/40 max-w-sm leading-relaxed">Pioneering high-fidelity interactive experiences for the decentralized web.</p>
        <p className="text-[10px] font-black uppercase tracking-widest text-black/20">© 2025 Archive Division. All rights reserved.</p>
      </div>
      <div className="flex flex-col md:items-end justify-between gap-12">
         <div className="text-[14vw] sm:text-[8vw] font-[900] text-black/[0.03] leading-none select-none tracking-tighter italic">LUXE_MODELS</div>
         <div className="flex flex-wrap gap-12 text-[10px] font-black uppercase tracking-[0.5em] text-black/40">
           <a href="#" className="hover:text-black transition-colors">Social</a>
           <a href="#" className="hover:text-black transition-colors">Contact</a>
           <a href="#" className="hover:text-black transition-colors">Privacy</a>
         </div>
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
