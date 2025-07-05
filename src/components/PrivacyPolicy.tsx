
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Mail, Calendar } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <Button onClick={onBack} variant="outline" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>
        <p className="text-gray-600 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Effective Date: January 7, 2025
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Our Commitment to Your Privacy</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>
              LinkedUp respects your privacy and is committed to protecting your personal information. 
              This privacy policy explains how we collect, use, and safeguard your data when you use our service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>We collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, and profile information</li>
              <li><strong>LinkedIn Credentials:</strong> OAuth tokens to connect and post to your LinkedIn account</li>
              <li><strong>Content Data:</strong> Posts you create, schedule, and publish through our platform</li>
              <li><strong>Usage Data:</strong> How you interact with our service, including search history and preferences</li>
              <li><strong>Technical Data:</strong> Device information, IP address, and browser details for security and performance</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>We use your data to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide content generation and scheduling services</li>
              <li>Connect and publish to your LinkedIn account</li>
              <li>Improve our AI-powered content suggestions</li>
              <li>Maintain and improve our service quality</li>
              <li>Communicate important updates and support</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Sharing and Third Parties</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>
              We do not currently sell your personal data. We may use trusted third-party services 
              such as the LinkedIn API and analytics tools under strict data protection agreements. 
              If our data practices change, we will update this policy and provide notice as required by law.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Rights and Choices</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access and review your personal information</li>
              <li>Update or correct your account details</li>
              <li>Delete your account and associated data</li>
              <li>Disconnect LinkedIn integration at any time</li>
              <li>Export your content and data</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Security</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>
              We implement industry-standard security measures to protect your data, including 
              encryption, secure authentication, and regular security audits. However, no system 
              is completely secure, and we cannot guarantee absolute security.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              For privacy-related inquiries, contact us at{' '}
              <a href="mailto:varungill19046@gmail.com" className="text-blue-600 hover:underline">
                varungill19046@gmail.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
