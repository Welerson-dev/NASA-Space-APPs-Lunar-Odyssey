import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyAsXbjuguXzkxCKqZnP81vGkmQ9VypS9TE',
  authDomain: 'lunar-odyssey-260e1.firebaseapp.com',
  projectId: 'lunar-odyssey-260e1',
  storageBucket: 'lunar-odyssey-260e1.firebasestorage.app',
  messagingSenderId: '98352013656',
  appId: '1:98352013656:web:f22fd063deb414d4e8c52d',
  measurementId: 'G-H81M8Q8E99',
};

export const app = initializeApp(firebaseConfig);

export const analyticsPromise =
  typeof window !== 'undefined'
    ? isSupported().then((yes) => (yes ? getAnalytics(app) : null))
    : Promise.resolve(null);
