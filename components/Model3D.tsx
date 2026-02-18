
import React, { useRef, useEffect } from 'react';
import { useGLTF, Center } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Model3DProps {
  url: string;
}

const DRACO_DECODER_URL = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

const Model3D: React.FC<Model3DProps> = ({ url }) => {
  const gltf = useGLTF(url, DRACO_DECODER_URL);
  const scene = gltf.scene;
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (scene) {
      // Reset transformations first to avoid cumulative scaling issues
      scene.scale.setScalar(1);
      scene.position.set(0, 0, 0);
      scene.rotation.set(0, 0, 0);

      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            materials.forEach(mat => {
              if ((mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
                const standardMat = mat as THREE.MeshStandardMaterial;
                standardMat.envMapIntensity = 2.0;
                standardMat.roughness = Math.max(standardMat.roughness, 0.1);
                standardMat.metalness = Math.min(standardMat.metalness, 0.9);
                standardMat.needsUpdate = true;
              }
            });
          }
        }
      });

      // Calculate the actual bounding box to normalize size
      const box = new THREE.Box3().setFromObject(scene);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      
      // We normalize the model to a fixed unit (e.g., 2.5 units) 
      // This ensures that "automatic zoom" is consistent across all models.
      const normalizationFactor = 2.5 / (maxDim || 1);
      scene.scale.setScalar(normalizationFactor);

      // Center the model's geometry
      const centeredBox = new THREE.Box3().setFromObject(scene);
      const center = new THREE.Vector3();
      centeredBox.getCenter(center);
      scene.position.sub(center);
    }
  }, [scene, url]);

  useFrame((state) => {
    if (meshRef.current) {
      // Ultra-smooth slow rotation
      meshRef.current.rotation.y += 0.003;
      // Subtle organic breathing animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.04;
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={meshRef}>
        <primitive object={scene} />
      </group>
    </group>
  );
};

export default Model3D;
