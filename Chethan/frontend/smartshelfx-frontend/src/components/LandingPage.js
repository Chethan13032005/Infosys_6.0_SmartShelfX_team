import React, { useState } from 'react';
import { ChevronRight, TrendingUp, Package, Zap, Bell, Lock, BarChart3, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const features = [
    {
      icon: TrendingUp,
      title: 'AI Demand Forecasting',
      description: 'Advanced models analyze sales patterns, seasonality, and trends to predict stock requirements with high accuracy.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Package,
      title: 'Automated Restocking',
      description: 'The system identifies low-stock levels and triggers auto-restock actions, ensuring uninterrupted inventory availability.',
      color: 'from-teal-500 to-emerald-500'
    },
    {
      icon: Zap,
      title: 'Unified Stock Monitoring',
      description: 'Track every product, movement, and adjustment in a centralized dashboard with real-time updates.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Bell,
      title: 'Smart Alerts & Notifications',
      description: 'Instant alerts for low stock, anomalies, and critical movements — keeping your operations proactive, not reactive.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Lock,
      title: 'Role-Based Access Control',
      description: 'Secure, structured access for Admins, Managers, and Staff with tailored permissions and activity visibility.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: BarChart3,
      title: 'Analytics that Matter',
      description: 'Action-driven insights into fast-movers, dead stock, restock cycles, and purchase efficiency.',
      color: 'from-green-500 to-teal-500'
    }
  ];

  const benefits = [
    'Reduces stock-outs',
    'Prevents overstock',
    'Improves cash-flow efficiency',
    'Removes repetitive manual work',
    'Gives full operational visibility'
  ];

  const industries = [
    'Retail stores',
    'FMCG distributors',
    'Supermarkets',
    'Pharmacies',
    'Electronics stores',
    'Warehouses & stockrooms'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-20 left-10 w-96 h-96 bg-teal-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-white">SX</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                SmartShelfX
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-sm font-semibold text-gray-700 hover:text-teal-600 transition">Features</a>
              <a href="#benefits" className="text-sm font-semibold text-gray-700 hover:text-teal-600 transition">Why Us</a>
              <a href="#industries" className="text-sm font-semibold text-gray-700 hover:text-teal-600 transition">For Business</a>
              <a href="#contact" className="text-sm font-semibold text-gray-700 hover:text-teal-600 transition">Contact</a>
            </div>

            <div className="hidden md:flex space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:border-teal-600 hover:text-teal-600 transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:shadow-teal-500/30 transition transform hover:scale-105"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-6 space-y-4 border-t border-gray-200 pt-6">
              <a href="#features" className="block text-base font-semibold text-gray-700 hover:text-teal-600 transition">Features</a>
              <a href="#benefits" className="block text-base font-semibold text-gray-700 hover:text-teal-600 transition">Why Us</a>
              <a href="#industries" className="block text-base font-semibold text-gray-700 hover:text-teal-600 transition">For Business</a>
              <div className="flex flex-col space-y-3 pt-4">
                <button
                  onClick={() => navigate('/login')}
                  className="px-5 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:border-teal-600 transition"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl shadow-lg"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 mb-8 px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200">
            <Zap size={18} className="text-teal-600" />
            <span className="text-sm text-teal-700 font-semibold">AI-Powered Inventory Intelligence</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-gray-900 via-teal-800 to-blue-900 bg-clip-text text-transparent">
              Inventory Intelligence
            </span>
            <br />
            <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              for Modern Retailers
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            A fully autonomous inventory engine that forecasts demand, automates restocking, and gives you real-time clarity across your entire product ecosystem.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center mb-20">
            <button
              onClick={() => navigate('/signup')}
              className="px-10 py-4 text-lg font-bold bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl shadow-2xl hover:shadow-teal-500/40 transition transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Get Started</span>
              <ChevronRight size={22} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-10 py-4 text-lg font-bold border-2 border-gray-300 text-gray-700 bg-white rounded-xl hover:border-teal-600 hover:text-teal-600 transition"
            >
              Login
            </button>
          </div>

          {/* Hero Visualization */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <TrendingUp size={32} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Forecast Accuracy</h3>
              <p className="text-gray-600">Predict demand with AI precision</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <Package size={32} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Auto-Restock</h3>
              <p className="text-gray-600">Never run out of inventory</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <BarChart3 size={32} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Real-Time Insights</h3>
              <p className="text-gray-600">Data-driven decisions instantly</p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-teal-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-8">
            <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">Predict.</span>
            <span className="text-gray-900"> Automate. </span>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Optimize.</span>
          </h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            SmartShelfX eliminates guesswork and manual tracking by combining AI forecasting, automated stock operations, and intelligent insights — enabling businesses to scale without chaos.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Core Features</h2>
            <p className="text-xl text-gray-600">Everything you need to master your inventory</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group p-8 rounded-2xl bg-white border-2 border-gray-200 hover:border-teal-500 hover:shadow-2xl transition-all"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition`}>
                    <Icon size={28} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why SmartShelfX */}
      <section id="benefits" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-teal-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">Why Businesses Trust SmartShelfX</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Because traditional inventory systems are reactive. SmartShelfX is predictive, automated, and insight-driven — the way modern retail demands.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start space-x-4 bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <ChevronRight size={20} className="text-white" />
                </div>
                <p className="text-lg font-semibold text-gray-800">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section id="industries" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Built for Business Workflows</h2>
          <p className="text-xl text-gray-600 mb-12">Designed for:</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {industries.map((industry, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-teal-50 border-2 border-gray-200 hover:border-teal-500 hover:shadow-lg transition"
              >
                <p className="text-lg font-bold text-gray-800">{industry}</p>
              </div>
            ))}
          </div>

          <p className="text-gray-600 mt-12 text-lg font-medium">Engineered for speed, reliability, and decision clarity.</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-teal-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Transform the way you manage inventory.</h2>
          <p className="text-xl mb-12 opacity-90">
            SmartShelfX brings intelligence, automation, and control — all in one platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="px-10 py-4 text-lg font-bold bg-white text-teal-600 rounded-xl shadow-2xl hover:shadow-white/40 transition transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Get Started</span>
              <ChevronRight size={22} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-10 py-4 text-lg font-bold border-2 border-white text-white rounded-xl hover:bg-white hover:text-teal-600 transition"
            >
              Login
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-white">SX</span>
                </div>
                <span className="font-bold text-white text-lg">SmartShelfX</span>
              </div>
              <p className="text-gray-400 text-sm">Inventory Intelligence Platform</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-teal-400 transition">Overview</a></li>
                <li><a href="#" className="hover:text-teal-400 transition">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-teal-400 transition">Contact</a></li>
                <li><a href="#" className="hover:text-teal-400 transition">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-teal-400 transition">Terms</a></li>
                <li><a href="#" className="hover:text-teal-400 transition">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">© 2025 SmartShelfX. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
