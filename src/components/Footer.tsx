
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t mt-auto">
      <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-2xl font-bold text-primary mb-4">LinkedUp</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              for brilliant LinkedIn posts
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create engaging LinkedIn content with AI-powered tools. 
              Generate ideas, craft posts, and schedule content to grow your professional presence in 2025.
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
              <li>
                <a href="mailto:varungill19046@gmail.com" className="hover:text-primary transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="mailto:varungill19046@gmail.com" className="hover:text-primary transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <button onClick={() => {
                  const modal = document.createElement('div');
                  modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
                  modal.innerHTML = `
                    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl max-h-96 overflow-y-auto">
                      <h3 class="text-lg font-bold mb-4">Privacy Policy</h3>
                      <div class="text-sm text-gray-600 dark:text-gray-300 space-y-3">
                        <p><strong>Effective Date:</strong> 1/7/2025</p>
                        <p>LinkedUp respects your privacy. We collect data such as name, email, LinkedIn credentials, and content you create or schedule. This data helps us provide services like post generation and scheduling.</p>
                        <p>We do not currently sell personal data. If our data practices change, we will update this policy and provide notice as required by law. We may use third-party services (e.g., LinkedIn API, analytics tools) under strict data protection agreements.</p>
                        <p>You can delete your account and data anytime. Contact us at varungill19046@gmail.com for privacy-related inquiries.</p>
                      </div>
                      <button onclick="this.parentElement.parentElement.remove()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Close</button>
                    </div>
                  `;
                  document.body.appendChild(modal);
                }} className="hover:text-primary transition-colors cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => {
                  const modal = document.createElement('div');
                  modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
                  modal.innerHTML = `
                    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl max-h-96 overflow-y-auto">
                      <h3 class="text-lg font-bold mb-4">Terms of Service</h3>
                      <div class="text-sm text-gray-600 dark:text-gray-300 space-y-3">
                        <p><strong>Effective Date:</strong> 1/7/2025</p>
                        <p>By using LinkedUp, you agree to:</p>
                        <ul class="list-disc list-inside ml-4 space-y-1">
                          <li>Provide accurate information.</li>
                          <li>Use the service only for lawful, personal or business-related LinkedIn content creation and scheduling.</li>
                          <li>Not misuse or attempt unauthorized access.</li>
                        </ul>
                        <p>LinkedUp may suspend accounts for abuse or policy violations. We provide no guarantees for uninterrupted service and are not liable for damages due to scheduling errors or third-party API failures.</p>
                        <p>You retain rights to the content you create. We reserve rights to update these terms.</p>
                      </div>
                      <button onclick="this.parentElement.parentElement.remove()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Close</button>
                    </div>
                  `;
                  document.body.appendChild(modal);
                }} className="hover:text-primary transition-colors cursor-pointer">
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">
              © 2025 LinkedUp. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <span 
                className="text-gray-400 hover:text-primary cursor-pointer transition-colors relative group text-sm"
                title="Coming Soon"
              >
                LinkedIn
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  Coming Soon
                </span>
              </span>
              <span 
                className="text-gray-400 hover:text-primary cursor-pointer transition-colors relative group text-sm"
                title="Coming Soon"
              >
                Twitter
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  Coming Soon
                </span>
              </span>
              <a 
                href="mailto:varungill19046@gmail.com" 
                className="text-gray-400 hover:text-primary transition-colors text-sm"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
