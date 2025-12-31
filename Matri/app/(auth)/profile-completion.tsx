import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  TextInputProps,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { apiService } from '../../services/api';
import { Colors } from '../../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

// Smoking Habits options
const smokingHabits = [
  { id: 'yes', name: 'Yes' },
  { id: 'no', name: 'No' },
  { id: 'occasionally', name: 'Occasionally' }
];

// Drinking Habits options
const drinkingHabits = [
  { id: 'yes', name: 'Yes' },
  { id: 'no', name: 'No' },
  { id: 'occasionally', name: 'Occasionally' }
];

// Height options (in feet)
const heights = [
  { id: '4.6', name: '4\'6"' },
  { id: '4.7', name: '4\'7"' },
  { id: '4.8', name: '4\'8"' },
  { id: '4.9', name: '4\'9"' },
  { id: '4.10', name: '4\'10"' },
  { id: '4.11', name: '4\'11"' },
  { id: '5.0', name: '5\'0"' },
  { id: '5.1', name: '5\'1"' },
  { id: '5.2', name: '5\'2"' },
  { id: '5.3', name: '5\'3"' },
  { id: '5.4', name: '5\'4"' },
  { id: '5.5', name: '5\'5"' },
  { id: '5.6', name: '5\'6"' },
  { id: '5.7', name: '5\'7"' },
  { id: '5.8', name: '5\'8"' },
  { id: '5.9', name: '5\'9"' },
  { id: '5.10', name: '5\'10"' },
  { id: '5.11', name: '5\'11"' },
  { id: '6.0', name: '6\'0"' },
  { id: '6.1', name: '6\'1"' },
  { id: '6.2', name: '6\'2"' },
  { id: '6.3', name: '6\'3"' },
  { id: '6.4', name: '6\'4"' },
  { id: '6.5', name: '6\'5"' },
  { id: '6.6', name: '6\'6"' }
];

// Weight options (in kg)
const weights = Array.from({ length: 81 }, (_, i) => ({
  id: String(40 + i),
  name: `${40 + i} kg`
}));

// Complexion options
const complexions = [
  { id: 'fair', name: 'Fair', color: '#F5DEB3' },
  { id: 'wheatish', name: 'Wheatish', color: '#D2B48C' },
  { id: 'brown', name: 'Brown', color: '#8B6914' },
  { id: 'dark', name: 'Dark', color: '#3D2817' }
];

// Eye Color options
const eyeColors = [
  { id: 'black', name: 'Black', color: '#000000' },
  { id: 'brown', name: 'Brown', color: '#8B4513' },
  { id: 'hazel', name: 'Hazel', color: '#8B7355' },
  { id: 'green', name: 'Green', color: '#228B22' },
  { id: 'blue', name: 'Blue', color: '#4169E1' },
  { id: 'gray', name: 'Gray', color: '#808080' }
];

// Hair Color options
const hairColors = [
  { id: 'black', name: 'Black', color: '#000000' },
  { id: 'brown', name: 'Brown', color: '#8B4513' },
  { id: 'blonde', name: 'Blonde', color: '#FFD700' },
  { id: 'red', name: 'Red', color: '#DC143C' },
  { id: 'gray', name: 'Gray', color: '#808080' },
  { id: 'white', name: 'White', color: '#FFFFFF' }
];

type Step = 1 | 2 | 3 | 4 | 5 | 6;

type FormInputProps = TextInputProps & {
  label: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
  containerStyle?: object;
  fieldName?: string;
  formData?: any;
  onFieldChange?: (field: string, value: string) => void;
};

const FormInput = ({ label, icon, containerStyle, fieldName, formData, onFieldChange, ...props }: FormInputProps) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.inputContainer, containerStyle]}>
      <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>
        {icon && <Feather name={icon} size={18} color={colors.textSecondary} style={styles.inputIcon} />}
        <TextInput 
          style={[styles.input, { color: colors.textPrimary }]} 
          value={fieldName ? formData?.[fieldName] || '' : ''}
          onChangeText={(value) => fieldName && onFieldChange ? onFieldChange(fieldName, value) : undefined}
          placeholderTextColor={colors.inputPlaceholder}
          {...props} 
        />
      </View>
    </View>
  );
};

