import Footer from '../Footer';

const About = () => {
  return (
    <>
      <div className="relative codeDiv min-h-screen">
        <div className="absolute bg-gradient-to-r from-pink-500 to-purple-500 inset-0 blur-lg opacity-10 min-h-screen"></div>
        <div className="relative min-h-screen text-white py-8 px-4 pb-28 sm:px-6 lg:px-8">
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
                  <li>AI Bug Fixer: Automatically detect and fix common coding errors.</li>
                  <li>AI Image to Code Converter: Convert design images to code efficiently.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default About;