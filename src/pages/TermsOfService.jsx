import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <Link 
            to="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing and using The GuruJI Classes ("the Platform," "we," "us," or "our"), you accept and agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must not use our services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                These Terms apply to all users of the Platform, including students, teachers, and visitors. By creating an account, you represent that you are at least 13 years old and have the legal capacity to enter into these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The GuruJI Classes is an educational technology platform that connects students with teachers for online learning. Our services include:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Course creation and management tools for teachers</li>
                <li>Course enrollment and access for students</li>
                <li>Video lessons and educational content</li>
                <li>Progress tracking and learning analytics</li>
                <li>Communication tools between teachers and students</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify, suspend, or discontinue any aspect of the Platform at any time without prior notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.1 Account Creation</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                To use certain features of the Platform, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your account information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.2 Account Types</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Platform supports two types of accounts:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Student Accounts:</strong> For enrolling in courses and accessing educational content</li>
                <li><strong>Teacher Accounts:</strong> For creating and managing courses, and viewing enrolled students</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                You must select your role during registration, and this role cannot be changed later without contacting support.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Teacher Responsibilities</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you are a teacher, you agree to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Create accurate and educational course content</li>
                <li>Respect intellectual property rights and not infringe on copyrights</li>
                <li>Maintain professional conduct with students</li>
                <li>Provide accurate course descriptions and pricing</li>
                <li>Respond to student inquiries in a timely manner</li>
                <li>Not share or misuse student personal information</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Student Responsibilities</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you are a student, you agree to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Use the Platform solely for educational purposes</li>
                <li>Respect intellectual property rights of teachers and the Platform</li>
                <li>Not share, copy, or redistribute course content without permission</li>
                <li>Maintain respectful communication with teachers and other students</li>
                <li>Not attempt to circumvent security measures or access unauthorized content</li>
                <li>Provide accurate information during enrollment</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Course Enrollment and Payments</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.1 Enrollment</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                By enrolling in a course, you agree to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Pay the course fee (if applicable) as displayed at the time of enrollment</li>
                <li>Abide by the course rules and guidelines set by the teacher</li>
                <li>Use course materials only for personal educational purposes</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.2 Refunds</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Refund policies are determined by individual teachers. Please review the refund policy before enrolling. The Platform may facilitate refunds but is not responsible for teacher refund decisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.1 Platform Content</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                All content on the Platform, including but not limited to text, graphics, logos, software, and design, is the property of The GuruJI Classes or its licensors and is protected by copyright and other intellectual property laws.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.2 User Content</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Teachers retain ownership of their course content. By uploading content to the Platform, teachers grant us a license to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Host, display, and distribute the content on the Platform</li>
                <li>Use the content for promotional purposes</li>
                <li>Make necessary technical modifications to ensure compatibility</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Prohibited Conduct</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Upload malicious code, viruses, or harmful software</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Impersonate any person or entity</li>
                <li>Collect or harvest user information without consent</li>
                <li>Interfere with or disrupt the Platform's operation</li>
                <li>Use automated systems to access the Platform without permission</li>
                <li>Share account credentials with others</li>
                <li>Use the Platform for any illegal or unauthorized purpose</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Termination</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">9.1 By You</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may terminate your account at any time by contacting us or using account deletion features. Upon termination, your access to the Platform will cease, but certain information may be retained as required by law.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">9.2 By Us</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We reserve the right to suspend or terminate your account if you:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Violate these Terms</li>
                <li>Engage in fraudulent or illegal activity</li>
                <li>Harm other users or the Platform</li>
                <li>Fail to pay required fees</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Disclaimers</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Warranties of merchantability and fitness for a particular purpose</li>
                <li>Warranties that the Platform will be uninterrupted, secure, or error-free</li>
                <li>Warranties regarding the accuracy or completeness of course content</li>
                <li>Warranties that defects will be corrected</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                We do not guarantee that courses will meet your expectations or that you will achieve specific learning outcomes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, data, or other intangible losses</li>
                <li>Damages resulting from your use or inability to use the Platform</li>
                <li>Damages resulting from unauthorized access to your account</li>
                <li>Content provided by teachers or third parties</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Our total liability shall not exceed the amount you paid to us in the 12 months preceding the claim.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Indemnification</h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify, defend, and hold harmless The GuruJI Classes, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2 mt-4">
                <li>Your use of the Platform</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Content you submit or upload</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Dispute Resolution</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Any disputes arising from these Terms or your use of the Platform shall be resolved through:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Good faith negotiation between parties</li>
                <li>Mediation, if negotiation fails</li>
                <li>Binding arbitration or litigation, as applicable by law</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by the laws of India, without regard to conflict of law principles.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We reserve the right to modify these Terms at any time. We will notify you of material changes by:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Posting the updated Terms on this page</li>
                <li>Updating the "Last updated" date</li>
                <li>Sending you an email notification (for significant changes)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Your continued use of the Platform after changes become effective constitutes acceptance of the new Terms. If you do not agree, you must stop using the Platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Severability</h2>
              <p className="text-gray-700 leading-relaxed">
                If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-2">
                  <strong>Email:</strong> <a href="mailto:thegurujiclasses11@gmail.com" className="text-blue-600 hover:underline">thegurujiclasses11@gmail.com</a>
                </p>
                <p className="text-gray-700">
                  <strong>Phone:</strong> <a href="tel:+918448250988" className="text-blue-600 hover:underline">+91 8448250988</a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;

