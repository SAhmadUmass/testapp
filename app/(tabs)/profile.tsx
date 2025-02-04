import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useStore } from '@/store';
import { logout } from '@/services/auth';
import { User } from 'firebase/auth';

export default function ProfileScreen() {
  const { user, setUser, isLoading, setIsLoading } = useStore();

  const handleLogout = async () => {
    setIsLoading(true);
    const { error } = await logout();
    if (!error) {
      setUser(null);
    }
    setIsLoading(false);
  };

  return (
    <View className="flex-1 bg-white p-6">
      <View className="items-center mb-6">
        <Image
          source={{ uri: (user as User)?.photoURL || 'https://via.placeholder.com/100' }}
          className="w-24 h-24 rounded-full mb-4"
        />
        <Text className="text-xl font-bold">{(user as User)?.displayName}</Text>
        <Text className="text-gray-500">{(user as User)?.email}</Text>
      </View>

      <TouchableOpacity
        className="w-full h-12 bg-red-500 rounded-lg items-center justify-center mt-auto"
        onPress={handleLogout}
        disabled={isLoading}
      >
        <Text className="text-white font-semibold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
} 