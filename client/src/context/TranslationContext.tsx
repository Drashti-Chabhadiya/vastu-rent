import React, { useEffect } from 'react'
import { authClient } from '#/lib/auth/auth-client'
import { useTranslationStore } from '#/store/useTranslationStore'

export type LanguageCode = 'en' | 'hi' | 'gu'

export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: 'English',
  hi: 'Hindi',
  gu: 'Gujarati',
}

export const translations = {
  en: {
    // Header
    'My Profile': 'My Profile',
    'Manage your personal information and account preferences.': 'Manage your personal information and account preferences.',

    // Member completeness
    'Verified Member': 'Verified Member',
    'Completeness': 'Completeness',
    'Pending Details:': 'Pending Details:',
    'Profile fully complete!': 'Profile fully complete!',
    'Member since': 'Member since',
    'Not specified': 'Not specified',

    // Buttons & Actions
    'Personal Information': 'Personal Information',
    'Edit Profile': 'Edit Profile',
    'Cancel': 'Cancel',
    'Save Changes': 'Save Changes',
    'Saving...': 'Saving...',
    'View': 'View',
    'Change': 'Change',
    'Manage': 'Manage',

    // Form Labels
    'Full Name': 'Full Name',
    'Gender': 'Gender',
    'Email Address': 'Email Address',
    'Location': 'Location',
    'Phone Number': 'Phone Number',
    'Preferred Language': 'Preferred Language',
    'Date of Birth': 'Date of Birth',

    // Genders & Options
    'Male': 'Male',
    'Female': 'Female',
    'Other': 'Other',
    'Select Gender': 'Select Gender',
    'Select Language': 'Select Language',
    'Select Currency': 'Select Currency',

    // Account Security
    'Account Security': 'Account Security',
    'Manage your password and account security settings.': 'Manage your password and account security settings.',
    'Password': 'Password',
    'Two-Factor Authentication': 'Two-Factor Authentication',
    'Enabled': 'Enabled',
    'Disabled': 'Disabled',
    'Login Sessions': 'Login Sessions',
    'Manage your active sessions': 'Manage your active sessions',
    'Devices': 'Devices',
    'Manage your trusted devices': 'Manage your trusted devices',

    // Preferences
    'Preferences': 'Preferences',
    'Customize your experience on Vastu.': 'Customize your experience on Vastu.',
    'Email Notifications': 'Email Notifications',
    'Stay updated with important updates': 'Stay updated with important updates',
    'SMS Notifications': 'SMS Notifications',
    'Receive text messages for bookings': 'Receive text messages for bookings',
    'Marketing Emails': 'Marketing Emails',
    'Receive offers and promotions': 'Receive offers and promotions',
    'Currency': 'Currency',

    // Subscription
    'Subscription Plan': 'Subscription Plan',
    'Manage your current plan, check limits, and view options.': 'Manage your current plan, check limits, and view options.',
    'Upgrade Plan': 'Upgrade Plan',
    'Listing Capacity': 'Listing Capacity',
    'Used': 'Used',
    'Plan Expired': 'Plan Expired',
    'Enjoy basic hosting with lifetime free access.': 'Enjoy basic hosting with lifetime free access.',
    'Valid until': 'Valid until',
    'Starter': 'Starter',
    'Pro': 'Pro',
    'Business': 'Business',
    'Plan': 'Plan',
    'Starter members can list up to 5 items. Upgrade to a paid plan to list up to 50 or unlimited items.': 'Starter members can list up to 5 items. Upgrade to a paid plan to list up to 50 or unlimited items.',
    'Pro members can list up to 50 items. Upgrade to the Business plan for unlimited items.': 'Pro members can list up to 50 items. Upgrade to the Business plan for unlimited items.',
    'You have unlimited listing capacity with your Business plan!': 'You have unlimited listing capacity with your Business plan!',
    'You have reached your listing limit. Upgrade your subscription plan to create new listings.': 'You have reached your listing limit. Upgrade your subscription plan to create new listings.',

    // Impact Banner
    'Green Member': 'Green Member',
    'You\'re saving the planet!': 'You\'re saving the planet!',
    'Thank you for being a part of our sustainable community.': 'Thank you for being a part of our sustainable community.',
    'View Impact': 'View Impact',

    // Notifications toasts
    'Profile changes saved successfully!': 'Profile changes saved successfully!',
    'Failed to save changes. Please try again.': 'Failed to save changes. Please try again.',
    'Preferences auto-saved successfully!': 'Preferences auto-saved successfully!',
    'Failed to update preference.': 'Failed to update preference.',
    'Failed to update currency.': 'Failed to update currency.',
    'Failed to update 2FA settings.': 'Failed to update 2FA settings.',

    // Global Navbar
    'Categories': 'Categories',
    'Catalogue': 'Catalogue',
    'How it works': 'How it works',
    'Pricing': 'Pricing',
    'Journal': 'Journal',
    'Become a host': 'Become a host',
    'Search...': 'Search...',
    'Download App': 'Download App',
    'Wishlist': 'Wishlist',
    'Sign in': 'Sign in',
    'Sign In': 'Sign In',
    'Sign Out': 'Sign Out',
    'Online': 'Online',
    'Verified': 'Verified',
    'Manage your profile': 'Manage your profile',
    'My Bookings': 'My Bookings',
    'View your bookings': 'View your bookings',
    'My Listings': 'My Listings',
    'Manage your items': 'Manage your items',
    'Dashboard': 'Dashboard',
    'View statistics': 'View statistics',
    'Admin': 'Admin',
    'System management': 'System management',
    'Saved items': 'Saved items',
    'Reviews': 'Reviews',
    'Your feedback': 'Your feedback',
    'Messages': 'Messages',
    'Conversations': 'Conversations',
    'Settings': 'Settings',
    'Help & Support': 'Help & Support',
    'Get assistance': 'Get assistance',
    'Quick Navigation': 'Quick Navigation',
    'View all categories': 'View all categories',
    'Explore items in': 'Explore items in',
    'Loading categories...': 'Loading categories...',

    // Global Footer
    'Need help?': 'Need help?',
    'Our support team is here for you 24/7.': 'Our support team is here for you 24/7.',
    'Visit Help Center': 'Visit Help Center',
    'Contact Support': 'Contact Support',
    'A trusted community marketplace for renting and hosting quality items. Live simply. Live in harmony.': 'A trusted community marketplace for renting and hosting quality items. Live simply. Live in harmony.',
    'Company': 'Company',
    'Explore': 'Explore',
    'Support': 'Support',
    'Stay in the loop': 'Stay in the loop',
    'Get tips, updates, and inspiration straight to your inbox.': 'Get tips, updates, and inspiration straight to your inbox.',
    'Enter your email': 'Enter your email',
    'No spam, unsubscribe anytime.': 'No spam, unsubscribe anytime.',
    'Secure Payments': 'Secure Payments',
    'Data Protection': 'Data Protection',
    '24/7 Support': '24/7 Support',
    'About Us': 'About Us',
    'Blog': 'Blog',
    'Contact Us': 'Contact Us',
    'Pricing Plans': 'Pricing Plans',
    'List an Item': 'List an Item',
    'Help Center': 'Help Center',
    'Trust & Safety': 'Trust & Safety',
    'Terms of Service': 'Terms of Service',
    'Country/region switched to': 'Country/region switched to',
  },
  hi: {
    // Header
    'My Profile': 'मेरी प्रोफ़ाइल',
    'Manage your personal information and account preferences.': 'अपनी व्यक्तिगत जानकारी और खाता प्राथमिकताओं को प्रबंधित करें।',

    // Member completeness
    'Verified Member': 'सत्यापित सदस्य',
    'Completeness': 'पूर्णता',
    'Pending Details:': 'लंबित विवरण:',
    'Profile fully complete!': 'प्रोफ़ाइल पूरी तरह से पूर्ण है!',
    'Member since': 'सदस्यता की तिथि',
    'Not specified': 'निर्दिष्ट नहीं है',

    // Buttons & Actions
    'Personal Information': 'व्यक्तिगत जानकारी',
    'Edit Profile': 'प्रोफ़ाइल संपादित करें',
    'Cancel': 'रद्द करें',
    'Save Changes': 'बदलाव सहेजें',
    'Saving...': 'सहेज रहा है...',
    'View': 'देखें',
    'Change': 'बदलें',
    'Manage': 'प्रबंधित करें',

    // Form Labels
    'Full Name': 'पूरा नाम',
    'Gender': 'लिंग',
    'Email Address': 'ईमेल पता',
    'Location': 'स्थान',
    'Phone Number': 'फ़ोन नंबर',
    'Preferred Language': 'पसंदीदा भाषा',
    'Date of Birth': 'जन्म तिथि',

    // Genders & Options
    'Male': 'पुरुष',
    'Female': 'महिला',
    'Other': 'अन्य',
    'Select Gender': 'लिंग चुनें',
    'Select Language': 'भाषा चुनें',
    'Select Currency': 'मुद्रा चुनें',

    // Account Security
    'Account Security': 'खाता सुरक्षा',
    'Manage your password and account security settings.': 'अपने पासवर्ड और खाता सुरक्षा सेटिंग्स प्रबंधित करें।',
    'Password': 'पासवर्ड',
    'Two-Factor Authentication': 'द्वि-कारक प्रमाणीकरण',
    'Enabled': 'सक्षम',
    'Disabled': 'अक्षम',
    'Login Sessions': 'लॉगिन सत्र',
    'Manage your active sessions': 'अपने सक्रिय सत्रों को प्रबंधित करें',
    'Devices': 'उपकरण',
    'Manage your trusted devices': 'अपने विश्वसनीय उपकरणों को प्रबंधित करें',

    // Preferences
    'Preferences': 'प्राथमिकताएं',
    'Customize your experience on Vastu.': 'वास्तु पर अपने अनुभव को अनुकूलित करें।',
    'Email Notifications': 'ईमेल सूचनाएं',
    'Stay updated with important updates': 'महत्वपूर्ण अपडेट के साथ अपडेट रहें',
    'SMS Notifications': 'एसएमएस सूचनाएं',
    'Receive text messages for bookings': 'बुकिंग के लिए टेक्स्ट संदेश प्राप्त करें',
    'Marketing Emails': 'विपणन ईमेल',
    'Receive offers and promotions': 'ऑफ़र और प्रचार प्राप्त करें',
    'Currency': 'मुद्रा',

    // Subscription
    'Subscription Plan': 'सदस्यता योजना',
    'Manage your current plan, check limits, and view options.': 'अपनी वर्तमान योजना प्रबंधित करें, सीमाएं जांचें और विकल्प देखें।',
    'Upgrade Plan': 'योजना अपग्रेड करें',
    'Listing Capacity': 'लिस्टिंग क्षमता',
    'Used': 'उपयोग किया गया',
    'Plan Expired': 'योजना समाप्त हो गई',
    'Enjoy basic hosting with lifetime free access.': 'आजीवन मुफ्त पहुंच के साथ बुनियादी होस्टिंग का आनंद लें।',
    'Valid until': 'तक मान्य',
    'Starter': 'स्टार्टर',
    'Pro': 'प्रो',
    'Business': 'बिजनेस',
    'Plan': 'योजना',
    'Starter members can list up to 5 items. Upgrade to a paid plan to list up to 50 or unlimited items.': 'स्टार्टर सदस्य 5 वस्तुओं तक सूचीबद्ध कर सकते हैं। 50 या असीमित वस्तुओं को सूचीबद्ध करने के लिए भुगतान योजना में अपग्रेड करें।',
    'Pro members can list up to 50 items. Upgrade to the Business plan for unlimited items.': 'प्रो सदस्य 50 वस्तुओं तक सूचीबद्ध कर सकते हैं। असीमित वस्तुओं के लिए बिजनेस योजना में अपग्रेड करें।',
    'You have unlimited listing capacity with your Business plan!': 'आपके पास अपनी व्यावसायिक (बिजनेस) योजना के साथ असीमित लिस्टिंग क्षमता है!',
    'You have reached your listing limit. Upgrade your subscription plan to create new listings.': 'आप अपनी लिस्टिंग सीमा तक पहुँच चुके हैं। नई लिस्टिंग बनाने के लिए अपनी सदस्यता योजना अपग्रेड करें।',

    // Impact Banner
    'Green Member': 'हरित सदस्य',
    'You\'re saving the planet!': 'आप ग्रह को बचा रहे हैं!',
    'Thank you for being a part of our sustainable community.': 'हमारे टिकाऊ समुदाय का हिस्सा बनने के लिए धन्यवाद।',
    'View Impact': 'प्रभाव देखें',

    // Notifications toasts
    'Profile changes saved successfully!': 'प्रोफ़ाइल परिवर्तन सफलतापूर्वक सहेजे गए!',
    'Failed to save changes. Please try again.': 'बदलाव सहेजने में विफल। कृपया पुन: प्रयास करें।',
    'Preferences auto-saved successfully!': 'प्राथमिकताएं सफलतापूर्वक सहेज ली गईं!',
    'Failed to update preference.': 'प्राथमिकता अपडेट करने में विफल।',
    'Failed to update currency.': 'मुद्रा अपडेट करने में विफल।',
    'Failed to update 2FA settings.': '2FA सेटिंग्स अपडेट करने में विफल।',

    // Global Navbar
    'Categories': 'श्रेणियां',
    'Catalogue': 'सूची',
    'How it works': 'यह कैसे काम करता है',
    'Pricing': 'मूल्य निर्धारण',
    'Journal': 'पत्रिका',
    'Become a host': 'होस्ट बनें',
    'Search...': 'खोजें...',
    'Download App': 'ऐप डाउनलोड करें',
    'Wishlist': 'इच्छा-सूची',
    'Sign in': 'साइन इन करें',
    'Sign In': 'साइन इन करें',
    'Sign Out': 'साइन आउट',
    'Online': 'ऑनलाइन',
    'Verified': 'सत्यापित',
    'Manage your profile': 'अपनी प्रोफ़ाइल प्रबंधित करें',
    'My Bookings': 'मेरी बुकिंग',
    'View your bookings': 'अपनी बुकिंग देखें',
    'My Listings': 'मेरी लिस्टिंग',
    'Manage your items': 'अपनी वस्तुओं को प्रबंधित करें',
    'Dashboard': 'डैशबोर्ड',
    'View statistics': 'आंकड़े देखें',
    'Admin': 'प्रशासक',
    'System management': 'प्रणाली प्रबंधन',
    'Saved items': 'सहेजी गई वस्तुएं',
    'Reviews': 'समीक्षाएं',
    'Your feedback': 'आपकी प्रतिक्रिया',
    'Messages': 'संदेश',
    'Conversations': 'बातचीत',
    'Settings': 'सेटिंग्स',
    'Help & Support': 'सहायता और समर्थन',
    'Get assistance': 'सहायता प्राप्त करें',
    'Quick Navigation': 'त्वरित नेविगेशन',
    'View all categories': 'सभी श्रेणियां देखें',
    'Explore items in': 'इसमें आइटम खोजें',
    'Loading categories...': 'श्रेणियां लोड हो रही हैं...',

    // Global Footer
    'Need help?': 'मदद की ज़रूरत है?',
    'Our support team is here for you 24/7.': 'हमारी सहायता टीम आपकी सेवा में 24/7 उपलब्ध है।',
    'Visit Help Center': 'सहायता केंद्र पर जाएं',
    'Contact Support': 'सहायता टीम से संपर्क करें',
    'A trusted community marketplace for renting and hosting quality items. Live simply. Live in harmony.': 'गुणवत्तापूर्ण वस्तुओं को किराए पर देने और होस्ट करने के लिए एक विश्वसनीय सामुदायिक बाज़ार। सादगी से जिएं। सद्भाव में जिएं।',
    'Company': 'कंपनी',
    'Explore': 'खोजें',
    'Support': 'समर्थन',
    'Stay in the loop': 'जुड़े रहें',
    'Get tips, updates, and inspiration straight to your inbox.': 'सीधे अपने इनबॉक्स में सुझाव, अपडेट और प्रेरणा प्राप्त करें।',
    'Enter your email': 'अपना ईमेल दर्ज करें',
    'No spam, unsubscribe anytime.': 'कोई स्पैम नहीं, कभी भी सदस्यता समाप्त करें।',
    'Secure Payments': 'सुरक्षित भुगतान',
    'Data Protection': 'डेटा सुरक्षा',
    '24/7 Support': '24/7 सहायता',
    'About Us': 'हमारे बारे में',
    'Blog': 'ब्लॉग',
    'Contact Us': 'संपर्क करें',
    'Pricing Plans': 'मूल्य निर्धारण योजनाएं',
    'List an Item': 'वस्तु सूचीबद्ध करें',
    'Help Center': 'सहायता केंद्र',
    'Trust & Safety': 'विश्वास और सुरक्षा',
    'Terms of Service': 'सेवा की शर्तें',
    'Country/region switched to': 'देश/क्षेत्र बदलकर किया गया',
  },
  gu: {
    // Header
    'My Profile': 'મારી પ્રોફાઇલ',
    'Manage your personal information and account preferences.': 'તમારી વ્યક્તિગત માહિતી અને એકાઉન્ટ પસંદગીઓનું સંચાલન કરો.',

    // Member completeness
    'Verified Member': 'પ્રમાણિત સભ્ય',
    'Completeness': 'પૂર્ણતા',
    'Pending Details:': 'બાકી વિગતો:',
    'Profile fully complete!': 'પ્રોફાઇલ સંપૂર્ણપણે પૂર્ણ છે!',
    'Member since': 'સભ્યપદ તારીખ',
    'Not specified': 'સ્પષ્ટ કરેલ નથી',

    // Buttons & Actions
    'Personal Information': 'વ્યક્તિગત માહિતી',
    'Edit Profile': 'પ્રોફાઇલ સંપાદિત કરો',
    'Cancel': 'રદ કરો',
    'Save Changes': 'ફેરફારો સાચવો',
    'Saving...': 'સાચવી રહ્યું છે...',
    'View': 'જુઓ',
    'Change': 'બદલો',
    'Manage': 'સંચાલન કરો',

    // Form Labels
    'Full Name': 'પૂરું નામ',
    'Gender': 'જાતિ',
    'Email Address': 'ઇમેઇલ સરનામું',
    'Location': 'સ્થાન',
    'Phone Number': 'ફોન નંબર',
    'Preferred Language': 'પસંદગીની ભાષા',
    'Date of Birth': 'જન્મ તારીખ',

    // Genders & Options
    'Male': 'પુરુષ',
    'Female': 'મહિલા',
    'Other': 'અન્ય',
    'Select Gender': 'જાતિ પસંદ કરો',
    'Select Language': 'ભાષા પસંદ કરો',
    'Select Currency': 'ચલણ પસંદ કરો',

    // Account Security
    'Account Security': 'એકાઉન્ટ સુરક્ષા',
    'Manage your password and account security settings.': 'તમારા પાસવર્ડ અને એકાઉન્ટ સુરક્ષા સેટિંગ્સનું સંચાલન કરો.',
    'Password': 'પાસવર્ડ',
    'Two-Factor Authentication': 'દ્વિ-પરિબળ પ્રમાણીકરણ',
    'Enabled': 'સક્ષમ',
    'Disabled': 'અક્ષમ',
    'Login Sessions': 'લૉગિન સત્રો',
    'Manage your active sessions': 'તમારા સક્રિય સત્રોનું સંચાલન કરો',
    'Devices': 'ઉપકરણો',
    'Manage your trusted devices': 'તમારા વિશ્વસનીય ઉપકરણોનું સંચાલન કરો',

    // Preferences
    'Preferences': 'પસંદગીઓ',
    'Customize your experience on Vastu.': 'વાસ્તુ પર તમારા અનુભવને અનુકૂળ બનાવો.',
    'Email Notifications': 'ઇમેઇલ સૂચનાઓ',
    'Stay updated with important updates': 'મહત્વપૂર્ણ અપડેટ્સ સાથે અપડેટ રહો',
    'SMS Notifications': 'એસએમએસ સૂચનાઓ',
    'Receive text messages for bookings': 'બુકિંગ માટે ટેક્સ્ટ સંદેશાઓ પ્રાપ્ત કરો',
    'Marketing Emails': 'માર્કેટિંગ ઇમેઇલ્સ',
    'Receive offers and promotions': 'ઑફર્સ અને પ્રમોશન પ્રાપ્ત કરો',
    'Currency': 'ચલણ',

    // Subscription
    'Subscription Plan': 'સબ્સ્ક્રિપ્શન પ્લાન',
    'Manage your current plan, check limits, and view options.': 'તમારા વર્તમાન પ્લાનનું સંચાલન કરો, મર્યાદાઓ તપાસો અને વિકલ્પો જુઓ.',
    'Upgrade Plan': 'પ્લાન અપગ્રેડ કરો',
    'Listing Capacity': 'લિસ્ટિંગ ક્ષમતા',
    'Used': 'વપરાયેલ',
    'Plan Expired': 'પ્લાન સમાપ્ત થઈ ગયો',
    'Enjoy basic hosting with lifetime free access.': 'આજીવન મફત ઍક્સેસ સાથે મૂળભૂત હોસ્ટિંગનો આનંદ માણો.',
    'Valid until': 'સુધી માન્ય',
    'Starter': 'સ્ટાર્ટર',
    'Pro': 'પ્રો',
    'Business': 'બિઝનેસ',
    'Plan': 'પ્લાન',
    'Starter members can list up to 5 items. Upgrade to a paid plan to list up to 50 or unlimited items.': 'સ્ટાર્ટર સભ્યો 5 વસ્તુઓ સુધી સૂચિબદ્ધ કરી શકે છે. 50 અથવા અમર્યાદિત વસ્તુઓની સૂચિ બનાવવા માટે પેઇડ પ્લાન પર અપગ્રેડ કરો.',
    'Pro members can list up to 50 items. Upgrade to the Business plan for unlimited items.': 'પ્રો સભ્યો 50 વસ્તુઓ સુધી સૂચિબદ્ધ કરી શકે છે. અમર્યાદિત વસ્તુઓ માટે બિઝનેસ પ્લાન પર અપગ્રેડ કરો.',
    'You have unlimited listing capacity with your Business plan!': 'તમારી પાસે તમારા બિઝનેસ પ્લાન સાથે અમર્યાદિત લિસ્ટિંગ ક્ષમતા છે!',
    'You have reached your listing limit. Upgrade your subscription plan to create new listings.': 'તમે તમારી લિસ્ટિંગ મર્યાદા પર પહોંચી ગયા છો. નવી સૂચિઓ બનાવવા માટે તમારા સબ્સ્ક્રિપ્શન પ્લાનને અપગ્રેડ કરો.',

    // Impact Banner
    'Green Member': 'ગ્રીન મેમ્બર',
    'You\'re saving the planet!': 'તમે પૃથ્વીને બચાવી રહ્યા છો!',
    'Thank you for being a part of our sustainable community.': 'અમારા ટકાઉ સમુદાયનો ભાગ બનવા બદલ આભાર.',
    'View Impact': 'અસર જુઓ',

    // Notifications toasts
    'Profile changes saved successfully!': 'પ્રોફાઇલ ફેરફારો સફળતાપૂર્વક સાચવવામાં આવ્યા!',
    'Failed to save changes. Please try again.': 'કૃપા કરીને ફરીથી પ્રયાસ કરો.',
    'Preferences auto-saved successfully!': 'પસંદગીઓ સફળતાપૂર્વક સાચવવામાં આવી!',
    'Failed to update preference.': 'પસંદગી અપડેટ કરવામાં નિષ્ફળ.',
    'Failed to update currency.': 'ચલણ અપડેટ કરવામાં નિષ્ફળ.',
    'Failed to update 2FA settings.': '2FA સેટિંગ્સ અપડેટ કરવામાં નિષ્ફળ.',

    // Global Navbar
    'Categories': 'શ્રેણીઓ',
    'Catalogue': 'સૂચિ',
    'How it works': 'તે કેવી રીતે કામ કરે છે',
    'Pricing': 'કિંમત નિર્ધારણ',
    'Journal': 'જર્નલ',
    'Become a host': 'હોસ્ટ બનો',
    'Search...': 'શોધો...',
    'Download App': 'એપ ડાઉનલોડ કરો',
    'Wishlist': 'વિશલિસ્ટ',
    'Sign in': 'સાઇન ઇન',
    'Sign In': 'સાઇન ઇન',
    'Sign Out': 'સાઇન આઉટ',
    'Online': 'ઓનલાઇન',
    'Verified': 'પ્રમાણિત',
    'Manage your profile': 'તમારી પ્રોફાઇલનું સંચાલન કરો',
    'My Bookings': 'મારી બુકિંગ',
    'View your bookings': 'તમારી બુકિંગ જુઓ',
    'My Listings': 'મારી લિસ્ટિંગ',
    'Manage your items': 'તમારી વસ્તુઓનું સંચાલન કરો',
    'Dashboard': 'ડેશબોર્ડ',
    'View statistics': 'આંકડા જુઓ',
    'Admin': 'એડમિન',
    'System management': 'સિસ્ટમ મેનેજમેન્ટ',
    'Saved items': 'સાચવેલી વસ્તુઓ',
    'Reviews': 'સમીક્ષાઓ',
    'Your feedback': 'તમારો પ્રતિસાદ',
    'Messages': 'સંદેશાઓ',
    'Conversations': 'વાતચીત',
    'Settings': 'સેટિંગ્સ',
    'Help & Support': 'મદદ અને સપોર્ટ',
    'Get assistance': 'સહાય મેળવો',
    'Quick Navigation': 'ઝડપી નેવિગેશન',
    'View all categories': 'બધી શ્રેણીઓ જુઓ',
    'Explore items in': 'આમાં વસ્તુઓ શોધો',
    'Loading categories...': 'શ્રેણીઓ લોડ થઈ રહી છે...',

    // Global Footer
    'Need help?': 'મદદની જરૂર છે?',
    'Our support team is here for you 24/7.': 'અમારી સપોર્ટ ટીમ તમારી સેવામાં 24/7 ઉપલબ્ધ છે.',
    'Visit Help Center': 'હેલ્પ સેન્ટરની મુલાકાત લો',
    'Contact Support': 'સપોર્ટનો સંપર્ક કરો',
    'A trusted community marketplace for renting and hosting quality items. Live simply. Live in harmony.': 'ગુણવત્તાવાળી વસ્તુઓ ભાડે આપવા અને હોસ્ટ કરવા માટે વિશ્વસનીય સામુદાયિક બજાર. સરળતાથી જીવો. સંવાદિતામાં જીવો.',
    'Company': 'કંપની',
    'Explore': 'અન્વેષણ',
    'Support': 'સપોર્ટ',
    'Stay in the loop': 'નવીનતમ માહિતી મેળવો',
    'Get tips, updates, and inspiration straight to your inbox.': 'ટિપ્સ, અપડેટ્સ અને પ્રેરણા સીધા તમારા ઇનબોક્સમાં મેળવો.',
    'Enter your email': 'તમારો ઇમેઇલ દાખલ કરો',
    'No spam, unsubscribe anytime.': 'કોઈ સ્પામ નથી, ગમે ત્યારે અનસબ્સ્ક્રાઇબ કરો.',
    'Secure Payments': 'સુરક્ષિત ચૂકવણી',
    'Data Protection': 'ડેટા પ્રોટેક્શન',
    '24/7 Support': '24/7 સપોર્ટ',
    'About Us': 'અમારા વિશે',
    'Blog': 'બ્લોગ',
    'Contact Us': 'અમારો સંપર્ક કરો',
    'Pricing Plans': 'કિંમત નિર્ધારણ પ્લાન',
    'List an Item': 'વસ્તુ સૂચિબદ્ધ કરો',
    'Help Center': 'હેલ્પ સેન્ટર',
    'Trust & Safety': 'વિશ્વાસ અને સુરક્ષા',
    'Terms of Service': 'સેવાની શરતો',
    'Country/region switched to': 'દેશ/પ્રદેશ બદલીને કરવામાં આવ્યો',
  },
} as const

