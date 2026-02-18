
import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import '../types';

interface Model3DProps {
  url: string;
}

const DRACO_DECODER_URL = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

const Model3D: React.FC<Model3DProps> = ({ url }) => {
  const gltf = useGLTF(url, DRACO_DECODER_URL);
  const scene = gltf.scene;
  const meshRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (scene) {
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
                standardMat.envMapIntensity = 1.5;
                standardMat.needsUpdate = true;
              }
            });
          }
        }
      });

      const box = new THREE.Box3().setFromObject(scene);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const normalizationFactor = 2.8 / (maxDim || 1);
      scene.scale.setScalar(normalizationFactor);

      const centeredBox = new THREE.Box3().setFromObject(scene);
      const center = new THREE.Vector3();
      centeredBox.getCenter(center);
      scene.position.sub(center);
    }
  }, [scene, url]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group ref={meshRef}>
      <primitive object={scene} />
    </group>
  );
};

export default Model3D;
