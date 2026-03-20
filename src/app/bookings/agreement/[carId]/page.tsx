
"use client"
import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/services/customer/authService';
import Stepper from '@/components/common/StepperBooking';
import toast from 'react-hot-toast';
import LoadingButton from '@/components/common/LoadingButton';
import { AgreeementCar } from '@/types/carTypes';

// interface Car {
//   _id: string;
//   carName: string;
//   brand: string;
//   expectedWage: string;
// }
const AgreementPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const carId = params?.carId as string;
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const totalPrice = searchParams.get('totalPrice');
 const bookingId = searchParams.get('bookingId');

  const [car, setCar] = useState< AgreeementCar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAgreed, setIsAgreed] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [currentStep, setCurrentStep] = useState(2);

  useEffect(() => {
    if (!carId) return;

    const fetchCarData = async () => {
      try {
        setLoading(true);
        const carData = await AuthService.findCarDetails(carId);
        setCar(carData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching car details:', err);
        setError('Failed to load car data. Please try again later.');
        setLoading(false);
      }
    };

    fetchCarData();
  }, [carId]);

const handleAgree = async () => {
  if (!bookingId) return; 
  try {
    setIsAgreed(true);
    await AuthService.updatePendingBooking(bookingId, { status: "agreementAccepted" });
    router.push(
      `/bookings/payment/${carId}?startDate=${startDate}&endDate=${endDate}&totalPrice=${totalPrice}&bookingId=${bookingId}`
    );
  } catch (err) {
    console.error("Failed to update booking:", err);
    toast.error("Could not save your agreement. Please try again.");
  }
};

  const handleDisagree = () => {
    setShowModal(false);
    router.push(`/bookings/dateselection/${carId}?startDate=${startDate}&endDate=${endDate}`);
  };

  if (loading) return <div className="flex justify-center items-center h-screen">
     <div className="flex items-center justify-center h-20">
      <div className="w-8 h-8 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
    </div>
  </div>;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;
  if (!car) return <div className="text-center p-8">Car not found</div>;

  const steps = ['Check Availability', 'Select Dates', 'Agreement', 'Payment'];
  return (
    <div className="bg-gradient-to-b from-blue-200 to-yellow-200 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 relative z-50">
        <Stepper steps={steps} currentStep={currentStep} />
        </div>
          <div className=  "flex items-center  justify-center" >
            <div className="bg-white rounded-xl p-8 max-w-xl w-full mx-4">
              <h2 className="text-2xl font-bold text-indigo-700 mb-6">Rental Agreement for {car.carName}</h2>
              <div className="max-h-96 overflow-y-auto mb-6 text-sm">
                <p className="text-gray-700">
                  Please read and agree to the following terms and conditions for renting the vehicle:
                  <br /><br />
                  1. The vehicle must be returned in the same condition as received, excluding normal wear and tear.
                  <br />
                  2. The renter is responsible for any damage to the vehicle during the rental period.
                  <br />
                  3. The vehicle must not be used for illegal activities or driven by unauthorized drivers.
                  <br />
                  4. The rental period is as specified above, and late returns may incur additional charges.
                  <br />
                  5. The renter agrees to pay the total price as displayed above.
                  <br /><br />
                  By proceeding, you confirm that you have read, understood, and agree to these terms.
                </p>
              </div>
              <div className="flex justify-between gap-4">
                <LoadingButton
                  onClick={handleDisagree}
                  className="py-2 px-6 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                >
                  Disagree
                </LoadingButton>
                <LoadingButton
                  onClick={handleAgree}
                  className="py-2 px-6 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  Agree & Continue
                </LoadingButton>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default AgreementPage;