'use client';

import { useState, useEffect } from 'react';
import { Copy, CheckCircle, XCircle, Clock } from 'lucide-react';

interface CryptoPaymentProps {
  plan: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const CRYPTO_OPTIONS = [
  { code: 'BTC', name: 'Bitcoin', icon: '₿' },
  { code: 'ETH', name: 'Ethereum', icon: 'Ξ' },
  { code: 'USDT', name: 'Tether USDT', icon: '₮' },
  { code: 'LTC', name: 'Litecoin', icon: 'Ł' },
  { code: 'DOGE', name: 'Dogecoin', icon: 'Ð' }
];

export default function CryptoPayment({ plan, amount, onSuccess, onCancel }: CryptoPaymentProps) {
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [paymentOrder, setPaymentOrder] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds

  useEffect(() => {
    if (selectedCrypto) {
      createPaymentOrder();
    }
  }, [selectedCrypto]);

  useEffect(() => {
    if (paymentOrder && paymentOrder.status === 'pending') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Poll for payment status every 30 seconds
      const pollInterval = setInterval(() => {
        checkPaymentStatus();
      }, 30000);

      return () => {
        clearInterval(timer);
        clearInterval(pollInterval);
      };
    }
  }, [paymentOrder]);

  const createPaymentOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/crypto/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: 1, // Get from auth context
          plan,
          amount,
          currency: selectedCrypto
        })
      });

      const data = await response.json();
      if (data.success) {
        setPaymentOrder(data.order);
      }
    } catch (error) {
      console.error('Failed to create payment order:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentOrder) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/crypto/status?orderId=${paymentOrder.orderId}`,
        { credentials: 'include' }
      );

      const data = await response.json();
      if (data.success && data.order.status === 'completed') {
        setPaymentOrder(data.order);
        onSuccess();
      } else if (data.order.status === 'expired') {
        setPaymentOrder(data.order);
      }
    } catch (error) {
      console.error('Failed to check payment status:', error);
    }
  };

  const handleVerifyPayment = async () => {
    if (!transactionHash.trim()) {
      alert('Please enter your transaction hash');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/crypto/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          orderId: paymentOrder.orderId,
          transactionHash
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Payment verified! Your subscription has been activated.');
        onSuccess();
      } else {
        alert(data.message || 'Payment not yet confirmed. Please wait a few minutes.');
      }
    } catch (error) {
      console.error('Failed to verify payment:', error);
      alert('Failed to verify payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Pay with Cryptocurrency</h2>
          <p className="text-gray-600 mt-1">Select your preferred cryptocurrency</p>
        </div>

        <div className="p-6">
          {/* Crypto Selection */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {CRYPTO_OPTIONS.map(crypto => (
              <button
                key={crypto.code}
                onClick={() => setSelectedCrypto(crypto.code)}
                className={`p-4 border-2 rounded-lg text-center transition ${
                  selectedCrypto === crypto.code
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-1">{crypto.icon}</div>
                <div className="text-xs font-semibold text-gray-700">{crypto.code}</div>
              </button>
            ))}
          </div>

          {paymentOrder && (
            <>
              {/* Payment Status */}
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                paymentOrder.status === 'completed' ? 'bg-green-50' :
                paymentOrder.status === 'expired' ? 'bg-red-50' :
                'bg-yellow-50'
              }`}>
                {paymentOrder.status === 'completed' && (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <span className="text-green-800 font-semibold">Payment Confirmed!</span>
                  </>
                )}
                {paymentOrder.status === 'expired' && (
                  <>
                    <XCircle className="w-6 h-6 text-red-600" />
                    <span className="text-red-800 font-semibold">Payment Expired</span>
                  </>
                )}
                {paymentOrder.status === 'pending' && (
                  <>
                    <Clock className="w-6 h-6 text-yellow-600" />
                    <span className="text-yellow-800 font-semibold">
                      Awaiting Payment - {formatTime(timeLeft)} remaining
                    </span>
                  </>
                )}
              </div>

              {/* Payment Details */}
              {paymentOrder.status === 'pending' && (
                <>
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="mb-4">
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Amount to Send
                      </label>
                      <div className="text-2xl font-bold text-gray-800">
                        {paymentOrder.amount} {paymentOrder.currency}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        ≈ ${amount} USD
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Send to Address
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-white p-3 rounded border text-sm break-all">
                          {paymentOrder.address}
                        </code>
                        <button
                          onClick={() => copyToClipboard(paymentOrder.address)}
                          className="p-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                          {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded border border-yellow-200">
                      ⚠️ <strong>Important:</strong> Send exactly {paymentOrder.amount} {paymentOrder.currency} to the address above. 
                      Sending a different amount may delay processing.
                    </div>
                  </div>

                  {/* Transaction Hash Input */}
                  <div className="mb-6">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      After sending, paste your transaction hash (optional - speeds up verification)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={transactionHash}
                        onChange={(e) => setTransactionHash(e.target.value)}
                        placeholder="0x... or transaction ID"
                        className="flex-1 px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={handleVerifyPayment}
                        disabled={loading || !transactionHash.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                      >
                        {loading ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p className="mb-2">
                      <strong>Verification Process:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Send the exact amount to the address above</li>
                      <li>Payment will be automatically detected (may take 5-30 minutes)</li>
                      <li>Or paste your transaction hash to speed up verification</li>
                      <li>Your subscription will activate once payment is confirmed</li>
                    </ul>
                  </div>
                </>
              )}
            </>
          )}

          {loading && !paymentOrder && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Generating payment address...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded font-semibold hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
