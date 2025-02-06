import { Client, Account, Databases, Storage, ID } from 'react-native-appwrite';
import 'react-native-url-polyfill/auto';
import Constants from 'expo-constants';

// Get environment variables
const {
    APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1',
    APPWRITE_PROJECT_ID = '67a3ff370019f23110f1',
    APPWRITE_PLATFORM_ID = 'com.shaheer.tiktokclone'
} = Constants.expoConfig?.extra || {};

const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setPlatform(APPWRITE_PLATFORM_ID);

// Export initialized services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

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