import React, { useState, useEffect } from 'react';
import { Dimensions, StatusBar } from 'react-native';
import { StyleSheet, View, TextInput, Text, TouchableOpacity, Image, SafeAreaView, ScrollView, ActivityIndicator, Alert, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Feather, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { SessionManager } from '../../utils/sessionManager';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [langRotate] = useState(new Animated.Value(0));
  const [themeRotate] = useState(new Animated.Value(0));
  const [themeSpread] = useState(new Animated.Value(0));
  const router = useRouter();
  const auth = useAuth();
  const { colors, theme, setThemeMode, themeMode } = useTheme();
  const { t, language, setLanguage } = useLanguage();

  const handleLanguageToggle = () => {
    Animated.sequence([
      Animated.timing(langRotate, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(langRotate, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();
    setLanguage(language === 'en' ? 'ta' : 'en');
  };

  const handleThemeToggle = () => {
    // Rotation animation
    Animated.sequence([
      Animated.timing(themeRotate, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(themeRotate, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();

    // Spread animation
    Animated.sequence([
      Animated.timing(themeSpread, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }),
      Animated.timing(themeSpread, {
        toValue: 0,
        duration: 0,
        useNativeDriver: false,
      }),
    ]).start();

    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeMode(newTheme);
  };

  const langRotateInterpolate = langRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const themeRotateInterpolate = themeRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spreadScale = themeSpread.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(width, height) * 2],
  });

  const spreadOpacity = themeSpread.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 0.4, 0],
  });

  // Modern vibrant header section with colorful artwork
  const ModernHeaderSection = () => {
    return (
      <View style={styles.modernHeader}>
        {/* Background Image */}
        <Image
          source={require('../../assets/images/login.webp')}
          style={styles.headerBackgroundImage}
          resizeMode="cover"
        />
        {/* Fade Gradient Overlay */}
        <LinearGradient
          colors={['rgba(220, 38, 38, 0.8)', 'rgba(239, 68, 68, 0.6)', 'rgba(255, 255, 255, 0.7)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* Welcome text overlay */}
          <View style={styles.welcomeTextContainer}>
          <Image
                source={{ uri: 'https://90skalyanam.com/assets/images/logoIcon/logo.png' }}
                style={styles.loginHeaderImage}
              />
              <Text style={styles.loginHeaderText}>Welcome Back</Text>
              <Text style={styles.loginHeaderSubtext}>Find your perfect match</Text>
         
          </View>
        </LinearGradient>
      </View>
    );
  };

    const handleLogin = async () => {
    if (!auth) return;

    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password.');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('🔐 Starting login...');
      await auth.login(username, password);
      
    } catch (error: any) {
      console.error('💥 Login failed:', error);
      
      let errorMessage = t('check_credentials');
      
      if (error.message?.includes('Network Error') || error.message?.includes('failed to fetch')) {
        errorMessage = t('check_connection');
      } else if (error.message?.includes('timeout')) {
        errorMessage = t('connection_timeout');
      } else {
        errorMessage = error.message || t('check_credentials');
      }
      
      Alert.alert(t('login_failed'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!auth) {
    return (
      <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <StatusBar hidden={true} />
        <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
      </View>
    );
  }

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Theme Spread Animation Overlay */}
      <Animated.View
        style={[
          styles.themeSpreadOverlay,
          {
            width: spreadScale,
            height: spreadScale,
            opacity: spreadOpacity,
            backgroundColor: theme === 'dark' ? '#FFFFFF' : '#1A1A2E',
          },
        ]}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <View style={styles.container}>
          
          {/* Login Image Header */}
          
          
          {/* Modern Vibrant Header Section */}
          <ModernHeaderSection />
          
          {/* Toggle Buttons - Right Side Horizontal with Login Text */}
          <View style={styles.toggleButtonsContainer}>
            <Text style={styles.screenTitleText}>Login</Text>
            <View style={styles.rightToggleButtonsRow}>
              {/* Theme Toggle Button */}
              <Animated.View style={{ transform: [{ rotate: themeRotateInterpolate }] }}>
                <TouchableOpacity 
                  style={[styles.toggleButton, { borderColor: '#DC2626', backgroundColor: 'rgba(220, 38, 38, 0.2)' }]}
                  onPress={handleThemeToggle}
                >
                  {theme === 'dark' ? (
                    <MaterialCommunityIcons name="moon-waning-crescent" size={16} color="#DC2626" />
                  ) : (
                    <MaterialCommunityIcons name="white-balance-sunny" size={16} color="#DC2626" />
                  )}
                </TouchableOpacity>
              </Animated.View>

              {/* Language Toggle Button */}
              <Animated.View style={{ transform: [{ rotate: langRotateInterpolate }] }}>
                <TouchableOpacity 
                  style={[styles.toggleButton, { borderColor: '#DC2626', backgroundColor: 'rgba(220, 38, 38, 0.2)' }]}
                  onPress={handleLanguageToggle}
                >
                  <Text style={[styles.languageButtonText, { color: '#DC2626' }]}>
                    {language === 'en' ? 'EN' : 'TA'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>

          {/* Form Container */}
          <View style={[styles.formContainer, { backgroundColor: colors.background }]}>
          
            {/* Email Input */}
            <View style={styles.formSection}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>{t('email')}</Text>
              <View style={[styles.modernInputContainer, { borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)' }]}>
                <TextInput
                  style={[styles.modernInput, { color: colors.textPrimary }]}
                  placeholder="example@email.com"
                  placeholderTextColor={colors.textTertiary}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.formSection}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>{t('password')}</Text>
              <View style={[styles.modernInputContainer, { borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)' }]}>
                <TextInput
                  style={[styles.modernInput, { color: colors.textPrimary }]}
                  placeholder="••••••••••"
                  placeholderTextColor={colors.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                />
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                  <Feather name={isPasswordVisible ? "eye-off" : "eye"} size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity 
              style={[styles.modernLoginButton, loading && styles.disabledButton]} 
              onPress={handleLogin} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modernLoginButtonText}>{t('sign_in')}</Text>
              )}
            </TouchableOpacity>

            {/* Social Login */}
            <View style={styles.socialContainer}>
              <Text style={[styles.socialLabel, { color: colors.textSecondary }]}>{t('or')}</Text>
              <View style={styles.socialButtonsRow}>
                <TouchableOpacity style={[styles.socialButton, { borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)' }]}>
                  <FontAwesome name="facebook" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.socialButton, { borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)' }]}>
                  <FontAwesome name="google" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.socialButton, { borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)' }]}>
                  <FontAwesome name="apple" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Guest Login Button */}
            <TouchableOpacity 
              style={styles.guestButton}
              onPress={async () => {
                try {
                  setLoading(true);
                  await auth?.loginAsGuest();
                } catch (error: any) {
                  console.error('💥 Guest login failed:', error);
                  Alert.alert('Error', error.message || 'Failed to login as guest');
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.guestButtonText}>👤 Login as Guest</Text>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.signupContainer}>
              <Text style={[styles.signupText, { color: colors.textSecondary }]}>
                {t('dont_have_account')}{' '}
                <Text 
                  style={styles.signupLink}
                  onPress={() => router.push('/(auth)/register')}
                >
                  {t('signup')}
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    position: 'relative',
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  
  // Theme Spread Overlay
  themeSpreadOverlay: {
    position: 'absolute',
    borderRadius: 9999,
    top: '50%',
    left: '50%',
    marginLeft: -50,
    marginTop: -50,
    zIndex: 999,
  },
  
  // Modern Header Styles
  modernHeader: {
    width: '100%',
    height: 280,
    overflow: 'hidden',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  decorShape: {
    position: 'absolute',
  },
  headerBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  welcomeTextContainer: {
    alignItems: 'center',
    zIndex: 10,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  
  // Form Container Styles
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
  },
  formSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  
  // Modern Input Styles
  modernInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  modernInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 45,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  input: {
    flex: 1,
    height: 45,
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 10,
  },
  inputIcon: {
    marginRight: 5,
  },
  eyeIcon: {
    paddingLeft: 10,
    paddingRight: 5,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  forgotPasswordText: {
    fontSize: 12,
    color: '#FFA500',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#FFA500',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    height: 45,
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#FFA500',
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  dividerText: {
    color: '#9CA3AF',
    marginHorizontal: 10,
    fontSize: 12,
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  signupText: {
    fontSize: 13,
    fontWeight: '500',
  },
  signupLink: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '700',
  },
  
  // Guest Button
  guestButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    height: 45,
    justifyContent: 'center',
    marginBottom: 15,
    borderWidth: 1.5,
    borderColor: '#DC2626',
  },
  guestButtonText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  // Modern Login Button
  modernLoginButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 10,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  modernLoginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  // Social Login Styles
  socialContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  socialLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 12,
    textTransform: 'lowercase',
  },
  socialButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  
  // Login Image Header
  imageHeaderContainer: {
    width: '100%',
    marginBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  imageHeaderGradient: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginHeaderImage: {
    width: 120,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  loginHeaderText: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  loginHeaderSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },

  // Toggle Buttons Container - With Title
  toggleButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  screenTitleText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#DC2626',
  },
  // Toggle Buttons Row - Right Side Horizontal
  rightToggleButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  toggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  languageButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },
});