import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Help & FAQ</h1>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">What to Report</h2>
          <p className="text-gray-700 mb-4">
            You can report various urban safety issues including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
            <li><strong>Potholes:</strong> Damaged road surfaces that need repair</li>
            <li><strong>Damaged Roads:</strong> Cracks, sinkholes, or other road damage</li>
            <li><strong>Debris:</strong> Trash, fallen branches, or other obstacles on roadways</li>
            <li><strong>Signage Issues:</strong> Missing, damaged, or unclear road signs</li>
            <li><strong>Other Hazards:</strong> Any other safety concerns on public roads</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Safety Tips for Taking Photos</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Park your vehicle safely before taking photos</li>
            <li>Be aware of traffic and pedestrians</li>
            <li>Take photos from a safe distance</li>
            <li>Ensure good lighting for clear photos</li>
            <li>Include context in your photos (road signs, landmarks)</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How long does it take to process a report?
              </h3>
              <p className="text-gray-700">
                Reports are typically reviewed within 24-48 hours. The status will be updated as the issue is being addressed.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I report the same issue multiple times?
              </h3>
              <p className="text-gray-700">
                Yes, if an issue hasn't been fixed, you can report it again. However, we recommend waiting a reasonable amount of time before reporting the same issue.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How do I update my report?
              </h3>
              <p className="text-gray-700">
                Currently, you can view your reports on the "My Reports" page. Status updates are handled by our team as issues are addressed.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What information do I need to provide?
              </h3>
              <p className="text-gray-700">
                At minimum, you need to provide a category, description, and location. Photos are optional but highly recommended.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Need More Help?</h2>
          <p className="text-gray-700 mb-4">
            If you have additional questions or need support, please contact us:
          </p>
          <p className="text-gray-700">
            <strong>Email:</strong> support@cleanthestreets.com
          </p>
          <p className="text-gray-700 mt-4">
            Or use our{' '}
            <Link href="/report" className="text-blue-600 hover:text-blue-800 underline">
              contact form
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
