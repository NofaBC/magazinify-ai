import { VercelRequest, VercelResponse } from '@vercel/node';
import { db, isFirebaseReady } from '../../lib/firebase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isFirebaseReady || !db) {
    return res.status(503).json({ error: 'Firebase not configured' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Issue ID required' });
    }

    // Fetch issue document
    const issueDoc = await db.collection('issues').doc(id).get();

    if (!issueDoc.exists) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const issueData = issueDoc.data();
    
    // Convert Firestore timestamp to ISO string for JSON response
    const issue = {
      id: issueDoc.id,
      ...issueData,
      createdAt: issueData?.createdAt?.toDate?.()?.toISOString() || null,
    };

    return res.status(200).json({
      success: true,
      issue,
    });

  } catch (error) {
    console.error('Debug get-issue error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch issue',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
