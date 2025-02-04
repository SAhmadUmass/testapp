import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, Animated } from 'react-native';
import { Link } from 'expo-router';
import { signUp } from '@/services/auth';
import { useStore } from '@/store';
import { FontAwesome } from '@expo/vector-icons';
import { ROUTES } from '@/utils/routes';
import { StatusBar } from 'expo-status-bar';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const { setUser, setError, isLoading, setIsLoading, error } = useStore();
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!email || !password || !username) {
      setError('All fields are required');
      return;
    }

    setIsLoading(true);
    const { user, error } = await signUp(email, password, username);
    if (error) {
      setError(error);
    } else if (user) {
      setUser(user);
    }
    setIsLoading(false);
  };

  const getInputStyle = (inputName: string) => ({
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: focusedInput === inputName ? '#3B82F6' : '#D1D5DB',
    borderRadius: 12,
    backgroundColor: focusedInput === inputName ? '#F8FAFF' : '#F9FAFB',
    fontSize: 16,
    color: '#1F2937'
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ 
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingVertical: 20
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1, justifyContent: 'center' }}>
            {/* Logo/Brand Section */}
            <View style={{ alignItems: 'center', marginBottom: 32 }}>
              <View style={{ 
                width: 96,
                height: 96,
                backgroundColor: '#EEF2FF',
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                shadowColor: '#3B82F6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4
              }}>
                <FontAwesome name="user-plus" size={48} color="#3B82F6" />
              </View>
              <Text style={{ 
                fontSize: 32,
                fontWeight: '700',
                color: '#1F2937',
                marginBottom: 8
              }}>
                Create Account
              </Text>
              <Text style={{ 
                fontSize: 16, 
                color: '#6B7280',
                textAlign: 'center',
                maxWidth: '80%'
              }}>
                Join our community and start sharing your moments
              </Text>
            </View>

            {/* Form Section */}
            <View style={{ gap: 20 }}>
              {error && (
                <Animated.View 
                  style={{ 
                    backgroundColor: '#FEE2E2',
                    padding: 12,
                    borderRadius: 12,
                    marginBottom: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#FCA5A5'
                  }}
                >
                  <FontAwesome name="exclamation-circle" size={16} color="#DC2626" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#DC2626', flex: 1 }}>{error}</Text>
                </Animated.View>
              )}

              <View>
                <Text style={{ 
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: 6
                }}>
                  Username
                </Text>
                <TextInput
                  style={getInputStyle('username')}
                  placeholder="Choose a username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  placeholderTextColor="#9CA3AF"
                  onFocus={() => setFocusedInput('username')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              <View>
                <Text style={{ 
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: 6
                }}>
                  Email
                </Text>
                <TextInput
                  style={getInputStyle('email')}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor="#9CA3AF"
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              <View>
                <Text style={{ 
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: 6
                }}>
                  Password
                </Text>
                <TextInput
                  style={getInputStyle('password')}
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor="#9CA3AF"
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                />
                <Text style={{ 
                  fontSize: 12,
                  color: '#6B7280',
                  marginTop: 4,
                  marginLeft: 4
                }}>
                  Must be at least 8 characters
                </Text>
              </View>

              <TouchableOpacity
                style={{
                  height: 52,
                  backgroundColor: '#3B82F6',
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 8,
                  shadowColor: '#3B82F6',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4
                }}
                onPress={handleSignUp}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>

              <View style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 20
              }}>
                <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
                <Text style={{ 
                  marginHorizontal: 16,
                  color: '#6B7280',
                  fontSize: 14,
                  fontWeight: '500'
                }}>
                  or continue with
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
              </View>

              <TouchableOpacity
                style={{
                  height: 52,
                  backgroundColor: 'white',
                  borderWidth: 1.5,
                  borderColor: '#E5E7EB',
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2
                }}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <FontAwesome name="google" size={20} color="#DB4437" />
                <Text style={{ 
                  marginLeft: 12,
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: 16
                }}>
                  Google
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Link */}
            <View style={{ 
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 32,
              opacity: 0.8
            }}>
              <Text style={{ color: '#6B7280', fontSize: 15 }}>
                Already have an account?{' '}
              </Text>
              <Link href={ROUTES.AUTH.SIGN_IN} asChild>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={{ 
                    color: '#3B82F6',
                    fontWeight: '600',
                    fontSize: 15
                  }}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 