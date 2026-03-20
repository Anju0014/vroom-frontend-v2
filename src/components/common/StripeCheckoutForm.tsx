'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { StripeService} from '@/services/common/stripeService';
// import { confirmBooking, cancelBooking } from '@/ser/bookingService'; // New services
import { AuthService } from '@/services/customer/authService';
import LoadingButton from './LoadingButton';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Props {
  carId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  customerEmail: string;
  userId: string;
  carOwnerId: string;
  dailyRate: string;
  bookingId: string; // Added
}

const CheckoutForm = ({
  setError,
  carId,
  startDate,
  endDate,
  totalPrice,
  userId,
  carOwnerId,
  dailyRate,
  customerEmail,
  bookingId, // Added
}: {
  setError: (message: string) => void;
  carId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  userId: string;
  carOwnerId: string;
  dailyRate: string;
  customerEmail: string;
  bookingId: string; // Added
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    if (elements) {
      const paymentElement = elements.getElement('payment');
      paymentElement?.on('change', (event) => {
        if (event.value?.type) {
          setSelectedPaymentMethod(event.value.type);
        }
      });
    }
  }, [elements]);

  const getBaseUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      return `https://${baseUrl}`;
    }
    return baseUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      const returnUrl = `${getBaseUrl()}/bookings/confirmation`;
      console.log('Using return_url:', returnUrl);

      const isValidUrl = (url: string) => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      };

      if (!isValidUrl(returnUrl)) {
        throw new Error('Invalid return URL. Please check your application configuration.');
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
          payment_method_data: {
            billing_details: {
              email: customerEmail,
            },
          },
        },
        redirect: 'if_required',
      });

      console.log('Payment intent:', paymentIntent);

      if (error) {
        let errorMsg = error.message || 'Payment failed';
        if (error.type === 'invalid_request_error' && error.code === 'payment_method_type_invalid') {
          errorMsg = `The ${selectedPaymentMethod.toUpperCase()} payment method is not available. Please ensure it is enabled in your Stripe Dashboard or try another payment method.`;
        }
        setMessage(errorMsg);
        setError(errorMsg);
        setShowErrorModal(true);

        // Cancel booking on payment failure
        try {
          await AuthService.failBooking(bookingId);
          console.log('Booking cancelled due to payment failure');
        } catch (cancelError: any) {
          console.error('Failed to cancel booking:', cancelError);
          setMessage('Payment failed and booking cancellation failed. Please contact support.');
          setError('Payment failed and booking cancellation failed. Please contact support.');
        }
      } else if (paymentIntent?.status === 'succeeded') {
        setMessage('Payment successful!');

        // Confirm booking
        try {
          const transactionId = paymentIntent.id;
          const bookingResponse = await AuthService.confirmBooking(bookingId, paymentIntent.id,'stripe');
          console.log('Booking confirmed:', bookingResponse);

          // Navigate to confirmation page
          router.push(`/bookings/confirmation?bookingId=${bookingId}`);
        } catch (confirmError: any) {
          const errorMsg = `Payment succeeded, but booking confirmation failed: ${confirmError.message}. Please contact support.`;
          setMessage(errorMsg);
          setError(errorMsg);
          setShowErrorModal(true);
        }
      } else {
        const errorMsg = `Payment not completed. Status: ${paymentIntent?.status || 'unknown'}`;
        setMessage(errorMsg);
        setError(errorMsg);
        setShowErrorModal(true);

        // Cancel booking on incomplete payment
        try {
          await AuthService.failBooking(bookingId);
          console.log('Booking cancelled due to incomplete payment');
        } catch (cancelError: any) {
          console.error('Failed to cancel booking:', cancelError);
          setMessage('Payment incomplete and booking cancellation failed. Please contact support.');
          setError('Payment incomplete and booking cancellation failed. Please contact support.');
        }
      }
    } catch (err: any) {
      const errorMsg = err.message || 'An unexpected error occurred during payment';
      setMessage(errorMsg);
      setError(errorMsg);
      setShowErrorModal(true);

      // Cancel booking on unexpected error
      try {
        await AuthService.failBooking(bookingId);
        console.log('Booking cancelled due to unexpected error');
      } catch (cancelError: any) {
        console.error('Failed to cancel booking:', cancelError);
        setMessage('Payment error and booking cancellation failed. Please contact support.');
        setError('Payment error and booking cancellation failed. Please contact support.');
      }
    }

    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <form onSubmit={handleSubmit}>
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-indigo-700">Secure Payment</h2>
        </div>
        <h3 className="text-lg font-semibold text-indigo-700 mb-4">Choose Payment Method</h3>
        <PaymentElement
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'upi', 'netbanking'],
            fields: {
              billingDetails: {
                name: 'auto',
                email: 'never',
              },
            },
          }}
        />
        <LoadingButton
          type="submit"
          disabled={!stripe || loading}
          className="mt-6 w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </span>
          ) : (
            `Pay ₹${totalPrice} with ${selectedPaymentMethod.toUpperCase()}`
          )}
        </LoadingButton>
        {message && !showErrorModal && (
          <p className="mt-4 text-sm text-red-500 text-center">{message}</p>
        )}
      </form>

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm">
            <h3 className="text-lg font-semibold text-red-500 mb-4">Payment Error</h3>
            <p className="text-gray-700">{message}</p>
            <LoadingButton
              onClick={() => setShowErrorModal(false)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Close
            </LoadingButton>
          </div>
        </div>
      )}
    </div>
  );
};

const StripeCheckoutForm: React.FC<Props> = ({
  carId,
  startDate,
  endDate,
  totalPrice,
  customerEmail,
  userId,
  carOwnerId,
  dailyRate,
  bookingId, // Added
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const initPayment = async () => {
//       try {
//         setLoading(true);
//         const data = await createPaymentIntent({
//           carId,
//           startDate,
//           endDate,
//           totalPrice,
//           customerEmail,
//           bookingId, 
//         });
//         setClientSecret(data.clientSecret);
//       } catch (err: any) {
//         setError(err.message || 'Failed to initialize payment');
//       } finally {
//         setLoading(false);
//       }
//     };

//     initPayment();
//   }, [carId, startDate, endDate, totalPrice, customerEmail, bookingId]);
useEffect(() => {
    let isMounted = true;
  
    const initPayment = async () => {
      try {
        setLoading(true);
        const data = await StripeService.createPaymentIntent({
          carId,
          startDate,
          endDate,
          totalPrice,
          customerEmail,
          bookingId,
        });
        if (!isMounted) return;
  
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to initialize payment');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
  
    initPayment();
  
    return () => {
      isMounted = false;
    };
  }, [carId, startDate, endDate, totalPrice, customerEmail, bookingId]);
  if (loading) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2">Loading Payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center text-red-500">
        Unable to initialize payment
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#4f46e5',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        borderRadius: '8px',
        spacingUnit: '4px',
      },
      rules: {
        '.Tab': {
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        },
        '.Tab--selected': {
          backgroundColor: '#4f46e5',
          color: '#ffffff',
        },
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm
        setError={setError}
        carId={carId}
        startDate={startDate}
        endDate={endDate}
        totalPrice={totalPrice}
        userId={userId}
        carOwnerId={carOwnerId}
        dailyRate={dailyRate}
        customerEmail={customerEmail}
        bookingId={bookingId} // Pass bookingId
      />
    </Elements>
  );
};

export default StripeCheckoutForm;
