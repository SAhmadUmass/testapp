import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, Animated } from 'react-native';
import { Link } from 'expo-router';
import { signUp } from '@/services/auth';
import { useStore } from '@/store';
import { FontAwesome } from '@expo/vector-icons';
import { ROUTES } from '@/utils/routes';
import { StatusBar } from 'expo-status-bar';
import { authStyles, colors } from '@/styles/auth';

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

  const getInputStyle = (inputName: string) => [
    authStyles.input,
    {
      borderColor: focusedInput === inputName ? colors.border.focused : colors.border.default,
      backgroundColor: focusedInput === inputName ? colors.background.input.focused : colors.background.input.default,
    }
  ];

  return (
    <SafeAreaView style={authStyles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={authStyles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={authStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={authStyles.mainContent}>
            {/* Logo/Brand Section */}
            <View style={authStyles.brandSection}>
              <View style={authStyles.logoContainer}>
                <FontAwesome name="user-plus" size={48} color={colors.primary} />
              </View>
              <Text style={authStyles.welcomeText}>Create Account</Text>
              <Text style={authStyles.subtitleText}>
                Join our community and start sharing your moments
              </Text>
            </View>

            {/* Form Section */}
            <View style={authStyles.formContainer}>
              {error && (
                <Animated.View style={authStyles.errorContainer}>
                  <FontAwesome name="exclamation-circle" size={16} color={colors.text.error} style={authStyles.errorIcon} />
                  <Text style={authStyles.errorText}>{error}</Text>
                </Animated.View>
              )}

              <View>
                <Text style={authStyles.inputLabel}>Username</Text>
                <TextInput
                  style={getInputStyle('username')}
                  placeholder="Choose a username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  placeholderTextColor={colors.text.secondary}
                  onFocus={() => setFocusedInput('username')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              <View>
                <Text style={authStyles.inputLabel}>Email</Text>
                <TextInput
                  style={getInputStyle('email')}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor={colors.text.secondary}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              <View>
                <Text style={authStyles.inputLabel}>Password</Text>
                <TextInput
                  style={getInputStyle('password')}
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor={colors.text.secondary}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                />
                <Text style={authStyles.helperText}>
                  Must be at least 8 characters
                </Text>
              </View>

              <TouchableOpacity
                style={authStyles.primaryButton}
                onPress={handleSignUp}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Text style={authStyles.primaryButtonText}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>

              <View style={authStyles.dividerContainer}>
                <View style={authStyles.dividerLine} />
                <Text style={authStyles.dividerText}>or continue with</Text>
                <View style={authStyles.dividerLine} />
              </View>

              <TouchableOpacity
                style={authStyles.googleButton}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <FontAwesome name="google" size={20} color={colors.google} />
                <Text style={authStyles.googleButtonText}>Google</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Link */}
            <View style={authStyles.linkContainer}>
              <Text style={authStyles.linkText}>Already have an account? </Text>
              <Link href={ROUTES.AUTH.SIGN_IN} asChild>
                <TouchableOpacity>
                  <Text style={authStyles.link}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 