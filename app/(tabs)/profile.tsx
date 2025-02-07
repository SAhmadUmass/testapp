import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { useStore } from '@/store';
import { logout } from '@/services/auth';
import { AppwriteUser } from '@/services/auth';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, setUser, isLoading, setIsLoading } = useStore();
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    const { error } = await logout();
    if (!error) {
      setUser(null);
    }
    setIsLoading(false);
  };

  const handleBookmarksPress = () => {
    router.push('/profile/bookmarks');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ffffff', '#f3f4f6']}
        style={styles.gradient}
      />
      
      {/* Profile Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <Image
          source={{ uri: user?.prefs?.avatarUrl || 'https://via.placeholder.com/150' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user?.name || 'Anonymous User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        {/* Bookmarks Button */}
        <TouchableOpacity
          style={styles.bookmarksButton}
          onPress={handleBookmarksPress}
        >
          <Ionicons name="bookmark" size={24} color="#4F46E5" />
          <Text style={styles.bookmarksText}>My Bookmarks</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoading}
        >
          <MaterialIcons name="logout" size={24} color="#DC2626" />
          <Text style={styles.logoutText}>
            {isLoading ? 'Logging out...' : 'Logout'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  bookmarksButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
    justifyContent: 'center',
  },
  bookmarksText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'center',
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
}); 