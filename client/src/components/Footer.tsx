import React from 'react';
import { Link } from 'wouter';

const Footer: React.FC = () => {
  return (
    <footer className="bg-charcoal text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="https://d64gsuwffb70l.cloudfront.net/68e7f2c7e795b22e67db6507_1762416633888_fefd0c10.webp" alt="TaxFlow" className="h-8 w-8" />
              <h3 className="text-2xl font-heading font-bold text-teal">TaxFlow</h3>
            </div>
            <p className="text-sm text-gray-300 mb-2">by SmartBooks Academy</p>
            <p className="text-gray-400 mb-4">Automate your tax prep. Stay organized and audit-ready all year long.</p>
            <p className="text-gray-400 text-sm">
              <a href="mailto:support@taxflow.refurrm.com" className="hover:text-teal">support@taxflow.refurrm.com</a>
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-teal">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/pricing" className="hover:text-teal">Pricing</Link></li>
              <li><Link href="/features" className="hover:text-teal">Features</Link></li>
              <li><Link href="/blog" className="hover:text-teal">Blog</Link></li>
              <li><a href="#security" className="hover:text-teal">Security</a></li>
            </ul>
          </div>

          
          <div>
            <h4 className="font-semibold mb-4 text-teal">SmartBooks Academy</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="https://taxflow.refurrm.com" className="hover:text-teal">Learning Portal</a></li>
              <li><a href="#courses" className="hover:text-teal">Courses</a></li>
              <li><a href="#support" className="hover:text-teal">Support</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-teal">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/privacy" className="hover:text-teal">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-teal">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © 2025 TaxFlow by SmartBooks Academy. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#twitter" className="text-gray-400 hover:text-teal">Twitter</a>
            <a href="#linkedin" className="text-gray-400 hover:text-teal">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>

  );
};

export default Footer;
