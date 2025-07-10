'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Shield, Calendar, Mail, Globe, Lock, Eye, Database, UserCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function PrivacyPage() {
  const lastUpdated = new Date('2025-01-01').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Lock className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>
          <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-2" />
            Last updated: {lastUpdated}
          </div>
        </div>

        {/* Privacy Badges */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Badge className="bg-green-100 text-green-800 px-4 py-2">
            <Shield className="h-4 w-4 mr-2" />
            GDPR Compliant
          </Badge>
          <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
            <Lock className="h-4 w-4 mr-2" />
            SSL Encrypted
          </Badge>
          <Badge className="bg-purple-100 text-purple-800 px-4 py-2">
            <UserCheck className="h-4 w-4 mr-2" />
            CCPA Compliant
          </Badge>
        </div>

        {/* Privacy Content */}
        <Card className="mb-8">
          <CardContent className="prose prose-gray max-w-none p-8">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-600 mb-4">
                CommerceCrafted ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our website and 
                services.
              </p>
              <p className="text-gray-600">
                By using CommerceCrafted, you consent to the data practices described in this policy. If you do not 
                agree with any part of this privacy policy, please do not use our Service.
              </p>
            </section>

            <Separator className="my-8" />

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                <li><strong>Account Information:</strong> Name, email address, password</li>
                <li><strong>Profile Information:</strong> Company name, business type, preferences</li>
                <li><strong>Payment Information:</strong> Billing address, payment method (processed by Stripe)</li>
                <li><strong>Communications:</strong> Support tickets, feedback, survey responses</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Information Collected Automatically</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                <li><strong>Usage Data:</strong> Pages visited, features used, search queries</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                <li><strong>Cookies:</strong> Session cookies, preference cookies, analytics cookies</li>
                <li><strong>Log Data:</strong> Access times, referring URLs, error logs</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.3 Third-Party Data</h3>
              <p className="text-gray-600">
                We may receive information about you from third-party services like Amazon's API for product data, 
                but we do not receive personal information from these sources.
              </p>
            </section>

            <Separator className="my-8" />

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-600 mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Provide, operate, and maintain our Service</li>
                <li>Process transactions and send transaction notifications</li>
                <li>Respond to your comments, questions, and support requests</li>
                <li>Send you technical notices, updates, and security alerts</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Monitor and analyze usage patterns and trends</li>
                <li>Detect, prevent, and address technical issues</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <Separator className="my-8" />

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How We Share Your Information</h2>
              <p className="text-gray-600 mb-4">
                We do not sell, trade, or rent your personal information. We may share your information in the following situations:
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Service Providers</h3>
              <p className="text-gray-600 mb-4">
                We work with third-party service providers to help us operate our business:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                <li><strong>Stripe:</strong> Payment processing</li>
                <li><strong>AWS:</strong> Cloud hosting and storage</li>
                <li><strong>SendGrid:</strong> Email delivery</li>
                <li><strong>Google Analytics:</strong> Usage analytics</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Legal Requirements</h3>
              <p className="text-gray-600 mb-4">
                We may disclose your information if required by law or in response to valid requests by public authorities.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Business Transfers</h3>
              <p className="text-gray-600">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred as part 
                of that transaction.
              </p>
            </section>

            <Separator className="my-8" />

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-600 mb-4">
                We implement appropriate technical and organizational security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>SSL encryption for all data transmissions</li>
                <li>Encrypted storage of sensitive information</li>
                <li>Regular security audits and vulnerability testing</li>
                <li>Limited access to personal information on a need-to-know basis</li>
                <li>Employee training on data protection best practices</li>
              </ul>
              <p className="text-gray-600 mt-4">
                However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <Separator className="my-8" />

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Data Rights</h2>
              <p className="text-gray-600 mb-4">You have the following rights regarding your personal data:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    Access
                  </h4>
                  <p className="text-sm text-blue-800">Request a copy of your personal data</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Correction
                  </h4>
                  <p className="text-sm text-green-800">Update or correct inaccurate data</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    Portability
                  </h4>
                  <p className="text-sm text-purple-800">Receive your data in a portable format</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Deletion
                  </h4>
                  <p className="text-sm text-red-800">Request deletion of your personal data</p>
                </div>
              </div>

              <p className="text-gray-600">
                To exercise any of these rights, please contact us at privacy@commercecrafted.com. We will respond to 
                your request within 30 days.
              </p>
            </section>

            <Separator className="my-8" />

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-600 mb-4">
                We retain your personal information only for as long as necessary to fulfill the purposes for which it 
                was collected:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><strong>Account Data:</strong> Retained while your account is active</li>
                <li><strong>Transaction Records:</strong> Retained for 7 years for tax purposes</li>
                <li><strong>Marketing Data:</strong> Retained until you unsubscribe</li>
                <li><strong>Analytics Data:</strong> Retained for 2 years</li>
              </ul>
            </section>

            <Separator className="my-8" />

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookie Policy</h2>
              <p className="text-gray-600 mb-4">
                We use cookies and similar tracking technologies to improve your experience:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for the Service to function properly</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how you use our Service</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
              </ul>
              <p className="text-gray-600 mt-4">
                You can control cookies through your browser settings. Disabling cookies may limit some features of the Service.
              </p>
            </section>

            <Separator className="my-8" />

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-600">
                CommerceCrafted is not intended for children under 18 years of age. We do not knowingly collect personal 
                information from children. If you believe we have collected information from a child, please contact us 
                immediately.
              </p>
            </section>

            <Separator className="my-8" />

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. International Data Transfers</h2>
              <p className="text-gray-600">
                Your information may be transferred to and processed in countries other than your country of residence. 
                We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
              </p>
            </section>

            <Separator className="my-8" />

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Policy</h2>
              <p className="text-gray-600">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the 
                new Privacy Policy on this page and updating the "Last updated" date. For significant changes, we will 
                provide additional notice via email.
              </p>
            </section>

            <Separator className="my-8" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="text-gray-600 mb-4">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-100 rounded-lg p-4 space-y-2">
                <div className="flex items-center text-gray-700">
                  <Mail className="h-4 w-4 mr-2" />
                  <a href="mailto:privacy@commercecrafted.com" className="hover:text-blue-600">
                    privacy@commercecrafted.com
                  </a>
                </div>
                <div className="flex items-center text-gray-700">
                  <Shield className="h-4 w-4 mr-2" />
                  <span>Data Protection Officer</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Globe className="h-4 w-4 mr-2" />
                  <span>CommerceCrafted, Inc.</span>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            We are committed to protecting your privacy and ensuring your data is handled responsibly.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <a href="/terms" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Terms of Service
            </a>
            <span className="text-gray-400">•</span>
            <a href="/account" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Manage Preferences
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}