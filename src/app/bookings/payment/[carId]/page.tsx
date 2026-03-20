'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { format, differenceInCalendarDays } from 'date-fns';
import { AuthService } from '@/services/customer/authService';
import { useAuthStore } from '@/store/customer/authStore';
import StripeCheckoutForm from '@/components/common/StripeCheckoutForm';
import Stepper from '@/components/common/StepperBooking';
import LoadingButton from '@/components/common/LoadingButton';
import { PaymentCar } from '@/types/carTypes';



const PaymentPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const carId = params?.carId as string;
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const totalPrice = searchParams.get('totalPrice');
  const bookingId = searchParams.get('bookingId');

  const { data: session, status } = useSession();
  const { user, accessToken } = useAuthStore();

  const [car, setCar] = useState<PaymentCar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'stripe'>('stripe');
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [walletLoading, setWalletLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const isNextAuthUser = status === 'authenticated';
  const isZustandUser = !!user && !!accessToken;
  const isAuthenticated = isNextAuthUser || isZustandUser;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/bookings/dateselection/${carId}?startDate=${startDate}&endDate=${endDate}`);
      return;
    }

    if (!carId || !startDate || !endDate || !totalPrice) {
      setError('Incomplete booking data');
      setLoading(false);
      return;
    }

    if (!session?.user?.email && !user?.email) {
      setError('User email is missing');
      setLoading(false);
      return;
    }

    if (!bookingId) {
      setError('Booking ID is missing');
      setLoading(false);
      return;
    }

    let isMounted = true;

    const initializePaymentPage = async () => {
      try {
        setLoading(true);

        const carData = await AuthService.findCarDetails(carId);
        if (!isMounted) return;
        setCar(carData);

        if (!session?.user?.id && !user?.id) {
          throw new Error('User ID is missing');
        }
        setWalletLoading(true);
        try {
          const userId = session?.user?.id || user?.id;
            console.log("sending data")
          const walletData = await AuthService.getWalletBalance();
          console.log(walletData)
          if (isMounted) {
            setWalletBalance(walletData.balance || 0);
          }
            console.log("balance",walletBalance)
        } catch (walletErr) {
          console.error('Error fetching wallet balance:', walletErr);
          if (isMounted) {
            setWalletBalance(0);
          }
        } finally {
          if (isMounted) {
            setWalletLoading(false);
          }
        }

      } catch (err) {
        console.error('Error initializing booking:', err);
        if (isMounted) {
          setError('Failed to initialize booking. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializePaymentPage();

    return () => {
      isMounted = false;
    };
  }, [carId, startDate, endDate, totalPrice, bookingId, isAuthenticated, session?.user?.email, session?.user?.id, user?.email, user?.id, router]);

  const handleWalletPayment = async () => {
    const totalAmount = Number(totalPrice);
    
    if (walletBalance < totalAmount) {
      setPaymentError('Insufficient wallet balance');
      return;
    }

    if (!bookingId) {
      setPaymentError('Booking ID is missing');
      return;
    }

    try {
      setProcessingPayment(true);
      setPaymentError(null);
      const walletPaymentResponse = await AuthService.payWithWallet({
        bookingId,
        amount: totalAmount,
      });

      console.log('Wallet payment successful:', walletPaymentResponse);
      try {
        router.push(`/bookings/confirmation?bookingId=${bookingId}`);
      } catch (confirmError: any) {
        console.error('Booking confirmation error:', confirmError);
        setPaymentError(`Wallet payment succeeded, but booking confirmation failed: ${confirmError.message}. Please contact support.`);
        router.push(`/bookings/confirmation?bookingId=${bookingId}`);
      }
    } catch (err: any) {
      console.error('Wallet payment error:', err);
      setPaymentError(err.response?.data?.message || 'Wallet payment failed. Please try again.');
      try {
        await AuthService.failBooking(bookingId);
        console.log('Booking cancelled due to wallet payment failure');
      } catch (cancelError) {
        console.error('Failed to cancel booking:', cancelError);
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleBack = () => {
    router.push(`/bookings/dateselection/${carId}?startDate=${startDate}&endDate=${endDate}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
         <div className="flex items-center justify-center h-20">
      <div className="w-8 h-8 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
    </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-8 max-w-lg mx-auto">
        {error}
        <LoadingButton
          onClick={handleBack}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Go Back
        </LoadingButton>
      </div>
    );
  }

  if (!car || !startDate || !endDate || !totalPrice || !bookingId) {
    return (
      <div className="text-red-500 text-center p-8 max-w-lg mx-auto">
        Incomplete booking data or booking not initialized
        <LoadingButton
          onClick={handleBack}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Go Back
        </LoadingButton>
      </div>
    );
  }

  const steps = ['Check Availability', 'Select Dates', 'Agreement', 'Payment'];
  const currentStep = steps.length - 1;
  const hasInsufficientBalance = walletBalance < Number(totalPrice);

  return (
    <div className="bg-gradient-to-b from-blue-200 to-yellow-200 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-indigo-700">
              Payment for {car.carName}
            </h2>
            <LoadingButton
              onClick={handleBack}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Back
            </LoadingButton>
          </div>

          <div className="space-y-8">
            <div className="bg-indigo-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-indigo-700 mb-4">
                Booking Summary
              </h3>
              <div className="space-y-2">
                <p><strong>Car:</strong> {car.carName}</p>
                <p><strong>Brand:</strong> {car.brand}</p>
                <p><strong>Daily Rate:</strong> ₹{car.expectedWage}</p>
                <p>
                  <strong>Start Date:</strong>{' '}
                  {format(new Date(startDate), 'MMM dd, yyyy')}
                </p>
                <p>
                  <strong>End Date:</strong>{' '}
                  {format(new Date(endDate), 'MMM dd, yyyy')}
                </p>
                <p>
                  <strong>Duration:</strong>{' '}
                  {differenceInCalendarDays(new Date(endDate), new Date(startDate)) + 1}{' '}
                  days
                </p>
                <p className="text-xl font-bold text-indigo-700 pt-2 border-t border-indigo-200">
                  <strong>Total Price:</strong> ₹{totalPrice}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Select Payment Method
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-white hover:border-indigo-300">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'wallet'}
                    onChange={() => setPaymentMethod('wallet')}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    disabled={walletLoading}
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-800">Wallet</span>
                    {walletLoading ? (
                      <span className="ml-2 text-sm text-gray-500">Loading...</span>
                    ) : (
                      <span className={`ml-2 text-sm ${hasInsufficientBalance ? 'text-red-600 font-medium' : 'text-green-600'}`}>
                        (Balance: ₹{walletBalance.toFixed(2)})
                      </span>
                    )}
                  </div>
                  {hasInsufficientBalance && (
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                      Insufficient
                    </span>
                  )}
                </label>

                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-white hover:border-indigo-300">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'stripe'}
                    onChange={() => setPaymentMethod('stripe')}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-800">Card / UPI</span>
                    <span className="ml-2 text-sm text-gray-500">(Secure payment via Stripe)</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="max-w-lg mx-auto">
              {paymentError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-center text-sm">{paymentError}</p>
                </div>
              )}

              {paymentMethod === 'wallet' ? (
                <div className="space-y-4">
                  <LoadingButton
                    onClick={handleWalletPayment}
                    disabled={hasInsufficientBalance || processingPayment}
                    className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
                      hasInsufficientBalance
                        ? 'bg-gray-400 cursor-not-allowed'
                        : processingPayment
                        ? 'bg-green-400 cursor-wait'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {processingPayment ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      `Pay ₹${totalPrice} using Wallet`
                    )}
                  </LoadingButton>

                  {hasInsufficientBalance && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 text-sm text-center">
                        Insufficient wallet balance. Please choose Card / UPI or add funds to your wallet.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <StripeCheckoutForm
                  carId={car._id}
                  startDate={startDate}
                  endDate={endDate}
                  totalPrice={parseInt(totalPrice)}
                  customerEmail={session?.user?.email || user?.email || ''}
                  userId={session?.user?.id || user?.id || ''}
                  carOwnerId={car.ownerId}
                  dailyRate={car.expectedWage}
                  bookingId={bookingId}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;