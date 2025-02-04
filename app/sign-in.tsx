import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { Link } from 'expo-router';
import { signIn, signInWithGoogle } from '@/services/auth';
import { useStore } from '@/store';
import { FontAwesome } from '@expo/vector-icons';
import { ROUTES } from '@/utils/routes';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser, setError, isLoading, setIsLoading } = useStore();

  const handleSignIn = async () => {
    setIsLoading(true);
    const { user, error } = await signIn(email, password);
    if (error) {
      setError(error);
    } else if (user) {
      setUser(user);
    }
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { user, error } = await signInWithGoogle();
    if (error) {
      setError(error);
    } else if (user) {
      setUser(user);
    }
    setIsLoading(false);
  };

  // ... existing code ...
} 