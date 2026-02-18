
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

// Fixed ModelErrorBoundary by using the directly imported Component class.
// This ensures that TypeScript correctly identifies 'this.state' and 'this.props' as inherited properties.
class ModelErrorBoundary extends Component<ModelErrorBoundaryProps, ModelErrorBoundaryState> {
  constructor(props: ModelErrorBoundaryProps) {
    super(props);
    // Initialize state properly in constructor
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: any): ModelErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    // Correctly check state for error condition
    if (this.state.hasError) {
      return (
        <Html center>
          <div className="flex flex-col items-center justify-center text-center p-12 bg-white/90 backdrop-blur-3xl rounded-[3rem] border border-black/5 shadow-2xl">
            <h3 className="text-xs font-black uppercase tracking-[0.5em] mb-4 text-red-500">Sync Error</h3>
            <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.2em] leading-relaxed">
              Spatial packet lost.<br/>Archive connection failed.
            </p>
          </div>
        </Html>
      );
    }
    // Correctly access props
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
  const cameraZ = isMobile ? 6 : 4.8;
  const fov = isMobile ? 45 : 28;

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, cameraZ]} fov={fov} />
      
      <ambientLight intensity={0.8} />
      <spotLight 
        position={[15, 25, 10]} 
        angle={0.2} 
        penumbra={1} 
        intensity={3} 
        castShadow 
        shadow-mapSize={[512, 512]}
      />
      <directionalLight position={[-10, 10, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[0, -10, -5]} intensity={1} color="#ffffff" />
      
      <Suspense fallback={
        <Html center>
           <div className="flex flex-col items-center gap-6">
             <div className="w-12 h-12 border-2 border-black/5 border-t-black rounded-full animate-spin" />
             <span className="text-[8px] font-black uppercase tracking-[0.6em] text-black/30">Streaming...</span>
           </div>
        </Html>
      }>
        <ModelErrorBoundary modelUrl={modelUrl}>
           <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.2}>
             <Model3D url={modelUrl} />
           </Float>
        </ModelErrorBoundary>
        
        <Environment preset="studio" resolution={256} />
        
        <ContactShadows 
          position={[0, -1.8, 0]}
          opacity={0.3}
          scale={15}
          blur={2.8}
          far={10}
          resolution={512}
          color="#000000"
        />
      </Suspense>

      <OrbitControls 
        enableZoom={true} 
        enablePan={false}
        dampingFactor={0.08}
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
        dpr={[1, 1.5]}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          logarithmicDepthBuffer: true,
          stencil: false,
          depth: true
        }}
      >
        {modelUrl && <ResponsiveScene modelUrl={modelUrl} />}
      </Canvas>
    </div>
  );
};

export default ModelViewer;
