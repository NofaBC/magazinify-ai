// Core data types for Magazinify AI

export interface Project {
  id: string;
  website: string;
  createdAt: string; // ISO timestamp
}

export interface Issue {
  id: string;
  projectId: string;
  title: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  pages: number;
  pdfUrl?: string; // Firebase Storage URL (optional for now)
  createdAt: string; // ISO timestamp
}

// Request/Response types
export interface GenerateSyncRequest {
  website: string;
}

export interface GenerateSyncResponse {
  success: boolean;
  projectId?: string;
  issueId?: string;
  error?: string;
}

// Firebase document data (for Firestore writes)
export interface ProjectDoc {
  website: string;
  createdAt: FirebaseFirestore.Timestamp;
}

export interface IssueDoc {
  projectId: string;
  title: string;
  status: Issue['status'];
  pages: number;
  pdfUrl?: string;
  createdAt: FirebaseFirestore.Timestamp;
}
