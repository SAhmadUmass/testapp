import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, Animated } from 'react-native';
import { Link } from 'expo-router';
import { signIn } from '@/services/auth';
import { useStore } from '@/store';
import { FontAwesome } from '@expo/vector-icons';
import { ROUTES } from '@/utils/routes';
import { StatusBar } from 'expo-status-bar';
import { authStyles, colors } from '@/styles/auth';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser, setError, isLoading, setIsLoading, error } = useStore();
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }

    setIsLoading(true);
    const { user, error } = await signIn(email, password);
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
                <FontAwesome name="user-circle" size={48} color={colors.primary} />
              </View>
              <Text style={authStyles.welcomeText}>Welcome Back!</Text>
              <Text style={authStyles.subtitleText}>
                Sign in to continue your journey
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
                <View style={authStyles.passwordHeader}>
                  <Text style={authStyles.inputLabel}>Password</Text>
                  <TouchableOpacity>
                    <Text style={authStyles.link}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={getInputStyle('password')}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor={colors.text.secondary}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              <TouchableOpacity
                style={authStyles.primaryButton}
                onPress={handleSignIn}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Text style={authStyles.primaryButtonText}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
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

            {/* Sign Up Link */}
            <View style={authStyles.linkContainer}>
              <Text style={authStyles.linkText}>Don't have an account? </Text>
              <Link href={ROUTES.AUTH.SIGN_UP} asChild>
                <TouchableOpacity>
                  <Text style={authStyles.link}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 