
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addModel, subscribeToModels, deleteModel } from '../services/firebase';
import { ModelData } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const CLOUD_NAME = "dj8ge55xe";
const UPLOAD_PRESET = "3d_portfolio"; 

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [models, setModels] = useState<ModelData[]>([]);
  const [name, setName] = useState('');
  const [glbFile, setGlbFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth Guard
  useEffect(() => {
    const isAuth = localStorage.getItem('luxe_auth') === 'true';
    if (!isAuth) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const unsubscribe = subscribeToModels((data) => {
      setModels(data);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('luxe_auth');
    navigate('/');
  };

  const handleGlbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.glb')) {
        setError("3D Asset must be a .glb file.");
        return;
      }
      setGlbFile(file);
      setError(null);
    }
  };

  const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setThumbFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadToCloudinary = async (file: File, resourceType: 'image' | 'raw') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
      { method: 'POST', body: formData }
    );
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || `Upload failed for ${resourceType}`);
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !glbFile || !thumbFile) {
      setError("Asset Title, 3D Model, and Thumbnail are all required.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    
    try {
      const glbData = await uploadToCloudinary(glbFile, 'raw');
      const thumbData = await uploadToCloudinary(thumbFile, 'image');

      await addModel(
        name, 
        glbData.secure_url, 
        glbData.public_id, 
        glbData.delete_token, 
        thumbData.secure_url
      );
      
      setName('');
      setGlbFile(null);
      setThumbFile(null);
      setThumbPreview(null);
      alert("Inventory Updated Successfully.");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during sync.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-6 md:p-24 selection:bg-black selection:text-white">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 md:mb-24 gap-8">
            <div>
                <h1 className="text-5xl md:text-6xl font-[900] tracking-tighter text-black uppercase">System Panel</h1>
                <p className="text-gray-400 font-black uppercase tracking-[0.4em] text-[10px] mt-4">Authorized Control Center</p>
            </div>
            <div className="flex gap-4">
                <button 
                  onClick={handleLogout}
                  className="px-8 py-4 border border-black/10 text-black/40 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-black hover:text-black transition-all"
                >
                  Logout
                </button>
                <Link to="/" className="px-10 py-4 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                    Back to Archive
                </Link>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20">
          <div className="lg:col-span-5">
            <div className="bg-white border border-gray-100 p-8 md:p-12 rounded-[2.5rem] shadow-xl">
              <h2 className="text-2xl font-black mb-10 tracking-tight">Sync New Asset</h2>
              <form onSubmit={handleSubmit} className="space-y-10">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-4">Asset Title</label>
                  <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-black/5 transition-all text-sm outline-none font-bold"
                    placeholder="e.g. Chronos Edition"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-4">3D Data (.glb)</label>
                  <div className="relative group border-2 border-dashed border-black/5 rounded-2xl p-8 hover:border-black/20 transition-all cursor-pointer">
                    <input type="file" accept=".glb" onChange={handleGlbChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center gap-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-black/60">{glbFile ? glbFile.name : "Select Binary Model"}</span>
                       <span className="text-[8px] font-bold text-black/20 uppercase tracking-[0.3em]">Limit: 50MB</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-4">Thumbnail Preview</label>
                  <div className="flex flex-col gap-6">
                    <div className="relative border-2 border-dashed border-black/5 rounded-2xl p-8 hover:border-black/20 transition-all cursor-pointer">
                       <input type="file" accept="image/*" onChange={handleThumbChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                       <div className="flex flex-col items-center gap-2">
                         <span className="text-[10px] font-black uppercase tracking-widest text-black/60">Upload Cover Art</span>
                       </div>
                    </div>
                    {thumbPreview && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full aspect-[4/3] rounded-3xl overflow-hidden border border-gray-100 bg-gray-50"
                      >
                        <img src={thumbPreview} className="w-full h-full object-cover" alt="Preview" />
                      </motion.div>
                    )}
                  </div>
                </div>
                {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-50 p-6 rounded-2xl">{error}</p>}
                <button
                  disabled={isSubmitting}
                  className="w-full bg-black text-white font-black uppercase tracking-[0.2em] py-6 rounded-2xl transition-all disabled:opacity-20 hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-black/20"
                >
                  {isSubmitting ? 'Syncing...' : 'Authorize Sync'}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
              <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/40">
                <h2 className="text-xl font-black uppercase tracking-widest">Vault Content</h2>
                <span className="text-[9px] font-black text-black bg-black/5 px-6 py-3 rounded-full uppercase tracking-widest">{models.length} Items</span>
              </div>
              <div className="divide-y divide-gray-50 max-h-[800px] overflow-y-auto">
                <AnimatePresence>
                  {models.length > 0 ? models.map((model) => (
                    <motion.div 
                      key={model.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-8 flex items-center justify-between hover:bg-gray-50/80 transition-all group"
                    >
                      <div className="flex items-center gap-8">
                        <div className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 grayscale group-hover:grayscale-0 transition-all duration-700">
                          {model.thumbnailUrl ? (
                            <img src={model.thumbnailUrl} className="w-full h-full object-cover" alt={model.name} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-300 font-bold uppercase tracking-widest">Null</div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-black leading-none uppercase">{model.name}</h3>
                          <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.4em] mt-3">ID: {model.public_id.slice(-12)}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteModel(model.id)} 
                        className="text-[10px] font-black uppercase tracking-widest text-red-400/40 hover:text-red-600 hover:bg-red-50 px-6 py-3 border border-transparent rounded-xl transition-all"
                      >
                        Purge
                      </button>
                    </motion.div>
                  )) : (
                    <div className="p-32 text-center">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-[1em]">Vault Empty</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
