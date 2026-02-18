

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
      div: any; span: any; p: any; h1: any; h2: any; h3: any; h4: any; h5: any; h6: any; a: any; button: any;
      form: any; input: any; label: any; header: any; nav: any; br: any; img: any;
      ul: any; li: any; footer: any; section: any; main: any; i: any; svg: any;
      path: any; circle: any; style: any;
      primitive: any; ambientLight: any; spotLight: any; pointLight: any; directionalLight: any;
      color: any; group: any; mesh: any; sphereGeometry: any; meshStandardMaterial: any;
      boxGeometry: any;
    }
  }
}