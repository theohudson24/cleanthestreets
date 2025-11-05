import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About CleanTheStreets</h1>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            At CleanTheStreets, we believe every voice matters in creating safer, smoother roads for our communities. 
            Our mission is to empower citizens across the United States to report potholes and road hazards, ensuring 
            that your input drives real change. Together, we can pave the way for a safer, more efficient transportation 
            system for everyone.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We're committed to making it easy for anyone to report issues and track their resolution, creating a 
            transparent and collaborative approach to maintaining our public infrastructure.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How It Works</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              CleanTheStreets is a community-driven platform that connects citizens with local authorities to address 
              road safety issues. When you report an issue, it appears on our interactive map where everyone can see it. 
              As issues are addressed, their status updates automatically, keeping the community informed.
            </p>
            <p>
              Our platform uses modern web technologies to provide a seamless experience across all devices, making 
              it easy to report issues on the go or from the comfort of your home.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tech Stack</h2>
          <p className="text-gray-700 mb-4">
            CleanTheStreets is built with modern, open-source technologies:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Next.js 15:</strong> React framework for server-side rendering and static site generation</li>
            <li><strong>React 19:</strong> UI library for building interactive user interfaces</li>
            <li><strong>Leaflet.js:</strong> Open-source JavaScript library for interactive maps</li>
            <li><strong>Tailwind CSS:</strong> Utility-first CSS framework for responsive design</li>
            <li><strong>Cloudinary:</strong> Cloud-based image and video management</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Credits</h2>
          <p className="text-gray-700 mb-4">
            CleanTheStreets is made possible by the contributions of developers, designers, and community members 
            who believe in making our streets safer for everyone.
          </p>
          <p className="text-gray-700">
            Map data provided by{' '}
            <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
              OpenStreetMap
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

