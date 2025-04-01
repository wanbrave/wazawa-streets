import * as React from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronRight, CheckCircle, Building, Wallet, Menu, X } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-gray-900">Wazawa St.</span>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          
          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#how-it-works" className="text-gray-600 hover:text-primary">How It Works</a>
            <a href="#properties" className="text-gray-600 hover:text-primary">Properties</a>
            <a href="#testimonials" className="text-gray-600 hover:text-primary">Testimonials</a>
            <a href="#about" className="text-gray-600 hover:text-primary">About Us</a>
            <Link href="/auth" className="text-primary hover:text-primary/90">
              Log In
            </Link>
            <Button onClick={() => navigate('/auth')}>
              Get Started
            </Button>
          </nav>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden px-4 py-2 pb-4 bg-white border-b border-gray-100">
            <nav className="flex flex-col space-y-4">
              <a href="#how-it-works" className="text-gray-600 hover:text-primary py-2">How It Works</a>
              <a href="#properties" className="text-gray-600 hover:text-primary py-2">Properties</a>
              <a href="#testimonials" className="text-gray-600 hover:text-primary py-2">Testimonials</a>
              <a href="#about" className="text-gray-600 hover:text-primary py-2">About Us</a>
              <Link href="/auth" className="text-primary hover:text-primary/90 py-2">
                Log In
              </Link>
              <Button onClick={() => navigate('/auth')}>
                Get Started
              </Button>
            </nav>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Real Estate Investing in Tanzania Made Simple
                </h1>
                <p className="text-xl text-gray-600 max-w-lg">
                  Invest in high-quality real estate properties in Tanzania with as little as TZS 100,000. Build your portfolio, earn passive income, and create wealth.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={() => navigate('/auth')} size="lg">
                    Start Investing Now
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => navigate('/auth')}>
                    Learn More
                  </Button>
                </div>
                <div className="pt-6">
                  <p className="text-sm text-gray-500">Trusted by over 10,000+ investors across Tanzania</p>
                  <div className="flex mt-2 space-x-6">
                    <div className="rounded-full h-8 w-8 bg-gray-200"></div>
                    <div className="rounded-full h-8 w-8 bg-gray-200"></div>
                    <div className="rounded-full h-8 w-8 bg-gray-200"></div>
                    <div className="rounded-full h-8 w-8 bg-gray-200"></div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                className="rounded-xl overflow-hidden shadow-2xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80" 
                  alt="Modern building in Dar es Salaam" 
                  className="w-full h-auto object-cover"
                />
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="py-12 bg-white border-y border-gray-100">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <p className="text-4xl font-bold text-primary">TZS 2B+</p>
                <p className="text-gray-600 mt-2">Total Investment Volume</p>
              </div>
              <div className="text-center p-6">
                <p className="text-4xl font-bold text-primary">15+</p>
                <p className="text-gray-600 mt-2">Properties Fully Funded</p>
              </div>
              <div className="text-center p-6">
                <p className="text-4xl font-bold text-primary">12%</p>
                <p className="text-gray-600 mt-2">Average Annual Returns</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">How Wazawa St. Works</h2>
              <p className="text-xl text-gray-600 mt-4 max-w-2xl mx-auto">
                Investing in Tanzanian real estate has never been easier. Start building your property portfolio in three simple steps.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Create an Account</h3>
                <p className="text-gray-600">
                  Sign up for free and complete your profile verification in less than 5 minutes.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Browse Properties</h3>
                <p className="text-gray-600">
                  Explore our curated selection of premium Tanzanian properties with detailed analytics.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Invest & Earn</h3>
                <p className="text-gray-600">
                  Invest any amount starting from TZS 100,000 and track your returns in real-time.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Featured Properties Section */}
        <section id="properties" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Featured Properties</h2>
                <p className="text-xl text-gray-600 mt-4 max-w-2xl">
                  Discover high-potential real estate investments across Tanzania's growing markets.
                </p>
              </div>
              <Button className="mt-6 md:mt-0" variant="outline" onClick={() => navigate('/auth')}>
                View All Properties
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              {/* Property 1 */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
                    alt="Luxury Apartment in Masaki" 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 rounded-md py-1 px-2 text-xs font-medium">
                    Luxury
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Golden Estate Apartment, Masaki</h3>
                  <p className="text-gray-500 text-sm mb-4 flex items-center">
                    <Building className="h-4 w-4 mr-1" /> Masaki, Dar es Salaam
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Minimum Investment</p>
                      <p className="text-lg font-bold text-gray-900">TZS 250,000</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Annual Return</p>
                      <p className="text-lg font-bold text-green-600">12.5%</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">65% Funded</span>
                      <span className="text-gray-900 font-medium">TZS 162.5M / TZS 250M</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "65%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Property 2 */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80" 
                    alt="Commercial Building" 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 rounded-md py-1 px-2 text-xs font-medium">
                    Commercial
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Oyster Bay Commercial Complex</h3>
                  <p className="text-gray-500 text-sm mb-4 flex items-center">
                    <Building className="h-4 w-4 mr-1" /> Oyster Bay, Dar es Salaam
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Minimum Investment</p>
                      <p className="text-lg font-bold text-gray-900">TZS 500,000</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Annual Return</p>
                      <p className="text-lg font-bold text-green-600">14.2%</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">89% Funded</span>
                      <span className="text-gray-900 font-medium">TZS 445M / TZS 500M</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "89%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Property 3 */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1605146769289-440113cc3d00?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
                    alt="Residential Villa" 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 rounded-md py-1 px-2 text-xs font-medium">
                    Residential
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Peninsula Villas, Msasani</h3>
                  <p className="text-gray-500 text-sm mb-4 flex items-center">
                    <Building className="h-4 w-4 mr-1" /> Msasani, Dar es Salaam
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Minimum Investment</p>
                      <p className="text-lg font-bold text-gray-900">TZS 100,000</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Annual Return</p>
                      <p className="text-lg font-bold text-green-600">11.8%</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">42% Funded</span>
                      <span className="text-gray-900 font-medium">TZS 126M / TZS 300M</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "42%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Benefits Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Why Choose Wazawa St.</h2>
              <p className="text-xl text-gray-600 mt-4 max-w-2xl mx-auto">
                We're transforming how Tanzanians invest in real estate with technology and transparency.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Low Minimum Investment</h3>
                <p className="text-gray-600">
                  Start with as little as TZS 100,000 and build your portfolio gradually.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Vetted Properties</h3>
                <p className="text-gray-600">
                  We thoroughly evaluate each property for quality, location, and return potential.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Diversified Portfolio</h3>
                <p className="text-gray-600">
                  Spread your investments across multiple properties and locations in Tanzania.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Secure Investment</h3>
                <p className="text-gray-600">
                  All investments are backed by real, physical properties with proper legal documentation.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What Our Investors Say</h2>
              <p className="text-xl text-gray-600 mt-4 max-w-2xl mx-auto">
                Join thousands of satisfied investors building wealth through Tanzanian real estate.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 mr-4"></div>
                  <div>
                    <h4 className="font-bold text-gray-900">Amina Joseph</h4>
                    <p className="text-gray-500 text-sm">Dar es Salaam</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "As a young professional, I never thought I could invest in property so early in my career. Wazawa St. made it possible for me to start building my real estate portfolio with just TZS 250,000."
                </p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 mr-4"></div>
                  <div>
                    <h4 className="font-bold text-gray-900">Emmanuel Makonda</h4>
                    <p className="text-gray-500 text-sm">Arusha</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "The transparency and detailed property analytics helped me make informed investment decisions. I've now invested in three properties and the returns have been consistently good."
                </p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 mr-4"></div>
                  <div>
                    <h4 className="font-bold text-gray-900">Grace Mwakasege</h4>
                    <p className="text-gray-500 text-sm">Mwanza</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "I love how easy it is to deposit funds using mobile money and track my investments. The customer service team is always responsive and helpful with any questions I have."
                </p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to start your investment journey?</h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Join Wazawa St. today and start building your real estate portfolio in Tanzania with just a few clicks.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/auth')}
              className="bg-white text-primary hover:bg-white/90"
            >
              Create Your Free Account
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
        
        {/* About Section */}
        <section id="about" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <img 
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
                  alt="Dar es Salaam cityscape" 
                  className="rounded-xl shadow-lg"
                />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">About Wazawa St.</h2>
                <p className="text-gray-600">
                  Founded in 2022, Wazawa St. is Tanzania's premier real estate investment platform. We're on a mission to democratize access to real estate investments for all Tanzanians.
                </p>
                <p className="text-gray-600">
                  Our team combines deep expertise in real estate, finance, and technology to provide a seamless investment experience. We carefully select each property in our portfolio to ensure quality and strong returns for our investors.
                </p>
                <div className="pt-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Our Vision</h3>
                  <p className="text-gray-600">
                    To empower every Tanzanian to build wealth through real estate investment, regardless of their financial background or expertise.
                  </p>
                </div>
                <Button variant="outline" onClick={() => navigate('/auth')}>
                  Learn More About Us
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Wazawa St.</span>
              </div>
              <p className="text-gray-400 mb-4">
                The easiest way to invest in Tanzanian real estate with as little as TZS 100,000.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#how-it-works" className="text-gray-400 hover:text-white">How It Works</a></li>
                <li><a href="#properties" className="text-gray-400 hover:text-white">Properties</a></li>
                <li><a href="#testimonials" className="text-gray-400 hover:text-white">Testimonials</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-white">About Us</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Investment Guide</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Market Insights</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Real Estate News</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Contact Us</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">Upanga, Dar es Salaam</li>
                <li className="text-gray-400">Tanzania</li>
                <li><a href="mailto:info@wazawast.com" className="text-gray-400 hover:text-white">info@wazawast.com</a></li>
                <li><a href="tel:+255712345678" className="text-gray-400 hover:text-white">+255 712 345 678</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2025 Wazawa St. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}