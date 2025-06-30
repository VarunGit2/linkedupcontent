
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-primary mb-4">LinkedUp</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              for brilliant LinkedIn posts
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create engaging LinkedIn content with AI-powered tools. 
              Generate ideas, craft posts, and schedule content to grow your professional presence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>Content Creation</li>
              <li>Idea Generation</li>
              <li>Post Scheduling</li>
              <li>LinkedIn Integration</li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>Help Center</li>
              <li>Contact Us</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2024 LinkedUp. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-primary">
                <span className="sr-only">LinkedIn</span>
                <span className="text-sm">LinkedIn</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <span className="sr-only">Twitter</span>
                <span className="text-sm">Twitter</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <span className="sr-only">Email</span>
                <span className="text-sm">Contact</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
