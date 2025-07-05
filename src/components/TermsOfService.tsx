
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Mail, Calendar } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <Button onClick={onBack} variant="outline" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Terms of Service</h1>
        </div>
        <p className="text-gray-600 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Effective Date: January 7, 2025
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Agreement to Terms</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>
              By using LinkedUp, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Responsibilities</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>By using LinkedUp, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and truthful information when creating your account</li>
              <li>Use the service only for lawful, personal, or business-related LinkedIn content creation and scheduling</li>
              <li>Not misuse the service or attempt unauthorized access to our systems</li>
              <li>Respect intellectual property rights and not post copyrighted content without permission</li>
              <li>Not use the service to spam, harass, or distribute malicious content</li>
              <li>Comply with LinkedIn's Terms of Service and Community Guidelines</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Availability</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>
              We strive to provide reliable service but cannot guarantee uninterrupted availability. 
              LinkedUp may experience downtime for maintenance, updates, or due to factors beyond our control. 
              We are not liable for damages resulting from service interruptions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Suspension and Termination</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>
              LinkedUp reserves the right to suspend or terminate accounts for violations of these terms, 
              abuse of the service, or any behavior that may harm other users or our platform. 
              We will provide reasonable notice when possible.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>
              LinkedUp is provided "as is" without warranties of any kind. We are not liable for damages 
              due to scheduling errors, third-party API failures, content issues, or any other service-related problems. 
              Our liability is limited to the amount you have paid for the service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>
              You retain full rights to the content you create using LinkedUp. We may use anonymized, 
              aggregated data to improve our services. LinkedUp retains rights to our platform, 
              technology, and proprietary algorithms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>
              We reserve the right to update these terms as our service evolves. 
              We will notify users of significant changes and provide reasonable notice before they take effect.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              For questions about these terms, contact us at{' '}
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

export default TermsOfService;
