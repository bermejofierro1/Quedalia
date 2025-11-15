import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { environment } from 'src/environments/environment';
import { getStorage } from 'firebase/storage';


let firebaseApp = getApps().length === 0
  ? initializeApp(environment.firebaseConfig)
  : getApps()[0];

export const app = firebaseApp;
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);