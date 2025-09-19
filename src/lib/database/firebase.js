firebase.jsimport { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { config } from '../config.js';

// Initialize Firebase
const app = initializeApp(config.firebase);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Database service functions following the provided schema
export const dbService = {
  // Tenant operations
  tenants: {
    async create(tenantData) {
      const docRef = doc(db, 'tenants', tenantData.slug);
      const data = {
        ...tenantData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(docRef, data);
      const docSnap = await getDoc(docRef);
      return { id: docRef.id, ...docSnap.data() };
    },

    async getById(tenantId) {
      const docRef = doc(db, 'tenants', tenantId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Tenant not found');
      }
      
      return { id: docSnap.id, ...docSnap.data() };
    },

    async getBySlug(slug) {
      const docRef = doc(db, 'tenants', slug);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Tenant not found');
      }
      
      return { id: docSnap.id, ...docSnap.data() };
    },

    async update(tenantId, updates) {
      const docRef = doc(db, 'tenants', tenantId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      const docSnap = await getDoc(docRef);
      return { id: docSnap.id, ...docSnap.data() };
    },
  },

  // Magazine operations (subcollection under tenant)
  magazines: {
    async create(tenantId, magazineData) {
      const docRef = doc(db, 'tenants', tenantId, 'magazines', magazineData.slug);
      const data = {
        ...magazineData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(docRef, data);
      const docSnap = await getDoc(docRef);
      return { id: docRef.id, ...docSnap.data() };
    },

    async getByTenant(tenantId) {
      const q = query(
        collection(db, 'tenants', tenantId, 'magazines'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },

    async getById(tenantId, magazineId) {
      const docRef = doc(db, 'tenants', tenantId, 'magazines', magazineId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Magazine not found');
      }
      
      return { id: docSnap.id, ...docSnap.data() };
    },

    async update(tenantId, magazineId, updates) {
      const docRef = doc(db, 'tenants', tenantId, 'magazines', magazineId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      const docSnap = await getDoc(docRef);
      return { id: docSnap.id, ...docSnap.data() };
    },

    async delete(tenantId, magazineId) {
      const docRef = doc(db, 'tenants', tenantId, 'magazines', magazineId);
      await deleteDoc(docRef);
    },
  },

  // Blueprint operations (singleton document under magazine)
  blueprints: {
    async create(tenantId, magazineId, blueprintData) {
      const docRef = doc(db, 'tenants', tenantId, 'magazines', magazineId, 'blueprint', 'default');
      const data = {
        ...blueprintData,
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(docRef, data);
      const docSnap = await getDoc(docRef);
      return { id: docRef.id, ...docSnap.data() };
    },

    async get(tenantId, magazineId) {
      const docRef = doc(db, 'tenants', tenantId, 'magazines', magazineId, 'blueprint', 'default');
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        // Return default blueprint if none exists
        return this.getDefault();
      }
      
      return { id: docSnap.id, ...docSnap.data() };
    },

    async update(tenantId, magazineId, updates) {
      const docRef = doc(db, 'tenants', tenantId, 'magazines', magazineId, 'blueprint', 'default');
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      const docSnap = await getDoc(docRef);
      return { id: docSnap.id, ...docSnap.data() };
    },

    getDefault() {
      return {
        structure: {
          pages: 12,
          sections: ['cover', 'toc', 'feature', 'spotlight', 'tips', 'ads', 'closing'],
          adSlots: ['p4', 'p10']
        },
        voice: {
          tone: 'professional, informative',
          readingLevel: '8-10'
        },
        niche: {
          topics: ['business', 'technology', 'innovation'],
          geo: ['global'],
          keywords: ['productivity', 'growth', 'insights']
        },
        sources: {
          rss: [],
          uploadsAllowed: true
        },
        cadence: 'monthly',
        approvalMode: 'semi_auto'
      };
    },
  },

  // Issue operations (subcollection under magazine)
  issues: {
    async create(tenantId, magazineId, issueData) {
      const docRef = doc(db, 'tenants', tenantId, 'magazines', magazineId, 'issues', issueData.slug);
      const data = {
        ...issueData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(docRef, data);
      const docSnap = await getDoc(docRef);
      return { id: docRef.id, ...docSnap.data() };
    },

    async getByMagazine(tenantId, magazineId) {
      const q = query(
        collection(db, 'tenants', tenantId, 'magazines', magazineId, 'issues'),
        orderBy('publishedAt', 'desc'),
        limit(24)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },

    async getById(tenantId, magazineId, issueSlug) {
      const docRef = doc(db, 'tenants', tenantId, 'magazines', magazineId, 'issues', issueSlug);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Issue not found');
      }
      
      return { id: docSnap.id, ...docSnap.data() };
    },

    async getPublished(tenantId, magazineId, issueSlug) {
      const issue = await this.getById(tenantId, magazineId, issueSlug);
      
      if (issue.status !== 'published') {
        throw new Error('Issue not published');
      }
      
      return issue;
    },

    async update(tenantId, magazineId, issueSlug, updates) {
      const docRef = doc(db, 'tenants', tenantId, 'magazines', magazineId, 'issues', issueSlug);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      const docSnap = await getDoc(docRef);
      return { id: docSnap.id, ...docSnap.data() };
    },

    async publish(tenantId, magazineId, issueSlug) {
      return await this.update(tenantId, magazineId, issueSlug, {
        status: 'published',
        publishedAt: serverTimestamp(),
      });
    },

    async delete(tenantId, magazineId, issueSlug) {
      const docRef = doc(db, 'tenants', tenantId, 'magazines', magazineId, 'issues', issueSlug);
      await deleteDoc(docRef);
    },
  },

  // Article operations (subcollection under issue)
  articles: {
    async create(tenantId, magazineId, issueSlug, articleData) {
      const docRef = await addDoc(
        collection(db, 'tenants', tenantId, 'magazines', magazineId, 'issues', issueSlug, 'articles'),
        {
          ...articleData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );
      
      const docSnap = await getDoc(docRef);
      return { id: docRef.id, ...docSnap.data() };
    },

    async getByIssue(tenantId, magazineId, issueSlug) {
      const q = query(
        collection(db, 'tenants', tenantId, 'magazines', magazineId, 'issues', issueSlug, 'articles'),
        orderBy('position', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },

    async getById(tenantId, magazineId, issueSlug, articleId) {
      const docRef = doc(db, 'tenants', tenantId, 'magazines', magazineId, 'issues', issueSlug, 'articles', articleId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Article not found');
      }
      
      return { id: docSnap.id, ...docSnap.data() };
    },

    async update(tenantId, magazineId, issueSlug, articleId, updates) {
      const docRef = doc(db, 'tenants', tenantId, 'magazines', magazineId, 'issues', issueSlug, 'articles', articleId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      const docSnap = await getDoc(docRef);
      return { id: docSnap.id, ...docSnap.data() };
    },

    async delete(tenantId, magazineId, issueSlug, articleId) {
      const docRef = doc(db, 'tenants', tenantId, 'magazines', magazineId, 'issues', issueSlug, 'articles', articleId);
      await deleteDoc(docRef);
    },
  },

  // Ad slot operations (subcollection under issue)
  adSlots: {
    async create(tenantId, magazineId, issueSlug, slotKey, adData) {
      const docRef = doc(db, 'tenants', tenantId, 'magazines', magazineId, 'issues', issueSlug, 'adSlots', slotKey);
      const data = {
        ...adData,
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(docRef, data);
      const docSnap = await getDoc(docRef);
      return { id: docRef.id, ...docSnap.data() };
    },

    async getByIssue(tenantId, magazineId, issueSlug) {
      const querySnapshot = await getDocs(
        collection(db, 'tenants', tenantId, 'magazines', magazineId, 'issues', issueSlug, 'adSlots')
      );
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },

    async getById(tenantId, magazineId, issueSlug, slotKey) {
      const docRef = doc(db, 'tenants', tenantId, 'magazines', magazineId, 'issues', issueSlug, 'adSlots', slotKey);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null; // Ad slots are optional
      }
      
      return { id: docSnap.id, ...docSnap.data() };
    },

    async update(tenantId, magazineId, issueSlug, slotKey, updates) {
      const docRef = doc(db, 'tenants', tenantId, 'magazines', magazineId, 'issues', issueSlug, 'adSlots', slotKey);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      const docSnap = await getDoc(docRef);
      return { id: docSnap.id, ...docSnap.data() };
    },

    async delete(tenantId, magazineId, issueSlug, slotKey) {
      const docRef = doc(db, 'tenants', tenantId, 'magazines', magazineId, 'issues', issueSlug, 'adSlots', slotKey);
      await deleteDoc(docRef);
    },
  },

  // Global analytics operations
  analytics: {
    async create(analyticsData) {
      const docRef = await addDoc(collection(db, 'analytics_events'), {
        ...analyticsData,
        createdAt: serverTimestamp(),
      });
      
      const docSnap = await getDoc(docRef);
      return { id: docRef.id, ...docSnap.data() };
    },

    async getByTenant(tenantId, startDate, endDate) {
      let q = query(
        collection(db, 'analytics_events'),
        where('tenantId', '==', doc(db, 'tenants', tenantId)),
        orderBy('createdAt', 'desc')
      );

      if (startDate) {
        q = query(q, where('createdAt', '>=', startDate));
      }
      if (endDate) {
        q = query(q, where('createdAt', '<=', endDate));
      }

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },

    async getByIssue(tenantId, magazineId, issueSlug, startDate, endDate) {
      let q = query(
        collection(db, 'analytics_events'),
        where('tenantId', '==', doc(db, 'tenants', tenantId)),
        where('issueSlug', '==', issueSlug),
        orderBy('createdAt', 'desc')
      );

      if (startDate) {
        q = query(q, where('createdAt', '>=', startDate));
      }
      if (endDate) {
        q = query(q, where('createdAt', '<=', endDate));
      }

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },

    async getStats(tenantId, issueSlug, startDate, endDate) {
      const events = await this.getByIssue(tenantId, null, issueSlug, startDate, endDate);
      
      // Aggregate stats
      const stats = events.reduce((acc, event) => {
        acc[event.event] = (acc[event.event] || 0) + 1;
        return acc;
      }, {});

      return {
        totalViews: stats.view || 0,
        totalPageTurns: stats.page_turn || 0,
        totalCtaClicks: stats.cta_click || 0,
        totalAdClicks: stats.ad_click || 0,
        totalEvents: events.length,
      };
    },
  },

  // Job operations for async tasks
  jobs: {
    async create(jobData) {
      const docRef = await addDoc(collection(db, 'jobs'), {
        ...jobData,
        status: 'queued',
        log: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      const docSnap = await getDoc(docRef);
      return { id: docRef.id, ...docSnap.data() };
    },

    async getById(jobId) {
      const docRef = doc(db, 'jobs', jobId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Job not found');
      }
      
      return { id: docSnap.id, ...docSnap.data() };
    },

    async update(jobId, updates) {
      const docRef = doc(db, 'jobs', jobId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      const docSnap = await getDoc(docRef);
      return { id: docSnap.id, ...docSnap.data() };
    },

    async updateStatus(jobId, status, logEntry = null) {
      const updates = { status };
      
      if (logEntry) {
        // Note: This is a simplified approach. In production, you'd want to use arrayUnion
        const job = await this.getById(jobId);
        updates.log = [...(job.log || []), { ...logEntry, timestamp: new Date() }];
      }
      
      return await this.update(jobId, updates);
    },
  },

  // User operations (for multi-tenant roles)
  users: {
    async create(uid, userData) {
      const docRef = doc(db, 'users', uid);
      const data = {
        ...userData,
        createdAt: serverTimestamp(),
      };
      
      await updateDoc(docRef, data);
      const docSnap = await getDoc(docRef);
      return { id: docRef.id, ...docSnap.data() };
    },

    async getById(uid) {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('User not found');
      }
      
      return { id: docSnap.id, ...docSnap.data() };
    },

    async update(uid, updates) {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, updates);
      
      const docSnap = await getDoc(docRef);
      return { id: docSnap.id, ...docSnap.data() };
    },

    async addTenantRole(uid, tenantId, role) {
      const user = await this.getById(uid);
      const tenants = user.tenants || [];
      
      // Remove existing role for this tenant
      const filteredTenants = tenants.filter(t => t.tenantRef.id !== tenantId);
      
      // Add new role
      filteredTenants.push({
        tenantRef: doc(db, 'tenants', tenantId),
        role: role
      });
      
      return await this.update(uid, { tenants: filteredTenants });
    },
  },
};

// Authentication helper functions
export const authService = {
  async signUp(email, password, userData) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user document in Firestore
    await dbService.users.create(userCredential.user.uid, {
      ...userData,
      email,
    });
    
    return userCredential.user;
  },

  async signIn(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  async signOut() {
    await signOut(auth);
  },

  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  },

  getCurrentUser() {
    return auth.currentUser;
  },
};

export default { db, auth, storage, dbService, authService };
