import { useState } from 'react';
import { X, Shield, Lock, Eye, Database, Mail, Globe, CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function PrivacyPolicy({ onClose }) {
  const { darkMode } = useTheme();

  const sections = [
    {
      icon: Shield,
      title: 'Information We Collect',
      content: 'We collect information you provide directly, such as your name, email address, phone number, and profile information. We also collect data about how you use the platform, including skills, mentorship requests, and messages.'
    },
    {
      icon: Database,
      title: 'How We Use Your Information',
      content: 'We use your information to connect you with mentors, facilitate mentorship sessions, enable messaging, and improve the platform experience. Your data helps us match you with relevant skills and opportunities.'
    },
    {
      icon: Eye,
      title: 'Data Sharing & Disclosure',
      content: 'We do not sell your personal information. Your profile data is visible to other users on the platform to facilitate connections. Messages and mentorship requests are shared only with the intended recipients.'
    },
    {
      icon: Lock,
      title: 'Data Security',
      content: 'We implement industry-standard security measures including encryption, secure authentication, and regular security audits. Your password is hashed and never stored in plain text.'
    },
    {
      icon: Mail,
      title: 'Email Communications',
      content: 'We send you notifications about mentorship requests, messages, and platform updates. You can control your notification preferences in Settings at any time.'
    },
    {
      icon: Globe,
      title: 'Your Rights & Choices',
      content: 'You can access, update, or delete your profile information at any time. You can also control your privacy settings and notification preferences. Contact us for data deletion requests.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className={`relative max-w-3xl w-full rounded-2xl max-h-[90vh] overflow-y-auto transition-colors duration-300 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 px-6 py-4 border-b transition-colors duration-300 ${
          darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className={`w-6 h-6 transition-colors duration-300 ${
                darkMode ? 'text-[#00B330]' : 'text-[#00B330]'
              }`} />
              <h2 className={`text-xl font-semibold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>Privacy Policy</h2>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Introduction */}
          <div className={`p-4 rounded-lg transition-colors duration-300 ${
            darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <p className={`text-sm leading-relaxed transition-colors duration-300 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <strong className={darkMode ? 'text-white' : 'text-gray-900'}>Last Updated:</strong> August 2026
            </p>
            <p className={`text-sm leading-relaxed mt-2 transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              ISDP ("Invisible Skills Discovery Platform") is committed to protecting your privacy. 
              This policy explains how we collect, use, and protect your personal information.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border transition-colors duration-300 ${
                    darkMode ? 'border-gray-700 hover:bg-gray-700/30' : 'border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#00B330]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-[#00B330]" />
                    </div>
                    <div>
                      <h4 className={`font-semibold transition-colors duration-300 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>{section.title}</h4>
                      <p className={`text-sm leading-relaxed mt-1 transition-colors duration-300 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>{section.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Data Protection Notice */}
          <div className={`p-4 rounded-lg border transition-colors duration-300 ${
            darkMode 
              ? 'border-[#00B330]/30 bg-[#00B330]/10' 
              : 'border-[#00B330]/20 bg-[#00B330]/5'
          }`}>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#00B330] flex-shrink-0 mt-0.5" />
              <div>
                <p className={`text-sm font-medium transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>Your Data Is Protected</p>
                <p className={`text-sm transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  We are committed to protecting your data. All personal information is encrypted 
                  and stored securely. You can request data deletion at any time by contacting our support team.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className={`flex flex-col sm:flex-row gap-3 pt-4 border-t transition-colors duration-300 ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-[#00B330] text-white rounded-lg hover:bg-[#009f2b] transition-colors font-medium"
            >
              I Understand
            </button>
            <button
              onClick={onClose}
              className={`flex-1 py-2.5 rounded-lg transition-colors border font-medium ${
                darkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Close
            </button>
          </div>

          {/* Footer */}
          <div className="text-center pt-2">
            <p className={`text-xs transition-colors duration-300 ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              ISDP Platform v1.0.0 • © 2026 All rights reserved
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
