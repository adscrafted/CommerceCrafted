'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Shield, Calendar, Mail, Globe, AlertCircle } from 'lucide-react'

export default function TermsPage() {
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
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600">
            Please read these terms carefully before using CommerceCrafted
          </p>
          <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-2" />
            Last updated: {lastUpdated}
          </div>
        </div>

        {/* Terms Content */}
        <Card className="mb-8">
          <CardContent className="prose prose-gray max-w-none p-8">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 mb-4">
                By accessing and using CommerceCrafted ("the Service"), you agree to be bound by these Terms of Service 
                ("Terms"). If you do not agree to all the terms and conditions, you may not access or use the Service.
              </p>
              <p className="text-gray-600">
                We reserve the right to update and change these Terms at any time without notice. Continued use of the 
                Service after any such changes constitutes your acceptance of the new Terms.
              </p>
            </section>

            <Separator className="my-8" />

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-600 mb-4">
                CommerceCrafted provides:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Amazon product research and analysis tools</li>
                <li>Market opportunity identification</li>
                <li>Competitive analysis and insights</li>
                <li>AI-powered research assistance</li>
                <li>Daily product recommendations</li>
                <li>Educational content and resources</li>
              </ul>
            </section>

            <Separator className="my-8" />

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-600 mb-4">
                To access certain features of the Service, you must register for an account. When creating an account, you must:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
              <p className="text-gray-600">
                We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent activity.
              </p>
            </section>

            <Separator className="my-8" />

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Subscription and Payment</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Subscription Plans</h3>
              <p className="text-gray-600 mb-4">
                CommerceCrafted offers various subscription plans with different features and limitations. Details of each 
                plan are available on our pricing page.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Billing</h3>
              <p className="text-gray-600 mb-4">
                By subscribing to a paid plan, you agree to pay the applicable fees. Subscriptions automatically renew 
                unless cancelled before the renewal date. All fees are non-refundable except as required by law.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Price Changes</h3>
              <p className="text-gray-600">
                We reserve the right to modify our pricing. Existing subscribers will be notified at least 30 days before 
                any price changes take effect.
              </p>
            </section>

            <Separator className="my-8" />

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Acceptable Use Policy</h2>
              <p className="text-gray-600 mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Use the Service for any illegal purpose or in violation of any laws</li>
                <li>Violate Amazon's Terms of Service or any other third-party terms</li>
                <li>Scrape, copy, or redistribute our data without permission</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use automated systems or software to extract data from the Service</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Impersonate any person or entity</li>
                <li>Share your account credentials with others</li>
              </ul>
            </section>

            <Separator className="my-8" />

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>
              <p className="text-gray-600 mb-4">
                All content, features, and functionality of the Service, including but not limited to text, graphics, logos, 
                and software, are the exclusive property of CommerceCrafted or its licensors and are protected by copyright, 
                trademark, and other intellectual property laws.
              </p>
              <p className="text-gray-600">
                You may not reproduce, distribute, modify, or create derivative works without our prior written consent.
              </p>
            </section>

            <Separator className="my-8" />

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data and Privacy</h2>
              <p className="text-gray-600 mb-4">
                Your use of the Service is also governed by our Privacy Policy. By using the Service, you consent to our 
                collection and use of data as described in the Privacy Policy.
              </p>
              <p className="text-gray-600">
                We make no claims of ownership to any content you submit to the Service. However, by submitting content, 
                you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and display such content 
                in connection with the Service.
              </p>
            </section>

            <Separator className="my-8" />

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Disclaimers and Limitations</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <strong>Important:</strong> The Service is provided "as is" without any warranties. We do not guarantee 
                    the accuracy, completeness, or usefulness of any information provided.
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                CommerceCrafted is not responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Any business decisions made based on our data or recommendations</li>
                <li>Loss of profits or any indirect, incidental, or consequential damages</li>
                <li>Accuracy of third-party data or services</li>
                <li>Interruptions or errors in the Service</li>
              </ul>
            </section>

            <Separator className="my-8" />

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Indemnification</h2>
              <p className="text-gray-600">
                You agree to indemnify and hold harmless CommerceCrafted, its affiliates, and their respective officers, 
                directors, employees, and agents from any claims, damages, losses, liabilities, and expenses arising out 
                of your use of the Service or violation of these Terms.
              </p>
            </section>

            <Separator className="my-8" />

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
              <p className="text-gray-600 mb-4">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason, 
                including if you breach these Terms.
              </p>
              <p className="text-gray-600">
                Upon termination, your right to use the Service will immediately cease. All provisions of these Terms 
                that should reasonably survive termination shall remain in effect.
              </p>
            </section>

            <Separator className="my-8" />

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law</h2>
              <p className="text-gray-600">
                These Terms shall be governed by and construed in accordance with the laws of the United States, without 
                regard to its conflict of law provisions. Any legal action or proceeding shall be brought exclusively in 
                the federal or state courts located in [Your Jurisdiction].
              </p>
            </section>

            <Separator className="my-8" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="bg-gray-100 rounded-lg p-4 space-y-2">
                <div className="flex items-center text-gray-700">
                  <Mail className="h-4 w-4 mr-2" />
                  <a href="mailto:legal@commercecrafted.com" className="hover:text-blue-600">
                    legal@commercecrafted.com
                  </a>
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
            By using CommerceCrafted, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
          <div className="flex items-center justify-center">
            <a href="/privacy" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}