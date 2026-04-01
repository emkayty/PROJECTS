'use client';

import { useState, useEffect } from 'react';
import { Check, Zap, Crown, Sparkles } from 'lucide-react';
import CryptoPayment from './CryptoPayment';
import StripePayment from './StripePayment';
import PayPalPayment from './PayPalPayment';
import PaystackPayment from './PaystackPayment';

export default function PricingPage() {
  const [showCrypto, setShowCrypto] = useState(false);
  const [showStripe, setShowStripe] = useState(false);
  const [showPayPal, setShowPayPal] = useState(false);
  const [showPaystack, setShowPaystack] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ plan: string; amount: number } | null>(null);
  const [enabledProviders, setEnabledProviders] = useState<string[]>([]);

  useEffect(() => {
    fetchEnabledProviders();
  }, []);

  const fetchEnabledProviders = async () => {
    try {
      const res = await fetch('/api/admin/payment-settings/status');
      const data = await res.json();
      if (data.enabledProviders) {
        setEnabledProviders(data.enabledProviders);
      }
    } catch (err) {
      console.error('Failed to fetch enabled providers');
    }
  };

  const plans = [
    {
      name: 'Free',
      price: 0,
      description: 'Perfect for getting started',
      features: [
        'Upload up to 5 files',
        'Basic file management',
        'Community support',
        '100MB storage',
      ],
      icon: Sparkles,
      color: 'from-gray-500 to-gray-700',
      highlighted: false,
    },
    {
      name: 'Standard',
      price: 9.99,
      description: 'For regular users',
      features: [
        'Upload up to 50 files',
        'Advanced file management',
        'Priority support',
        '5GB storage',
        'Custom categories',
        'Analytics dashboard',
      ],
      icon: Zap,
      color: 'from-blue-500 to-indigo-500',
      highlighted: true,
    },
    {
      name: 'Premium',
      price: 19.99,
      description: 'For power users',
      features: [
        'Unlimited file uploads',
        'Advanced file management',
        '24/7 Priority support',
        'Unlimited storage',
        'Custom categories',
        'Advanced analytics',
        'API access',
        'Custom branding',
      ],
      icon: Crown,
      color: 'from-purple-500 to-pink-500',
      highlighted: false,
    },
  ];

  const openPayment = (provider: string, plan: string, amount: number) => {
    setSelectedPlan({ plan, amount });
    
    switch (provider) {
      case 'stripe':
        setShowStripe(true);
        break;
      case 'paypal':
        setShowPayPal(true);
        break;
      case 'paystack':
        setShowPaystack(true);
        break;
      case 'crypto':
        setShowCrypto(true);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Select the perfect plan for your needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all hover:scale-105 ${
                  plan.highlighted ? 'ring-4 ring-blue-500 md:-mt-4' : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <div className={`bg-gradient-to-r ${plan.color} p-6 text-white`}>
                  <Icon className="w-12 h-12 mb-4" />
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-white/80">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-5xl font-bold">${plan.price}</span>
                    <span className="text-white/80">/month</span>
                  </div>
                </div>

                <div className="p-6">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.price > 0 ? (
                    <div className="space-y-2">
                      {enabledProviders.includes('stripe') && (
                        <button
                          onClick={() => openPayment('stripe', plan.name, plan.price)}
                          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all"
                        >
                          💳 Pay with Card
                        </button>
                      )}
                      {enabledProviders.includes('paypal') && (
                        <button
                          onClick={() => openPayment('paypal', plan.name, plan.price)}
                          className="w-full bg-[#0070ba] text-white py-3 rounded-lg font-semibold hover:bg-[#005ea6] transition-all"
                        >
                          PayPal
                        </button>
                      )}
                      {enabledProviders.includes('paystack') && (
                        <button
                          onClick={() => openPayment('paystack', plan.name, plan.price)}
                          className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-all"
                        >
                          Paystack
                        </button>
                      )}
                      {enabledProviders.includes('crypto') && (
                        <button
                          onClick={() => openPayment('crypto', plan.name, plan.price)}
                          className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white py-3 rounded-lg font-semibold hover:from-gray-800 hover:to-black transition-all"
                        >
                          ₿ Crypto
                        </button>
                      )}
                      {enabledProviders.length === 0 && (
                        <p className="text-center text-gray-500 text-sm py-2">
                          Payment methods not configured
                        </p>
                      )}
                    </div>
                  ) : (
                    <button className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold cursor-default">
                      Current Plan
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Can I upgrade or downgrade my plan?
              </h3>
              <p className="text-gray-600">
                Yes! You can change your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept credit/debit cards (Stripe), PayPal, Paystack, and various cryptocurrencies including Bitcoin, Ethereum, USDT, Litecoin, and Dogecoin.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                How long does crypto payment verification take?
              </h3>
              <p className="text-gray-600">
                Crypto payments are typically confirmed within 5-30 minutes depending on network conditions. You can speed up verification by submitting your transaction hash.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Is there a refund policy?
              </h3>
              <p className="text-gray-600">
                Yes, we offer a 7-day money-back guarantee for all paid plans. Contact support for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modals */}
      {selectedPlan && (
        <>
          {showCrypto && (
            <CryptoPayment
              plan={selectedPlan.plan}
              amount={selectedPlan.amount}
              onClose={() => {
                setShowCrypto(false);
                setSelectedPlan(null);
              }}
            />
          )}
          {showStripe && (
            <StripePayment
              plan={selectedPlan.plan}
              amount={selectedPlan.amount}
              onClose={() => {
                setShowStripe(false);
                setSelectedPlan(null);
              }}
            />
          )}
          {showPayPal && (
            <PayPalPayment
              plan={selectedPlan.plan}
              amount={selectedPlan.amount}
              onClose={() => {
                setShowPayPal(false);
                setSelectedPlan(null);
              }}
            />
          )}
          {showPaystack && (
            <PaystackPayment
              plan={selectedPlan.plan}
              amount={selectedPlan.amount}
              onClose={() => {
                setShowPaystack(false);
                setSelectedPlan(null);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
