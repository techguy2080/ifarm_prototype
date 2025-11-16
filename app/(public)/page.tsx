'use client';

import Link from 'next/link';
import { Shield, Users, Clock, Link2, FileSearch, UserPlus, Building2, Zap, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-950 via-green-900 to-teal-900 py-24 md:py-32 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-emerald-100 text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span>Next-Generation Farm Management</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-tight tracking-tight">
              Manage Your Farm
              <span className="block bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 bg-clip-text text-transparent animate-gradient">
                The Modern Way
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-emerald-100 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Track your animals, manage daily operations, monitor sales and expenses—all in one place. 
              iFarm helps you run your livestock business smarter and more efficiently.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Link 
                href="/login" 
                className="group relative inline-flex items-center gap-3 bg-white text-green-900 hover:bg-emerald-50 font-bold px-8 py-5 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-lg"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/pricing" 
                className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 font-bold px-8 py-5 rounded-2xl transition-all duration-300 text-lg"
              >
                <span>View Pricing</span>
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-emerald-200/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">Free Demo Access</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-24 fill-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold mb-6 tracking-wide uppercase">
              Powerful Features
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
              Everything You Need to
              <span className="block text-green-600">Grow Your Farm</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
              Powerful tools designed specifically for modern livestock farmers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="group relative bg-gradient-to-br from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 border border-emerald-100">
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Shield className="h-8 w-8 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Animal Tracking</h3>
                <p className="text-gray-700 leading-relaxed">
                  Keep detailed records of every animal—health status, breeding history, vaccinations, and more. Know exactly what's happening on your farm.
                </p>
              </div>
            </div>
            
            <div className="group relative bg-gradient-to-br from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 border border-teal-100">
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Building2 className="h-8 w-8 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Multiple Farms, One Dashboard</h3>
                <p className="text-gray-700 leading-relaxed">
                  Manage all your farms from a single account. Whether you have one location or ten, see everything at a glance.
                </p>
              </div>
            </div>
            
            <div className="group relative bg-gradient-to-br from-green-50 to-lime-50 hover:from-green-100 hover:to-lime-100 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 border border-green-100">
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-lime-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Clock className="h-8 w-8 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Financial Management</h3>
                <p className="text-gray-700 leading-relaxed">
                  Track sales, expenses, and profits in real-time. Understand your farm's financial health and make better business decisions.
                </p>
              </div>
            </div>
            
            <div className="group relative bg-gradient-to-br from-emerald-50 to-cyan-50 hover:from-emerald-100 hover:to-cyan-100 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 border border-emerald-100">
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Link2 className="h-8 w-8 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Team Collaboration</h3>
                <p className="text-gray-700 leading-relaxed">
                  Add your workers, vets, and managers. Give each person the right access—no more, no less. Everyone stays on the same page.
                </p>
              </div>
            </div>
            
            <div className="group relative bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 border border-green-100">
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <FileSearch className="h-8 w-8 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Production Tracking</h3>
                <p className="text-gray-700 leading-relaxed">
                  Record daily milk, eggs, wool, or honey production. Track output per animal and identify your top performers.
                </p>
              </div>
            </div>
            
            <div className="group relative bg-gradient-to-br from-lime-50 to-green-50 hover:from-lime-100 hover:to-green-100 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 border border-lime-100">
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-lime-500 to-green-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <UserPlus className="h-8 w-8 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Smart Reports</h3>
                <p className="text-gray-700 leading-relaxed">
                  Get insights that matter. See health trends, breeding patterns, financial summaries, and operational reports instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="relative bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 py-24 md:py-32 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold mb-6 tracking-wide uppercase">
                Enterprise Architecture
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
                Built for Real Farms
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 font-light leading-relaxed max-w-3xl mx-auto">
                Whether you're managing <span className="text-green-600 font-semibold">dairy cattle</span>, 
                <span className="text-green-600 font-semibold"> poultry</span>, 
                <span className="text-green-600 font-semibold"> goats</span>, or 
                <span className="text-green-600 font-semibold"> sheep</span>—iFarm works for your operation
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="group relative bg-white rounded-3xl p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 border-l-8 border-emerald-500 hover:scale-[1.02]">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg">
                      1
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight">Track Every Animal</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      From birth to sale, record everything about each animal. Track <span className="text-green-600 font-semibold">health records</span>, 
                      <span className="text-green-600 font-semibold"> breeding dates</span>, <span className="text-green-600 font-semibold">vaccinations</span>, and 
                      <span className="text-green-600 font-semibold"> weight</span>. Never lose important information again.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="group relative bg-white rounded-3xl p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 border-l-8 border-teal-500 hover:scale-[1.02]">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg">
                      2
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight">Manage Your Team <span className="text-gray-400 text-lg font-normal">(Easily)</span></h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      Set up accounts for your workers, veterinarians, and farm managers. Give each person access to what they need—
                      <span className="text-green-600 font-semibold"> vets see health records</span>, 
                      <span className="text-green-600 font-semibold"> workers log daily activities</span>, and you control everything.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="group relative bg-white rounded-3xl p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 border-l-8 border-green-500 hover:scale-[1.02]">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-lime-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg">
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight">Know Your Numbers</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      See your farm's performance at a glance—<span className="text-green-600 font-semibold">sales revenue</span>, 
                      <span className="text-green-600 font-semibold"> total expenses</span>, <span className="text-green-600 font-semibold">profit margins</span>, and 
                      <span className="text-green-600 font-semibold"> production output</span>. Make informed decisions backed by real data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-br from-emerald-950 via-green-900 to-teal-900 text-white py-24 md:py-32 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight leading-tight">
              Ready to Modernize
              <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Your Farm?
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-emerald-100 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              Join hundreds of farmers who are managing their livestock smarter with iFarm. 
              Try it free—no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Link 
                href="/login" 
                className="group inline-flex items-center gap-3 bg-white text-green-900 hover:bg-emerald-50 font-bold px-10 py-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-xl"
              >
                <span>Try Demo Now</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/pricing" 
                className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 font-bold px-10 py-6 rounded-2xl transition-all duration-300 text-xl"
              >
                <span>View Plans</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

