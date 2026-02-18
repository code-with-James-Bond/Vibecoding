
import React, { Suspense, ReactNode, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, ContactShadows, PerspectiveCamera, Float, Html } from '@react-three/drei';
import Model3D from './Model3D';
import '../types';

interface ModelViewerProps {
  modelUrl: string | null;
}

interface ModelErrorBoundaryProps {
  children?: ReactNode;
}

interface ModelErrorBoundaryState {
  hasError: boolean;
}

class ModelErrorBoundary extends React.Component<ModelErrorBoundaryProps, ModelErrorBoundaryState> {
  public state: ModelErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(_: any): ModelErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Html center>
          <div className="flex flex-col items-center justify-center text-center p-12 bg-[#0c0c0c] rounded-xl border border-white/10 shadow-2xl">
            <h3 className="text-[10px] font-sans font-black uppercase tracking-[0.5em] mb-4 text-white/40">Sync Error</h3>
            <p className="text-[8px] font-sans font-bold text-white/20 uppercase tracking-[0.2em]">Archive link disrupted.</p>
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
  const cameraZ = isMobile ? 7 : 5.5;

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, cameraZ]} fov={30} />
      
      {/* Precision Studio Lighting */}
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 20, 10]} angle={0.15} penumbra={1} intensity={2} />
      <directionalLight position={[-5, 5, 5]} intensity={1.5} />
      <pointLight position={[0, -5, -5]} intensity={0.5} color="#ffffff" />
      
      <Suspense fallback={
        <Html center>
           <div className="w-8 h-8 border-t-2 border-white/20 rounded-full animate-spin" />
        </Html>
      }>
        <ModelErrorBoundary>
           <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.1}>
             <Model3D url={modelUrl} />
           </Float>
        </ModelErrorBoundary>
        
        <Environment preset="studio" />
        
        {/* High-Fidelity Grounding */}
        <ContactShadows 
          position={[0, -1.8, 0]}
          opacity={0.4}
          scale={12}
          blur={2.5}
          far={10}
          resolution={1024}
          color="#000000"
        />
      </Suspense>

      <OrbitControls 
        enableZoom={true} 
        enablePan={false}
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={10}
        makeDefault
      />
    </>
  );
};

const ModelViewer: React.FC<ModelViewerProps> = ({ modelUrl }) => {
  return (
    <div className="w-full h-full relative outline-none touch-none">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          logarithmicDepthBuffer: true
        }}
      >
        {modelUrl && <ResponsiveScene modelUrl={modelUrl} />}
      </Canvas>
    </div>
  );
};

export default ModelViewer;
