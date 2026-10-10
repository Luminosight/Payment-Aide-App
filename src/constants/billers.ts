import { BillerCategory } from '../types';
import { ImageSourcePropType } from 'react-native';

export interface CatalogBiller {
  id: string;
  name: string;
  category: BillerCategory;
  logo: ImageSourcePropType;
}

export const BILLER_CATEGORIES: BillerCategory[] = [
  'E-commerce/BNPL',
  'Traditional Bank',
  'Digital Bank',
  'Utility',
  'Telco',
  'Subscriptions',
  'Government',
];

export const CATEGORY_ICONS: Record<string, string> = {
  'E-commerce/BNPL': 'cart-outline',
  'Traditional Bank': 'business-outline',
  'Digital Bank': 'phone-portrait-outline',
  'Utility': 'flash-outline',
  'Telco': 'wifi-outline',
  'Subscriptions': 'tv-outline',
  'Government': 'shield-checkmark-outline',
  'Other': 'ellipsis-horizontal-circle-outline',
};

export const BILLER_CATALOG: CatalogBiller[] = [
  // E-commerce / BNPL
  { id: 'bnpl_001', name: 'SPayLater (Shopee)', category: 'E-commerce/BNPL', logo: require('../../assets/images/billers/spaylater-shopee.png') },
  { id: 'bnpl_002', name: 'SLoan (Shopee)', category: 'E-commerce/BNPL', logo: require('../../assets/images/billers/sloan-shopee.png') },
  { id: 'bnpl_010', name: 'TikTok Pay Later', category: 'E-commerce/BNPL', logo: require('../../assets/images/billers/tiktokpaylater.png') },
  { id: 'bnpl_003', name: 'LazPayLater (Lazada)', category: 'E-commerce/BNPL', logo: require('../../assets/images/billers/lazpaylater-lazada.png') },
  { id: 'bnpl_004', name: 'Home Credit', category: 'E-commerce/BNPL', logo: require('../../assets/images/billers/home-credit.png') },
  { id: 'bnpl_005', name: 'BillEase', category: 'E-commerce/BNPL', logo: require('../../assets/images/billers/billease.png') },
  { id: 'bnpl_006', name: 'GGives (GCash)', category: 'E-commerce/BNPL', logo: require('../../assets/images/billers/ggives-gcash.png') },
  { id: 'bnpl_007', name: 'GCredit (GCash)', category: 'E-commerce/BNPL', logo: require('../../assets/images/billers/gcredit-gcash.png') },
  { id: 'bnpl_008', name: 'Maya Credit', category: 'E-commerce/BNPL', logo: require('../../assets/images/billers/maya-credit.png') },
  { id: 'bnpl_009', name: 'Atome', category: 'E-commerce/BNPL', logo: require('../../assets/images/billers/atome.png') },
  // Traditional Bank
  { id: 'bank_001', name: 'BDO', category: 'Traditional Bank', logo: require('../../assets/images/billers/bdo.png') },
  { id: 'bank_002', name: 'BPI (Bank of the Phil. Islands)', category: 'Traditional Bank', logo: require('../../assets/images/billers/bpi.png') },
  { id: 'bank_003', name: 'Metrobank', category: 'Traditional Bank', logo: require('../../assets/images/billers/metrobank.png') },
  { id: 'bank_004', name: 'UnionBank', category: 'Traditional Bank', logo: require('../../assets/images/billers/unionbank.png') },
  { id: 'bank_005', name: 'RCBC Pulz / Credit Card', category: 'Traditional Bank', logo: require('../../assets/images/billers/rcbc.png') },
  { id: 'bank_006', name: 'Security Bank', category: 'Traditional Bank', logo: require('../../assets/images/billers/security-bank.png') },
  { id: 'bank_007', name: 'EastWest Bank', category: 'Traditional Bank', logo: require('../../assets/images/billers/eastwest-bank.png') },
  { id: 'bank_008', name: 'PNB (Philippine National Bank)', category: 'Traditional Bank', logo: require('../../assets/images/billers/pnb.png') },
  { id: 'bank_009', name: 'China Bank', category: 'Traditional Bank', logo: require('../../assets/images/billers/china-bank.png') },
  // Digital Bank
  { id: 'digi_001', name: 'Maya Bank', category: 'Digital Bank', logo: require('../../assets/images/billers/maya-bank.png') },
  { id: 'digi_002', name: 'GoTyme Bank', category: 'Digital Bank', logo: require('../../assets/images/billers/gotyme-bank.png') },
  { id: 'digi_003', name: 'Tonik Bank', category: 'Digital Bank', logo: require('../../assets/images/billers/tonik-bank.png') },
  { id: 'digi_004', name: 'Uno Digital Bank', category: 'Digital Bank', logo: require('../../assets/images/billers/uno-digital-bank.png') },
  { id: 'digi_005', name: 'CIMB Bank Philippines', category: 'Digital Bank', logo: require('../../assets/images/billers/cimb-bank.png') },
  { id: 'digi_006', name: 'MariBank', category: 'Digital Bank', logo: require('../../assets/images/billers/maribank.png') },
  // Utility
  { id: 'util_001', name: 'Meralco', category: 'Utility', logo: require('../../assets/images/billers/meralco.png') },
  { id: 'util_002', name: 'Maynilad', category: 'Utility', logo: require('../../assets/images/billers/maynilad.png') },
  { id: 'util_003', name: 'Manila Water', category: 'Utility', logo: require('../../assets/images/billers/manila-water.png') },
  // Telco
  { id: 'util_004', name: 'Globe Postpaid', category: 'Telco', logo: require('../../assets/images/billers/globe-postpaid.png') },
  { id: 'util_005', name: 'PLDT Home', category: 'Telco', logo: require('../../assets/images/billers/pldt-home.png') },
  { id: 'util_006', name: 'Converge ICT', category: 'Telco', logo: require('../../assets/images/billers/converge-ict.png') },
  { id: 'telco_004', name: 'Starlink', category: 'Telco', logo: require('../../assets/images/billers/starlink.png') },
  // Subscriptions
  { id: 'subs_001', name: 'Netflix', category: 'Subscriptions', logo: require('../../assets/images/billers/netflix.png') },
  { id: 'subs_002', name: 'Disney+', category: 'Subscriptions', logo: require('../../assets/images/billers/disney-plus.png') },
  { id: 'subs_003', name: 'Amazon Prime Video', category: 'Subscriptions', logo: require('../../assets/images/billers/amazon-prime-video.png') },
  { id: 'subs_004', name: 'YouTube Music', category: 'Subscriptions', logo: require('../../assets/images/billers/youtube-music.png') },
  { id: 'subs_005', name: 'Spotify', category: 'Subscriptions', logo: require('../../assets/images/billers/spotify.png') },
  // Government
  { id: 'govt_001', name: 'SSS', category: 'Government', logo: require('../../assets/images/billers/sss.png') },
  { id: 'govt_002', name: 'PhilHealth', category: 'Government', logo: require('../../assets/images/billers/philhealth.png') },
  { id: 'govt_003', name: 'Pag-IBIG', category: 'Government', logo: require('../../assets/images/billers/pagibig.png') },
];
