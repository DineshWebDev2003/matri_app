import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Dimensions, StyleSheet, View, TextInput, Text, TouchableOpacity, Image, SafeAreaView, ScrollView, ActivityIndicator, Alert, Platform, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

const { width, height } = Dimensions.get('window');

const BackgroundOverlay = () => {
  const icons = ['heart', 'ring', 'flower-tulip', 'human-male-female', 'camera-iris'];
  const iconSize = 50;
  const { width, height } = Dimensions.get('window');

  const numCols = Math.ceil(width / (iconSize * 2));
  const numRows = Math.ceil(height / (iconSize * 2));

  return (
    <View style={styles.overlayContainer}>
      {Array.from({ length: numRows }).map((_, rowIndex) =>
        Array.from({ length: numCols }).map((_, colIndex) => {
          const iconName = icons[(rowIndex * numCols + colIndex) % icons.length];
          return (
            <MaterialCommunityIcons
              key={`${rowIndex}-${colIndex}`}
              name={iconName}
              size={iconSize}
              color="rgba(0, 0, 0, 0.05)" // Subtle gray color
              style={{
                position: 'absolute',
                top: rowIndex * iconSize * 2.5,
                left: colIndex * iconSize * 2.5,
                transform: [{ rotate: '-15deg' }],
              }}
            />
          );
        })
      )}
    </View>
  );
};

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [langRotate] = useState(new Animated.Value(0));
  const [themeRotate] = useState(new Animated.Value(0));
  const [themeSpread] = useState(new Animated.Value(0));
  const router = useRouter();
  const auth = useAuth();
  const { colors, theme, setThemeMode, themeMode } = useTheme();
  const { t, language, setLanguage } = useLanguage();

  // Dynamic dropdown data
  const [religions, setReligions] = useState<any[]>([]);
  const [castes, setCastes] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const resp = await apiService.getDropdownOptions();
        // Extract religions array regardless of nesting levels
        const relList = resp?.religions || resp?.data?.religions || resp?.data?.data?.religions || [];
        if (Array.isArray(relList)) {
          setReligions(relList);
        }
      } catch (err) {
        console.warn('Failed to load religions', err);
      }
      try {
        const countryResp = await apiService.getCountries();
        // Backend returns { data: { countries: [...] } }
        const list = countryResp?.countries || countryResp?.data?.countries || [];
        if (Array.isArray(list)) {
          setCountries(list);
        }
      } catch (err) {
        console.warn('Failed to load countries', err);
      }
    })();
  }, []);

  const fetchCastes = async (religionId: string) => {
    try {
      const resp = await apiService.getCastesByReligion(religionId);
      const casteList = resp?.data?.castes || resp?.data?.data?.castes;
      if (resp?.status === 'success' && Array.isArray(casteList)) {
        setCastes(casteList);
      } else {
        setCastes([]);
      }
    } catch (err) {
      console.warn('Failed to load castes', err);
      setCastes([]);
    }
  };

  const [formData, setFormData] = useState({
    looking_for: '',
    firstname: '',
    lastname: '',
    email: '',
    mobile_code: '',
    mobile: '',
    country_code: '',
    country: '',
    birth_date: '',
    password: '',
    religion: '',
    caste: '',
    gender: '',
    agree: false,
  });

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

  const handleInputChange = (name: string, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Reset caste when religion changes
      if (name === 'looking_for') {
        // Auto-set gender based on selected looking_for value
        if (value === '1') {
          newData.gender = 'm';
        } else if (value === '2') {
          newData.gender = 'f';
        } else {
          newData.gender = '';
        }
      }

      if (name === 'religion') {
        newData.caste = '';
        if (value) {
          fetchCastes(value as string);
        } else {
          setCastes([]);
        }
        newData.caste = '';
      }
      return newData;
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      handleInputChange('birth_date', formattedDate);
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const handleRegister = async () => {
    console.log('🚀 Starting registration process...');
    console.log('📋 Current form data:', formData);

    // Validation checks with detailed logging
    const requiredFields = {
      looking_for: formData.looking_for,
      firstname: formData.firstname,
      lastname: formData.lastname,
      email: formData.email,
      mobile: formData.mobile,
      birth_date: formData.birth_date,
      password: formData.password,
      religion_id: formData.religion,
      caste: formData.caste
    };

    console.log('🔍 Checking required fields:', requiredFields);
    
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      Alert.alert('Error', `Please fill all required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (!formData.agree) {
      console.error('❌ Terms not agreed');
      Alert.alert('Error', 'You must agree to the terms and policies.');
      return;
    }

    console.log('✅ All validations passed, proceeding with registration...');
    setLoading(true);
    
    try {
      // Generate username from email (required field)
      const emailPrefix = formData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const username = emailPrefix + randomSuffix;

      console.log('🔧 Generated username:', username);

      const registrationData = {
        looking_for: formData.looking_for || '',
        firstname: formData.firstname || '',
        lastname: formData.lastname || '',
        email: formData.email || '',
        mobile: formData.mobile || '',
        birth_date: formData.birth_date || '',
        password: formData.password || '',
        religion_id: formData.religion || '',
        caste: formData.caste || '',
        gender: formData.gender || '',
        username: username || '',
        mobile_code: formData.mobile_code || '',
        country_code: formData.country_code || '',
        country: formData.country || '',
        password_confirmation: formData.password || '',
        agree: formData.agree ? '1' : '0',
      };

      console.log('📤 Final registration data being sent to API:', registrationData);
      console.log('✓ looking_for:', registrationData.looking_for);
      console.log('✓ firstname:', registrationData.firstname);
      console.log('✓ lastname:', registrationData.lastname);
      console.log('✓ email:', registrationData.email);
      console.log('✓ mobile:', registrationData.mobile);
      console.log('✓ birth_date:', registrationData.birth_date);
      console.log('✓ password:', registrationData.password);
      console.log('✓ religion:', registrationData.religion);
      console.log('✓ caste:', registrationData.caste);
      console.log('✓ username:', registrationData.username);
      console.log('✓ agree:', registrationData.agree);
      console.log('🌐 Calling auth.register()...');

      const result = await auth?.register(registrationData);
      console.log('✅ Registration API call completed successfully:', result);
      
      // Navigate to profile completion screen with registration data
      router.replace({
        pathname: '/(auth)/profile-completion',
        params: {
          registrationData: JSON.stringify(registrationData),
          isNewUser: 'true'
        }
      });
      
    } catch (error: any) {
      console.error('💥 Registration error caught in handleRegister:');
      console.error('🔴 Error type:', typeof error);
      console.error('🔴 Error message:', error?.message);
      console.error('🔴 Error stack:', error?.stack);
      console.error('🔴 Full error object:', error);
      
      if (error?.response) {
        console.error('🔴 API Response Error:');
        console.error('  - Status:', error.response.status);
        console.error('  - Status Text:', error.response.statusText);
        console.error('  - Headers:', error.response.headers);
        console.error('  - Data:', error.response.data);
      }
      
      if (error?.request) {
        console.error('🔴 Network Request Error:', error.request);
      }
      
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          'An unexpected error occurred during registration.';
      
      console.error('🔴 Final error message to show user:', errorMessage);
      Alert.alert('Registration Failed', errorMessage);
      
    } finally {
      console.log('🏁 Registration process completed, setting loading to false');
      setLoading(false);
    }
  };

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

      <ScrollView contentContainerStyle={styles.container}>
        {/* Modern Vibrant Header Section */}
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
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeTitle}>Join</Text>
              <Text style={styles.welcomeSubtitle}>90sKalyanam</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Toggle Buttons - Right Side Horizontal with Signup Text */}
        <View style={styles.toggleButtonsContainer}>
          <Text style={styles.screenTitleText}>Signup</Text>
          <View style={styles.rightToggleButtonsContainer}>
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

        <View style={[styles.formContainer, { backgroundColor: colors.background }]}>

          {/* Looking For Dropdown */}
          <View style={styles.formSection}>
            <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>{t('looking_for')}</Text>
            <View style={[styles.modernInputContainer, { borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)', backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
              <Picker
                selectedValue={formData.looking_for}
                style={[styles.modernInput, { color: colors.textPrimary }]}
                onValueChange={(itemValue) => handleInputChange('looking_for', itemValue)}
              >
                <Picker.Item label="Select One" value="" />
                <Picker.Item label="Bridegroom (மணமகன்)" value="1" />
                <Picker.Item label="Bride (மணமகள்)" value="2" />
              </Picker>
            </View>
          </View>

          {/* Gender (auto-selected) */}
          <View style={styles.formSection}>
            <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Gender</Text>
            <View style={[styles.modernInputContainer, { borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)', backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(0, 0, 0, 0.02)' }]}> 
              <Picker
                enabled={false}
                selectedValue={formData.gender}
                style={[styles.modernInput, { color: colors.textPrimary }]}
                onValueChange={() => {}}
              >
                <Picker.Item label="Select Gender" value="" />
                <Picker.Item label="Male" value="m" />
                <Picker.Item label="Female" value="f" />
              </Picker>
            </View>
          </View>

          {/* First Name & Last Name */}
          <View style={styles.row}>
            <View style={[styles.formSection, styles.halfWidth]}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>{t('first_name')}</Text>
              <View style={[styles.modernInputContainer, { borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)', backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
                <TextInput 
                  style={[styles.modernInput, { color: colors.textPrimary }]} 
                  placeholder="First Name" 
                  placeholderTextColor={colors.textTertiary}
                  value={formData.firstname} 
                  onChangeText={(text) => handleInputChange('firstname', text)} 
                />
              </View>
            </View>
            <View style={[styles.formSection, styles.halfWidth]}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>{t('last_name')}</Text>
              <View style={[styles.modernInputContainer, { borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)', backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
                <TextInput 
                  style={[styles.modernInput, { color: colors.textPrimary }]} 
                  placeholder="Last Name" 
                  placeholderTextColor={colors.textTertiary}
                  value={formData.lastname} 
                  onChangeText={(text) => handleInputChange('lastname', text)} 
                />
              </View>
            </View>
          </View>

          {/* Email */}
          <View style={styles.formSection}>
            <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>{t('email')}</Text>
            <View style={[styles.modernInputContainer, { borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)', backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
              <TextInput 
                style={[styles.modernInput, { color: colors.textPrimary }]} 
                placeholder="example@email.com" 
                placeholderTextColor={colors.textTertiary}
                keyboardType="email-address" 
                value={formData.email} 
                onChangeText={(text) => handleInputChange('email', text)} 
                autoCapitalize="none" 
              />
            </View>
          </View>

          {/* Mobile */}
          <View style={styles.formSection}>
            <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>{t('mobile_number')}</Text>
            <View style={styles.row}>
              <View style={[styles.modernInputContainer, { flex: 1, marginRight: 8, borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)', backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
                <Picker
                  selectedValue={formData.mobile_code}
                  style={[styles.modernInput, { color: colors.textPrimary }]}
                  onValueChange={(dialCode) => {
                    const sel = countries.find((c:any) => c.dial_code == dialCode);
                    handleInputChange('mobile_code', dialCode);
                    handleInputChange('country_code', sel?.country_code || '');
                    handleInputChange('country', sel?.country || '');
                  }}
                >
                  <Picker.Item label="Select" value="" />
                  {countries.map((c:any) => (
                    <Picker.Item key={c.country_code} label={`${c.country} (+${c.dial_code})`} value={c.dial_code} />
                  ))}
                </Picker>
              </View>
              <View style={[styles.modernInputContainer, { flex: 3, marginLeft: 8, borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)', backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
                <TextInput 
                  style={[styles.modernInput, { color: colors.textPrimary }]} 
                  placeholder="Mobile Number" 
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="phone-pad" 
                  value={formData.mobile} 
                  onChangeText={(text) => handleInputChange('mobile', text)} 
                />
              </View>
            </View>
          </View>

          {/* Date of Birth & Password */}
          <View style={styles.row}>
            <View style={[styles.formSection, styles.halfWidth]}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>{t('date_of_birth')}</Text>
              <View style={[styles.modernInputContainer, { borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)', backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
                <TouchableOpacity onPress={showDatePickerModal} style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[styles.modernInput, { color: formData.birth_date ? colors.textPrimary : colors.textTertiary }]}>
                    {formData.birth_date || 'Select Date'}
                  </Text>
                  <Feather name="calendar" size={16} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={[styles.formSection, styles.halfWidth]}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>{t('password')}</Text>
              <View style={[styles.modernInputContainer, { borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)', backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
                <TextInput 
                  style={[styles.modernInput, { color: colors.textPrimary }]} 
                  placeholder="Password" 
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry 
                  value={formData.password} 
                  onChangeText={(text) => handleInputChange('password', text)} 
                />
              </View>
            </View>
          </View>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <DateTimePicker
            value={formData.birth_date ? new Date(formData.birth_date) : new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
          {/* Religion & Caste */}
          <View style={styles.row}>
            <View style={[styles.formSection, styles.halfWidth]}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>{t('religion')}</Text>
              <View style={[styles.modernInputContainer, { borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)', backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
                <Picker
                  selectedValue={formData.religion}
                  style={[styles.modernInput, { color: colors.textPrimary }]}
                  onValueChange={(itemValue) => handleInputChange('religion', itemValue)}
                >
                  <Picker.Item label="Select Religion" value="" />
                  {religions.map((religion:any) => (
                    <Picker.Item key={religion.id} label={religion.name} value={religion.id} />
                  ))}
                </Picker>
              </View>
            </View>
            
            <View style={[styles.formSection, styles.halfWidth]}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>{t('caste')}</Text>
              <View style={[styles.modernInputContainer, { borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)', backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
                <Picker
                  selectedValue={formData.caste}
                  style={[styles.modernInput, { color: colors.textPrimary }]}
                  onValueChange={(itemValue) => handleInputChange('caste', itemValue)}
                  enabled={!!formData.religion}
                >
                  <Picker.Item label={formData.religion ? "Select Caste" : "Select Religion First"} value="" />
                  {castes.map((caste: any) => (
                    <Picker.Item key={caste.id} label={caste.name} value={caste.name} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* Terms & Conditions */}
          <TouchableOpacity style={styles.checkboxContainer} onPress={() => handleInputChange('agree', !formData.agree)}>
            <Feather name={formData.agree ? 'check-square' : 'square'} size={24} color="#DC2626" />
            <Text style={[styles.checkboxLabel, { color: colors.textSecondary }]}>I agree with <Text style={styles.link}>Privacy Policy</Text>, <Text style={styles.link}>Terms of Service</Text>, <Text style={styles.link}>Purchase Policy</Text></Text>
          </TouchableOpacity>

          {/* Register Button */}
          <TouchableOpacity style={[styles.registerButton, loading && styles.disabledButton]} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>{t('signup')}</Text>
            )}
          </TouchableOpacity>

          {/* Social Signup */}
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

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: colors.textSecondary }]}>{t('have_account')}{' '}</Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.loginLink}>{t('sign_in')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  container: {
    flexGrow: 1,
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
  // Right Side Toggle Buttons - Horizontal
  rightToggleButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
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

  // Modern Header Styles
  modernHeader: {
    width: '100%',
    height: 200,
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
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Form Container
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
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  halfWidth: {
    width: '48%',
  },
  pickerContainer: {
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    minHeight: 50,
    borderWidth: 1,
  },
  pickerLabel: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: -5,
    fontWeight: '600',
  },
  picker: {
    height: 40,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  
  // Social Buttons
  socialContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  socialLabel: {
    fontSize: 12,
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
  
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    height: 50,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 14,
  },
  link: {
    color: '#DC2626',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  registerButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#DC2626',
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 16,
  },
  loginLink: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: 'bold',
    marginLeft: 4,
  },
});
