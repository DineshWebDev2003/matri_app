import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Login Screen
    'login': 'Login',
    'email': 'Email',
    'email_placeholder': 'Enter your email',
    'password': 'Password',
    'password_placeholder': 'Enter your password',
    'forgot_password': 'Forgot Password?',
    'sign_in': 'Sign in',
    'or': 'or',
    'login_with_google': 'Login with Google',
    'dont_have_account': "Don't Have an Account?",
    'signup': 'Signup',
    'have_account': 'Already have an account?',
    'first_name': 'First Name',
    'last_name': 'Last Name',
    'mobile_number': 'Mobile Number',
    'date_of_birth': 'Date of Birth',
    'religion': 'Religion',
    'caste': 'Caste',
    'looking_for': 'Looking For',
    'error_empty_fields': 'Please enter both email and password.',
    'login_failed': 'Login Failed',
    'check_credentials': 'Please check your credentials and try again.',
    'network_error': 'Network Error',
    'check_connection': 'Please check your internet connection and ensure the server is running.',
    'connection_timeout': 'Connection timeout. Please try again.',
    
    // Home Screen
    'search_placeholder': 'Search...',
    'just_joined': 'Just Joined',
    'new_matches': 'New Matches',
    'recommended_matches': 'Recommended Matches',
    'view_all': 'View all',
    'interest_requests': 'Interest Requests',
    'interest_sent': 'Interest Sent',
    'total_shortlist': 'Total Shortlist',
    
    // Profile Screen
    'profiles': 'Profiles',
    'newly_joined': 'Newly joined',
    'all_profiles': 'All Profiles',
    'premium': 'Premium',
    'search': 'Search',
    'search_by_name': 'Search by name, caste, or profile ID...',
    'no_profiles_found': 'No profiles found',
    'loading_profiles': 'Loading profiles...',
    
    // Chat Screen
    'messages': 'Messages',
    'all': 'All',
    'unread': 'Unread',
    'chats': 'Chats',
    'interest': 'Interest',
    'online': 'Online',
    'say_something_nice': 'Say Something nice...',
    'voice_message': 'Voice Message',
    'today': 'Today',
    'yesterday': 'Yesterday',
    
    // Account Screen
    'account': 'Account',
    'profile': 'Profile',
    'settings': 'Settings',
    'logout': 'Logout',
    
    // Common
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'cancel': 'Cancel',
    'ok': 'OK',
    'age': 'Age',
    'height': 'Height',
    'location': 'Location',
    'id': 'ID',
    'message': 'Message',
    'saved': 'Saved',
    'edit_profile': 'Edit Profile',
    'complete_profile': 'Complete Profile',
    'plans_pricing': 'Plans & Pricing',
    'purchase_history': 'Purchase History',
    'ignored_lists': 'Ignored Lists',
    'privacy_centre': 'Privacy Centre',
    'account_status': 'Account Status',
    'link_history': 'Link History',
    'push_notification': 'Push Notification',
    'email_notification': 'Email Notification',
    'sms_notification': 'SMS Notification',
    'weekly_notification': 'Weekly Notification',
    'search_history': 'Search History',
    'privacy_policy': 'Privacy Policy',
    'about_us': 'About Us',
    'customer_care': 'Customer Care',
    'personal_information': 'Personal Information',
    'notifications_settings': 'Notifications Settings',
    'other_settings': 'Other Settings',
    
    // Home Banner
    'find_your_match': 'Find Your Match',
    'connect_with_perfect_partner': 'Connect with your perfect life partner',
    'verified_profiles': 'Verified Profiles',
    'safe_secure': 'Safe & Secure',
    'quick_matches': 'Quick Matches',
    'marriage_tagline': 'Find Your Perfect Match Today',
  },
  ta: {
    // Login Screen
    'login': 'உள்நுழைக',
    'email': 'மின்னஞ்சல்',
    'email_placeholder': 'உங்கள் மின்னஞ்சல் உள்ளிடவும்',
    'password': 'கடவுச்சொல்',
    'password_placeholder': 'உங்கள் கடவுச்சொல் உள்ளிடவும்',
    'forgot_password': 'கடவுச்சொல் மறந்துவிட்டீர்களா?',
    'sign_in': 'உள்நுழைக',
    'or': 'அல்லது',
    'login_with_google': 'Google மூலம் உள்நுழைக',
    'dont_have_account': 'கணக்கு இல்லையா?',
    'signup': 'பதிவு செய்க',
    'have_account': 'ஏற்கனவே கணக்கு உள்ளதா?',
    'first_name': 'முதல் பெயர்',
    'last_name': 'கடைசி பெயர்',
    'mobile_number': 'மொபைல் எண்',
    'date_of_birth': 'பிறந்த தேதி',
    'religion': 'மதம்',
    'caste': 'சாதி',
    'looking_for': 'தேடுகிறீர்கள்',
    'error_empty_fields': 'தயவுசெய்து மின்னஞ்சல் மற்றும் கடவுச்சொல் இரண்டையும் உள்ளிடவும்.',
    'login_failed': 'உள்நுழைவு தோல்வியடைந்தது',
    'check_credentials': 'தயவுசெய்து உங்கள் நற்சான்றுகளைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.',
    'network_error': 'நெட்வொர்க் பிழை',
    'check_connection': 'தயவுசெய்து உங்கள் இணைய இணைப்பைச் சரிபார்த்து சேவையகம் இயங்கிக்கொண்டிருக்கிறதா என்பதை உறுதிசெய்யவும்.',
    'connection_timeout': 'இணைப்பு காலம் முடிந்துவிட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
    
    // Home Screen
    'search_placeholder': 'தேடுக...',
    'just_joined': 'புதிதாக சேர்ந்தவர்கள்',
    'new_matches': 'புதிய பொருத்தங்கள்',
    'recommended_matches': 'பரிந்துரைக்கப்பட்ட பொருத்தங்கள்',
    'view_all': 'அனைத்தையும் பார்க்க',
    'interest_requests': 'ஆர்வ கோரிக்கைகள்',
    'interest_sent': 'ஆர்வம் அனுப்பப்பட்டது',
    'total_shortlist': 'மொத்த குறுகிய பட்டியல்',
    
    // Profile Screen
    'profiles': 'சுயவிவரங்கள்',
    'newly_joined': 'புதிதாக சேர்ந்தவர்கள்',
    'all_profiles': 'அனைத்து சுயவிவரங்கள்',
    'premium': 'பிரீமியம்',
    'search': 'தேடல்',
    'search_by_name': 'பெயர், சாதி அல்லது சுயவிவர ஐடி மூலம் தேடுங்கள்...',
    'no_profiles_found': 'சுயவிவரங்கள் எதுவும் கிடைக்கவில்லை',
    'loading_profiles': 'சுயவிவரங்களை ஏற்றுகிறது...',
    
    // Chat Screen
    'messages': 'செய்திகள்',
    'all': 'அனைத்தும்',
    'unread': 'படிக்கப்படாதவை',
    'chats': 'அரட்டைகள்',
    'interest': 'ஆர்வம்',
    'online': 'ஆன்லைன்',
    'say_something_nice': 'ஏதாவது நல்லது சொல்லுங்கள்...',
    'voice_message': 'குரல் செய்தி',
    'today': 'இன்று',
    'yesterday': 'நேற்று',
    
    // Account Screen
    'account': 'கணக்கு',
    'profile': 'சுயவிவரம்',
    'settings': 'அமைப்புகள்',
    'logout': 'வெளியேறு',
    
    // Common
    'loading': 'ஏற்றுகிறது...',
    'error': 'பிழை',
    'success': 'வெற்றி',
    'cancel': 'ரத்து',
    'ok': 'சரி',
    'age': 'வயது',
    'height': 'உயரம்',
    'location': 'இடம்',
    'id': 'ஐடி',
    'message': 'செய்தி',
    'saved': 'சேமிக்கப்பட்டது',
    'edit_profile': 'சுயவிவரத்தைத் திருத்து',
    'complete_profile': 'சுயவிவரத்தை முடிக்கவும்',
    'plans_pricing': 'திட்டங்கள் & விலை',
    'purchase_history': 'வாங்கல் வரலாறு',
    'ignored_lists': 'புறக்கணிக்கப்பட்ட பட்டியல்கள்',
    'privacy_centre': 'தனியுரிமை மையம்',
    'account_status': 'கணக்கு நிலை',
    'link_history': 'இணைப்பு வரலாறு',
    'push_notification': 'தள்ளு அறிவிப்பு',
    'email_notification': 'மின்னஞ்சல் அறிவிப்பு',
    'sms_notification': 'SMS அறிவிப்பு',
    'weekly_notification': 'வாரந்தோறும் அறிவிப்பு',
    'search_history': 'தேடல் வரலாறு',
    'privacy_policy': 'தனியுரிமை கொள்கை',
    'about_us': 'எங்களைப் பற்றி',
    'customer_care': 'வாடிக்கையாளர் பராமரிப்பு',
    'personal_information': 'தனிப்பட்ட தகவல்',
    'notifications_settings': 'அறிவிப்பு அமைப்புகள்',
    'other_settings': 'பிற அமைப்புகள்',
    
    // Home Banner
    'find_your_match': 'உங்கள் பொருத்தத்தைக் கண்டுபிடிக்கவும்',
    'connect_with_perfect_partner': 'உங்கள் சரியான வாழ்க்கைத் துணையுடன் இணைக்கவும்',
    'verified_profiles': 'சரிபார்க்கப்பட்ட சுயவிவரங்கள்',
    'safe_secure': 'பாதுகாப்பான & நிரப்பத்தான',
    'quick_matches': 'விரைவான பொருத்தங்கள்',
    'marriage_tagline': 'இன்றே உங்கள் சரியான பொருத்தத்தைக் கண்டுபிடிக்கவும்',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
