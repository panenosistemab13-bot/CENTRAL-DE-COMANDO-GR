import { useState, useEffect } from 'react';
import { rtdb } from '../firebase';
import { ref, onValue, set } from 'firebase/database';

// Global Build Date and Timestamp injected by Vite during build (e.g. on Vercel)
export const LOCAL_BUILD_DATE: string = 
  typeof __APP_BUILD_DATE__ !== 'undefined' 
    ? __APP_BUILD_DATE__ 
    : (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_APP_BUILD_DATE)
      ? (import.meta as any).env.VITE_APP_BUILD_DATE
      : new Intl.DateTimeFormat('pt-BR', {
          timeZone: 'America/Sao_Paulo',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date()).replace(',', ' às');

export const LOCAL_BUILD_TIMESTAMP: string =
  typeof __APP_BUILD_TIMESTAMP__ !== 'undefined'
    ? __APP_BUILD_TIMESTAMP__
    : (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_APP_BUILD_TIMESTAMP)
      ? (import.meta as any).env.VITE_APP_BUILD_TIMESTAMP
      : new Date().toISOString();

export interface DeploymentInfo {
  updatedAt: string;
  timestamp: string;
  source?: string;
}

/**
 * Hook to get the latest update date and listen to new deployments
 */
export function useAppVersion() {
  const [lastUpdateDate, setLastUpdateDate] = useState<string>(LOCAL_BUILD_DATE);
  const [remoteTimestamp, setRemoteTimestamp] = useState<string>(LOCAL_BUILD_TIMESTAMP);
  const [isNewVersionAvailable, setIsNewVersionAvailable] = useState<boolean>(false);

  useEffect(() => {
    try {
      const deployRef = ref(rtdb, 'system/lastDeployment');

      // Listen for remote updates from Firebase RTDB
      const unsubscribe = onValue(deployRef, (snapshot) => {
        const val = snapshot.val() as DeploymentInfo | null;
        if (val && val.updatedAt) {
          setLastUpdateDate(val.updatedAt);
          if (val.timestamp) {
            setRemoteTimestamp(val.timestamp);
            // If remote deployment timestamp is newer than current client build
            if (new Date(val.timestamp).getTime() > new Date(LOCAL_BUILD_TIMESTAMP).getTime() + 10000) {
              setIsNewVersionAvailable(true);
            }
          }
        } else {
          // Initialize Firebase record if empty
          set(deployRef, {
            updatedAt: LOCAL_BUILD_DATE,
            timestamp: LOCAL_BUILD_TIMESTAMP,
            source: 'Vercel Deployment'
          }).catch(() => {});
        }
      });

      // If current client has a newer local build timestamp than recorded, update Firebase
      const syncLocalBuildToFirebase = async () => {
        try {
          const currentLocalTime = new Date(LOCAL_BUILD_TIMESTAMP).getTime();
          const currentRemoteTime = new Date(remoteTimestamp).getTime();
          if (currentLocalTime > currentRemoteTime) {
            await set(deployRef, {
              updatedAt: LOCAL_BUILD_DATE,
              timestamp: LOCAL_BUILD_TIMESTAMP,
              source: 'Vercel Deployment'
            });
          }
        } catch {
          // Silent catch for permissions
        }
      };
      syncLocalBuildToFirebase();

      return () => unsubscribe();
    } catch {
      // Fallback to local build date
      setLastUpdateDate(LOCAL_BUILD_DATE);
    }
  }, []);

  const reloadApp = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return {
    lastUpdateDate,
    isNewVersionAvailable,
    reloadApp,
    isVercel: typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('run.app'))
  };
}
