const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">The GuruJI Classes</h3>
            <p className="text-gray-400">
              Empowering learners with quality education and expert guidance.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Email: thegurujiclasses11@gmail.com</li>
              <li>Phone: +91 8448250988</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <p className="text-gray-400">
              Follow us on social media for updates and announcements.
            </p>
          </div>
        </div>
        
        {/* Legal Links */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
            <a 
              href="/privacy-policy" 
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Privacy Policy
            </a>
            <span className="hidden sm:inline text-gray-600">|</span>
            <a 
              href="/terms-of-service" 
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
