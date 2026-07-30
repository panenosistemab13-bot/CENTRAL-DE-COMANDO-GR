import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBC3hReyxk-CkVmbGzHgBM-LY66abk5p6Q",
  authDomain: "central-de-comandos-gr.firebaseapp.com",
  databaseURL: "https://central-de-comandos-gr-default-rtdb.firebaseio.com/",
  projectId: "central-de-comandos-gr",
  storageBucket: "central-de-comandos-gr.firebasestorage.app",
  messagingSenderId: "483229462429",
  appId: "1:483229462429:web:f484720e545c9c28d28974",
  measurementId: "G-THEK03CK0N"
};

const app = initializeApp(firebaseConfig);
console.log('Firebase initialized with databaseURL:', firebaseConfig.databaseURL);
export const rtdb = getDatabase(app);
export const db = rtdb; // Alias to maintain compatibility with existing imports
export const auth = getAuth(app);
export const storage = getStorage(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirebaseErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirebaseErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firebase Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
