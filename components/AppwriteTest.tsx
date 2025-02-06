import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getCurrentUser } from '../lib/appwrite';

export default function AppwriteTest() {
    const [status, setStatus] = useState('Checking Appwrite connection...');

    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        try {
            const user = await getCurrentUser();
            if (user) {
                setStatus(`Connected! User: ${user.email}`);
            } else {
                setStatus('Connected! (No user logged in)');
            }
        } catch (error: any) {
            setStatus(`Error: ${error?.message || 'Unknown error occurred'}`);
        }
    };

    return (
        <View className="p-4">
            <Text className="text-base">{status}</Text>
        </View>
    );
} 