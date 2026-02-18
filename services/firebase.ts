
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, remove } from 'firebase/database';
import { ModelData } from '../types';

// Safely access environment variables with fallbacks to prevent crashes
const getEnv = (key: string, fallback: string) => {
  try {
    // @ts-ignore
    return (typeof process !== 'undefined' && process.env && process.env[key]) || fallback;
  } catch {
    return fallback;
  }
};

const firebaseConfig = {
  apiKey: getEnv('REACT_APP_FIREBASE_API_KEY', "AIzaSyAs-FakeKey-ReplaceMe"),
  authDomain: getEnv('REACT_APP_FIREBASE_AUTH_DOMAIN', "d-portfolio-27.firebaseapp.com"),
  databaseURL: "https://d-portfolio-27-default-rtdb.firebaseio.com/",
  projectId: getEnv('REACT_APP_FIREBASE_PROJECT_ID', "d-portfolio-27"),
  storageBucket: getEnv('REACT_APP_FIREBASE_STORAGE_BUCKET', "d-portfolio-27.appspot.com"),
  messagingSenderId: getEnv('REACT_APP_FIREBASE_MESSAGING_SENDER_ID', "000000000000"),
  appId: getEnv('REACT_APP_FIREBASE_APP_ID', "1:000000000000:web:abcdef")
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
  }, (error) => {
    console.error("Firebase subscription error:", error);
    callback([]);
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
