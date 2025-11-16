'use client';

import Link from 'next/link';
import { Heart, Users, Shield, TrendingUp, Target, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-emerald-50/20 to-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-950 via-green-900 to-teal-900 py-24 md:py-32 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-emerald-100 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Our Story</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
              About iFarm
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100 font-light leading-relaxed">
              Empowering farmers with modern tools to manage their livestock operations smarter and more efficiently
            </p>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-24 fill-gray-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold mb-6 tracking-wide uppercase">
                Our Mission
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
                Making Farm Management
                <span className="block text-green-600">Simple & Powerful</span>
              </h2>
            </div>
            
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border-2 border-emerald-100">
              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p className="text-xl md:text-2xl font-light text-gray-900 mb-8">
                  iFarm was built by people who understand farming. We know the challenges you face every day—
                  tracking hundreds of animals, managing your team, monitoring finances, and making sure nothing falls through the cracks.
                </p>
                <p>
                  We believe that <span className="text-green-600 font-semibold">modern farms deserve modern tools</span>. 
                  Tools that are powerful enough for large commercial operations, yet simple enough for family farms. 
                  Tools that save you time, reduce errors, and help you make better decisions.
                </p>
                <p>
                  That's why we built iFarm—to give you complete visibility into your farm operations, 
                  from <span className="text-green-600 font-semibold">animal health and breeding</span> to 
                  <span className="text-green-600 font-semibold"> production tracking and financial management</span>. 
                  All in one place, accessible from anywhere.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold mb-6 tracking-wide uppercase">
                What Drives Us
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
                Our Core Values
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="group bg-gradient-to-br from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 border border-emerald-100">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Heart className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Farmer First</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  Every feature we build starts with a simple question: "Will this make a farmer's life easier?" 
                  If the answer isn't yes, we don't build it.
                </p>
              </div>
              
              <div className="group bg-gradient-to-br from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 border border-teal-100">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Shield className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Your Data, Secure</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  Your farm data is precious. We use enterprise-grade security to keep your information safe, 
                  private, and accessible only to you and your team.
                </p>
              </div>
              
              <div className="group bg-gradient-to-br from-green-50 to-lime-50 hover:from-green-100 hover:to-lime-100 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 border border-green-100">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-lime-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Users className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Built for Teams</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  Farming is a team sport. iFarm makes it easy for owners, workers, vets, and managers 
                  to collaborate seamlessly—everyone sees what they need, when they need it.
                </p>
              </div>
              
              <div className="group bg-gradient-to-br from-emerald-50 to-cyan-50 hover:from-emerald-100 hover:to-cyan-100 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 border border-emerald-100">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <TrendingUp className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Always Improving</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  We listen to our farmers. Every piece of feedback helps us make iFarm better. 
                  We're constantly adding features and improvements based on what you need.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose iFarm Section */}
      <section className="py-24 md:py-32 bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold mb-6 tracking-wide uppercase">
                Why iFarm?
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
                Built for the
                <span className="block text-green-600">Modern Farmer</span>
              </h2>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 border-l-8 border-emerald-500">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                  🌾 No Learning Curve
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  We designed iFarm to be intuitive. If you can use a smartphone, you can use iFarm. 
                  No complicated manuals, no training sessions—just simple, powerful farm management.
                </p>
              </div>
              
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 border-l-8 border-teal-500">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                  📱 Access Anywhere
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  In the barn, in the field, or at home—your farm data is always at your fingertips. 
                  iFarm works on any device, so you can manage your operation from anywhere.
                </p>
              </div>
              
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 border-l-8 border-green-500">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                  💰 Know Your Profits
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Stop guessing about your farm's financial health. iFarm tracks every sale and expense, 
                  showing you exactly where you stand—so you can make smarter business decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-br from-emerald-950 via-green-900 to-teal-900 py-24 md:py-32 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-emerald-100 text-sm font-medium mb-8">
              <Target className="w-4 h-4" />
              <span>Ready to Get Started?</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-white tracking-tight leading-tight">
              See iFarm in Action
            </h2>
            <p className="text-xl md:text-2xl text-emerald-100 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              Try our fully-featured demo account and see how iFarm can transform your farm management. 
              No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Link 
                href="/login" 
                className="inline-flex items-center gap-3 bg-white text-green-900 hover:bg-emerald-50 font-bold px-10 py-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-xl"
              >
                <span>Try Demo Now</span>
              </Link>
              <Link 
                href="/pricing" 
                className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 font-bold px-10 py-6 rounded-2xl transition-all duration-300 text-xl"
              >
                <span>View Pricing</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
