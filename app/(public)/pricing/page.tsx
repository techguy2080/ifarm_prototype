'use client';

import Link from 'next/link';
import { Check, Zap, Building2, Crown, Sparkles } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter',
      price: '$29',
      period: '/month',
      description: 'Perfect for small family farms',
      features: [
        'Manage up to 3 farms',
        'Add up to 10 team members',
        'Track animals & production',
        'Sales & expense tracking',
        'Email support',
      ],
      popular: false,
      icon: Building2,
      color: 'emerald',
    },
    {
      name: 'Professional',
      price: '$99',
      period: '/month',
      description: 'For growing commercial operations',
      features: [
        'Unlimited farms',
        'Add up to 50 team members',
        'Advanced animal tracking',
        'Team access control',
        'Production analytics',
        'Financial reports',
        'Priority support',
      ],
      popular: true,
      icon: Zap,
      color: 'green',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large-scale operations',
      features: [
        'Unlimited everything',
        'Custom features for your farm',
        'API integrations',
        'Dedicated account manager',
        'Training & onboarding',
        'On-premise option available',
      ],
      popular: false,
      icon: Crown,
      color: 'teal',
    },
  ];

  return (
    <div className="py-24 md:py-32 bg-gradient-to-br from-gray-50 via-emerald-50/20 to-gray-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold mb-6 tracking-wide uppercase">
            Pricing Plans
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight">
            Simple, Transparent
            <span className="block text-green-600">Pricing</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
            Choose the plan that fits your farm operations—upgrade or downgrade anytime
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`group relative bg-white rounded-3xl overflow-hidden transition-all duration-300 ${
                  plan.popular 
                    ? 'border-4 border-green-500 shadow-2xl scale-105 md:scale-110 z-10' 
                    : 'border-2 border-gray-200 shadow-lg hover:shadow-2xl hover:scale-105'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0">
                    <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-black tracking-wider uppercase">Most Popular</span>
                        <Sparkles className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className={`p-8 md:p-10 ${plan.popular ? 'pt-20' : ''}`}>
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
                    plan.color === 'emerald' ? 'from-emerald-500 to-green-600' :
                    plan.color === 'green' ? 'from-green-500 to-lime-600' :
                    'from-teal-500 to-emerald-600'
                  } flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  
                  {/* Plan name and price */}
                  <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">{plan.name}</h3>
                  <div className="flex items-baseline mb-4">
                    <span className="text-5xl md:text-6xl font-black text-gray-900">{plan.price}</span>
                    {plan.period && <span className="text-xl text-gray-600 ml-2 font-medium">{plan.period}</span>}
                  </div>
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">{plan.description}</p>

                  {/* Features */}
                  <ul className="space-y-4 mb-10">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
                          <Check className="w-4 h-4 text-green-600" strokeWidth={3} />
                        </div>
                        <span className="text-gray-700 text-lg leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link
                    href="/login"
                    className={`block w-full text-center py-5 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 text-lg ${
                      plan.popular
                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-2 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Try demo CTA */}
        <div className="mt-20 text-center">
          <div className="inline-block px-8 py-6 bg-white rounded-3xl shadow-xl border-2 border-emerald-100">
            <p className="text-lg text-gray-700 mb-4 font-medium">Want to try before you buy?</p>
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-bold text-xl group"
            >
              <span>Login with demo credentials</span>
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}

