import {
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
  limit as firestoreLimit,
  DocumentData,
  QueryDocumentSnapshot,
  serverTimestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, Video } from '../utils/types';

// User Operations
export const createUserProfile = async (userId: string, userData: Partial<User>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
    return { error: null };
  } catch (error) {
    return { error: (error as Error).message };
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return { data: userSnap.data() as User, error: null };
    }
    return { data: null, error: 'User not found' };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
};

// Video Operations
export const createVideo = async (videoData: Partial<Video>) => {
  try {
    const videosRef = collection(db, 'videos');
    const docRef = await addDoc(videosRef, {
      ...videoData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: (error as Error).message };
  }
};

export const getVideos = async (limitCount: number = 10) => {
  try {
    const videosRef = collection(db, 'videos');
    const q = query(
      videosRef,
      orderBy('createdAt', 'desc'),
      firestoreLimit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const videos: Video[] = [];
    querySnapshot.forEach((doc) => {
      videos.push({ id: doc.id, ...doc.data() } as Video);
    });
    return { data: videos, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
};

export const getUserVideos = async (userId: string) => {
  try {
    const videosRef = collection(db, 'videos');
    const q = query(
      videosRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const videos: Video[] = [];
    querySnapshot.forEach((doc) => {
      videos.push({ id: doc.id, ...doc.data() } as Video);
    });
    return { data: videos, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
};

// Batch Operations
export const batchUpdateLikes = async (
  videoId: string, 
  userId: string,
  shouldIncrement: boolean
): Promise<{ error: string | null }> => {
  try {
    const batch = writeBatch(db);
    const videoRef = doc(db, 'videos', videoId);
    const likeRef = doc(db, 'likes', `${userId}_${videoId}`);
    
    if (shouldIncrement) {
      // Add like
      batch.set(likeRef, {
        userId,
        videoId,
        createdAt: serverTimestamp()
      });
      batch.update(videoRef, {
        likes: increment(1),
        updatedAt: serverTimestamp()
      });
    } else {
      // Remove like
      batch.delete(likeRef);
      batch.update(videoRef, {
        likes: increment(-1),
        updatedAt: serverTimestamp()
      });
    }

    await batch.commit();
    return { error: null };
  } catch (error) {
    console.error('Error updating likes:', error);
    return { error: (error as Error).message };
  }
};

export const checkIfUserLikedVideo = async (userId: string, videoId: string): Promise<boolean> => {
  try {
    const likeRef = doc(db, 'likes', `${userId}_${videoId}`);
    const likeDoc = await getDoc(likeRef);
    return likeDoc.exists();
  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
};

export const deleteVideoAndComments = async (videoId: string): Promise<{ error: string | null }> => {
  try {
    const batch = writeBatch(db);
    
    // Delete video document
    const videoRef = doc(db, 'videos', videoId);
    batch.delete(videoRef);
    
    // Delete associated comments
    const commentsRef = collection(db, 'videos', videoId, 'comments');
    const commentsSnapshot = await getDocs(commentsRef);
    commentsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    return { error: null };
  } catch (error) {
    return { error: (error as Error).message };
  }
}; 