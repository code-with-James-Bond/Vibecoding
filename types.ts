
import React from 'react';

export interface ModelData {
  id: string;
  name: string;
  modelUrl: string;
  thumbnailUrl?: string; // Critical for "Instant" grid loading
  public_id: string;
  deleteToken?: string; 
  createdAt: number;
}

export interface GlassNavProps {
  models: ModelData[];
  currentModelId: string | null;
  onSelectModel: (model: ModelData) => void;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Removed standard HTML elements to avoid conflicts with React's default types
      primitive: any; ambientLight: any; spotLight: any; pointLight: any; directionalLight: any;
      color: any; group: any; mesh: any; sphereGeometry: any; meshStandardMaterial: any;
      boxGeometry: any;
    }
  }
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        // Removed standard HTML elements to avoid conflicts with React's default types
        primitive: any; ambientLight: any; spotLight: any; pointLight: any; directionalLight: any;
        color: any; group: any; mesh: any; sphereGeometry: any; meshStandardMaterial: any;
        boxGeometry: any;
      }
    }
  }
}