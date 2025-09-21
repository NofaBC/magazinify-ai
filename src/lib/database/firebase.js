import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { config } from '../config.js';

// Initialize Firebase
const app = initializeApp(config.firebase);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Database service class
export class DatabaseService {
  // Tenants
  async createTenant(tenantData) {
    try {
      const docRef = await addDoc(collection(db, 'tenants'), {
        ...tenantData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  }

  async getTenant(tenantId) {
    try {
      const docRef = doc(db, 'tenants', tenantId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting tenant:', error);
      throw error;
    }
  }

  async updateTenant(tenantId, updates) {
    try {
      const docRef = doc(db, 'tenants', tenantId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating tenant:', error);
      throw error;
    }
  }

  // Blueprints
  async createBlueprint(tenantId, blueprintData) {
    try {
      const docRef = await addDoc(collection(db, 'blueprints'), {
        ...blueprintData,
        tenantId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating blueprint:', error);
      throw error;
    }
  }

  async getBlueprint(blueprintId) {
    try {
      const docRef = doc(db, 'blueprints', blueprintId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting blueprint:', error);
      throw error;
    }
  }

  async getBlueprintsByTenant(tenantId) {
    try {
      const q = query(
        collection(db, 'blueprints'),
        where('tenantId', '==', tenantId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting blueprints:', error);
      throw error;
    }
  }

  // Magazines
  async createMagazine(tenantId, magazineData) {
    try {
      const docRef = await addDoc(collection(db, 'magazines'), {
        ...magazineData,
        tenantId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating magazine:', error);
      throw error;
    }
  }

  async getMagazine(magazineId) {
    try {
      const docRef = doc(db, 'magazines', magazineId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting magazine:', error);
      throw error;
    }
  }

  async getMagazinesByTenant(tenantId) {
    try {
      const q = query(
        collection(db, 'magazines'),
        where('tenantId', '==', tenantId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting magazines:', error);
      throw error;
    }
  }

  // Issues
  async createIssue(magazineId, issueData) {
    try {
      const docRef = await addDoc(collection(db, 'issues'), {
        ...issueData,
        magazineId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating issue:', error);
      throw error;
    }
  }

  async getIssue(issueId) {
    try {
      const docRef = doc(db, 'issues', issueId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting issue:', error);
      throw error;
    }
  }

  async getIssuesByMagazine(magazineId) {
    try {
      const q = query(
        collection(db, 'issues'),
        where('magazineId', '==', magazineId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting issues:', error);
      throw error;
    }
  }

  async getPublishedIssues(tenantSlug, magazineSlug) {
    try {
      const q = query(
        collection(db, 'issues'),
        where('tenantSlug', '==', tenantSlug),
        where('magazineSlug', '==', magazineSlug),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting published issues:', error);
      throw error;
    }
  }

  // Analytics
  async recordView(issueId, viewData) {
    try {
      await addDoc(collection(db, 'analytics'), {
        issueId,
        type: 'view',
        ...viewData,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error recording view:', error);
      throw error;
    }
  }

  async getAnalytics(issueId, startDate, endDate) {
    try {
      const q = query(
        collection(db, 'analytics'),
        where('issueId', '==', issueId),
        where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw error;
    }
  }

  // Real-time subscriptions
  subscribeToTenant(tenantId, callback) {
    const docRef = doc(db, 'tenants', tenantId);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    });
  }

  subscribeToIssues(magazineId, callback) {
    const q = query(
      collection(db, 'issues'),
      where('magazineId', '==', magazineId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (querySnapshot) => {
      const issues = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(issues);
    });
  }
}

// Create and export a singleton instance
export const dbService = new DatabaseService();

// Auth helpers
export const authHelpers = {
  async signUp(email, password, userData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user document
      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        email: user.email,
        ...userData,
        createdAt: serverTimestamp()
      });
      
      return user;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  },

  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }
};

export default dbService;
