import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, TextInputProps, Image, Alert, ActivityIndicator, StatusBar, Modal, FlatList, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiService, premiumUtils } from '../services/api';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../constants/Colors';
import UniversalHeader from '../components/UniversalHeader';

type AccordionItemProps = {
  title: string;
  children: React.ReactNode;
  icon: React.ComponentProps<typeof Feather>['name'];
};

const AccordionItem = ({ title, children, icon }: AccordionItemProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const { colors } = useTheme();

  return (
    <View style={[styles.accordionContainer, { backgroundColor: colors.surfaceLight }]}>
      <TouchableOpacity onPress={() => setIsOpen(!isOpen)} style={[styles.accordionHeader, { borderBottomColor: colors.divider }]}>
        <View style={styles.accordionTitleContainer}>
          <Feather name={icon} size={20} color={colors.primary} style={styles.accordionIcon} />
          <Text style={[styles.accordionTitle, { color: colors.textPrimary }]}>{title}</Text>
        </View>
        <Feather name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color={colors.primary} />
      </TouchableOpacity>
      {isOpen && <View style={styles.accordionContent}>{children}</View>}
    </View>
  );
};


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

type SelectableInputProps = {
  label: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
  containerStyle?: object;
  fieldName: string;
  formData: any;
  onFieldChange: (field: string, value: string) => void;
  options: string[];
};

