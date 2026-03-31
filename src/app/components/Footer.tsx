import React from 'react';
import { Ticket, Twitter, Instagram, Linkedin, Facebook } from 'lucide-react';

interface FooterProps {
  onBecomeOrganizer?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onBecomeOrganizer }) => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                DanceTime
              </span>
            </div>
            <p className="max-w-xs mb-8">
              The leading ticketing platform for the global dance community. Experience the movement.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-purple-400 transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-purple-400 transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="hover:text-purple-400 transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-purple-400 transition-colors"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Platform</h4>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-white transition-colors">Find Events</a></li>
              <li>
                <button 
                  onClick={onBecomeOrganizer}
                  className="hover:text-white transition-colors text-left"
                >
                  Become an Organizer
                </button>
              </li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 DanceTime Technologies Inc. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">English (US)</a>
            <a href="#" className="hover:text-white transition-colors">Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
};