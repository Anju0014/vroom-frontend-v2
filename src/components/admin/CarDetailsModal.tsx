
import React, { useState, useEffect } from "react";
import { X, Calendar, MapPin, Phone, Mail, User, DollarSign, Fuel, Hash, Camera } from "lucide-react";
import LoadingButton from "../common/LoadingButton";

interface CarDetailsModalProps {
  car: any;
  onClose: () => void;
  onToggleBlock: (car: any) => void;
  isProcessing?: boolean;
}

const CarDetailsModal: React.FC<CarDetailsModalProps> = ({ 
  car, 
  onClose, 
  onToggleBlock, 
  isProcessing = false 
}) => {
  const [updatedCar, setUpdatedCar] = useState(car);
 
  
  useEffect(() => {
    setUpdatedCar(car);
  }, [car]);

  const InfoRow = ({ icon: Icon, label, value, valueClass = "" }: any) => (
    <div className="flex items-start py-3 border-b border-blue-50 last:border-0 hover:bg-blue-25 transition-colors rounded px-2">
      <div className="flex items-center min-w-[140px] text-gray-600">
        <Icon size={16} className="mr-2 text-blue-500" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className={`text-sm font-semibold ${valueClass || 'text-gray-800'}`}>
        {value}
      </span>
    </div>
  );

  return (
  
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4
                bg-black/30 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-1">{updatedCar.carName}</h2>
            <p className="text-blue-100 text-sm">{updatedCar.brand} • {updatedCar.year}</p>
          </div>
          <LoadingButton
            onClick={onClose} 
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
          >
            <X size={24} />
          </LoadingButton>
        </div>


        <div className="overflow-y-auto flex-1">
          <div className="p-6">
     
            {updatedCar.images && updatedCar.images.length > 0 ? (
  <div className="mb-8">
    <div className="flex items-center mb-4">
      <Camera size={20} className="text-blue-600 mr-2" />
      <h3 className="text-xl font-bold text-gray-800">Gallery</h3>
    </div>


    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {updatedCar.images.map((image: string, index: number) => (
        <div
          key={index}
          className="relative aspect-video rounded-lg overflow-hidden shadow-md bg-gray-100"
        >
          <img
            src={image}
            alt={`${updatedCar.carName} image ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  </div>
) : (
  <div className="mb-8 p-8 bg-blue-50 rounded-xl text-center">
    <Camera size={48} className="text-blue-300 mx-auto mb-2" />
    <p className="text-gray-500">No images available</p>
  </div>
)}


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white border-2 border-blue-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-blue-700 mb-4 pb-3 border-b-2 border-blue-200">
                  Vehicle Details
                </h3>
                <div className="space-y-1">
                  <InfoRow icon={Hash} label="Brand" value={updatedCar.brand} />
                  <InfoRow icon={Calendar} label="Year" value={updatedCar.year} />
                  <InfoRow icon={Fuel} label="Fuel Type" value={updatedCar.fuelType} />
                  <InfoRow icon={Hash} label="RC Book No." value={updatedCar.rcBookNo} />
                  <InfoRow 
                    icon={DollarSign} 
                    label="Price/Day" 
                    value={`₹${updatedCar.expectedWage}`}
                    valueClass="text-blue-700"
                  />
                  <InfoRow 
                    icon={Calendar} 
                    label="Availability" 
                    value={updatedCar.available ? 'Available' : 'Not Available'}
                    valueClass={updatedCar.available ? 'text-green-600' : 'text-red-600'}
                  />
                  <InfoRow 
                    icon={Hash} 
                    label="Status" 
                    value={updatedCar.blockStatus === 1 ? 'Blocked' : 'Active'}
                    valueClass={updatedCar.blockStatus === 1 ? 'text-red-600' : 'text-green-600'}
                  />
                </div>
              </div>


              <div className="bg-white border-2 border-blue-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-blue-700 mb-4 pb-3 border-b-2 border-blue-200">
                  Owner Details
                </h3>
                <div className="space-y-1 mb-6">
                  <InfoRow icon={User} label="Name" value={updatedCar.owner?.fullName || 'N/A'} />
                  <InfoRow icon={Mail} label="Email" value={updatedCar.owner?.email || 'N/A'} />
                  <InfoRow icon={Phone} label="Phone" value={updatedCar.owner?.phoneNumber || 'N/A'} />
                  <InfoRow icon={MapPin} label="Location" value={updatedCar.location?.address || 'N/A'} />
                </div>

                <h3 className="text-xl font-bold text-blue-700 mb-4 pb-3 border-b-2 border-blue-200">
                  Listing Info
                </h3>
                <div className="space-y-1">
                  <InfoRow 
                    icon={Calendar} 
                    label="Listed On" 
                    value={new Intl.DateTimeFormat('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }).format(new Date(updatedCar.createdAt))}
                  />
                  <InfoRow 
                    icon={Hash} 
                    label="Verification" 
                    value="Verified"
                    valueClass="text-green-600"
                  />
                </div>
              </div>
            </div>


            {updatedCar.videos && updatedCar.videos.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-blue-700 mb-4">Videos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {updatedCar.videos.map((video: string, index: number) => (
                    <div key={index} className="aspect-video rounded-xl overflow-hidden shadow-md border-2 border-blue-100">
                      <video 
                        src={video} 
                        controls 
                        className="w-full h-full object-cover bg-gray-900"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}


            <LoadingButton
              onClick={() => onToggleBlock(updatedCar)}
              disabled={isProcessing}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg
                ${updatedCar.blockStatus === 0 
                  ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700" 
                  : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                updatedCar.blockStatus === 0 ? "🚫 Block Car" : "✓ Unblock Car"
              )}
            </LoadingButton>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <LoadingButton
            onClick={onClose}
            className="px-6 py-2.5 bg-white text-blue-600 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-all font-semibold"
          >
            Close
          </LoadingButton>
        </div>
      </div>
    </div>
  );
};

export default CarDetailsModal;