type TranslationKey = keyof typeof translations.en





export function normalizeLanguage(lang: string | null | undefined): LanguageCode {
  if (!lang) return 'en'
  const lower = lang.toLowerCase()
  if (lower === 'hi' || lower === 'hindi') return 'hi'
  if (lower === 'gu' || lower === 'gujarati') return 'gu'
  return 'en'
}

function setCookie(name: string, value: string, days?: number) {
  if (typeof document === 'undefined') return
  let expires = ""
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
    expires = "; expires=" + date.toUTCString()
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/"
}

function getCookie(name: string) {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

function eraseCookie(name: string) {
  if (typeof document === 'undefined') return
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
}

const loadGoogleTranslateScript = () => {
  if (typeof window === 'undefined') return
  if (document.getElementById('google-translate-script')) return

  // Create translate element mount div if not present
  if (!document.getElementById('google_translate_element')) {
    const div = document.createElement('div')
    div.id = 'google_translate_element'
    div.style.display = 'none'
    document.body.appendChild(div)
  }

  // Set up global init callback
  ; (window as any).googleTranslateElementInit = () => {
    new (window as any).google.translate.TranslateElement({
      pageLanguage: 'en',
      includedLanguages: 'en,hi,gu',
      autoDisplay: false
    }, 'google_translate_element')
  }

  const script = document.createElement('script')
  script.id = 'google-translate-script'
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
  script.async = true
  document.body.appendChild(script)
}

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = authClient.useSession()
  const language = useTranslationStore((state) => state.language)
  const setLanguageState = useTranslationStore((state) => state.setLanguageState)

  // Keep state in sync with authenticated user preference on session change
  useEffect(() => {
    if (session?.user) {
      const userLang = (session.user as any).language
      if (userLang) {
        const normalized = normalizeLanguage(userLang)
        if (normalized !== language) {
          setLanguageState(normalized)
          localStorage.setItem('app_language', normalized)
        }
      }
    }
  }, [session, language, setLanguageState])

  // Dynamically set cookie and load translate widget script on mount/language changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    const targetCookieVal = language === 'en' ? null : `/en/${language}`
    const currentCookie = getCookie('googtrans')

    if (language !== 'en' && currentCookie !== targetCookieVal) {
      setCookie('googtrans', `/en/${language}`)
      loadGoogleTranslateScript()
      window.location.reload()
    } else if (language === 'en' && currentCookie) {
      eraseCookie('googtrans')
      window.location.reload()
    } else if (language !== 'en') {
      loadGoogleTranslateScript()
    }
  }, [language])

  return <>{children}</>
}

export function useTranslation() {
  const language = useTranslationStore((state) => state.language)
  const changeLanguage = useTranslationStore((state) => state.changeLanguage)

  const t = (key: TranslationKey | string): string => {
    const dict = translations[language] as Record<string, string>
    return dict[key] || translations.en[key as TranslationKey] || key
  }

  return { language, changeLanguage, t }
}
