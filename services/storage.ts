import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { storage } from '../config/firebase';

export const uploadFile = async (
  file: Blob,
  path: string,
  onProgress?: (progress: number) => void
): Promise<{ url: string | null; error: string | null }> => {
  try {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          resolve({ url: null, error: error.message });
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({ url: downloadURL, error: null });
          } catch (error) {
            resolve({ url: null, error: (error as Error).message });
          }
        }
      );
    });
  } catch (error) {
    return { url: null, error: (error as Error).message };
  }
};

export const deleteFile = async (path: string): Promise<{ error: string | null }> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return { error: null };
  } catch (error) {
    return { error: (error as Error).message };
  }
}; 