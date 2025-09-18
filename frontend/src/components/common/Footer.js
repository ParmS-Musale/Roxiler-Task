import React from 'react';
import { 
  Star, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Github,
  Heart,
  Shield,
  Award,
  Users,
  TrendingUp
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const navigation = {
    platform: [
      { name: 'Browse Stores', href: '/stores' },
      { name: 'Categories', href: '/categories' },
      { name: 'Top Rated', href: '/top-rated' },
      { name: 'Recent Reviews', href: '/recent-reviews' },
    ],
    account: [
      { name: 'Sign Up', href: '/register' },
      { name: 'Sign In', href: '/login' },
      { name: 'My Reviews', href: '/my-reviews' },
      { name: 'Profile Settings', href: '/profile' },
    ],
    business: [
      { name: 'For Businesses', href: '/for-businesses' },
      { name: 'Add Your Store', href: '/add-store' },
      { name: 'Business Analytics', href: '/analytics' },
      { name: 'Advertise', href: '/advertise' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Report Issue', href: '/report' },
      { name: 'Guidelines', href: '/guidelines' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Disclaimer', href: '/disclaimer' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#', color: 'hover:text-blue-600' },
    { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:text-sky-500' },
    { name: 'Instagram', icon: Instagram, href: '#', color: 'hover:text-pink-600' },
    { name: 'LinkedIn', icon: Linkedin, href: '#', color: 'hover:text-blue-700' },
    { name: 'GitHub', icon: Github, href: '#', color: 'hover:text-gray-900' },
  ];

  const stats = [
    { label: 'Stores Listed', value: '10,000+', icon: Award },
    { label: 'Happy Users', value: '50,000+', icon: Users },
    { label: 'Reviews Written', value: '100,000+', icon: Star },
    { label: 'Cities Covered', value: '500+', icon: MapPin },
  ];

  return (
  <footer className="bg-gray-900 text-white text-sm">
  {/* Main Footer Content */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {/* Brand Section */}
      <div className="col-span-2 md:col-span-1">
        <div className="flex items-center mb-3">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Star className="h-4 w-4 text-white" />
          </div>
          <h2 className="ml-2 text-lg font-bold text-white">StoreRate</h2>
        </div>
        
        <p className="text-gray-400 mb-4 text-xs">
          Discover, review, and rate the best stores in your area.
        </p>

        {/* Social Links */}
        <div className="flex space-x-3">
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <a
                key={social.name}
                href={social.href}
                className={`text-gray-400 ${social.color} transition-colors duration-200`}
                aria-label={social.name}
              >
                <Icon className="h-4 w-4" />
              </a>
            );
          })}
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-white font-semibold mb-2">Platform</h3>
        <ul className="space-y-2">
          {navigation.platform.slice(0, 3).map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-2">Account</h3>
        <ul className="space-y-2">
          {navigation.account.slice(0, 3).map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-white font-semibold mb-2">Support</h3>
        <ul className="space-y-2">
          {navigation.support.slice(0, 3).map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>

  {/* Bottom Footer */}
  <div className="bg-gray-800 border-t border-gray-700">
    <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400">
      <p>© {currentYear} StoreRate. All rights reserved.</p>
      <div className="flex space-x-4 mt-2 md:mt-0">
        {navigation.legal.slice(0, 2).map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="hover:text-white"
          >
            {item.name}
          </a>
        ))}
      </div>
    </div>
  </div>
</footer>

  );
};

export default Footer;