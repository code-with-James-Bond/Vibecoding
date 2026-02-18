
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, remove } from 'firebase/database';
import { ModelData } from '../types';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  databaseURL: "https://d-portfolio-27-default-rtdb.firebaseio.com/",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export const MODELS_REF_PATH = 'models';

export const subscribeToModels = (callback: (models: ModelData[]) => void) => {
  const modelsRef = ref(db, MODELS_REF_PATH);
  const unsubscribe = onValue(modelsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const formattedModels: ModelData[] = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      callback(formattedModels);
    } else {
      callback([]);
    }
  });
  return unsubscribe;
};

export const addModel = async (name: string, modelUrl: string, public_id: string, deleteToken?: string, thumbnailUrl?: string): Promise<void> => {
  const modelsRef = ref(db, MODELS_REF_PATH);
  await push(modelsRef, {
    name,
    modelUrl,
    thumbnailUrl: thumbnailUrl || null,
    public_id,
    deleteToken: deleteToken || null,
    createdAt: Date.now(),
  });
};

export const deleteModel = async (id: string): Promise<void> => {
  const modelRef = ref(db, `${MODELS_REF_PATH}/${id}`);
  await remove(modelRef);
};