export default function ProfileCompletionScreen() {
  const [religionOptions, setReligionOptions] = useState<{id:string;name:string}[]>([]);
  const [maritalStatusOptions, setMaritalStatusOptions] = useState<{id:string;name:string}[]>([]);
  const getReligionName = (rid:string)=> religionOptions.find(r=>r.id===rid)?.name || rid;
  const router = useRouter();
  const auth = useAuth();
  const params = useLocalSearchParams();
  
  const [formData, setFormData] = useState({
    // ------ Step 1 required only (web parity) ------
    birth_date: '',          // YYYY-MM-DD
    religion_id: '',         // numeric id
    gender: '',              // m / f
    looking_for: '',         // 1 = Bridegroom, 2 = Bride
    marital_status: '',      // string title matching table

    dateOfBirth: '',
    religion: '',
    gender: '',
    profession: '',
    annualIncome: '',
    smokingHabits: '',
    drinkingHabits: '',
    maritalStatus: '',
    caste: '',
    spokenLanguages: '',
    presentCountry: '',
    presentState: '',
    presentCity: '',
    presentZipCode: '',
    
    // Step 2: Physical Attributes
    height: '',
    weight: '',
    bloodGroup: '',
    eyeColor: '',
    hairColor: '',
    complexion: '',
    disability: '',
    
    // Step 3: Family Information
    fatherName: '',
    fatherProfession: '',
    fatherContact: '',
    motherName: '',
    motherProfession: '',
    motherContact: '',
    numberOfBrothers: '',
    numberOfSisters: '',
    
    // Step 4: Partner Expectation
    partnerGeneralRequirement: '',
    partnerCountry: '',
    partnerMinAge: '',
    partnerMaxAge: '',
    partnerMinHeight: '',
    partnerMaxHeight: '',
    partnerMaritalStatus: '',
    partnerReligion: '',
    partnerComplexion: '',
    partnerSmokingHabits: '',
    partnerDrinkingHabits: '',
    partnerSpokenLanguages: '',
    partnerEducation: '',
    partnerProfession: '',
    partnerFinancialCondition: '',
    partnerFamilyValues: '',

    // Step 5: Career Information
    company: '',
    designation: '',
    careerStartYear: '',
    careerEndYear: '',

    // Step 6: Education Information
    institute: '',
    degree: '',
    fieldOfStudy: '',
    educationStartYear: '',
    educationEndYear: '',
  });

  // Multi-entry arrays
  type EducationRecord = { institute: string; degree: string; fieldOfStudy: string; start: string; end: string };
  type CareerRecord = { company: string; designation: string; start: string; end: string };

  const [educationList, setEducationList] = useState<EducationRecord[]>([{ institute: '', degree: '', fieldOfStudy: '', start: '', end: '' }]);
  const [careerList, setCareerList] = useState<CareerRecord[]>([{ company: '', designation: '', start: '', end: '' }]);

  // Helpers
  const addEducation = () => setEducationList(prev => [...prev, { institute:'', degree:'', fieldOfStudy:'', start:'', end:'' }]);
  const updateEducation = (index:number, field:keyof EducationRecord, value:string) => {
    setEducationList(prev=> prev.map((rec,i)=> i===index ? { ...rec, [field]: value } as EducationRecord : rec));
  };
  const deleteEducation = (index:number) => setEducationList(prev => prev.filter((_,i)=> i !== index));
  const addCareer = () => setCareerList(prev => [...prev, { company:'', designation:'', start:'', end:'' }]);
  const updateCareer = (index:number, field:keyof CareerRecord, value:string) => {
    setCareerList(prev=> prev.map((rec,i)=> i===index ? { ...rec, [field]: value } as CareerRecord : rec));
  };
  const deleteCareer = (index:number) => setCareerList(prev => prev.filter((_,i)=> i !== index));

  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  useEffect(() => {
    // fetch dropdown options once
    const fetchDropdowns = async () => {
      try {
        const res = await apiService.getDropdownOptions(); // expects { religions:[], maritalStatuses:[] }
        if(res.status==='success'){
          setReligionOptions(res.data.religions || []);
          setMaritalStatusOptions(res.data.maritalStatuses || []);
        }
      } catch(err){ console.error('dropdown fetch err', err);}
    }
    fetchDropdowns();
    // Pre-fill from registration data if available
    if (params.registrationData) {
      try {
        const regData = JSON.parse(params.registrationData as string);
        console.log('📋 Registration data received:', regData);
        
        setFormData(prev => ({
          ...prev,
          dateOfBirth: regData.birth_date || prev.dateOfBirth,
          religion: regData.religion || prev.religion,
          caste: regData.caste || prev.caste,
          // Auto-detect gender from looking_for (1 = Bridegroom/Male, 2 = Bride/Female)
          gender: regData.looking_for === '1' ? 'male' : regData.looking_for === '2' ? 'female' : prev.gender,
        }));
      } catch (error) {
        console.error('Error parsing registration data:', error);
      }
    }
    
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setDataLoading(true);
      console.log('📊 Fetching existing profile data...');
      
      // First, set basic user data from auth context
      const user = auth?.user;
      if (user) {
        setFormData(prev => ({
          ...prev,
        }));
      }

      // Then fetch complete profile data from API
      const response = await apiService.getUserInfo();
      console.log('👤 Complete profile response:', response);
      
      if (response && response.status === 'success' && response.data) {
        // Backend returns data.user, so extract it
        const profileData = response.data.user || response.data;
        
        setFormData(prev => ({
          ...prev,
          // Basic Information
          dateOfBirth: profileData.dateOfBirth || profileData.date_of_birth || '',
          religion: profileData.religion || '',
          gender: profileData.gender || '',
          profession: profileData.profession || '',
          smokingHabits: profileData.smokingHabits || profileData.smoking_habits || '',
          drinkingHabits: profileData.drinkingHabits || profileData.drinking_habits || '',
          maritalStatus: profileData.maritalStatus || profileData.marital_status || '',
          caste: profileData.caste || '',
          spokenLanguages: profileData.spokenLanguages || profileData.spoken_languages || '',
          presentCountry: profileData.presentCountry || profileData.present_country || '',
          presentState: profileData.presentState || profileData.present_state || '',
          presentCity: profileData.presentCity || profileData.present_city || '',
          presentZipCode: profileData.presentZipCode || profileData.present_zip_code || '',
          // Physical Attributes
          height: profileData.height || '',
          weight: profileData.weight || '',
          bloodGroup: profileData.bloodGroup || profileData.blood_group || '',
          eyeColor: profileData.eyeColor || profileData.eye_color || '',
          hairColor: profileData.hairColor || profileData.hair_color || '',
          complexion: profileData.complexion || '',
          disability: profileData.disability || '',
          // Family Information
          fatherName: profileData.fatherName || profileData.father_name || '',
          fatherProfession: profileData.fatherProfession || profileData.father_profession || '',
          fatherContact: profileData.fatherContact || profileData.father_contact || '',
          motherName: profileData.motherName || profileData.mother_name || '',
          motherProfession: profileData.motherProfession || profileData.mother_profession || '',
          motherContact: profileData.motherContact || profileData.mother_contact || '',
          numberOfBrothers: profileData.numberOfBrothers || '',
          numberOfSisters: profileData.numberOfSisters || '',
          // Partner Expectations
          partnerGeneralRequirement: profileData.partnerGeneralRequirement || '',
          partnerCountry: profileData.partnerCountry || '',
          partnerMinAge: profileData.partnerMinAge || '',
          partnerMaxAge: profileData.partnerMaxAge || '',
          partnerMinHeight: profileData.partnerMinHeight || '',
          partnerMaxHeight: profileData.partnerMaxHeight || '',
          partnerMaritalStatus: profileData.partnerMaritalStatus || '',
          partnerReligion: profileData.partnerReligion || '',
          partnerComplexion: profileData.partnerComplexion || '',
          partnerSmokingHabits: profileData.partnerSmokingHabits || '',
          partnerDrinkingHabits: profileData.partnerDrinkingHabits || '',
          partnerSpokenLanguages: profileData.partnerSpokenLanguages || '',
          partnerEducation: profileData.partnerEducation || '',
          partnerProfession: profileData.partnerProfession || '',
          partnerFinancialCondition: profileData.partnerFinancialCondition || '',
          partnerFamilyValues: profileData.partnerFamilyValues || '',
          // Career Information
          company: profileData.company || '',
          designation: profileData.designation || '',
          careerStartYear: profileData.careerStartYear || '',
          careerEndYear: profileData.careerEndYear || '',
          // Education Information
          institute: profileData.institute || '',
          degree: profileData.degree || '',
          fieldOfStudy: profileData.fieldOfStudy || profileData.field_of_study || '',
          educationStartYear: profileData.educationStartYear || '',
          educationEndYear: profileData.educationEndYear || '',
        }));

        // --- Prefill multi-entry arrays ---
        if (Array.isArray(profileData.educations) && profileData.educations.length) {
          const mappedEdu = profileData.educations.map((e:any)=>({
            institute: e.institute || '',
            degree: e.degree || '',
            fieldOfStudy: e.field_of_study || '',
            start: e.start || '',
            end: e.end || '',
          }));
          setEducationList(mappedEdu);
        }
        if (Array.isArray(profileData.careers) && profileData.careers.length) {
          const mappedCareer = profileData.careers.map((c:any)=>({
            company: c.company || '',
            designation: c.designation || '',
            start: c.start || '',
            end: c.end || '',
          }));
          setCareerList(mappedCareer);
        }
      }
    } catch (error) {
      console.error('💥 Error fetching profile data:', error);
    } finally {
      setDataLoading(false);
    }
  };


  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep((currentStep + 1) as Step);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleSkip = () => {
    setShowSkipConfirm(true);
  };

  const handleConfirmSkip = async () => {
    setShowSkipConfirm(false);
    setLoading(true);
    try {
      // Save minimal basic info before skipping
      const basicData = {
        dateOfBirth: formData.dateOfBirth,
        religion: formData.religion,
        gender: formData.gender,
      };
      
      console.log('💾 Saving basic profile before skip:', basicData);
      const response = await apiService.updateProfile(basicData);
      
      if (response.status === 'success') {
        console.log('✅ Basic profile saved successfully before skip');
      }
    } catch (error) {
      console.error('⚠️ Error saving basic profile before skip:', error);
      // Still navigate even if save fails
    } finally {
      setLoading(false);
      // Navigate to index page
      router.replace('/(tabs)/index');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      console.log('📤 Submitting profile completion data for step:', currentStep);
      
      // Prepare step data based on current step
      let stepData: any = {};
      
      switch (currentStep) {
        case 1:
          // Basic Information
          stepData = {
            birth_date: formData.dateOfBirth,
            gender: formData.gender,
            religion_id: formData.religion,
            caste: formData.caste,
            profession: formData.profession,
            smokingHabits: formData.smokingHabits,
            drinkingHabits: formData.drinkingHabits,
            maritalStatus: formData.maritalStatus,
            spokenLanguages: formData.spokenLanguages,
            presentCountry: formData.presentCountry,
            presentState: formData.presentState,
            presentCity: formData.presentCity,
            presentZipCode: formData.presentZipCode,
          };
          break;
        case 2:
          // Family Information
          stepData = {
            fatherName: formData.fatherName,
            fatherProfession: formData.fatherProfession,
            fatherContact: formData.fatherContact,
            motherName: formData.motherName,
            motherProfession: formData.motherProfession,
            motherContact: formData.motherContact,
            numberOfBrothers: formData.numberOfBrothers,
            numberOfSisters: formData.numberOfSisters,
          };
          break;
        case 3:
          // Education Information
          stepData = {
            institute: educationList.map(e=>e.institute),
            degree: educationList.map(e=>e.degree),
            field_of_study: educationList.map(e=>e.fieldOfStudy),
            start: educationList.map(e=>e.start),
            end: educationList.map(e=>e.end),
          };
          break;
        case 4:
          // Career Information
          stepData = {
            company: careerList.map(c=>c.company),
            designation: careerList.map(c=>c.designation),
            start: careerList.map(c=>c.start),
            end: careerList.map(c=>c.end),
          };
          break;
        case 5:
          // Physical Attributes
          stepData = {
            height: formData.height,
            weight: formData.weight,
            bloodGroup: formData.bloodGroup,
            eyeColor: formData.eyeColor,
            hairColor: formData.hairColor,
            complexion: formData.complexion,
            disability: formData.disability,
          };
          break;
        case 6:
          // Partner Expectation
          stepData = {
            partnerGeneralRequirement: formData.partnerGeneralRequirement,
            partnerCountry: formData.partnerCountry,
            partnerMinAge: formData.partnerMinAge,
            partnerMaxAge: formData.partnerMaxAge,
            partnerMinHeight: formData.partnerMinHeight,
            partnerMaxHeight: formData.partnerMaxHeight,
            partnerMaritalStatus: formData.partnerMaritalStatus,
            partnerReligion: formData.partnerReligion,
            partnerComplexion: formData.partnerComplexion,
            partnerSmokingHabits: formData.partnerSmokingHabits,
            partnerDrinkingHabits: formData.partnerDrinkingHabits,
            partnerSpokenLanguages: formData.partnerSpokenLanguages,
            partnerEducation: formData.partnerEducation,
            partnerProfession: formData.partnerProfession,
            partnerFinancialCondition: formData.partnerFinancialCondition,
            partnerFamilyValues: formData.partnerFamilyValues,
          };
          break;
      }
      
      // Log payload then submit the current step
      console.log('📦 Payload for step', currentStep, stepData);
      // Submit the current step
      const response = await apiService.submitProfileStep(currentStep, stepData);
      
      console.log('✅ Step submission response:', response);
      
      if (response.status === 'success') {
        if (currentStep < 6) {
          // Move to next step
          setCurrentStep((currentStep + 1) as Step);
        } else {
          // All steps completed
          Alert.alert('Success', 'Profile completed successfully!');
          router.replace('/(tabs)/index');
        }
      } else {
        Alert.alert('Error', response.message?.error?.[0] || 'Failed to submit step. Please try again.');
      }
    } catch (error: any) {
      console.error('❌ Error submitting profile step:', error);
      Alert.alert('Error', error.message || 'Failed to submit step. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Basic Information</Text>
            <Text style={styles.stepDescription}>Complete your basic details</Text>
            
            {/* Pre-filled from registration - Read Only */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date of Birth * (from registration)</Text>
              <View style={styles.inputWrapper}>
                <Feather name="calendar" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                <Text style={styles.input}>
                  {formData.dateOfBirth || 'Not provided'}
                </Text>
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Religion * (from registration)</Text>
              <View style={styles.inputWrapper}>
                <Feather name="moon" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                <Text style={styles.input}>
                  {formData.religion ? getReligionName(formData.religion) : 'Not provided'}
                </Text>
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Gender * (auto-detected)</Text>
              <View style={styles.inputWrapper}>
                <Feather name="user" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                <Text style={styles.input}>
                  {formData.gender || 'Not detected'}
                </Text>
              </View>
            </View>
            <FormInput 
              label="Profession *" 
              placeholder="Your Profession" 
              icon="briefcase"
              fieldName="profession"
              formData={formData}
              onFieldChange={handleInputChange}
            />
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Smoking Habits</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.smokingHabits}
                    onValueChange={(value) => handleInputChange('smokingHabits', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select" value="" />
                    {smokingHabits.map((habit) => (
                      <Picker.Item key={habit.id} label={habit.name} value={habit.id} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>Drinking Status</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.drinkingHabits}
                    onValueChange={(value) => handleInputChange('drinkingHabits', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select" value="" />
                    {drinkingHabits.map((habit) => (
                      <Picker.Item key={habit.id} label={habit.name} value={habit.id} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Marital Status *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.maritalStatus}
                  onValueChange={(value) => handleInputChange('maritalStatus', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Marital Status" value="" />
                  {maritalStatusOptions.map((status) => (
                    <Picker.Item key={status.id} label={status.name} value={status.id} />
                  ))}
                </Picker>
              </View>
            </View>
            <FormInput 
              label="Caste" 
              placeholder="Your Caste" 
              icon="users"
              fieldName="caste"
              formData={formData}
              onFieldChange={handleInputChange}
            />
            <FormInput 
              label="Spoken Languages *" 
              placeholder="e.g., English, Tamil" 
              icon="globe"
              fieldName="spokenLanguages"
              formData={formData}
              onFieldChange={handleInputChange}
            />
            
            
            <Text style={styles.subHeader}>Present Address</Text>
            <FormInput 
              label="Country *" 
              placeholder="Select Country" 
              icon="map-pin"
              fieldName="presentCountry"
              formData={formData}
              onFieldChange={handleInputChange}
            />
            <View style={styles.row}>
              <FormInput 
                label="State" 
                placeholder="Your State" 
                icon="map" 
                containerStyle={styles.halfWidth}
                fieldName="presentState"
                formData={formData}
                onFieldChange={handleInputChange}
              />
              <FormInput 
                label="City *" 
                placeholder="Your City" 
                icon="map" 
                containerStyle={styles.halfWidth}
                fieldName="presentCity"
                formData={formData}
                onFieldChange={handleInputChange}
              />
            </View>
            <FormInput 
              label="Zip Code" 
              placeholder="Your Zip Code" 
              icon="hash"
              fieldName="presentZipCode"
              formData={formData}
              onFieldChange={handleInputChange}
            />
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Physical Attributes</Text>
            <Text style={styles.stepDescription}>Tell us about your physical characteristics</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Height *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.height}
                  onValueChange={(value) => handleInputChange('height', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Height" value="" />
                  {heights.map((h) => (
                    <Picker.Item key={h.id} label={h.name} value={h.id} />
                  ))}
                </Picker>
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Weight *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.weight}
                  onValueChange={(value) => handleInputChange('weight', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Weight" value="" />
                  {weights.map((w) => (
                    <Picker.Item key={w.id} label={w.name} value={w.id} />
                  ))}
                </Picker>
              </View>
            </View>
            
            <FormInput label="Blood Group *" placeholder="Select Blood Group" icon="droplet" fieldName="bloodGroup" formData={formData} onFieldChange={handleInputChange} />
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Complexion *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.complexion}
                  onValueChange={(value) => handleInputChange('complexion', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Complexion" value="" />
                  {complexions.map((c) => (
                    <Picker.Item key={c.id} label={c.name} value={c.id} />
                  ))}
                </Picker>
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Eye Color *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.eyeColor}
                  onValueChange={(value) => handleInputChange('eyeColor', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Eye Color" value="" />
                  {eyeColors.map((e) => (
                    <Picker.Item key={e.id} label={e.name} value={e.id} />
                  ))}
                </Picker>
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Hair Color *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.hairColor}
                  onValueChange={(value) => handleInputChange('hairColor', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Hair Color" value="" />
                  {hairColors.map((h) => (
                    <Picker.Item key={h.id} label={h.name} value={h.id} />
                  ))}
                </Picker>
              </View>
            </View>
            
            <FormInput label="Disability" placeholder="If any" icon="alert-circle" fieldName="disability" formData={formData} onFieldChange={handleInputChange} />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Family Information</Text>
            <Text style={styles.stepDescription}>Tell us about your family</Text>
            
            <FormInput label="Father's Name *" placeholder="Father's Name" icon="user" fieldName="fatherName" formData={formData} onFieldChange={handleInputChange} />
            <FormInput label="Father's Profession" placeholder="Father's Profession" icon="briefcase" fieldName="fatherProfession" formData={formData} onFieldChange={handleInputChange} />
            <FormInput label="Father's Contact" placeholder="Father's Contact" icon="phone" fieldName="fatherContact" formData={formData} onFieldChange={handleInputChange} />
            <FormInput label="Mother's Name *" placeholder="Mother's Name" icon="user" fieldName="motherName" formData={formData} onFieldChange={handleInputChange} />
            <FormInput label="Mother's Profession" placeholder="Mother's Profession" icon="briefcase" fieldName="motherProfession" formData={formData} onFieldChange={handleInputChange} />
            <FormInput label="Mother's Contact" placeholder="Mother's Contact" icon="phone" fieldName="motherContact" formData={formData} onFieldChange={handleInputChange} />
            <View style={styles.row}>
              <FormInput label="No. of Brothers" placeholder="e.g., 1" icon="users" containerStyle={styles.halfWidth} fieldName="numberOfBrothers" formData={formData} onFieldChange={handleInputChange} />
              <FormInput label="No. of Sisters" placeholder="e.g., 1" icon="users" containerStyle={styles.halfWidth} fieldName="numberOfSisters" formData={formData} onFieldChange={handleInputChange} />
            </View>
          </View>
        );

      case 6:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Partner Expectation</Text>
            <Text style={styles.stepDescription}>What are you looking for?</Text>
            
            <FormInput label="General Requirement" placeholder="e.g., Educated, Family-oriented" icon="file-text" fieldName="partnerGeneralRequirement" formData={formData} onFieldChange={handleInputChange} />
            <FormInput label="Country" placeholder="Select Country" icon="map-pin" fieldName="partnerCountry" formData={formData} onFieldChange={handleInputChange} />
            <View style={styles.row}>
              <FormInput label="Min Age" placeholder="e.g., 25" icon="user" containerStyle={styles.halfWidth} fieldName="partnerMinAge" formData={formData} onFieldChange={handleInputChange} />
              <FormInput label="Max Age" placeholder="e.g., 30" icon="user" containerStyle={styles.halfWidth} fieldName="partnerMaxAge" formData={formData} onFieldChange={handleInputChange} />
            </View>
            <View style={styles.row}>
              <FormInput label="Min Height" placeholder="e.g., 5.5" icon="trending-up" containerStyle={styles.halfWidth} fieldName="partnerMinHeight" formData={formData} onFieldChange={handleInputChange} />
              <FormInput label="Max Height" placeholder="e.g., 6.0" icon="trending-up" containerStyle={styles.halfWidth} fieldName="partnerMaxHeight" formData={formData} onFieldChange={handleInputChange} />
            </View>
            <FormInput label="Marital Status" placeholder="Select Marital Status" icon="heart" fieldName="partnerMaritalStatus" formData={formData} onFieldChange={handleInputChange} />
            <FormInput label="Religion" placeholder="Select Religion" icon="moon" fieldName="partnerReligion" formData={formData} onFieldChange={handleInputChange} />
            <FormInput label="Complexion" placeholder="e.g., Fair, Wheatish" icon="sun" fieldName="partnerComplexion" formData={formData} onFieldChange={handleInputChange} />
            <View style={styles.row}>
              <FormInput label="Smoking Habits" placeholder="Select" icon="wind" containerStyle={styles.halfWidth} fieldName="partnerSmokingHabits" formData={formData} onFieldChange={handleInputChange} />
              <FormInput label="Drinking Habits" placeholder="Select" icon="droplet" containerStyle={styles.halfWidth} fieldName="partnerDrinkingHabits" formData={formData} onFieldChange={handleInputChange} />
            </View>
            <FormInput label="Spoken Languages" placeholder="e.g., English, Tamil" icon="globe" fieldName="partnerSpokenLanguages" formData={formData} onFieldChange={handleInputChange} />
            <FormInput label="Education" placeholder="e.g., Masters" icon="book-open" fieldName="partnerEducation" formData={formData} onFieldChange={handleInputChange} />
            <FormInput label="Profession" placeholder="e.g., Doctor, Engineer" icon="briefcase" fieldName="partnerProfession" formData={formData} onFieldChange={handleInputChange} />
            <FormInput label="Financial Condition" placeholder="e.g., Well Settled" icon="dollar-sign" fieldName="partnerFinancialCondition" formData={formData} onFieldChange={handleInputChange} />
            <FormInput label="Family Values" placeholder="e.g., Modern, Traditional" icon="home" fieldName="partnerFamilyValues" formData={formData} onFieldChange={handleInputChange} />
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Career Information</Text>
            <Text style={styles.stepDescription}>Add your career history (multiple allowed)</Text>
            {careerList.map((job, idx)=>(
              <View key={idx} style={{ marginBottom:20 }}>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                <Text style={[styles.subHeader, { color: colors.textPrimary }]}>Position #{idx+1}</Text>
                {careerList.length>1 && (
                  <TouchableOpacity onPress={()=>deleteCareer(idx)}>
                    <Feather name="x" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
                <FormInput label="Company *" placeholder="Company" icon="briefcase" value={job.company} onChangeText={val=>updateCareer(idx,'company',val)} />
                <FormInput label="Designation *" placeholder="Designation" icon="award" value={job.designation} onChangeText={val=>updateCareer(idx,'designation',val)} />
                <View style={styles.row}>
                  <FormInput label="Start Year" placeholder="2020" icon="calendar" containerStyle={styles.halfWidth} value={job.start} onChangeText={val=>updateCareer(idx,'start',val)} />
                  <FormInput label="End Year" placeholder="Present" icon="calendar" containerStyle={styles.halfWidth} value={job.end} onChangeText={val=>updateCareer(idx,'end',val)} />
                </View>
              </View>
            ))}
            <TouchableOpacity onPress={addCareer} style={[styles.button, styles.secondaryButton, { alignSelf:'flex-start', backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}> 
              <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>+ Add another career</Text>
            </TouchableOpacity>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Education Information</Text>
            <Text style={styles.stepDescription}>Add your education details (multiple allowed)</Text>

            {educationList.map((edu, idx) => (
              <View key={idx} style={{ marginBottom: 20 }}>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                <Text style={[styles.subHeader, { color: colors.textPrimary }]}>Education #{idx + 1}</Text>
                {educationList.length>1 && (
                  <TouchableOpacity onPress={()=>deleteEducation(idx)}>
                    <Feather name="x" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
                <FormInput label="Institute *" placeholder="Institute Name" icon="book-open" value={edu.institute} onChangeText={val=>updateEducation(idx,'institute',val)} />
                <FormInput label="Degree *" placeholder="e.g., B.Tech" icon="award" value={edu.degree} onChangeText={val=>updateEducation(idx,'degree',val)} />
                <FormInput label="Field of Study" placeholder="e.g., Computer Science" icon="edit-3" value={edu.fieldOfStudy} onChangeText={val=>updateEducation(idx,'fieldOfStudy',val)} />
                <View style={styles.row}>
                  <FormInput label="Start Year" placeholder="2016" icon="calendar" containerStyle={styles.halfWidth} value={edu.start} onChangeText={val=>updateEducation(idx,'start',val)} />
                  <FormInput label="End Year" placeholder="2020" icon="calendar" containerStyle={styles.halfWidth} value={edu.end} onChangeText={val=>updateEducation(idx,'end',val)} />
                </View>
              </View>
            ))}
            <TouchableOpacity onPress={addEducation} style={[styles.button, styles.secondaryButton, { alignSelf:'flex-start', backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}> 
              <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>+ Add another education</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} style={{ backgroundColor: colors.background }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Complete Your Profile</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Step {currentStep} of 6</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <View key={step} style={[styles.progressBar, { backgroundColor: colors.divider }, step <= currentStep && { backgroundColor: colors.primary }]} />
          ))}
        </View>

        {/* Step Content */}
        {renderStep()}

        {/* Skip Confirmation Modal */}
        <Modal
          visible={showSkipConfirm}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSkipConfirm(false)}
        >
          <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
            <View style={[styles.modalContent, { backgroundColor: colors.surfaceLight }]}>
              <MaterialCommunityIcons name="alert-circle" size={50} color={colors.primary} />
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Skip Profile Completion?</Text>
              <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
                You can complete your profile later. Your account is ready to use!
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}
                  onPress={() => setShowSkipConfirm(false)}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.textPrimary }]}>Continue</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton, { backgroundColor: colors.primary }]}
                  onPress={handleConfirmSkip}
                >
                  <Text style={styles.confirmButtonText}>Skip</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}
              onPress={handlePrevious}
              disabled={loading}
            >
              <Feather name="arrow-left" size={20} color={colors.primary} />
              <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>Previous</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.primaryButton, { flex: currentStep === 1 ? 1 : 0.5, backgroundColor: colors.primary }]}
            onPress={handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>
                  {currentStep === 6 ? 'Complete' : 'Next'}
                </Text>
                <Feather name="arrow-right" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Skip Button */}
        <TouchableOpacity
          style={[styles.skipButton, { borderColor: colors.divider }]}
          onPress={handleSkip}
          disabled={loading}
        >
          <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 30,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressBarActive: {
    backgroundColor: Colors.light.tint,
  },
  stepContent: {
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: Colors.light.tint,
    flex: 1,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: Colors.light.tint,
    flex: 0.4,
  },
  secondaryButtonText: {
    color: Colors.light.tint,
    fontSize: 14,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: width - 40,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: Colors.light.tint,
  },
  cancelButtonText: {
    color: Colors.light.tint,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: Colors.light.tint,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
  },
  inputIcon: {
    marginRight: 8,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#1F2937',
  },
});
