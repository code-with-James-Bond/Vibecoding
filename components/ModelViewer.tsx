
import React, { Component, Suspense, ReactNode, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, ContactShadows, PerspectiveCamera, Float, Html } from '@react-three/drei';
import Model3D from './Model3D';

interface ModelViewerProps {
  modelUrl: string | null;
}

interface ModelErrorBoundaryProps {
  children?: ReactNode;
  modelUrl?: string | null;
}

interface ModelErrorBoundaryState {
  hasError: boolean;
}

// Fixing property 'state' and 'props' existence errors by explicitly using React.Component with generics
class ModelErrorBoundary extends React.Component<ModelErrorBoundaryProps, ModelErrorBoundaryState> {
  constructor(props: ModelErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: any): ModelErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Html center>
          <div className="flex flex-col items-center justify-center text-center p-12 bg-white/80 backdrop-blur-xl rounded-[2rem] border border-black/5 shadow-2xl">
            <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mb-6">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-black/20"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-2">Sync Error</h3>
            <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest leading-relaxed">
              Spatial data packet was corrupted.<br/>Refresh archive to reconnect.
            </p>
          </div>
        </Html>
      );
    }
    return this.props.children;
  }
}

const ResponsiveScene: React.FC<{ modelUrl: string }> = ({ modelUrl }) => {
  const [aspect, setAspect] = useState(window.innerWidth / window.innerHeight);

  useEffect(() => {
    const handleResize = () => setAspect(window.innerWidth / window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = aspect < 1;
  const cameraZ = isMobile ? 6 : 4.5;
  const fov = isMobile ? 45 : 30;

  return (
    <>
      <PerspectiveCamera 
        makeDefault 
        position={[0, 0, cameraZ]} 
        fov={fov} 
      />
      
      {/* Studio Lighting Rig */}
      <ambientLight intensity={0.7} />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.15} 
        penumbra={1} 
        intensity={2.5} 
        castShadow 
        shadow-mapSize={[512, 512]}
      />
      <directionalLight position={[-10, 15, 5]} intensity={1.2} />
      <pointLight position={[5, -5, 5]} intensity={0.5} />
      
      <Suspense fallback={
        <Html center>
           <div className="flex flex-col items-center gap-6">
             <div className="w-10 h-[1px] bg-black/10 overflow-hidden relative">
                <div className="absolute inset-0 bg-black animate-progress-slide" />
             </div>
             <span className="text-[8px] font-black uppercase tracking-[0.6em] text-black/20">Decrypting...</span>
             <style>{`
               @keyframes progress-slide {
                 0% { transform: translateX(-100%); }
                 100% { transform: translateX(100%); }
               }
             `}</style>
           </div>
        </Html>
      }>
        <ModelErrorBoundary modelUrl={modelUrl}>
           <Float 
             speed={1.4} 
             rotationIntensity={0.1} 
             floatIntensity={0.2}
           >
             <Model3D url={modelUrl} />
           </Float>
        </ModelErrorBoundary>
        
        <Environment preset="studio" resolution={128} />
        
        <ContactShadows 
          position={[0, -1.8, 0]}
          opacity={0.35}
          scale={15}
          blur={2.8}
          far={10}
          resolution={256}
          color="#000000"
        />
      </Suspense>

      <OrbitControls 
        enableZoom={true} 
        enablePan={false}
        dampingFactor={0.06}
        minDistance={3}
        maxDistance={12}
        makeDefault
      />
    </>
  );
};

const ModelViewer: React.FC<ModelViewerProps> = ({ modelUrl }) => {
  return (
    <div className="w-full h-full relative outline-none touch-none bg-transparent">
      <Canvas
        shadows
        // Optimized DPR for performance-to-quality balance
        dpr={[1, 1.5]}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
        // Dispose of the renderer on unmount to free GPU memory
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        {modelUrl && <ResponsiveScene modelUrl={modelUrl} />}
      </Canvas>
    </div>
  );
};

export default ModelViewer;
