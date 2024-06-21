import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">About Codylo</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-3xl font-semibold mb-4">Our Vision</h2>
            <p className="text-lg mb-4">
              At Codylo, we envision a future where AI-powered tools revolutionize the way developers write, debug, and optimize code. Our goal is to provide an integrated suite of AI code tools that cater to diverse programming needs and elevate developer productivity.
            </p>
            <h2 className="text-3xl font-semibold mb-4">What is Codylo?</h2>
            <p className="text-lg mb-4">
              Codylo is a comprehensive platform that hosts a variety of AI-driven code tools designed to assist developers in different aspects of coding. From code generation and error handling to optimization and documentation, Codylo is your one-stop solution for all coding requirements.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-semibold mb-4">Our Tools</h2>
            <p className="text-lg mb-4">
              Our platform features an array of tools tailored to meet the needs of developers:
            </p>
            <ul className="list-disc list-inside mb-4">
              <li>AI Code Generator: Quickly generate code based on user prompts.</li>
              <li>Code Optimizer: Improve the efficiency and performance of your code.</li>
              <li>Error Handler: Automatically detect and fix common coding errors.</li>
              <li>Code Documenter: Generate comprehensive documentation for your code.</li>
              <li>And many more tools to come!</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-3xl font-semibold mb-4">Join Our Community</h2>
          <p className="text-lg mb-4">
            We are constantly evolving and adding new tools to our platform. Join our community of developers to stay updated with the latest features and improvements. Together, let's make coding smarter and more efficient.
          </p>
          <Link 
            to="/"
            className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
          >
            Join Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;