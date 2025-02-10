import { Client, Account, Databases, Storage, Functions, ID } from 'react-native-appwrite';
import 'react-native-url-polyfill/auto';
import Constants from 'expo-constants';

// Get environment variables
const {
    APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1',
    APPWRITE_PROJECT_ID = '67a3ff370019f23110f1',
    APPWRITE_PLATFORM_ID = 'com.shaheer.tiktokclone'
} = Constants.expoConfig?.extra || {};

// Initialize the Appwrite client
const client = new Client();

// Set the endpoint and project ID
client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

// Export initialized services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Database and Collection IDs
export const DATABASE_ID = 'main';
export const COLLECTIONS = {
    USERS: '67a534af000d73c8cb55', //users collection id(dont change this)
    VIDEOS: 'videos',
    LIKES: 'likes',
    SAVES: 'saves',
    COMMENTS: '67a567e5000e8435a75a',
    BOOKMARKS: 'bookmarks'
} as const;

// Collection Types
export interface DBUser {
    $id?: string;
    name: string;
    email: string;
    profile_picture?: string;
    created_at: string;
}

export interface DBVideo {
    $id?: string;
    video_url: string;
    storage_file_id: string;
    userId?: string;
    username?: string;
    title?: string;
    cuisine_type?: 'Italian' | 'Mexican' | 'Chinese' | 'Indian' | 'Japanese' | 'American' | 'Thai' | 'Mediterranean';
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    duration?: number;
}

export interface DBComment {
    $id?: string;
    userId: string;
    videoId: string;
    text: string;
    created_at: string;
}

export interface DBBookmark {
    $id?: string;
    userId: {
        $id: string;
        $collectionId: string;
        $databaseId: string;
    };
    videoId: {
        $id: string;
        $collectionId: string;
        $databaseId: string;
    };
    description?: string;
    created_at: string;
}

// Helper function to check if database exists
export const ensureDatabase = async () => {
    try {
        await databases.listDocuments(DATABASE_ID, COLLECTIONS.USERS);
        console.log('Database access confirmed');
    } catch (error: any) {
        console.error('Error accessing database:', error);
        throw error;
    }
};

// Helper function to check if collections exist
export const ensureCollections = async () => {
    try {
        await databases.listDocuments(DATABASE_ID, COLLECTIONS.USERS);
        console.log('Collections access confirmed');
    } catch (error: any) {
        if (error.code === 404) {
            console.error('Collections not found - please create them in the Appwrite console');
        }
        throw error;
    }
};

// Export client and ID for convenience
export { client, ID };

// Export a function to check if user is authenticated
export const getCurrentUser = async () => {
    try {
        const user = await account.get();
        return user;
    } catch (error) {
        return null;
    }
}; 