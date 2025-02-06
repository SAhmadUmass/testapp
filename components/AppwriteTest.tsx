import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { account } from '@/config/appwrite';

export default function AppwriteTest() {
    const [status, setStatus] = useState('Checking Appwrite connection...');

    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        try {
            const user = await account.get();
            if (user) {
                setStatus(`Connected! User: ${user.email}`);
            } else {
                setStatus('Connected! (No user logged in)');
            }
        } catch (error: any) {
            if (error.code === 401) {
                setStatus('Connected! (No user logged in)');
            } else {
                setStatus(`Error: ${error?.message || 'Unknown error occurred'}`);
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>{status}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 8,
        position: 'absolute',
        bottom: 10,
        alignSelf: 'center',
        borderRadius: 8,
        backgroundColor: 'transparent',
    },
    text: {
        color: '#666',
        fontSize: 12,
        textAlign: 'center',
    },
}); 