const SelectableInput = ({ label, icon, containerStyle, fieldName, formData, onFieldChange, options }: SelectableInputProps) => {
  const [showModal, setShowModal] = useState(false);
  const { colors } = useTheme();

  return (
    <>
      <View style={[styles.inputContainer, containerStyle]}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
        <TouchableOpacity 
          style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}
          onPress={() => setShowModal(true)}
        >
          {icon && <Feather name={icon} size={18} color={colors.textSecondary} style={styles.inputIcon} />}
          <Text style={[styles.input, { color: formData?.[fieldName] ? colors.textPrimary : colors.inputPlaceholder }]}>
            {formData?.[fieldName] || 'Select option'}
          </Text>
          <Feather name="chevron-down" size={18} color={colors.textSecondary} style={{ marginRight: 10 }} />
        </TouchableOpacity>
      </View>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surfaceLight }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.divider }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{label}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Feather name="x" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalOption, { borderBottomColor: colors.divider }]}
                  onPress={() => {
                    onFieldChange(fieldName, item);
                    setShowModal(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, { color: colors.textPrimary }, formData?.[fieldName] === item && [styles.modalOptionSelected, { color: colors.primary }]]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

// Interfaces for career and education items
interface CareerItem {
  id: string;
  company: string;
  designation: string;
  startYear: string;
  endYear: string;
}

interface EducationItem {
  id: string;
  institute: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
}

export default function ProfileSettingScreen() {
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user;
  
  // State for careers and educations
  const [careers, setCareers] = useState<CareerItem[]>([]);
  const [educations, setEducations] = useState<EducationItem[]>([]);
  const [isAddingCareer, setIsAddingCareer] = useState(false);
  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [newCareer, setNewCareer] = useState<Omit<CareerItem, 'id'>>({ 
    company: '', 
    designation: '', 
    startYear: '', 
    endYear: '' 
  });
  const [newEducation, setNewEducation] = useState<Omit<EducationItem, 'id'>>({ 
    institute: '', 
    degree: '', 
    fieldOfStudy: '', 
    startYear: '', 
    endYear: '' 
  });

  // State for each section
  // Basic Information
  const [basicInfo, setBasicInfo] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    image: '',
    profile_id: '',
    id: '',
    dateOfBirth: '',
    religion: '',
    gender: '',
    profession: '',
    motherTongue: '',
    financialCondition: '',
    smokingHabits: '',
    drinkingHabits: '',
    maritalStatus: '',
    caste: '',
    spokenLanguages: '',
    annualIncome: ''
  });

  // Present Address
  const [addressInfo, setAddressInfo] = useState({
    presentCountry: '',
    presentState: '',
    presentCity: '',
    presentZipCode: ''
  });

  // Partner Expectation
  const [partnerExpectation, setPartnerExpectation] = useState({
    partnerGeneralRequirement: '',
    partnerCountry: '',
    partnerMinAge: '',
    partnerMaxAge: '',
    partnerMinHeight: '',
    partnerMaxHeight: '',
    partnerMaxWeight: '',
    partnerMaritalStatus: '',
    partnerReligion: '',
    partnerFaceColor: '',
    partnerSmokingHabits: '',
    partnerDrinkingStatus: '',
    partnerMinDegree: '',
    partnerLanguages: '',
    partnerProfession: '',
    partnerPersonality: '',
    partnerAnnualIncome: '',
    partnerFamilyPosition: ''
  });

  // Physical Attributes
  const [physicalAttributes, setPhysicalAttributes] = useState({
    height: '',
    weight: '',
    bloodGroup: '',
    eyeColor: '',
    hairColor: '',
    complexion: '',
    disability: ''
  });

  // Family Information
  const [familyInfo, setFamilyInfo] = useState({
    fatherName: '',
    fatherProfession: '',
    fatherContact: '',
    motherName: '',
    motherProfession: '',
    motherContact: '',
    numberOfBrothers: '',
    numberOfSisters: ''
  });

  // Career Information
  const [careerInfo, setCareerInfo] = useState({
    company: '',
    designation: '',
    careerStartYear: '',
    careerEndYear: ''
  });

  // Education Information
  const [educationInfo, setEducationInfo] = useState({
    institute: '',
    degree: '',
    fieldOfStudy: '',
    educationStartYear: '',
    educationEndYear: ''
  });
  const { theme, colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Options for selectable fields
  const genderOptions = ['Male', 'Female', 'Other'];
  // Dynamic dropdown options
  const [religionOptions, setReligionOptions] = useState<string[]>([]); // names for dropdown
  const [religionMap, setReligionMap] = useState<Record<string,string>>({}); // name -> id
  const [casteOptions, setCasteOptions] = useState<string[]>([]);
  const smokingOptions = ['Yes', 'No', 'Occasionally'];
  const drinkingOptions = ['Yes', 'No', 'Occasionally'];
  const maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed'];

  // Year picker options
  const currentYear = new Date().getFullYear();
  const yearOptions = ['Select Year', ...Array.from({ length: currentYear - 1949 }, (_, i) => (currentYear - i).toString())];

  useEffect(() => {
    // Load dropdown options once
    (async () => {
      try {
        const data = await apiService.getDropdownOptions();
        const religionsArr = (data?.data?.religions || []) as Array<{id:string,name:string}>;
        religionsArr.sort((a,b)=>a.name.localeCompare(b.name));
        setReligionOptions(religionsArr.map(r=>r.name));
        const map: Record<string,string> = {};
        religionsArr.forEach(r=>{map[r.name]=String(r.id)});
        setReligionMap(map);
      } catch (err) {
        console.error('❌ Failed loading dropdown options', err);
      }
    })();
    fetchUserProfile();
  }, []);

  const handleDateChange = (event: any, date: any) => {
    if (date) {
      setSelectedDate(date);
      const dateString = date.toISOString().split('T')[0];
      handleInputChange('dateOfBirth', dateString);
    }
    setShowDatePicker(false);
  };

  const fetchUserProfile = async () => {
    try {
      setDataLoading(true);
      console.log('📊 Fetching complete user profile data...');
      
      // First, set basic user data from auth context
      if (user) {
        console.log('👤 Auth user data:', {
          firstname: user.firstname,
          lastname: user.lastname,
          gender: user.gender,
          looking_for: user.looking_for,
          caste: user.caste,
          religion: user.religion,
          date_of_birth: user.date_of_birth
        });
        
        // Set basic info
        setBasicInfo(prev => ({
          ...prev,
          firstname: user.firstname || '',
          lastname: user.lastname || '',
          email: user.email || '',
          phone: user.phone || '',
          image: user.image || '',
          profile_id: user.profile_id || user.id || '',
          id: user.id || '',
          gender: user.gender || '',
          caste: user.caste || '',
          religion: user.religion || '',
          dateOfBirth: user.date_of_birth || '',
        }));
      }

      // Then fetch complete profile data from API
      const response = await apiService.getUserInfo();
      console.log('👤 Complete profile response:', response);
      console.log('📋 Response data keys:', response?.data ? Object.keys(response.data) : 'null');
      
      if (response && response.status === 'success' && response.data) {
        // Extract user data from nested structure
        const profileData = response.data.user || response.data;

        // Flatten nested objects for easier access
        const basic = profileData.basic_info || {};
        const phys = profileData.physical_attributes || {};
        const family = profileData.family || {};
        const career = Array.isArray(profileData.career_info) ? (profileData.career_info[0] || {}) : (profileData.career_info || {});
        const education = Array.isArray(profileData.education_info) ? (profileData.education_info[0] || {}) : (profileData.education_info || {});
        const partner = Array.isArray(profileData.partner_expectation) ? (profileData.partner_expectation[0] || {}) : (profileData.partner_expectation || {});
        const addr = Array.isArray(profileData.address) ? (profileData.address[0] || {}) : (profileData.address || {});
        
        console.log('📋 Profile data keys:', Object.keys(profileData || {}));
        console.log('📊 Profile data values:', {
          gender: profileData.gender,
          looking_for: profileData.looking_for,
          caste: profileData.caste,
          religion: profileData.religion,
          date_of_birth: profileData.date_of_birth,
          dateOfBirth: profileData.dateOfBirth
        });
        
        // Update basic info
        setBasicInfo(prev => ({
          ...prev,
          firstname: profileData.firstname || prev.firstname,
          lastname: profileData.lastname || prev.lastname,
          email: profileData.email || prev.email,
          phone: profileData.mobile || profileData.phone || prev.phone,
          image: profileData.image || prev.image,
          dateOfBirth: basic.date_of_birth || basic.dateOfBirth || basic.birth_date || basic.dob || profileData.dateOfBirth || profileData.date_of_birth || profileData.birth_date || profileData.dob || prev.dateOfBirth || '',
          religion: basic.religion || profileData.religion || prev.religion || '',
          gender: basic.gender || profileData.gender || prev.gender || '',
          caste: basic.caste || profileData.caste || prev.caste || '',
          profession: basic.profession || profileData.profession || prev.profession || '',
          motherTongue: basic.mother_tongue || basic.motherTongue || profileData.motherTongue || profileData.mother_tongue || prev.motherTongue || '',
          financialCondition: basic.financial_condition || basic.financialCondition || profileData.financialCondition || profileData.financial_condition || prev.financialCondition || '',
          smokingHabits: basic.smoking_habits || basic.smokingHabits || profileData.smokingHabits || profileData.smoking_habits || prev.smokingHabits || '',
          drinkingHabits: basic.drinking_habits || basic.drinkingHabits || profileData.drinkingHabits || profileData.drinking_habits || prev.drinkingHabits || '',
          maritalStatus: basic.marital_status || basic.maritalStatus || profileData.maritalStatus || profileData.marital_status || prev.maritalStatus || '',
          spokenLanguages: basic.spoken_languages || basic.spokenLanguages || profileData.spokenLanguages || profileData.spoken_languages || prev.spokenLanguages || '',
          annualIncome: basic.annual_income || basic.annualIncome || profileData.annualIncome || profileData.annual_income || prev.annualIncome || ''
        }));

        // Sync date picker state if we received a valid date of birth
        const dobString = basic.date_of_birth || basic.dateOfBirth || basic.birth_date || basic.dob || profileData.dateOfBirth || profileData.date_of_birth || profileData.birth_date || profileData.dob;
        if (dobString) {
          const dobDate = new Date(dobString);
          if (!isNaN(dobDate.getTime())) {
            setSelectedDate(dobDate);
          }
        }

        // Update address info
        setAddressInfo(prev => ({
          ...prev,
          presentCountry: addr.country || addr.presentCountry || profileData.presentCountry || profileData.present_country || prev.presentCountry || '',
          presentState: addr.state || addr.presentState || profileData.presentState || profileData.present_state || prev.presentState || '',
          presentCity: addr.city || addr.presentCity || profileData.presentCity || profileData.present_city || prev.presentCity || '',
          presentZipCode: addr.zip_code || addr.presentZipCode || profileData.presentZipCode || profileData.present_zip_code || prev.presentZipCode || ''
        }));

        // Update physical attributes
        setPhysicalAttributes(prev => ({
          ...prev,
          height: phys.height || profileData.height || prev.height || '',
          weight: phys.weight || profileData.weight || prev.weight || '',
          bloodGroup: phys.blood_group || phys.bloodGroup || profileData.bloodGroup || profileData.blood_group || prev.bloodGroup || '',
          eyeColor: phys.eye_color || phys.eyeColor || profileData.eyeColor || profileData.eye_color || prev.eyeColor || '',
          hairColor: phys.hair_color || phys.hairColor || profileData.hairColor || profileData.hair_color || prev.hairColor || '',
          complexion: phys.complexion || profileData.complexion || prev.complexion || '',
          disability: phys.disability || profileData.disability || prev.disability || ''
        }));

        // Update family info
        setFamilyInfo(prev => ({
          ...prev,
          fatherName: family.father_name || family.fatherName || profileData.fatherName || profileData.father_name || prev.fatherName || '',
          fatherProfession: family.father_profession || family.fatherProfession || profileData.fatherProfession || profileData.father_profession || prev.fatherProfession || '',
          fatherContact: family.father_contact || family.fatherContact || profileData.fatherContact || profileData.father_contact || prev.fatherContact || '',
          motherName: family.mother_name || family.motherName || profileData.motherName || profileData.mother_name || prev.motherName || '',
          motherProfession: family.mother_profession || family.motherProfession || profileData.motherProfession || profileData.mother_profession || prev.motherProfession || '',
          motherContact: family.mother_contact || family.motherContact || profileData.motherContact || profileData.mother_contact || prev.motherContact || '',
          numberOfBrothers: family.number_of_brothers || family.numberOfBrothers || profileData.numberOfBrothers || profileData.number_of_brothers || prev.numberOfBrothers || '',
          numberOfSisters: family.number_of_sisters || family.numberOfSisters || profileData.numberOfSisters || profileData.number_of_sisters || prev.numberOfSisters || ''
        }));

        // Update career info
        setCareerInfo(prev => ({
          ...prev,
          company: career.company || profileData.company || prev.company || '',
          designation: career.designation || profileData.designation || prev.designation || '',
          careerStartYear: career.start_year || career.careerStartYear || profileData.careerStartYear || profileData.career_start_year || prev.careerStartYear || '',
          careerEndYear: career.end_year || career.careerEndYear || profileData.careerEndYear || profileData.career_end_year || prev.careerEndYear || ''
        }));

        // Update education info
        setEducationInfo(prev => ({
          ...prev,
          institute: education.institute || profileData.institute || prev.institute || '',
          degree: education.degree || profileData.degree || prev.degree || '',
          fieldOfStudy: education.field_of_study || education.fieldOfStudy || profileData.fieldOfStudy || profileData.field_of_study || prev.fieldOfStudy || '',
          educationStartYear: education.start_year || education.educationStartYear || profileData.educationStartYear || profileData.education_start_year || prev.educationStartYear || '',
          educationEndYear: education.end_year || education.educationEndYear || profileData.educationEndYear || profileData.education_end_year || prev.educationEndYear || ''
        }));

        // Update partner expectations
        setPartnerExpectation(prev => ({
          ...prev,
          partnerGeneralRequirement: partner.partnerGeneralRequirement || partner.partner_general_requirement || profileData.partnerGeneralRequirement || profileData.partner_general_requirement || prev.partnerGeneralRequirement || '',
          partnerCountry: partner.partnerCountry || partner.partner_country || profileData.partnerCountry || profileData.partner_country || prev.partnerCountry || '',
          partnerMinAge: partner.partnerMinAge || partner.partner_min_age || profileData.partnerMinAge || profileData.partner_min_age || prev.partnerMinAge || '',
          partnerMaxAge: partner.partnerMaxAge || partner.partner_max_age || profileData.partnerMaxAge || profileData.partner_max_age || prev.partnerMaxAge || '',
          partnerMinHeight: partner.partnerMinHeight || partner.partner_min_height || profileData.partnerMinHeight || profileData.partner_min_height || prev.partnerMinHeight || '',
          partnerMaxHeight: partner.partnerMaxHeight || partner.partner_max_height || profileData.partnerMaxHeight || profileData.partner_max_height || prev.partnerMaxHeight || '',
          partnerMaxWeight: partner.partnerMaxWeight || partner.partner_max_weight || profileData.partnerMaxWeight || profileData.partner_max_weight || prev.partnerMaxWeight || '',
          partnerMaritalStatus: partner.partnerMaritalStatus || partner.partner_marital_status || profileData.partnerMaritalStatus || profileData.partner_marital_status || prev.partnerMaritalStatus || '',
          partnerReligion: partner.partnerReligion || partner.partner_religion || profileData.partnerReligion || profileData.partner_religion || prev.partnerReligion || '',
          partnerFaceColor: partner.partnerFaceColor || partner.partner_face_color || profileData.partnerFaceColor || profileData.partner_face_color || prev.partnerFaceColor || '',
          partnerSmokingHabits: partner.partnerSmokingHabits || partner.partner_smoking_habits || profileData.partnerSmokingHabits || profileData.partner_smoking_habits || prev.partnerSmokingHabits || '',
          partnerDrinkingStatus: partner.partnerDrinkingStatus || partner.partner_drinking_status || profileData.partnerDrinkingStatus || profileData.partner_drinking_status || prev.partnerDrinkingStatus || '',
          partnerMinDegree: partner.partnerMinDegree || partner.partner_min_degree || profileData.partnerMinDegree || profileData.partner_min_degree || prev.partnerMinDegree || '',
          partnerLanguages: partner.partnerLanguages || partner.partner_languages || profileData.partnerLanguages || profileData.partner_languages || prev.partnerLanguages || '',
          partnerProfession: partner.partnerProfession || partner.partner_profession || profileData.partnerProfession || profileData.partner_profession || prev.partnerProfession || '',
          partnerPersonality: partner.partnerPersonality || partner.partner_personality || profileData.partnerPersonality || profileData.partner_personality || prev.partnerPersonality || '',
          partnerAnnualIncome: partner.partnerAnnualIncome || partner.partner_annual_income || profileData.partnerAnnualIncome || profileData.partner_annual_income || prev.partnerAnnualIncome || '',
          partnerFamilyPosition: partner.partnerFamilyPosition || partner.partner_family_position || profileData.partnerFamilyPosition || profileData.partner_family_position || prev.partnerFamilyPosition || ''
        }));
      } else {
        console.log('⚠️ No profile data received from API');
      }
    } catch (error) {
      console.error('💥 Error fetching profile data:', error);
      console.error('❌ Error details:', error);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
    } finally {
      setDataLoading(false);
    }
  };

  // Helper to remove empty or undefined values before sending to API
  const cleanObject = (obj: Record<string, any>) =>
    Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ''));

  const numericFields = [
    'partnerMinAge', 'partnerMaxAge', 'partnerMinHeight', 'partnerMaxHeight', 'partnerMaxWeight',
    'careerStartYear', 'careerEndYear', 'educationStartYear', 'educationEndYear',
    'height', 'weight', 'numberOfBrothers', 'numberOfSisters'
  ];

  const handleInputChange = (field: string, value: string, section: string = 'basic') => {
    // Special case: when religion changes reset caste and fetch new caste list
    if (section === 'basic' && field === 'religion') {
      const religionId = religionMap[value] || '';
      // reset caste & store religion id
      setBasicInfo(prev=>({...prev,caste:'', religion:religionId}));
      // fetch castes list and map to names
      (async ()=>{
        try {
          const castesArr = await apiService.getCastesByReligion(religionId);
          const names = Array.isArray(castesArr)
            ? (typeof castesArr[0] === 'string'
                ? (castesArr as string[])
                : (castesArr as any[]).map(c=>c.name))
            : [];
          names.sort();
          setCasteOptions(names);
        } catch(err){ console.error('❌ caste fetch',err); }
      })();
      return;
    }
    // Strip non-digit characters for numeric fields
    if (numericFields.includes(field)) {
      value = value.replace(/[^0-9]/g, '');
    }
    console.log(`Updating field '${field}' in section '${section}' with value:`, value);
    switch (section) {
      case 'basic':
        setBasicInfo(prev => ({ ...prev, [field]: value }));
        break;
      case 'address':
        setAddressInfo(prev => ({ ...prev, [field]: value }));
        break;
      case 'partner':
        setPartnerExpectation(prev => ({ ...prev, [field]: value }));
        break;
      case 'physical':
        setPhysicalAttributes(prev => ({ ...prev, [field]: value }));
        break;
      case 'family':
        setFamilyInfo(prev => ({ ...prev, [field]: value }));
        break;
      case 'career':
        setCareerInfo(prev => ({ ...prev, [field]: value }));
        break;
      case 'education':
        setEducationInfo(prev => ({ ...prev, [field]: value }));
        break;
      default:
        console.warn(`Unknown section '${section}' for field '${field}'`);
    }
  };

  const handleBasicInfoSubmit = async () => {
    try {
      setLoading(true);
      console.log('📝 Submitting basic info:', basicInfo);
      // Add your API call here for basic info
      const response = await apiService.updateProfile(basicInfo);
      Alert.alert('Success', 'Basic information updated successfully');
    } catch (error) {
      console.error('Error updating basic info:', error);
      Alert.alert('Error', 'Failed to update basic information');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async () => {
    try {
      setLoading(true);
      console.log('📝 Submitting address:', addressInfo);

      // Convert to API snake_case fields and strip empty values
      const addressData = cleanObject({
        present_country: addressInfo.presentCountry,
        present_state: addressInfo.presentState,
        present_city: addressInfo.presentCity,
        present_zip_code: addressInfo.presentZipCode,
      });
      console.log('📤 Converted address data:', addressData);

      const response = await apiService.updateProfile(addressData);
      Alert.alert('Success', 'Address updated successfully');
    } catch (error) {
      console.error('Error updating address:', error);
      Alert.alert('Error', 'Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  const handlePartnerExpectationSubmit = async () => {
    try {
      setLoading(true);
      console.log('📝 Submitting partner expectations:', partnerExpectation);

      const partnerData = {
        partner_general_requirement: partnerExpectation.partnerGeneralRequirement,
        partner_country: partnerExpectation.partnerCountry,
        partner_min_age: partnerExpectation.partnerMinAge,
        partner_max_age: partnerExpectation.partnerMaxAge,
        partner_min_height: partnerExpectation.partnerMinHeight,
        partner_max_height: partnerExpectation.partnerMaxHeight,
        partner_max_weight: partnerExpectation.partnerMaxWeight,
        partner_marital_status: partnerExpectation.partnerMaritalStatus,
        partner_religion: partnerExpectation.partnerReligion,
        partner_complexion: partnerExpectation.partnerFaceColor,
        partner_smoking_habits: partnerExpectation.partnerSmokingHabits,
        partner_drinking_habits: partnerExpectation.partnerDrinkingStatus,
        partner_education: partnerExpectation.partnerMinDegree,
        partner_spoken_languages: partnerExpectation.partnerLanguages,
        partner_profession: partnerExpectation.partnerProfession,
        partner_personality: partnerExpectation.partnerPersonality,
        partner_annual_income: partnerExpectation.partnerAnnualIncome,
        partner_family_values: partnerExpectation.partnerFamilyPosition
      } as const;

      console.log('📤 Converted partner data for API:', partnerData);

      const response = await apiService.updateProfile(partnerData);
      Alert.alert('Success', 'Partner expectations updated successfully');
    } catch (error) {
      console.error('Error updating partner expectations:', error);
      Alert.alert('Error', 'Failed to update partner expectations');
    } finally {
      setLoading(false);
    }
  };

  const handlePhysicalAttributesSubmit = async () => {
    try {
      setLoading(true);
      console.log('📝 Submitting physical attributes:', physicalAttributes);
      const response = await apiService.updateProfile({
        ...physicalAttributes
      });
      Alert.alert('Success', 'Physical attributes updated successfully');
    } catch (error) {
      console.error('Error updating physical attributes:', error);
      Alert.alert('Error', 'Failed to update physical attributes');
    } finally {
      setLoading(false);
    }
  };

  const handleFamilyInfoSubmit = async () => {
    try {
      setLoading(true);
      console.log('📝 Submitting family information:', familyInfo);
      const response = await apiService.updateProfile({
        ...familyInfo
      });
      Alert.alert('Success', 'Family information updated successfully');
    } catch (error) {
      console.error('Error updating family information:', error);
      Alert.alert('Error', 'Failed to update family information');
    } finally {
      setLoading(false);
    }
  };

  const handleCareerInfoSubmit = async () => {
    try {
      setLoading(true);
      console.log('📝 Submitting career information:', careerInfo);
      const response = await apiService.updateProfile({
        ...careerInfo
      });
      Alert.alert('Success', 'Career information updated successfully');
    } catch (error) {
      console.error('Error updating career information:', error);
      Alert.alert('Error', 'Failed to update career information');
    } finally {
      setLoading(false);
    }
  };

  const handleEducationInfoSubmit = async () => {
    try {
      setLoading(true);
      console.log('📝 Submitting education information:', educationInfo);
      const response = await apiService.updateProfile({
        ...educationInfo
      });
      Alert.alert('Success', 'Education information updated successfully');
    } catch (error) {
      console.error('Error updating education information:', error);
      Alert.alert('Error', 'Failed to update education information');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      // Combine all form data into one object
      const allFormData = {
        ...basicInfo,
        ...addressInfo,
        ...physicalAttributes,
        ...familyInfo,
        ...careerInfo,
        ...educationInfo,
        ...partnerExpectation
      };
      
      console.log('📝 Submitting all profile data:', allFormData);
      
      // Call API to update profile
      const response = await apiService.updateProfile(allFormData);
      
      if (response.status === 'success') {
        Alert.alert('Success', 'Profile updated successfully!');
        // Refresh user data
        if (auth && 'refreshUser' in auth && typeof auth.refreshUser === 'function') {
          await auth.refreshUser();
        }
      } else {
        Alert.alert('Error', response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePicker = async () => {
    try {
      // Check plan limitations
      const userPlan = await apiService.getUserPlan();
      const remainingUploads = userPlan.data?.remaining_image_upload || 0;
      
      if (remainingUploads <= 0 && !premiumUtils.isPremiumUser(user?.packageId)) {
        Alert.alert(
          'Upload Limit Reached',
          'You have reached your image upload limit. Upgrade to premium for unlimited uploads.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade', onPress: () => router.push('/plans') }
          ]
        );
        return;
      }

      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload images.');
        return;
      }

      // Directly open gallery without showing options
      openGallery();
    } catch (error) {
      console.error('Error checking upload limits:', error);
      Alert.alert('Error', 'Failed to check upload limits. Please try again.');
    }
  };

  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadImage(result.assets[0]);
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadImage(result.assets[0]);
    }
  };

  const uploadImage = async (imageAsset: any) => {
    try {
      console.log('📸 Uploading profile image...');
      
      const formData = new FormData();
      formData.append('profile_image', {
        uri: imageAsset.uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      const response = await apiService.uploadProfileImage(formData);
      
      if (response.status === 'success') {
        Alert.alert('Success', 'Profile picture updated successfully!');
        // Update basicInfo with new image URL from API response
        const imageBaseUrl = process.env.EXPO_PUBLIC_IMAGE_BASE_URL || 'https://90skalyanam.com/assets/images/user/profile';
        const imageUrl = response.data?.image_url || `${imageBaseUrl}/${response.data?.image || response.image}`;
        console.log('🖼️ New image URL:', imageUrl);
        setBasicInfo(prev => ({ ...prev, image: imageUrl }));
        // Refresh user data if available
        if (auth && 'refreshUser' in auth && typeof auth.refreshUser === 'function') {
          auth.refreshUser();
        }
      } else {
        Alert.alert('Error', 'Failed to upload image. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    }
  };

  if (dataLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textPrimary }]}>Loading profile data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient colors={['#fdfcfb', '#e2d1c3']} style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Universal Header */}
      <UniversalHeader 
        title="Edit Profile"
        leftIcon="arrow-left"
        onLeftPress={() => router.back()}
        rightIcons={['check']}
        onRightPress={[() => handleSubmit()]}
      />
      
      <ScrollView contentContainerStyle={[styles.contentContainer, { paddingTop: 20 }]} style={{ backgroundColor: colors.background }}>
        {/* Profile Picture Section */}
        <LinearGradient
          colors={['#FCA5A5', '#F87171']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileSection}
        >
          <TouchableOpacity style={styles.profileImageContainer} onPress={handleImagePicker}>
            {basicInfo?.image ? (
              <Image 
                source={{ uri: basicInfo.image.startsWith('http') ? basicInfo.image : `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL || 'https://90skalyanam.com/assets/images/user/profile'}/${basicInfo.image}` }} 
                style={styles.profileImage}
              />
            ) : (
              <LinearGradient
                colors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.profileImage}
              />
            )}
          </TouchableOpacity>
          <Text style={styles.profileName}>{basicInfo.firstname} {basicInfo.lastname}</Text>
          <Text style={styles.profileId}>ID: {basicInfo.profile_id || basicInfo.id}</Text>
        </LinearGradient>

        <AccordionItem title="Basic Information" icon="user">
          <View style={styles.row}>
            <FormInput 
              label="First Name *" 
              placeholder="Enter first name" 
              icon="user" 
              containerStyle={styles.halfWidth}
              fieldName="firstname"
              formData={basicInfo}
              onFieldChange={(field, value) => handleInputChange(field, value, 'basic')}
            />
            <FormInput 
              label="Last Name *" 
              placeholder="Enter last name" 
              icon="user" 
              containerStyle={styles.halfWidth}
              fieldName="lastname"
              formData={basicInfo}
              onFieldChange={(field, value) => handleInputChange(field, value, 'basic')}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.inputContainer}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.label, { color: colors.textPrimary }]}>Date of Birth *</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>
              <Feather name="calendar" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <Text style={[styles.input, { color: basicInfo?.dateOfBirth ? colors.textPrimary : colors.inputPlaceholder }]}>
                {basicInfo?.dateOfBirth || 'Select date'}
              </Text>
            </View>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
            />
          )}
          
          <SelectableInput 
            label="Religion *" 
            icon="moon"
            fieldName="religion"
            formData={basicInfo}
            onFieldChange={(field, value) => handleInputChange(field, value, 'basic')}
            options={religionOptions}
          />
          
          <SelectableInput
            label="Caste *"
            icon="users"
            fieldName="caste"
            formData={basicInfo}
            onFieldChange={(field, value) => handleInputChange(field, value, 'basic')}
            options={casteOptions}
          />
          
          <SelectableInput 
            label="Gender *" 
            icon="user"
            fieldName="gender"
            formData={basicInfo}
            onFieldChange={(field, value) => handleInputChange(field, value, 'basic')}
            options={genderOptions}
          />
          
          <SelectableInput 
            label="Marital Status *" 
            icon="heart"
            fieldName="maritalStatus"
            formData={basicInfo}
            onFieldChange={(field, value) => handleInputChange(field, value, 'basic')}
            options={maritalStatusOptions}
          />
          
          <FormInput 
            label="Languages *" 
            placeholder="e.g., English, Tamil" 
            icon="globe"
            fieldName="spokenLanguages"
            formData={basicInfo}
            onFieldChange={(field, value) => handleInputChange(field, value, 'basic')}
          />
          
          <FormInput 
            label="Mother Tongue *" 
            placeholder="e.g., Tamil" 
            icon="message-square"
            fieldName="motherTongue"
            formData={basicInfo}
            onFieldChange={(field, value) => handleInputChange(field, value, 'basic')}
          />
          
          <FormInput 
            label="Profession *" 
            placeholder="Your Profession" 
            icon="briefcase"
            fieldName="profession"
            formData={basicInfo}
            onFieldChange={(field, value) => handleInputChange(field, value, 'basic')}
          />
          
          <FormInput 
            label="Annual Income *" 
            placeholder="e.g., 5,00,000" 
            icon="dollar-sign"
            fieldName="annualIncome"
            formData={basicInfo}
            onFieldChange={(field, value) => handleInputChange(field, value, 'basic')}
            keyboardType="numeric"
          />
          
          <View style={styles.row}>
            <SelectableInput 
              label="Smoking Habits *" 
              icon="wind" 
              containerStyle={styles.halfWidth}
              fieldName="smokingHabits"
              formData={basicInfo}
              onFieldChange={(field, value) => handleInputChange(field, value, 'basic')}
              options={['Non-smoker', 'Occasionally', 'Regularly', 'Socially']}
            />
            <SelectableInput 
              label="Drinking Habits *" 
              icon="coffee" 
              containerStyle={styles.halfWidth}
              fieldName="drinkingHabits"
              formData={basicInfo}
              onFieldChange={(field, value) => handleInputChange(field, value, 'basic')}
              options={['Non-drinker', 'Occasionally', 'Regularly', 'Socially']}
            />
          </View>
          
          <SelectableInput 
            label="Financial Condition *" 
            icon="dollar-sign" 
            fieldName="financialCondition"
            formData={basicInfo}
            onFieldChange={(field, value) => handleInputChange(field, value, 'basic')}
            options={['Wealthy', 'Upper Middle Class', 'Middle Class', 'Lower Middle Class', 'Poor']}
          />
          
          <TouchableOpacity 
            style={[styles.sectionSubmitButton, { backgroundColor: '#FF3B30', marginTop: 16 }]}
            onPress={handleBasicInfoSubmit}
          >
            <Feather name="save" size={20} color="white" />
            <Text style={styles.sectionSubmitButtonText}>Save Basic Information</Text>
          </TouchableOpacity>
        </AccordionItem>

        <AccordionItem title="Present Address" icon="map-pin">
          <FormInput 
            label="Country *" 
            placeholder="Select Country" 
            icon="map-pin"
            fieldName="presentCountry"
            formData={addressInfo}
            onFieldChange={(field, value) => handleInputChange(field, value, 'address')}
          />
          
          <View style={styles.row}>
            <FormInput 
              label="State *"
              placeholder="Enter state" 
              icon="map" 
              containerStyle={styles.halfWidth}
              fieldName="presentState"
              formData={addressInfo}
              onFieldChange={(field, value) => handleInputChange(field, value, 'address')}
            />
            <FormInput 
              label="City *"
              placeholder="Enter city" 
              icon="map-pin" 
              containerStyle={styles.halfWidth}
              fieldName="presentCity"
              formData={addressInfo}
              onFieldChange={(field, value) => handleInputChange(field, value, 'address')}
            />
          </View>
          
          <FormInput 
            label="Zip Code *" 
            placeholder="Enter zip code" 
            icon="hash"
            fieldName="presentZipCode"
            formData={addressInfo}
            onFieldChange={(field, value) => handleInputChange(field, value, 'address')}
            keyboardType="numeric"
          />
          
          <TouchableOpacity 
            style={[styles.sectionSubmitButton, { backgroundColor: '#FF3B30', marginTop: 16 }]}
            onPress={handleAddressSubmit}
          >
            <Feather name="save" size={20} color="white" />
            <Text style={styles.sectionSubmitButtonText}>Save Address</Text>
          </TouchableOpacity>
        </AccordionItem>

        <AccordionItem title="Partner Expectation" icon="heart">
          <FormInput 
            label="General Requirement" 
            placeholder="Enter general requirements" 
            icon="file-text" 
            fieldName="partnerGeneralRequirement"
            formData={partnerExpectation}
            onFieldChange={(field, value) => handleInputChange(field, value, 'partner')}
            multiline
            numberOfLines={3}
          />
          
          <SelectableInput 
            label="Country *" 
            icon="map-pin"
            fieldName="partnerCountry" 
            formData={partnerExpectation} 
            onFieldChange={(field, value) => handleInputChange(field, value, 'partner')} 
            options={['India', 'USA', 'UK', 'Canada', 'Australia']}
          />
          
          <View style={styles.row}>
            <FormInput 
              label="Minimum Age *" 
              placeholder="e.g., 25" 
              icon="user" 
              containerStyle={styles.halfWidth} 
              fieldName="partnerMinAge" 
              formData={partnerExpectation} 
              onFieldChange={(field, value) => handleInputChange(field, value, 'partner')}
              keyboardType="numeric"
            />
            <FormInput 
              label="Maximum Age *" 
              placeholder="e.g., 30" 
              icon="user" 
              containerStyle={styles.halfWidth} 
              fieldName="partnerMaxAge" 
              formData={partnerExpectation} 
              onFieldChange={(field, value) => handleInputChange(field, value, 'partner')}
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.row}>
            <FormInput 
              label="Minimum Height *" 
              placeholder="e.g., 5.5" 
              icon="maximize-2" 
              containerStyle={styles.halfWidth} 
              fieldName="partnerMinHeight" 
              formData={partnerExpectation} 
              onFieldChange={(field, value) => handleInputChange(field, value, 'partner')}
              keyboardType="numeric"
            />
            <FormInput 
              label="Maximum Height *" 
              placeholder="e.g., 6.0" 
              icon="minimize-2" 
              containerStyle={styles.halfWidth} 
              fieldName="partnerMaxHeight" 
              formData={partnerExpectation} 
              onFieldChange={(field, value) => handleInputChange(field, value, 'partner')}
              keyboardType="numeric"
            />
          </View>
          
          <FormInput 
            label="Maximum Weight *" 
            placeholder="e.g., 70" 
            icon="minimize-2" 
            fieldName="partnerMaxWeight" 
            formData={partnerExpectation} 
            onFieldChange={(field, value) => handleInputChange(field, value, 'partner')}
            keyboardType="numeric"
          />
          
          <SelectableInput 
            label="Marital Status *" 
            icon="heart" 
            fieldName="partnerMaritalStatus" 
            formData={partnerExpectation} 
            onFieldChange={(field, value) => handleInputChange(field, value, 'partner')} 
            options={['Select One', 'Never Married', 'Divorced', 'Widowed', 'Separated']}
          />
          
          <SelectableInput 
            label="Religion *" 
            icon="moon" 
            fieldName="partnerReligion" 
            formData={partnerExpectation} 
            onFieldChange={(field, value) => handleInputChange(field, value, 'partner')} 
            options={['Select One', 'Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other']}
          />
          
          <FormInput 
            label="Face Colour *" 
            placeholder="e.g., Fair, Wheatish" 
            icon="sun" 
            fieldName="partnerFaceColor" 
            formData={partnerExpectation} 
            onFieldChange={(field, value) => handleInputChange(field, value, 'partner')}
          />
          
          <View style={styles.row}>
            <SelectableInput 
              label="Smoking Habits *" 
              icon="wind" 
              containerStyle={styles.halfWidth} 
              fieldName="partnerSmokingHabits" 
              formData={partnerExpectation} 
              onFieldChange={(field, value) => handleInputChange(field, value, 'partner')} 
              options={['Select One', 'No', 'Yes', 'Occasionally']}
            />
            <SelectableInput 
              label="Drinking Status *" 
              icon="droplet" 
              containerStyle={styles.halfWidth} 
              fieldName="partnerDrinkingStatus" 
              formData={partnerExpectation} 
              onFieldChange={(field, value) => handleInputChange(field, value, 'partner')} 
              options={['Select One', 'No', 'Yes', 'Occasionally']}
            />
          </View>
          
          <FormInput 
            label="Minimum Degree *" 
            placeholder="e.g., B.Tech, MBA" 
            icon="book-open" 
            fieldName="partnerMinDegree" 
            formData={partnerExpectation} 
            onFieldChange={(field, value) => handleInputChange(field, value, 'partner')}
          />
          
          <FormInput 
            label="Languages *" 
            placeholder="e.g., English, Hindi" 
            icon="globe" 
            fieldName="partnerLanguages" 
            formData={partnerExpectation} 
            onFieldChange={(field, value) => handleInputChange(field, value, 'partner')}
          />
          
          <FormInput 
            label="Profession *" 
            placeholder="e.g., Doctor, Engineer" 
            icon="briefcase" 
            fieldName="partnerProfession" 
            formData={partnerExpectation} 
            onFieldChange={(field, value) => handleInputChange(field, value, 'partner')}
          />
          
          <FormInput 
            label="Personality *" 
            placeholder="e.g., Outgoing, Reserved" 
            icon="user" 
            fieldName="partnerPersonality" 
            formData={partnerExpectation} 
            onFieldChange={(field, value) => handleInputChange(field, value, 'partner')}
          />
          
          <FormInput 
            label="Annual Income *" 
            placeholder="e.g., 10,00,000" 
            icon="dollar-sign" 
            fieldName="partnerAnnualIncome" 
            formData={partnerExpectation} 
            onFieldChange={(field, value) => handleInputChange(field, value, 'partner')}
            keyboardType="numeric"
          />
          
          <FormInput 
            label="Family Position *" 
            placeholder="e.g., Eldest, Youngest" 
            icon="users" 
            fieldName="partnerFamilyPosition" 
            formData={partnerExpectation} 
            onFieldChange={(field, value) => handleInputChange(field, value, 'partner')}
          />
          
          <TouchableOpacity 
            style={[styles.sectionSubmitButton, { backgroundColor: '#FF3B30', marginTop: 16 }]}
            onPress={handlePartnerExpectationSubmit}
          >
            <Feather name="save" size={20} color="white" />
            <Text style={styles.sectionSubmitButtonText}>Save Partner Expectations</Text>
          </TouchableOpacity>
        </AccordionItem>

        <AccordionItem title="Physical Attributes" icon="activity">
          <FormInput 
            label="Face Colour *" 
            placeholder="e.g., Fair, Wheatish" 
            icon="user" 
            fieldName="complexion" 
            formData={physicalAttributes} 
            onFieldChange={(field, value) => handleInputChange(field, value, 'physical')}
          />
          
          <FormInput 
            label="Height (ft)" 
            placeholder="e.g., 5.8" 
            icon="maximize-2" 
            fieldName="height" 
            formData={physicalAttributes} 
            onFieldChange={(field, value) => handleInputChange(field, value, 'physical')}
            keyboardType="numeric"
          />
          
          <FormInput 
            label="Weight (kg)" 
            placeholder="e.g., 70" 
            icon="minimize-2" 
            fieldName="weight" 
            formData={physicalAttributes} 
            onFieldChange={(field, value) => handleInputChange(field, value, 'physical')}
            keyboardType="numeric"
          />
          
          <SelectableInput 
            label="Blood Group" 
            icon="droplet"
            fieldName="bloodGroup" 
            formData={physicalAttributes} 
            onFieldChange={(field, value) => handleInputChange(field, value, 'physical')} 
            options={['Select One', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
          />
          
          <FormInput 
            label="Eye Color *" 
            placeholder="e.g., Brown" 
            icon="eye" 
            fieldName="eyeColor" 
            formData={physicalAttributes} 
            onFieldChange={(field, value) => handleInputChange(field, value, 'physical')}
          />
          
          <FormInput 
            label="Hair Color *" 
            placeholder="e.g., Black" 
            icon="user" 
            fieldName="hairColor" 
            formData={physicalAttributes} 
            onFieldChange={(field, value) => handleInputChange(field, value, 'physical')}
          />
          
          <FormInput 
            label="Disability" 
            placeholder="If any" 
            icon="alert-circle" 
            fieldName="disability" 
            formData={physicalAttributes} 
            onFieldChange={(field, value) => handleInputChange(field, value, 'physical')}
          />
          
          <TouchableOpacity 
            style={[styles.sectionSubmitButton, { backgroundColor: '#FF3B30', marginTop: 16 }]}
            onPress={handlePhysicalAttributesSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Feather name="save" size={20} color="white" />
                <Text style={styles.sectionSubmitButtonText}>Save Physical Attributes</Text>
              </>
            )}
          </TouchableOpacity>
        </AccordionItem>

        <AccordionItem title="Family Information" icon="users">
            <FormInput 
              label="Father's Name *" 
              placeholder="Father's Name" 
              icon="user" 
              fieldName="fatherName" 
              formData={familyInfo} 
              onFieldChange={(field, value) => handleInputChange(field, value, 'family')} 
            />
            <FormInput 
              label="Father's Profession" 
              placeholder="Father's Profession" 
              icon="briefcase" 
              fieldName="fatherProfession" 
              formData={familyInfo} 
              onFieldChange={(field, value) => handleInputChange(field, value, 'family')} 
            />
            <FormInput 
              label="Father's Contact" 
              placeholder="Father's Contact" 
              icon="phone" 
              fieldName="fatherContact" 
              formData={familyInfo} 
              onFieldChange={(field, value) => handleInputChange(field, value, 'family')} 
              keyboardType="phone-pad"
            />
            <FormInput 
              label="Mother's Name *" 
              placeholder="Mother's Name" 
              icon="user" 
              fieldName="motherName" 
              formData={familyInfo} 
              onFieldChange={(field, value) => handleInputChange(field, value, 'family')} 
            />
            <FormInput 
              label="Mother's Profession" 
              placeholder="Mother's Profession" 
              icon="briefcase" 
              fieldName="motherProfession" 
              formData={familyInfo} 
              onFieldChange={(field, value) => handleInputChange(field, value, 'family')} 
            />
            <FormInput 
              label="Mother's Contact" 
              placeholder="Mother's Contact" 
              icon="phone" 
              fieldName="motherContact" 
              formData={familyInfo} 
              onFieldChange={(field, value) => handleInputChange(field, value, 'family')} 
              keyboardType="phone-pad"
            />
            <View style={styles.row}>
                <FormInput 
                  label="No. of Brothers" 
                  placeholder="e.g., 1" 
                  icon="users" 
                  containerStyle={styles.halfWidth} 
                  fieldName="numberOfBrothers" 
                  formData={familyInfo} 
                  onFieldChange={(field, value) => handleInputChange(field, value, 'family')} 
                  keyboardType="numeric"
                />
                <FormInput 
                  label="No. of Sisters" 
                  placeholder="e.g., 1" 
                  icon="users" 
                  containerStyle={styles.halfWidth} 
                  fieldName="numberOfSisters" 
                  formData={familyInfo} 
                  onFieldChange={(field, value) => handleInputChange(field, value, 'family')} 
                  keyboardType="numeric"
                />
            </View>
            <TouchableOpacity 
              style={[styles.sectionSubmitButton, { backgroundColor: '#FF3B30', marginTop: 16 }]}
              onPress={handleFamilyInfoSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Feather name="save" size={20} color="white" />
                  <Text style={styles.sectionSubmitButtonText}>Save Family Information</Text>
                </>
              )}
            </TouchableOpacity>
        </AccordionItem>

        <AccordionItem title="Career Information" icon="briefcase">
          <FormInput
            label="Company *"
            placeholder="Company name"
            icon="briefcase"
            fieldName="company"
            formData={careerInfo}
            onFieldChange={(field, value) => handleInputChange(field, value, 'career')}
          />
          <FormInput
            label="Designation *"
            placeholder="Your job title"
            icon="user"
            fieldName="designation"
            formData={careerInfo}
            onFieldChange={(field, value) => handleInputChange(field, value, 'career')}
          />
          <View style={styles.row}>
            <SelectableInput
              label="Start Year *"
              icon="calendar"
              containerStyle={styles.halfWidth}
              fieldName="careerStartYear"
              formData={careerInfo}
              onFieldChange={(field, value) => handleInputChange(field, value, 'career')}
              options={yearOptions}
            />
            <SelectableInput
              label="End Year (Leave empty if current)"
              icon="calendar"
              containerStyle={styles.halfWidth}
              fieldName="careerEndYear"
              formData={careerInfo}
              onFieldChange={(field, value) => handleInputChange(field, value, 'career')}
              options={['Current', ...yearOptions.slice(1)]}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.sectionSubmitButton, { backgroundColor: '#FF3B30', marginTop: 16 }]}
            onPress={handleCareerInfoSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Feather name="save" size={20} color="white" />
                <Text style={styles.sectionSubmitButtonText}>Save Career Information</Text>
              </>
            )}
          </TouchableOpacity>
        </AccordionItem>

        <AccordionItem title="Education Information" icon="book-open">
          <FormInput 
            label="Highest Degree *" 
            placeholder="e.g., B.Tech, M.Sc, MBA" 
            icon="award" 
            fieldName="highestDegree"
            formData={educationInfo}
            onFieldChange={(field, value) => handleInputChange(field, value, 'education')}
          />
          <FormInput 
            label="Field of Study" 
            placeholder="e.g., Computer Science, Business" 
            icon="book" 
            fieldName="fieldOfStudy"
            formData={educationInfo}
            onFieldChange={(field, value) => handleInputChange(field, value, 'education')}
          />
          <FormInput 
            label="Institution *" 
            placeholder="University/College Name" 
            icon="home" 
            fieldName="institution"
            formData={educationInfo}
            onFieldChange={(field, value) => handleInputChange(field, value, 'education')}
          />
          <View style={styles.row}>
            <SelectableInput
              label="Start Year *"
              icon="calendar"
              containerStyle={styles.halfWidth}
              fieldName="educationStartYear"
              formData={educationInfo}
              onFieldChange={(field, value) => handleInputChange(field, value, 'education')}
              options={yearOptions}
            />
            <SelectableInput
              label="End Year (or expected)"
              icon="calendar"
              containerStyle={styles.halfWidth}
              fieldName="educationEndYear"
              formData={educationInfo}
              onFieldChange={(field, value) => handleInputChange(field, value, 'education')}
              options={['Current', ...yearOptions.slice(1)]}
            />
          </View>
          <FormInput 
            label="Achievements" 
            placeholder="Any academic achievements or honors" 
            icon="award" 
            fieldName="achievements"
            formData={educationInfo}
            onFieldChange={(field, value) => handleInputChange(field, value, 'education')}
            multiline
            numberOfLines={3}
          />
          
          <TouchableOpacity 
            style={[styles.sectionSubmitButton, { backgroundColor: '#FF3B30', marginTop: 16 }]}
            onPress={handleEducationInfoSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Feather name="save" size={20} color="white" />
                <Text style={styles.sectionSubmitButtonText}>Save Education Information</Text>
              </>
            )}
          </TouchableOpacity>
        </AccordionItem>

        <View style={{padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e2e8f0'}}>
          <TouchableOpacity 
            style={[styles.sectionSubmitButton, {backgroundColor: '#FF3B30'}]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Feather name="save" size={20} color="white" />
            <Text style={styles.sectionSubmitButtonText}>
              {loading ? 'Saving...' : 'Save All Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC',
  },
  sectionSubmitButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 14,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  sectionSubmitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
  },
  entryCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  entrySubtitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  entryField: {
    fontSize: 13,
    marginBottom: 4,
    color: '#64748b',
  },
  entryDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 8,
  },
  addButtonText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  addForm: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  // Modern Header Styles
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: 'bold',
    color: 'white'
  },
  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#6B7280',
  },
  // Legacy header (keeping for compatibility)
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  contentContainer: { padding: 20, paddingTop: 10 },
  accordionContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  accordionTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  accordionIcon: { marginRight: 10 },
  accordionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.light.tint },
  accordionContent: { padding: 15 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: { width: '48%' },
  inputContainer: { flex: 1, marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, fontSize: 16 },
  submitButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  subHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 5,
  },
  // Profile Picture Styles
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  profileId: {
    color: 'white',
    fontSize: 14,
    marginTop: 4,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.light.tint,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.light.tint,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.light.tint,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileId: {
    fontSize: 14,
    color: '#666',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  modalOption: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalOptionSelected: {
    color: Colors.light.tint,
    fontWeight: 'bold',
  },
});
