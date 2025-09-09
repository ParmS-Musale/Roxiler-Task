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
    <footer className="bg-gray-900 text-white">
      {/* Stats Section */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex justify-center mb-2">
                    <Icon className="h-8 w-8 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h2 className="ml-3 text-xl font-bold text-white">StoreRate</h2>
            </div>
            
            <p className="text-gray-400 mb-6 max-w-sm">
              Discover, review, and rate the best stores in your area. Help others make informed decisions with authentic reviews.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-400">
                <Mail className="h-4 w-4 mr-3" />
                <span>info@storerate.com</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Phone className="h-4 w-4 mr-3" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center text-gray-400">
                <MapPin className="h-4 w-4 mr-3" />
                <span>123 Tech Street, Digital City, DC 12345</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className={`text-gray-400 ${social.color} transition-colors duration-200 p-2 rounded-full hover:bg-gray-800`}
                    aria-label={social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Platform
            </h3>
            <ul className="space-y-3">
              {navigation.platform.map((item) => (
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

          {/* Account Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Account
            </h3>
            <ul className="space-y-3">
              {navigation.account.map((item) => (
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

          {/* Business Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <Award className="h-4 w-4 mr-2" />
              Business
            </h3>
            <ul className="space-y-3">
              {navigation.business.map((item) => (
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

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Support
            </h3>
            <ul className="space-y-3">
              {navigation.support.map((item) => (
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

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="max-w-md">
            <h3 className="text-white font-semibold mb-4">Stay Updated</h3>
            <p className="text-gray-400 mb-4">
              Get notified about new stores and features in your area.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
              />
              <button className="px-6 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors duration-200 font-medium">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-gray-800 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <p className="text-gray-400 text-sm">
                © {currentYear} StoreRate. All rights reserved.
              </p>
              <div className="flex items-center text-gray-400 text-sm">
                Made with <Heart className="h-4 w-4 mx-1 text-red-500" /> by the StoreRate Team
              </div>
            </div>
            
            <div className="flex flex-wrap items-center space-x-6">
              {navigation.legal.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="flex flex-wrap items-center justify-center space-x-6 text-gray-500 text-sm">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                SSL Secured
              </div>
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-2" />
                Verified Reviews
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Trusted Community
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;