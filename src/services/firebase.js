// Import the functions you need from the SDKs you need
import { getAnalytics, isSupported } from "firebase/analytics";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate required Firebase config values
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field] || firebaseConfig[field] === undefined || firebaseConfig[field] === '');

if (missingFields.length > 0) {
  const errorMsg = `Firebase configuration error: Missing required environment variables: ${missingFields.join(', ')}.\nPlease create a .env file with the following variables:\n${missingFields.map(field => `  VITE_FIREBASE_${field.toUpperCase().replace(/([A-Z])/g, '_$1')}`).join('\n')}`;
  console.error(errorMsg);
  throw new Error(errorMsg);
}

// Initialize Firebase app
let app;
try {
  // Only initialize if we have valid config values (not empty strings)
  const hasValidConfig = requiredFields.every(field => {
    const value = firebaseConfig[field];
    return value && value !== '' && value !== undefined;
  });
  
  if (!hasValidConfig) {
    throw new Error('Firebase configuration is invalid. Please check your .env file.');
  }
  
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Firebase initialization error:', error.message);
  console.error('Please verify your Firebase configuration values in the .env file are correct');
  console.error('Common issues:');
  console.error('  - appId does not match your Firebase project');
  console.error('  - projectId is incorrect');
  console.error('  - apiKey is invalid or expired');
  console.error('  - Missing environment variables in .env file');
  throw error; // Re-throw to prevent silent failures
}

// Initialize Analytics only if supported and in browser environment
// Analytics initialization is wrapped in try-catch to prevent errors from breaking the app
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    // Check if analytics is supported before initializing
    isSupported().then((supported) => {
      if (supported && firebaseConfig.measurementId) {
        try {
          analytics = getAnalytics(app);
        } catch (error) {
          console.warn('Firebase Analytics initialization failed:', error.message);
        }
      }
    }).catch(() => {
      // Analytics not supported, continue without it
    });
  } catch (error) {
    console.warn('Firebase Analytics setup error:', error.message);
  }
}

// Initialize Firebase services only after app is confirmed to be initialized
let auth, googleProvider, db, storage;

try {
  if (!app) {
    throw new Error('Firebase app was not initialized');
  }
  
  // Initialize Auth - this must happen after app is initialized
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Verify auth was properly initialized
  if (!auth) {
    throw new Error('Firebase Auth failed to initialize');
  }
} catch (error) {
  console.error('Firebase services initialization error:', error.message);
  throw error;
}

export { auth, googleProvider, db, storage };


// match /punchPasses/{passId} {
//   allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
// }