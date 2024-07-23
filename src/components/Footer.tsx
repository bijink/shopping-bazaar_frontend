import { EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-700">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Company</h3>
            <ul>
              <li className="mb-2">
                <a href="#" className="hover:underline">
                  About Us
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="hover:underline">
                  Careers
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="hover:underline">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Services</h3>
            <ul>
              <li className="mb-2">
                <a href="#" className="hover:underline">
                  Web Development
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="hover:underline">
                  App Development
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="hover:underline">
                  SEO Services
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Support</h3>
            <ul>
              <li className="mb-2">
                <a href="#" className="hover:underline">
                  Help Center
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="hover:underline">
                  Privacy Policy
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="hover:underline">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact Us</h3>
            <ul>
              <li className="mb-2 flex items-center">
                <EnvelopeIcon className="mr-2 h-5 w-5" />
                <span>info@example.com</span>
              </li>
              <li className="mb-2 flex items-center">
                <PhoneIcon className="mr-2 h-5 w-5" />
                <span>(123) 456-7890</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-center">
          <p>&copy; 2024 Your Company. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
