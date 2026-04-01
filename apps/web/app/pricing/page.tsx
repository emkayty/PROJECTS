'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CryptoPayment from '@/components/CryptoPayment';

export default function PricingPage() {
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);
  const [showCryptoPayment, setShowCryptoPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{plan: string, amount: number} | null>(null);

  const handleCryptoPayment = (plan: string, amount: number) => {
    setSelectedPlan({ plan, amount });
    setShowCryptoPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowCryptoPayment(false);
    alert('Payment successful! Your subscription has been activated.');
    router.push('/');
  };

  const handlePaymentCancel = () => {
    setShowCryptoPayment(false);
    setSelectedPlan(null);
  };

  return (
    <div className="bg-gray-100 min-h-screen" style={{ fontFamily: 'Verdana, Arial, Helvetica, sans-serif' }}>
      <style jsx global>{`
        body {
          font-family: Verdana, Arial, sans-serif;
          background-color: #f5f5f5;
        }
        .forum-header {
          background: linear-gradient(180deg, #4a90e2 0%, #2c5aa0 100%);
          border-bottom: 3px solid #1e3a5f;
        }
        .forum-category {
          background: white;
          border: 1px solid #ddd;
          transition: all 0.2s;
        }
        .forum-category:hover {
          background: #f9f9f9;
          border-color: #4a90e2;
        }
        .stats-box {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 3px;
        }
        .breadcrumb {
          font-size: 11px;
          color: #666;
        }
      `}</style>

      {/* Top Navigation Bar */}
      <div className="forum-header text-white py-3 px-4 shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
              <h1 className="text-2xl font-bold">HISAH TECH</h1>
            </div>
            <div className="flex gap-4 text-sm">
              <Link href="/" className="hover:underline">Home</Link>
              <Link href="/bios-files" className="hover:underline">BIOS Files</Link>
              <Link href="/schematics" className="hover:underline">Schematics</Link>
              <Link href="/repair-guides" className="hover:underline">Guides</Link>
              <Link href="/contact" className="hover:underline">Contact</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="breadcrumb">
          <Link href="/" className="text-blue-600 hover:underline">Hisah Tech</Link> » <span>Pricing</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        
        {/* Header Section */}
        <div className="bg-white p-6 mb-6 border border-gray-300 rounded shadow-sm text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Membership Plans</h2>
          <p className="text-gray-600 mb-6">
            Upgrade your access to our schematic archive, BIOS files, and technician support.
          </p>
          
          <div className="flex items-center justify-center gap-3 text-sm">
            <span className="text-gray-600">Monthly</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-12 h-6 rounded-full transition-colors ${isYearly ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isYearly ? 'translate-x-6' : ''}`}></span>
            </button>
            <span className="text-gray-800 font-semibold">Yearly (Save 20%)</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          
          {/* Free Plan */}
          <div className="bg-white p-6 border border-gray-300 rounded shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Free</h3>
            <div className="text-3xl font-bold text-gray-800 mb-4">$0<span className="text-lg font-normal text-gray-500">/mo</span></div>
            <ul className="space-y-2 mb-6 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Read-only forum access
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Basic parts search
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                No schematic downloads
              </li>
            </ul>
            <button className="w-full py-2 border border-gray-300 rounded font-semibold hover:bg-gray-50 transition">
              Current Plan
            </button>
          </div>

          {/* Standard Plan */}
          <div className="bg-white p-6 border-2 border-blue-600 rounded shadow-lg relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded">
              RECOMMENDED
            </div>
            <h3 className="text-lg font-bold text-blue-700 mb-2">Standard</h3>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {isYearly ? (
                <>$99<span className="text-lg font-normal text-gray-500">/yr</span></>
              ) : (
                <>$9<span className="text-lg font-normal text-gray-500">/mo</span></>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-4">Billed {isYearly ? 'annually' : 'monthly'}</p>
            <ul className="space-y-2 mb-6 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <strong>Full forum posting rights</strong>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <strong>5 schematic downloads/day</strong>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Advanced cross-ref database
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Hi-res board views
              </li>
            </ul>
            <div className="space-y-2">
              <button className="w-full py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition">
                Upgrade with Card
              </button>
              <button 
                onClick={() => handleCryptoPayment('standard', isYearly ? 99 : 9)}
                className="w-full py-2 bg-gray-800 text-white rounded font-semibold hover:bg-gray-900 transition"
              >
                Pay with Crypto
              </button>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="bg-white p-6 border border-gray-300 rounded shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Premium</h3>
            <div className="text-3xl font-bold text-gray-800 mb-4">$29<span className="text-lg font-normal text-gray-500">/mo</span></div>
            <ul className="space-y-2 mb-6 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <strong>Everything in Standard</strong>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Unlimited downloads
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Priority support
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Commercial license
              </li>
            </ul>
            <div className="space-y-2">
              <button className="w-full py-2 border border-gray-300 rounded font-semibold hover:bg-gray-50 transition">
                Upgrade with Card
              </button>
              <button 
                onClick={() => handleCryptoPayment('premium', 29)}
                className="w-full py-2 bg-gray-800 text-white rounded font-semibold hover:bg-gray-900 transition"
              >
                Pay with Crypto
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white p-6 border border-gray-300 rounded shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Can I cancel my subscription anytime?</h4>
              <p className="text-sm text-gray-600">Yes, you can cancel anytime from your account dashboard. Access remains until the billing cycle ends.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Do you offer team licenses?</h4>
              <p className="text-sm text-gray-600">Yes, Premium tier covers up to 3 users. For larger teams, please contact support.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">What payment methods do you accept?</h4>
              <p className="text-sm text-gray-600">We accept Visa, Mastercard, PayPal, and cryptocurrency (BTC, ETH, USDT, LTC, DOGE).</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">How does crypto payment work?</h4>
              <p className="text-sm text-gray-600">Click "Pay with Crypto", select your preferred cryptocurrency, send the payment to the generated address, and your subscription will be activated automatically once the transaction is confirmed on the blockchain.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Crypto Payment Modal */}
      {showCryptoPayment && selectedPlan && (
        <CryptoPayment
          plan={selectedPlan.plan}
          amount={selectedPlan.amount}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}

      {/* Footer */}
      <div className="bg-gray-800 text-white py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <div className="mb-3">
            <Link href="/" className="hover:underline mx-2">Home</Link> |
            <a href="#" className="hover:underline mx-2">Help</a> |
            <a href="#" className="hover:underline mx-2">Search</a> |
            <Link href="/about-us" className="hover:underline mx-2">About</Link> |
            <Link href="/contact" className="hover:underline mx-2">Contact</Link>
          </div>
          <div className="text-gray-400 text-xs">
            © 2024 Hisah Tech. All rights reserved.
            <br />Powered by Community Forums Software
          </div>
        </div>
      </div>
    </div>
  );
}
