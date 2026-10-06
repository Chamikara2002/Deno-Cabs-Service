import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  X, Check, ArrowLeft, ArrowRight, ShieldCheck, Car, Bus, Calendar, Clock, Info, CheckCircle, Search, ChevronDown, Navigation
} from 'lucide-react';
import LocationSearchInput from '../../Common/LocationSearchInput';
import LeafletRouteMap from '../../Common/LeafletRouteMap';
import { calculateDrivingRoute } from '../../../services/mapService';
import '../css/HireBookingModal.css';

const CATEGORIES = [
  { id: 'Cars', label: 'Cars', icon: 'car' },
  { id: 'Vans', label: 'Vans', icon: 'van' },
  { id: 'SUVs', label: 'SUVs', icon: 'suv' },
  { id: 'Buses', label: 'Buses', icon: 'bus' }
];

const FLEET_BY_CATEGORY = {
  Cars: [
    { id: 'c1', name: 'Toyota Axio', type: 'Premium Sedan • 4 Seats', ratePerKm: 100, image: 'https://images.unsplash.com/photo-1541348263662-e082662d82da?auto=format&fit=crop&q=80&w=400', tag: 'AC' },
    { id: 'c2', name: 'Honda Fit', type: 'Compact Hatchback • 4 Seats', ratePerKm: 100, image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400' },
    { id: 'c3', name: 'Toyota Vitz', type: 'Compact Hatchback • 4 Seats', ratePerKm: 100, image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=400' },
    { id: 'c4', name: 'Suzuki Alto', type: 'Economy • 3 Seats', ratePerKm: 80, image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400' }
  ],
  SUVs: [
    { id: 's1', name: 'Toyota Land Cruiser V8', type: 'Premium SUV • 7 Seats', ratePerKm: 150, image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400', tag: 'PREMIUM' },
    { id: 's2', name: 'Range Rover Autobiography', type: 'Luxury SUV • 5 Seats', ratePerKm: 180, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400' },
    { id: 's3', name: 'Mitsubishi Montero', type: 'Executive SUV • 7 Seats', ratePerKm: 130, image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=400' },
    { id: 's4', name: 'Honda Vezel', type: 'Compact SUV • 5 Seats', ratePerKm: 100, image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400' }
  ],
  Vans: [
    { id: 'v1', name: 'Mercedes-Benz Sprinter', type: 'VIP Executive Van • 12 Seats', ratePerKm: 160, image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400' },
    { id: 'v2', name: 'Toyota KDH VIP Van', type: 'Chauffeur Van • 9 Seats', ratePerKm: 120, image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400' }
  ],
  Buses: [
    { id: 'b1', name: 'Toyota Coaster Luxury Bus', type: 'VIP Tour Bus • 24 Seats', ratePerKm: 200, image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=400' }
  ]
};

const COUNTRY_CODES = [
  { name: 'Sri Lanka', code: '+94', iso: 'LK', flag: '🇱🇰', minDigits: 9, maxDigits: 10 },
  { name: 'Afghanistan', code: '+93', iso: 'AF', flag: '🇦🇫', minDigits: 9, maxDigits: 9 },
  { name: 'Albania', code: '+355', iso: 'AL', flag: '🇦🇱', minDigits: 9, maxDigits: 9 },
  { name: 'Algeria', code: '+213', iso: 'DZ', flag: '🇩🇿', minDigits: 9, maxDigits: 9 },
  { name: 'Andorra', code: '+376', iso: 'AD', flag: '🇦🇩', minDigits: 6, maxDigits: 6 },
  { name: 'Angola', code: '+244', iso: 'AO', flag: '🇦🇴', minDigits: 9, maxDigits: 9 },
  { name: 'Argentina', code: '+54', iso: 'AR', flag: '🇦🇷', minDigits: 10, maxDigits: 11 },
  { name: 'Armenia', code: '+374', iso: 'AM', flag: '🇦🇲', minDigits: 8, maxDigits: 8 },
  { name: 'Australia', code: '+61', iso: 'AU', flag: '🇦🇺', minDigits: 9, maxDigits: 10 },
  { name: 'Austria', code: '+43', iso: 'AT', flag: '🇦🇹', minDigits: 10, maxDigits: 11 },
  { name: 'Azerbaijan', code: '+994', iso: 'AZ', flag: '🇦🇿', minDigits: 9, maxDigits: 9 },
  { name: 'Bahamas', code: '+1', iso: 'BS', flag: '🇧🇸', minDigits: 10, maxDigits: 10 },
  { name: 'Bahrain', code: '+973', iso: 'BH', flag: '🇧🇭', minDigits: 8, maxDigits: 8 },
  { name: 'Bangladesh', code: '+880', iso: 'BD', flag: '🇧🇩', minDigits: 10, maxDigits: 10 },
  { name: 'Barbados', code: '+1', iso: 'BB', flag: '🇧🇧', minDigits: 10, maxDigits: 10 },
  { name: 'Belarus', code: '+375', iso: 'BY', flag: '🇧🇾', minDigits: 9, maxDigits: 9 },
  { name: 'Belgium', code: '+32', iso: 'BE', flag: '🇧🇪', minDigits: 9, maxDigits: 9 },
  { name: 'Belize', code: '+501', iso: 'BZ', flag: '🇧🇿', minDigits: 7, maxDigits: 7 },
  { name: 'Benin', code: '+229', iso: 'BJ', flag: '🇧🇯', minDigits: 8, maxDigits: 8 },
  { name: 'Bhutan', code: '+975', iso: 'BT', flag: '🇧🇹', minDigits: 8, maxDigits: 8 },
  { name: 'Bolivia', code: '+591', iso: 'BO', flag: '🇧🇴', minDigits: 8, maxDigits: 8 },
  { name: 'Bosnia and Herzegovina', code: '+387', iso: 'BA', flag: '🇧🇦', minDigits: 8, maxDigits: 8 },
  { name: 'Botswana', code: '+267', iso: 'BW', flag: '🇧🇼', minDigits: 7, maxDigits: 8 },
  { name: 'Brazil', code: '+55', iso: 'BR', flag: '🇧🇷', minDigits: 10, maxDigits: 11 },
  { name: 'Brunei', code: '+673', iso: 'BN', flag: '🇧🇳', minDigits: 7, maxDigits: 7 },
  { name: 'Bulgaria', code: '+359', iso: 'BG', flag: '🇧🇬', minDigits: 9, maxDigits: 9 },
  { name: 'Burkina Faso', code: '+226', iso: 'BF', flag: '🇧🇫', minDigits: 8, maxDigits: 8 },
  { name: 'Burundi', code: '+257', iso: 'BI', flag: '🇧🇮', minDigits: 8, maxDigits: 8 },
  { name: 'Cambodia', code: '+855', iso: 'KH', flag: '🇰🇭', minDigits: 8, maxDigits: 9 },
  { name: 'Cameroon', code: '+237', iso: 'CM', flag: '🇨🇲', minDigits: 9, maxDigits: 9 },
  { name: 'Canada', code: '+1', iso: 'CA', flag: '🇨🇦', minDigits: 10, maxDigits: 10 },
  { name: 'Central African Republic', code: '+236', iso: 'CF', flag: '🇨🇫', minDigits: 8, maxDigits: 8 },
  { name: 'Chad', code: '+235', iso: 'TD', flag: '🇹🇩', minDigits: 8, maxDigits: 8 },
  { name: 'Chile', code: '+56', iso: 'CL', flag: '🇨🇱', minDigits: 9, maxDigits: 9 },
  { name: 'China', code: '+86', iso: 'CN', flag: '🇨🇳', minDigits: 11, maxDigits: 11 },
  { name: 'Colombia', code: '+57', iso: 'CO', flag: '🇨🇴', minDigits: 10, maxDigits: 10 },
  { name: 'Costa Rica', code: '+506', iso: 'CR', flag: '🇨🇷', minDigits: 8, maxDigits: 8 },
  { name: 'Croatia', code: '+385', iso: 'HR', flag: '🇭🇷', minDigits: 9, maxDigits: 9 },
  { name: 'Cuba', code: '+53', iso: 'CU', flag: '🇨🇺', minDigits: 8, maxDigits: 8 },
  { name: 'Cyprus', code: '+357', iso: 'CY', flag: '🇨🇾', minDigits: 8, maxDigits: 8 },
  { name: 'Czech Republic', code: '+420', iso: 'CZ', flag: '🇨🇿', minDigits: 9, maxDigits: 9 },
  { name: 'Denmark', code: '+45', iso: 'DK', flag: '🇩🇰', minDigits: 8, maxDigits: 8 },
  { name: 'Djibouti', code: '+253', iso: 'DJ', flag: '🇩🇯', minDigits: 8, maxDigits: 8 },
  { name: 'Dominican Republic', code: '+1', iso: 'DO', flag: '🇩🇴', minDigits: 10, maxDigits: 10 },
  { name: 'Ecuador', code: '+593', iso: 'EC', flag: '🇪🇨', minDigits: 9, maxDigits: 9 },
  { name: 'Egypt', code: '+20', iso: 'EG', flag: '🇪🇬', minDigits: 10, maxDigits: 10 },
  { name: 'El Salvador', code: '+503', iso: 'SV', flag: '🇸🇻', minDigits: 8, maxDigits: 8 },
  { name: 'Estonia', code: '+372', iso: 'EE', flag: '🇪🇪', minDigits: 7, maxDigits: 8 },
  { name: 'Ethiopia', code: '+251', iso: 'ET', flag: '🇪🇹', minDigits: 9, maxDigits: 9 },
  { name: 'Fiji', code: '+679', iso: 'FJ', flag: '🇫🇯', minDigits: 7, maxDigits: 7 },
  { name: 'Finland', code: '+358', iso: 'FI', flag: '🇫🇮', minDigits: 9, maxDigits: 10 },
  { name: 'France', code: '+33', iso: 'FR', flag: '🇫🇷', minDigits: 9, maxDigits: 9 },
  { name: 'Georgia', code: '+995', iso: 'GE', flag: '🇬🇪', minDigits: 9, maxDigits: 9 },
  { name: 'Germany', code: '+49', iso: 'DE', flag: '🇩🇪', minDigits: 10, maxDigits: 11 },
  { name: 'Ghana', code: '+233', iso: 'GH', flag: '🇬🇭', minDigits: 9, maxDigits: 9 },
  { name: 'Greece', code: '+30', iso: 'GR', flag: '🇬🇷', minDigits: 10, maxDigits: 10 },
  { name: 'Guatemala', code: '+502', iso: 'GT', flag: '🇬🇹', minDigits: 8, maxDigits: 8 },
  { name: 'Honduras', code: '+504', iso: 'HN', flag: '🇭🇳', minDigits: 8, maxDigits: 8 },
  { name: 'Hong Kong', code: '+852', iso: 'HK', flag: '🇭🇰', minDigits: 8, maxDigits: 8 },
  { name: 'Hungary', code: '+36', iso: 'HU', flag: '🇭🇺', minDigits: 9, maxDigits: 9 },
  { name: 'Iceland', code: '+354', iso: 'IS', flag: '🇮🇸', minDigits: 7, maxDigits: 7 },
  { name: 'India', code: '+91', iso: 'IN', flag: '🇮🇳', minDigits: 10, maxDigits: 10 },
  { name: 'Indonesia', code: '+62', iso: 'ID', flag: '🇮🇩', minDigits: 9, maxDigits: 12 },
  { name: 'Iran', code: '+98', iso: 'IR', flag: '🇮🇷', minDigits: 10, maxDigits: 10 },
  { name: 'Iraq', code: '+964', iso: 'IQ', flag: '🇮🇶', minDigits: 10, maxDigits: 10 },
  { name: 'Ireland', code: '+353', iso: 'IE', flag: '🇮🇪', minDigits: 9, maxDigits: 9 },
  { name: 'Israel', code: '+972', iso: 'IL', flag: '🇮🇱', minDigits: 9, maxDigits: 9 },
  { name: 'Italy', code: '+39', iso: 'IT', flag: '🇮🇹', minDigits: 9, maxDigits: 10 },
  { name: 'Jamaica', code: '+1', iso: 'JM', flag: '🇯🇲', minDigits: 10, maxDigits: 10 },
  { name: 'Japan', code: '+81', iso: 'JP', flag: '🇯🇵', minDigits: 10, maxDigits: 10 },
  { name: 'Jordan', code: '+962', iso: 'JO', flag: '🇯🇴', minDigits: 9, maxDigits: 9 },
  { name: 'Kazakhstan', code: '+7', iso: 'KZ', flag: '🇰🇿', minDigits: 10, maxDigits: 10 },
  { name: 'Kenya', code: '+254', iso: 'KE', flag: '🇰🇪', minDigits: 9, maxDigits: 9 },
  { name: 'Kuwait', code: '+965', iso: 'KW', flag: '🇰🇼', minDigits: 8, maxDigits: 8 },
  { name: 'Kyrgyzstan', code: '+996', iso: 'KG', flag: '🇰🇬', minDigits: 9, maxDigits: 9 },
  { name: 'Laos', code: '+856', iso: 'LA', flag: '🇱🇦', minDigits: 9, maxDigits: 10 },
  { name: 'Latvia', code: '+371', iso: 'LV', flag: '🇱🇻', minDigits: 8, maxDigits: 8 },
  { name: 'Lebanon', code: '+961', iso: 'LB', flag: '🇱🇧', minDigits: 7, maxDigits: 8 },
  { name: 'Libya', code: '+218', iso: 'LY', flag: '🇱🇾', minDigits: 9, maxDigits: 9 },
  { name: 'Liechtenstein', code: '+423', iso: 'LI', flag: '🇱🇮', minDigits: 7, maxDigits: 7 },
  { name: 'Lithuania', code: '+370', iso: 'LT', flag: '🇱🇹', minDigits: 8, maxDigits: 8 },
  { name: 'Luxembourg', code: '+352', iso: 'LU', flag: '🇱🇺', minDigits: 9, maxDigits: 9 },
  { name: 'Macau', code: '+853', iso: 'MO', flag: '🇲🇴', minDigits: 8, maxDigits: 8 },
  { name: 'Madagascar', code: '+261', iso: 'MG', flag: '🇲🇬', minDigits: 9, maxDigits: 9 },
  { name: 'Malawi', code: '+265', iso: 'MW', flag: '🇲🇼', minDigits: 9, maxDigits: 9 },
  { name: 'Malaysia', code: '+60', iso: 'MY', flag: '🇲🇾', minDigits: 9, maxDigits: 10 },
  { name: 'Maldives', code: '+960', iso: 'MV', flag: '🇲🇻', minDigits: 7, maxDigits: 7 },
  { name: 'Mali', code: '+223', iso: 'ML', flag: '🇲🇱', minDigits: 8, maxDigits: 8 },
  { name: 'Malta', code: '+356', iso: 'MT', flag: '🇲🇹', minDigits: 8, maxDigits: 8 },
  { name: 'Mauritius', code: '+230', iso: 'MU', flag: '🇲🇺', minDigits: 8, maxDigits: 8 },
  { name: 'Mexico', code: '+52', iso: 'MX', flag: '🇲🇽', minDigits: 10, maxDigits: 10 },
  { name: 'Moldova', code: '+373', iso: 'MD', flag: '🇲🇩', minDigits: 8, maxDigits: 8 },
  { name: 'Monaco', code: '+377', iso: 'MC', flag: '🇲🇨', minDigits: 8, maxDigits: 9 },
  { name: 'Mongolia', code: '+976', iso: 'MN', flag: '🇲🇳', minDigits: 8, maxDigits: 8 },
  { name: 'Montenegro', code: '+382', iso: 'ME', flag: '🇲🇪', minDigits: 8, maxDigits: 8 },
  { name: 'Morocco', code: '+212', iso: 'MA', flag: '🇲🇦', minDigits: 9, maxDigits: 9 },
  { name: 'Mozambique', code: '+258', iso: 'MZ', flag: '🇲🇿', minDigits: 9, maxDigits: 9 },
  { name: 'Myanmar', code: '+95', iso: 'MM', flag: '🇲🇲', minDigits: 8, maxDigits: 10 },
  { name: 'Namibia', code: '+264', iso: 'NA', flag: '🇳🇦', minDigits: 8, maxDigits: 9 },
  { name: 'Nepal', code: '+977', iso: 'NP', flag: '🇳🇵', minDigits: 10, maxDigits: 10 },
  { name: 'Netherlands', code: '+31', iso: 'NL', flag: '🇳🇱', minDigits: 9, maxDigits: 9 },
  { name: 'New Zealand', code: '+64', iso: 'NZ', flag: '🇳🇿', minDigits: 8, maxDigits: 9 },
  { name: 'Nicaragua', code: '+505', iso: 'NI', flag: '🇳🇮', minDigits: 8, maxDigits: 8 },
  { name: 'Nigeria', code: '+234', iso: 'NG', flag: '🇳🇬', minDigits: 10, maxDigits: 10 },
  { name: 'North Macedonia', code: '+389', iso: 'MK', flag: '🇲🇰', minDigits: 8, maxDigits: 8 },
  { name: 'Norway', code: '+47', iso: 'NO', flag: '🇳🇴', minDigits: 8, maxDigits: 8 },
  { name: 'Oman', code: '+968', iso: 'OM', flag: '🇴🇲', minDigits: 8, maxDigits: 8 },
  { name: 'Pakistan', code: '+92', iso: 'PK', flag: '🇵🇰', minDigits: 10, maxDigits: 10 },
  { name: 'Panama', code: '+507', iso: 'PA', flag: '🇵🇦', minDigits: 8, maxDigits: 8 },
  { name: 'Papua New Guinea', code: '+675', iso: 'PG', flag: '🇵🇬', minDigits: 8, maxDigits: 8 },
  { name: 'Paraguay', code: '+595', iso: 'PY', flag: '🇵🇾', minDigits: 9, maxDigits: 9 },
  { name: 'Peru', code: '+51', iso: 'PE', flag: '🇵🇪', minDigits: 9, maxDigits: 9 },
  { name: 'Philippines', code: '+63', iso: 'PH', flag: '🇵🇭', minDigits: 10, maxDigits: 10 },
  { name: 'Poland', code: '+48', iso: 'PL', flag: '🇵🇱', minDigits: 9, maxDigits: 9 },
  { name: 'Portugal', code: '+351', iso: 'PT', flag: '🇵🇹', minDigits: 9, maxDigits: 9 },
  { name: 'Qatar', code: '+974', iso: 'QA', flag: '🇶🇦', minDigits: 8, maxDigits: 8 },
  { name: 'Romania', code: '+40', iso: 'RO', flag: '🇷🇴', minDigits: 9, maxDigits: 9 },
  { name: 'Russia', code: '+7', iso: 'RU', flag: '🇷🇺', minDigits: 10, maxDigits: 10 },
  { name: 'Rwanda', code: '+250', iso: 'RW', flag: '🇷🇼', minDigits: 9, maxDigits: 9 },
  { name: 'San Marino', code: '+378', iso: 'SM', flag: '🇸🇲', minDigits: 10, maxDigits: 10 },
  { name: 'Saudi Arabia', code: '+966', iso: 'SA', flag: '🇸🇦', minDigits: 9, maxDigits: 9 },
  { name: 'Senegal', code: '+221', iso: 'SN', flag: '🇸🇳', minDigits: 9, maxDigits: 9 },
  { name: 'Serbia', code: '+381', iso: 'RS', flag: '🇷🇸', minDigits: 8, maxDigits: 9 },
  { name: 'Seychelles', code: '+248', iso: 'SC', flag: '🇸🇨', minDigits: 7, maxDigits: 7 },
  { name: 'Singapore', code: '+65', iso: 'SG', flag: '🇸🇬', minDigits: 8, maxDigits: 8 },
  { name: 'Slovakia', code: '+421', iso: 'SK', flag: '🇸🇰', minDigits: 9, maxDigits: 9 },
  { name: 'Slovenia', code: '+386', iso: 'SI', flag: '🇸🇮', minDigits: 8, maxDigits: 8 },
  { name: 'Somalia', code: '+252', iso: 'SO', flag: '🇸🇴', minDigits: 8, maxDigits: 9 },
  { name: 'South Africa', code: '+27', iso: 'ZA', flag: '🇿🇦', minDigits: 9, maxDigits: 9 },
  { name: 'South Korea', code: '+82', iso: 'KR', flag: '🇰🇷', minDigits: 9, maxDigits: 10 },
  { name: 'Spain', code: '+34', iso: 'ES', flag: '🇪🇸', minDigits: 9, maxDigits: 9 },
  { name: 'Sudan', code: '+249', iso: 'SD', flag: '🇸🇩', minDigits: 9, maxDigits: 9 },
  { name: 'Sweden', code: '+46', iso: 'SE', flag: '🇸🇪', minDigits: 9, maxDigits: 9 },
  { name: 'Switzerland', code: '+41', iso: 'CH', flag: '🇨🇭', minDigits: 9, maxDigits: 9 },
  { name: 'Taiwan', code: '+886', iso: 'TW', flag: '🇹🇼', minDigits: 9, maxDigits: 9 },
  { name: 'Tajikistan', code: '+992', iso: 'TJ', flag: '🇹🇯', minDigits: 9, maxDigits: 9 },
  { name: 'Tanzania', code: '+255', iso: 'TZ', flag: '🇹🇿', minDigits: 9, maxDigits: 9 },
  { name: 'Thailand', code: '+66', iso: 'TH', flag: '🇹🇭', minDigits: 9, maxDigits: 9 },
  { name: 'Tunisia', code: '+216', iso: 'TN', flag: '🇹🇳', minDigits: 8, maxDigits: 8 },
  { name: 'Turkey', code: '+90', iso: 'TR', flag: '🇹🇷', minDigits: 10, maxDigits: 10 },
  { name: 'Turkmenistan', code: '+993', iso: 'TM', flag: '🇹🇲', minDigits: 8, maxDigits: 8 },
  { name: 'Uganda', code: '+256', iso: 'UG', flag: '🇺🇬', minDigits: 9, maxDigits: 9 },
  { name: 'Ukraine', code: '+380', iso: 'UA', flag: '🇺🇦', minDigits: 9, maxDigits: 9 },
  { name: 'United Arab Emirates', code: '+971', iso: 'AE', flag: '🇦🇪', minDigits: 9, maxDigits: 9 },
  { name: 'United Kingdom', code: '+44', iso: 'GB', flag: '🇬🇧', minDigits: 10, maxDigits: 11 },
  { name: 'United States', code: '+1', iso: 'US', flag: '🇺🇸', minDigits: 10, maxDigits: 10 },
  { name: 'Uruguay', code: '+598', iso: 'UY', flag: '🇺🇾', minDigits: 8, maxDigits: 8 },
  { name: 'Uzbekistan', code: '+998', iso: 'UZ', flag: '🇺🇿', minDigits: 9, maxDigits: 9 },
  { name: 'Vatican City', code: '+39', iso: 'VA', flag: '🇻🇦', minDigits: 10, maxDigits: 10 },
  { name: 'Venezuela', code: '+58', iso: 'VE', flag: '🇻🇪', minDigits: 10, maxDigits: 10 },
  { name: 'Vietnam', code: '+84', iso: 'VN', flag: '🇻🇳', minDigits: 9, maxDigits: 10 },
  { name: 'Yemen', code: '+967', iso: 'YE', flag: '🇾🇪', minDigits: 9, maxDigits: 9 },
  { name: 'Zambia', code: '+260', iso: 'ZM', flag: '🇿🇲', minDigits: 9, maxDigits: 9 },
  { name: 'Zimbabwe', code: '+263', iso: 'ZW', flag: '🇿🇼', minDigits: 9, maxDigits: 9 }
];

const HireBookingModal = ({ isOpen, onClose, preselectedVehicle = null }) => {
  const navigate = useNavigate();
  const { user, addHireBooking } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [category, setCategory] = useState('Cars');
  const [selectedVehicle, setSelectedVehicle] = useState(FLEET_BY_CATEGORY['Cars'][0]);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [dropoffDate, setDropoffDate] = useState('');
  const [dropoffTime, setDropoffTime] = useState('');
  const [pickupLoc, setPickupLoc] = useState('');
  const [dropoffLoc, setDropoffLoc] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [selectingTarget, setSelectingTarget] = useState(null);
  const [distanceKm, setDistanceKm] = useState('');
  const [description, setDescription] = useState('');

  // Extras
  const [extraDates, setExtraDates] = useState(false);
  const [extraKm, setExtraKm] = useState(false);

  // Helper to sanitize phone input (strip leading country code if typed in 2nd box)
  const sanitizeLocalPhone = (val, countryCode = '+94') => {
    if (!val) return '';
    let str = val.trim();
    if (str.startsWith('+')) {
      if (str.startsWith(countryCode)) {
        str = str.slice(countryCode.length).trim();
      } else {
        str = str.replace(/^\+\d{1,4}\s*/, '').trim();
      }
    }
    const digitsOnlyCode = countryCode.replace('+', '');
    if (str.startsWith(digitsOnlyCode) && str.length > 9) {
      str = str.slice(digitsOnlyCode.length).trim();
    }
    return str;
  };

  // Country Code Dropdown State
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');

  // User details
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  // Touch states
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

  // Booking Result
  const [submittedBooking, setSubmittedBooking] = useState(null);

  // Reset modal state to Step 1 and clear all form inputs every time modal is opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setSubmittedBooking(null);
      
      // Clear all inputs so example placeholders display cleanly
      setPickupDate('');
      setPickupTime('');
      setDropoffDate('');
      setDropoffTime('');
      setPickupLoc('');
      setDropoffLoc('');
      setPickupCoords(null);
      setDropoffCoords(null);
      setSelectingTarget(null);
      setDistanceKm('');
      setDescription('');
      setExtraDates(false);
      setExtraKm(false);
      setFullName('');
      setEmail('');
      setPhone('');
      setEmailTouched(false);
      setPhoneTouched(false);

      if (preselectedVehicle) {
        if (typeof preselectedVehicle === 'string') {
          for (const cat in FLEET_BY_CATEGORY) {
            const found = FLEET_BY_CATEGORY[cat].find(v => v.name.toLowerCase() === preselectedVehicle.toLowerCase());
            if (found) {
              setCategory(cat);
              setSelectedVehicle(found);
              break;
            }
          }
        } else if (preselectedVehicle.name) {
          const cat = preselectedVehicle.category || 'Cars';
          const matchedCat = CATEGORIES.find(c => c.label.toLowerCase() === cat.toLowerCase())?.label || 'Cars';
          setCategory(matchedCat);
          setSelectedVehicle(preselectedVehicle);
        }
      }
    }
  }, [isOpen, preselectedVehicle]);

  if (!isOpen) return null;

  // Phone validation helpers per country
  const getPhoneDigitsCount = (phoneStr) => {
    if (!phoneStr) return 0;
    return phoneStr.replace(/\D/g, '').length;
  };

  const isValidPhoneForCountry = (phoneStr, countryObj) => {
    if (!phoneStr || phoneStr.trim() === '') return false;
    const count = getPhoneDigitsCount(phoneStr);
    const min = countryObj.minDigits || 7;
    const max = countryObj.maxDigits || 11;
    return count >= min && count <= max;
  };

  const isPhoneExceedingMaxDigits = (phoneStr, countryObj) => {
    if (!phoneStr) return false;
    const count = getPhoneDigitsCount(phoneStr);
    const max = countryObj.maxDigits || 11;
    return count > max;
  };

  const getPhonePlaceholder = (countryObj) => {
    if (!countryObj) return 'e.g. 77 123 4567 (9-10 digits)';
    const digitCountText = countryObj.minDigits === countryObj.maxDigits
      ? `${countryObj.maxDigits} digits`
      : `${countryObj.minDigits}-${countryObj.maxDigits} digits`;

    if (countryObj.iso === 'LK') return `e.g. 77 123 4567 (${digitCountText})`;
    if (countryObj.iso === 'US' || countryObj.iso === 'CA') return `e.g. 202 555 0123 (${digitCountText})`;
    if (countryObj.iso === 'GB') return `e.g. 7911 123456 (${digitCountText})`;
    if (countryObj.iso === 'AU') return `e.g. 412 345 678 (${digitCountText})`;
    if (countryObj.iso === 'IN') return `e.g. 98765 43210 (${digitCountText})`;
    if (countryObj.iso === 'AE') return `e.g. 50 123 4567 (${digitCountText})`;
    if (countryObj.iso === 'SG') return `e.g. 8123 4567 (${digitCountText})`;
    if (countryObj.iso === 'DE') return `e.g. 151 12345678 (${digitCountText})`;
    if (countryObj.iso === 'FR') return `e.g. 6 12 34 56 78 (${digitCountText})`;

    const sample = '9'.repeat(countryObj.maxDigits);
    return `e.g. ${sample} (${digitCountText})`;
  };

  // Email validation regex helper
  const isValidEmailFormat = (emailStr) => {
    if (!emailStr || emailStr.trim() === '') return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(emailStr.trim());
  };

  // Validation function per step
  const isStepValid = (step) => {
    if (step === 1) {
      return !!category;
    }
    if (step === 2) {
      return !!selectedVehicle;
    }
    if (step === 3) {
      return (
        pickupDate.trim() !== '' &&
        pickupTime.trim() !== '' &&
        dropoffDate.trim() !== '' &&
        dropoffTime.trim() !== '' &&
        pickupLoc.trim() !== '' &&
        dropoffLoc.trim() !== '' &&
        Number(distanceKm) > 0
      );
    }
    if (step === 4) {
      return true; // Extras optional
    }
    if (step === 5) {
      return (
        fullName.trim() !== '' &&
        email.trim() !== '' &&
        isValidEmailFormat(email) &&
        phone.trim() !== '' &&
        isValidPhoneForCountry(phone, selectedCountry)
      );
    }
    return true;
  };

  // Calculate pricing
  const baseRate = selectedVehicle?.ratePerKm || 100;
  const distNum = Number(distanceKm) || 0;
  const calculatedFare = distNum > 0 ? Math.max(distNum, 10) * baseRate : 0;
  const extrasCost = (extraDates ? 500 : 0) + (extraKm ? 2000 : 0);
  const totalAmount = calculatedFare + extrasCost;

  const handleCategorySelect = (catId) => {
    setCategory(catId);
    if (FLEET_BY_CATEGORY[catId] && FLEET_BY_CATEGORY[catId].length > 0) {
      setSelectedVehicle(FLEET_BY_CATEGORY[catId][0]);
    }
  };

  const handleNext = () => {
    if (isStepValid(currentStep) && currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmitBooking = (e) => {
    e.preventDefault();
    if (!isStepValid(5)) return;

    const fullPhoneNumber = `${selectedCountry.code} ${phone}`;

    const created = addHireBooking({
      vehicle: selectedVehicle.name,
      vehicleModel: selectedVehicle.name,
      vehicleCategory: category,
      pickupLocation: pickupLoc,
      dropoffLocation: dropoffLoc,
      hireDate: pickupDate,
      hireTime: pickupTime,
      scheduleDate: pickupDate,
      scheduleTime: pickupTime,
      dropoffDate: dropoffDate || pickupDate,
      dropoffTime: dropoffTime || '06:00 PM',
      distanceKm: `${distanceKm} km`,
      distance: `${distanceKm} km`,
      estimatedFare: `LKR ${totalAmount.toLocaleString()}`,
      totalLKR: totalAmount,
      totalUSD: Math.round(totalAmount / 330),
      fullName,
      customer: fullName,
      email,
      contactEmail: email,
      phone: fullPhoneNumber,
      contactPhone: fullPhoneNumber,
      description,
      specialNotes: description,
      status: 'Pending Approval',
      dispatchConfirmed: false
    });

    setSubmittedBooking(created);
  };

  return (
    <div className="hire-modal-overlay">
      <div className="hire-modal-container">
        {/* Close Button */}
        <button className="hire-modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {submittedBooking ? (
          <div className="hire-modal-success-screen">
            <CheckCircle size={56} color="#10b981" className="success-icon" />
            <h2>Booking Request Submitted!</h2>
            <p>
              Thank you, <strong>{submittedBooking.fullName || submittedBooking.customer}</strong>. Your chauffeur hire for <strong>{submittedBooking.vehicle}</strong> has been created.
            </p>
            <div className="success-ref-card">
              <span className="success-ref-label">Booking Reference Code</span>
              <strong className="success-ref-code">{submittedBooking.ref || (submittedBooking.id?.startsWith('#') ? submittedBooking.id : `#${submittedBooking.id}`)}</strong>
              <div className="success-ref-grid">
                <div><span>📍 Route:</span> <strong>{submittedBooking.pickupLocation} ➔ {submittedBooking.dropoffLocation}</strong></div>
                <div><span>📅 Schedule:</span> <strong>{submittedBooking.hireDate} at {submittedBooking.hireTime}</strong></div>
                <div><span>📞 Contact:</span> <strong>{submittedBooking.phone}</strong></div>
                <div><span>💰 Total:</span> <strong className="success-fare">{submittedBooking.estimatedFare}</strong></div>
              </div>
            </div>
            
            <div className="success-actions-row">
              <button 
                className="success-track-btn" 
                onClick={() => {
                  onClose();
                  navigate('/previous-hire');
                }}
              >
                <Navigation size={16} /> Track Live Booking Status ➔
              </button>
              <button 
                className="success-done-btn" 
                onClick={() => {
                  onClose();
                  navigate('/previous-hire');
                }}
              >
                Done & Close
              </button>
            </div>
          </div>
        ) : (
          <div className="hire-modal-inner">
            {/* Header Title */}
            <div className="hire-modal-header">
              <h1>Booking & Quote</h1>
              <p>Get an instant quote and reserve your vehicle. Enter your details to get an instant price estimate.</p>

              {/* 5-Step Progress Bar matching Image 1-5 */}
              <div className="hire-stepper-bar">
                <div className={`stepper-item ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                  <div className="stepper-circle">{currentStep > 1 ? <Check size={14} /> : '1'}</div>
                  <span className="stepper-label">Vehicle Type</span>
                </div>
                <div className="stepper-line" />

                <div className={`stepper-item ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                  <div className="stepper-circle">{currentStep > 2 ? <Check size={14} /> : '2'}</div>
                  <span className="stepper-label">Select Vehicle</span>
                </div>
                <div className="stepper-line" />

                <div className={`stepper-item ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
                  <div className="stepper-circle">{currentStep > 3 ? <Check size={14} /> : '3'}</div>
                  <span className="stepper-label">Dates & Loc</span>
                </div>
                <div className="stepper-line" />

                <div className={`stepper-item ${currentStep >= 4 ? 'active' : ''} ${currentStep > 4 ? 'completed' : ''}`}>
                  <div className="stepper-circle">{currentStep > 4 ? <Check size={14} /> : '4'}</div>
                  <span className="stepper-label">Extras</span>
                </div>
                <div className="stepper-line" />

                <div className={`stepper-item ${currentStep >= 5 ? 'active' : ''}`}>
                  <div className="stepper-circle">5</div>
                  <span className="stepper-label">Your Details</span>
                </div>
              </div>
            </div>

            {/* Main Modal Layout (2 Columns) */}
            <div className="hire-modal-body-grid">
              {/* Left Column: Interactive Step Card */}
              <div className="hire-step-card-col">

                {/* STEP 1: VEHICLE TYPE */}
                {currentStep === 1 && (
                  <div className="step-content-box">
                    <h2 className="step-title">Select Vehicle Category</h2>
                    <div className="step1-category-grid">
                      {CATEGORIES.map((cat) => (
                        <div
                          key={cat.id}
                          className={`cat-choice-box ${category === cat.id ? 'selected' : ''}`}
                          onClick={() => handleCategorySelect(cat.id)}
                        >
                          {category === cat.id && <span className="choice-check-badge"><Check size={12} /></span>}
                          <div className="cat-icon-wrapper">
                            {cat.icon === 'car' && <Car size={26} />}
                            {cat.icon === 'van' && <Car size={26} />}
                            {cat.icon === 'suv' && <Car size={26} />}
                            {cat.icon === 'bus' && <Bus size={26} />}
                          </div>
                          <span className="cat-label">{cat.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="step-footer-actions right-only">
                      <button
                        className="step-btn-next-yellow"
                        onClick={handleNext}
                        disabled={!isStepValid(1)}
                      >
                        Next Step
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: SELECT VEHICLE */}
                {currentStep === 2 && (
                  <div className="step-content-box">
                    <h2 className="step-title">Select Your Vehicle</h2>
                    <p className="step-subtitle">
                      Choose from our premium fleet of localized models available for the "{category}" category.
                    </p>

                    <div className="step2-vehicles-list">
                      {(FLEET_BY_CATEGORY[category] || FLEET_BY_CATEGORY['Cars']).map((veh) => {
                        const isSelected = selectedVehicle?.name === veh.name;
                        return (
                          <div
                            key={veh.id}
                            className={`veh-choice-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => setSelectedVehicle(veh)}
                          >
                            <img src={veh.image} alt={veh.name} className="veh-choice-img" />
                            <div className="veh-choice-details">
                              <div className="veh-choice-title-row">
                                <strong>{veh.name}</strong>
                                {isSelected && <CheckCircle size={18} color="#0f172a" />}
                              </div>
                              <span className="veh-choice-sub">{veh.type}</span>
                              {veh.tag && <span className="veh-tag-pill">{veh.tag}</span>}
                            </div>
                            <div className="veh-choice-rate-col">
                              <strong className="rate-text">LKR {veh.ratePerKm}<span>/km</span></strong>
                              <button className={`choice-select-btn ${isSelected ? 'selected' : ''}`}>
                                {isSelected ? 'Selected' : 'Select'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="step-footer-actions">
                      <button className="step-btn-back" onClick={handleBack}>
                        <ArrowLeft size={16} /> Back
                      </button>
                      <button
                        className="step-btn-next-navy"
                        onClick={handleNext}
                        disabled={!isStepValid(2)}
                      >
                        Next <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: DATES & LOCATIONS WITH OPENSTREETMAP LEAFLET INTEGRATION */}
                {currentStep === 3 && (
                  <div className="step-content-box">
                    <div className="step3-header-row">
                      <div>
                        <h2 className="step-title">Dates & Exact GPS Locations</h2>
                        <p className="step-subtitle">
                          Search below or pinpoint directly on the <strong>OpenStreetMap</strong> to set 100% accurate coordinates.
                        </p>
                      </div>
                      <span className="osm-verified-badge">
                        <CheckCircle size={14} /> OpenStreetMap GPS Live
                      </span>
                    </div>

                    <div className="step3-form-grid">
                      {/* Date & Time Grid */}
                      <div className="form-grid-2">
                        <div className="form-group">
                          <label>Pickup Date *</label>
                          <div className="input-with-icon">
                            <input
                              type="date"
                              value={pickupDate}
                              onChange={(e) => setPickupDate(e.target.value)}
                              required
                            />
                            <Calendar size={16} className="field-icon" />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Pickup Time *</label>
                          <div className="input-with-icon">
                            <input
                              type="time"
                              value={pickupTime}
                              onChange={(e) => setPickupTime(e.target.value)}
                              required
                            />
                            <Clock size={16} className="field-icon" />
                          </div>
                        </div>
                      </div>

                      <div className="form-grid-2">
                        <div className="form-group">
                          <label>Drop-off Date *</label>
                          <div className="input-with-icon">
                            <input
                              type="date"
                              value={dropoffDate}
                              onChange={(e) => setDropoffDate(e.target.value)}
                              required
                            />
                            <Calendar size={16} className="field-icon" />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Drop-off Time *</label>
                          <div className="input-with-icon">
                            <input
                              type="time"
                              value={dropoffTime}
                              onChange={(e) => setDropoffTime(e.target.value)}
                              required
                            />
                            <Clock size={16} className="field-icon" />
                          </div>
                        </div>
                      </div>

                      {/* 100% Accurate OpenStreetMap Location Search Inputs */}
                      <div className="form-group">
                        <LocationSearchInput
                          label="Pickup Location *"
                          type="pickup"
                          value={pickupLoc}
                          onChange={(val) => setPickupLoc(val)}
                          onSelectCoordinate={(coord) => {
                            setPickupCoords(coord);
                            setPickupLoc(coord.name);
                            if (dropoffCoords) {
                              calculateDrivingRoute(coord, dropoffCoords).then((r) => {
                                if (r?.distanceKm) setDistanceKm(r.distanceKm);
                              });
                            }
                          }}
                          onPickOnMap={() => setSelectingTarget(selectingTarget === 'pickup' ? null : 'pickup')}
                          isSelectingOnMap={selectingTarget === 'pickup'}
                          placeholder="Search Airport, Hotel, City or Address..."
                          required
                        />
                      </div>

                      <div className="form-group">
                        <LocationSearchInput
                          label="Drop-off Destination *"
                          type="dropoff"
                          value={dropoffLoc}
                          onChange={(val) => setDropoffLoc(val)}
                          onSelectCoordinate={(coord) => {
                            setDropoffCoords(coord);
                            setDropoffLoc(coord.name);
                            if (pickupCoords) {
                              calculateDrivingRoute(pickupCoords, coord).then((r) => {
                                if (r?.distanceKm) setDistanceKm(r.distanceKm);
                              });
                            }
                          }}
                          onPickOnMap={() => setSelectingTarget(selectingTarget === 'dropoff' ? null : 'dropoff')}
                          isSelectingOnMap={selectingTarget === 'dropoff'}
                          placeholder="Search Resort, Landmark, Beach or City..."
                          required
                        />
                      </div>

                      {/* Real-time Interactive Leaflet OpenStreetMap View */}
                      <div className="form-group">
                        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <Navigation size={14} color="#d97706" />
                          Live OpenStreetMap Route & Telemetry Preview
                        </label>
                        <LeafletRouteMap
                          pickupLocation={pickupLoc}
                          dropoffLocation={dropoffLoc}
                          pickupCoords={pickupCoords}
                          dropoffCoords={dropoffCoords}
                          selectingTarget={selectingTarget}
                          onLocationSelected={(loc) => {
                            if (loc.target === 'pickup') {
                              setPickupLoc(loc.name);
                              setPickupCoords({ lat: loc.lat, lng: loc.lng, name: loc.name });
                              if (dropoffCoords) {
                                calculateDrivingRoute({ lat: loc.lat, lng: loc.lng }, dropoffCoords).then((r) => {
                                  if (r?.distanceKm) setDistanceKm(r.distanceKm);
                                });
                              }
                            } else if (loc.target === 'dropoff') {
                              setDropoffLoc(loc.name);
                              setDropoffCoords({ lat: loc.lat, lng: loc.lng, name: loc.name });
                              if (pickupCoords) {
                                calculateDrivingRoute(pickupCoords, { lat: loc.lat, lng: loc.lng }).then((r) => {
                                  if (r?.distanceKm) setDistanceKm(r.distanceKm);
                                });
                              }
                            }
                            setSelectingTarget(null);
                          }}
                          height="230px"
                          theme="light"
                          interactive={true}
                        />
                      </div>

                      {/* Auto-Calculated Distance */}
                      <div className="form-group">
                        <label>Road Distance (Kilometers) *</label>
                        <input
                          type="number"
                          placeholder="Auto-calculated from OpenStreetMap..."
                          value={distanceKm}
                          onChange={(e) => setDistanceKm(e.target.value === '' ? '' : Number(e.target.value))}
                          required
                          min="1"
                          className="simple-text-input"
                        />
                        <span className="field-note">
                          ✨ Road distance is auto-calculated via OpenStreetMap routing. Minimum charge applies under 10km.
                        </span>
                      </div>

                      <div className="form-group">
                        <label>Special Instructions / Flight Details</label>
                        <input
                          type="text"
                          placeholder="e.g. Flight UL-504 arriving 2:30 PM, baby seat requested"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="simple-text-input"
                        />
                      </div>
                    </div>

                    <div className="step-footer-actions">
                      <button className="step-btn-back" onClick={handleBack}>
                        <ArrowLeft size={16} /> Back
                      </button>
                      <button
                        className="step-btn-next-navy"
                        onClick={handleNext}
                        disabled={!isStepValid(3)}
                      >
                        Next <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: EXTRAS */}
                {currentStep === 4 && (
                  <div className="step-content-box">
                    <h2 className="step-title">Additional Extras</h2>

                    <div className="extras-info-banner">
                      <ShieldCheck size={24} className="banner-icon" />
                      <div>
                        <strong>Professional Driver Included</strong>
                        <p>All vehicles come with an experienced, licensed driver. No driving license required from you. Drive with peace of mind — professional, licensed drivers on every trip.</p>
                      </div>
                    </div>

                    <div className="extras-options-list">
                      <label className="extras-label-title">Optional Extras</label>

                      <div
                        className={`extra-option-card ${extraDates ? 'selected' : ''}`}
                        onClick={() => setExtraDates(!extraDates)}
                      >
                        <input type="checkbox" checked={extraDates} onChange={() => {}} />
                        <div>
                          <strong>Extra Dates</strong>
                          <span>LKR 500/day</span>
                        </div>
                      </div>

                      <div
                        className={`extra-option-card ${extraKm ? 'selected' : ''}`}
                        onClick={() => setExtraKm(!extraKm)}
                      >
                        <input type="checkbox" checked={extraKm} onChange={() => {}} />
                        <div>
                          <strong>Extra Killomiters</strong>
                          <span>LKR 2,000/day</span>
                        </div>
                      </div>
                    </div>

                    <div className="step-footer-actions">
                      <button className="step-btn-back" onClick={handleBack}>
                        <ArrowLeft size={16} /> Back
                      </button>
                      <button
                        className="step-btn-next-navy"
                        onClick={handleNext}
                        disabled={!isStepValid(4)}
                      >
                        Next <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5: YOUR DETAILS (With Email Validation & Country Code Dropdown with Search) */}
                {currentStep === 5 && (
                  <form onSubmit={handleSubmitBooking} className="step-content-box">
                    <h2 className="step-title">Your Details</h2>

                    <div className="step5-inputs-grid">
                      <div className="form-group">
                        <label>Full Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Kasun Perera"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          className="simple-text-input"
                        />
                      </div>

                      {/* EMAIL INPUT WITH VALIDATION & ERROR HINT */}
                      <div className="form-group">
                        <label>Email Address *</label>
                        <input
                          type="email"
                          placeholder="e.g. kasun.perera@gmail.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (!emailTouched) setEmailTouched(true);
                          }}
                          onBlur={() => setEmailTouched(true)}
                          required
                          className={`simple-text-input ${emailTouched && email && !isValidEmailFormat(email) ? 'input-error' : ''}`}
                        />
                        {emailTouched && email && !isValidEmailFormat(email) && (
                          <span className="email-error-hint">
                            ⚠️ Error, Please enter your valid email
                          </span>
                        )}
                      </div>

                      {/* PHONE INPUT WITH COUNTRY CODE DROPDOWN & SEARCH BAR */}
                      <div className="form-group">
                        <label>Phone Number *</label>
                        <div className="phone-input-row">
                          <div className="country-dropdown-container">
                            <button
                              type="button"
                              className="country-select-btn"
                              onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                            >
                              <span className="country-iso-code">{selectedCountry.iso || 'LK'}</span>
                              <span className="country-code-val">{selectedCountry.code}</span>
                              <ChevronDown size={14} className={`country-chevron ${isCountryDropdownOpen ? 'open' : ''}`} />
                            </button>

                            {/* Dropdown Menu with Search Bar */}
                            {isCountryDropdownOpen && (
                              <div className="country-dropdown-menu">
                                <div className="country-search-header">
                                  <Search size={14} className="country-search-icon" />
                                  <input
                                    type="text"
                                    placeholder="e.g. Sri Lanka or +94"
                                    value={countrySearchQuery}
                                    onChange={(e) => setCountrySearchQuery(e.target.value)}
                                    className="country-search-input"
                                    autoFocus
                                  />
                                </div>
                                <div className="country-list-scroll">
                                  {COUNTRY_CODES.filter(c =>
                                    c.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) ||
                                    c.code.includes(countrySearchQuery) ||
                                    (c.iso && c.iso.toLowerCase().includes(countrySearchQuery.toLowerCase()))
                                  ).map((c) => (
                                    <button
                                      key={c.name + c.code}
                                      type="button"
                                      className={`country-option-item ${selectedCountry.name === c.name ? 'active' : ''}`}
                                      onClick={() => {
                                        setSelectedCountry(c);
                                        setIsCountryDropdownOpen(false);
                                        setCountrySearchQuery('');
                                      }}
                                    >
                                      <span className="opt-flag">{c.flag}</span>
                                      <span className="opt-iso">{c.iso}</span>
                                      <span className="opt-name">{c.name}</span>
                                      <span className="opt-code">{c.code}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <input
                            type="text"
                            placeholder={getPhonePlaceholder(selectedCountry)}
                            value={phone}
                            onChange={(e) => {
                              setPhone(sanitizeLocalPhone(e.target.value, selectedCountry.code));
                              if (!phoneTouched) setPhoneTouched(true);
                            }}
                            onBlur={() => setPhoneTouched(true)}
                            required
                            className={`simple-text-input phone-number-field ${phoneTouched && phone && (isPhoneExceedingMaxDigits(phone, selectedCountry) || !isValidPhoneForCountry(phone, selectedCountry)) ? 'input-error' : ''}`}
                          />
                        </div>
                        {phoneTouched && phone && isPhoneExceedingMaxDigits(phone, selectedCountry) && (
                          <span className="phone-error-hint">
                            ⚠️ Error, Invalid phone number (Maximum {selectedCountry.maxDigits} digits allowed for {selectedCountry.name})
                          </span>
                        )}
                        {phoneTouched && phone && !isPhoneExceedingMaxDigits(phone, selectedCountry) && !isValidPhoneForCountry(phone, selectedCountry) && (
                          <span className="phone-error-hint">
                            ⚠️ Error, Please enter a valid phone number for {selectedCountry.name} (Min {selectedCountry.minDigits} digits)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quote Summary Blue Box */}
                    <div className="quote-summary-blue-box">
                      <span className="quote-box-head">Quote Summary</span>
                      <div className="quote-row">
                        <span>Vehicle:</span>
                        <strong>{selectedVehicle?.name}</strong>
                      </div>
                      <div className="quote-row">
                        <span>Distance:</span>
                        <strong>{distanceKm} km</strong>
                      </div>
                      <div className="quote-row">
                        <span>Rate:</span>
                        <strong>LKR {baseRate}/km</strong>
                      </div>
                      <div className="quote-row">
                        <span>Base Price:</span>
                        <strong>LKR {calculatedFare.toLocaleString()}</strong>
                      </div>
                      <div className="quote-row">
                        <span>Driver:</span>
                        <strong>Included</strong>
                      </div>
                      <div className="quote-total-row">
                        <span>Total:</span>
                        <strong className="quote-total-val">LKR {totalAmount.toLocaleString()}</strong>
                      </div>
                    </div>

                    <div className="step-footer-actions">
                      <button type="button" className="step-btn-back" onClick={handleBack}>
                        <ArrowLeft size={16} /> Back
                      </button>
                      <button
                        type="submit"
                        className={`step-btn-submit ${isStepValid(5) ? 'active-enabled' : ''}`}
                        disabled={!isStepValid(5)}
                      >
                        Submit Booking Request
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Right Column: Booking Summary Sidebar */}
              <div className="hire-sidebar-summary-col">
                <div className="summary-card-box">
                  <div className="summary-header">
                    <h3>Booking Summary</h3>
                    <span className="status-badge">● In Progress</span>
                  </div>

                  <div className="summary-details-list">
                    <div className="summary-item">
                      <span>Category</span>
                      <strong>{category}</strong>
                    </div>

                    <div className="summary-item">
                      <span>Vehicle</span>
                      <strong>{selectedVehicle?.name || 'Pending'}</strong>
                    </div>

                    <div className="summary-item">
                      <span>Dates</span>
                      <strong>{pickupDate ? `${pickupDate}` : 'Pending'}</strong>
                    </div>

                    <div className="summary-item">
                      <span>Location</span>
                      <strong>{pickupLoc || 'Pending'}</strong>
                    </div>
                  </div>

                  <div className="summary-total-box">
                    <span className="total-label">Estimated Total</span>
                    <strong className="total-amount">
                      {currentStep >= 3 ? `LKR ${totalAmount.toLocaleString()}` : '--'}
                    </strong>
                    <span className="total-sub">*Final price calculated based on distance and extras.</span>
                  </div>

                  <div className="summary-info-callout">
                    <Info size={16} className="info-icon" />
                    <span>Final price is calculated in the next step based on your itinerary and duration.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HireBookingModal;
