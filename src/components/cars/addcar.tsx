
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import InputField from '@/components/InputField';
import FileUpload from '@/components/FileUpload';
import { Car,CarFormData } from '@/types/authTypes';
import { OwnerAuthService } from '@/services/carOwner/authService';
import toast from 'react-hot-toast';
import { carSchema } from '@/lib/validation';
import LocationPicker from "@/components/maps/LocationPicker";
import { MapPin } from 'lucide-react';
import { transformGeoCoordinates } from '@/utils/transformGeoCoordinates';
import LoadingButton from '../common/LoadingButton';

interface AddNewCarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCarAdded?: (car: Car) => void; 
  onAddCar?: (carData: CarFormData) => Promise<void>;
}

const AddNewCarModal: React.FC<AddNewCarModalProps> = ({ isOpen, onClose, onCarAdded}) => {
  const [formData, setFormData] = useState<CarFormData>({
    carName: '',
    brand: '',
    year: '',
    fuelType: '',
    carType:'',
    rcBookNo: '',
    expectedWage: '',
    location: {
      address: '',
      landmark: '',
      coordinates: {
        lat: null,
        lng: null
      }
    },
    images: [],
    videos: [],
    rcBookProof:'',
    insuranceProof:''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [imagesUploaded, setImagesUploaded] = useState(false);
  const [videoUploaded, setVideoUploaded] = useState(false);
  
  // Fuel type options
  const fuelTypes = [
    "Petrol",
    "Diesel",
    "Electric",
    "Hybrid",
    
  ];
 
  const carTypes=[
    "Sedan",
    "SUV",
    "Hatchback",
    "VAN/MUV"
  ]
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: {
          lat,
          lng
        }
      }
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    

    if (name === 'address' || name === 'landmark') {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [name]: value
        }
      }));
    } else {
   
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
   const handleFileInsuranceUpload = async (uploadedUrl: string | string[]) => {
      if (typeof uploadedUrl === "string") {
        setFormData((prev) => ({ ...prev, insuranceProof: uploadedUrl }));
        toast.success("Insurance Proof uploaded successfully!");
      }
    };
     const handleFileRCUpload = async (uploadedUrl: string | string[]) => {
      if (typeof uploadedUrl === "string") {
        setFormData((prev) => ({ ...prev, rcBookProof: uploadedUrl }));
        toast.success("RC BOOK Proof uploaded successfully!");
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log(formData.location.coordinates.lat, formData.location.coordinates.lng)
    // Check if location coordinates are selected
    if (!formData.location.coordinates.lat || !formData.location.coordinates.lng) {
      toast.error("Please select a location for the car on the map");
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate the data
      const result = carSchema.safeParse(formData);
      if (!result.success) {
        const errorMessages = result.error.errors.map((err) => err.message).join(", ");
        toast.error(errorMessages);
        return;
      }

    const response = await OwnerAuthService.addCar(formData);
      console.log("Backend response:", response);

      if (response && response.car && onCarAdded) {
        const formattedCar = transformGeoCoordinates(response.car);
        console.log("Formatted car:", formattedCar);
        onCarAdded(formattedCar);
      }
  
      toast.success('Car added successfully!');
    
   
      setFormData({
        carName: '',
        brand: '',
        year: '',
        fuelType: '',
        carType:'',
        rcBookNo: '',
        expectedWage: '',
        location: {
          address: '',
          landmark: '',
          coordinates: {
            lat: null,
            lng: null
          }
        },
        images: [],
        videos: [],
        insuranceProof:'',
        rcBookProof:''
      });
      
  
      setImagesUploaded(false);
      setVideoUploaded(false);
      

      onClose();
    } catch (error) {
      console.error('Error adding new car:', error);
      toast.error('Failed to add new car. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen || !mounted) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-blue-100 rounded-xl shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Add New Car</h2>
          <LoadingButton
            type="button" 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold hover:bg-gray-100 h-8 w-8 rounded-full flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            ×
          </LoadingButton>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-lg shadow-sm">
 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <InputField label="Car Name" name="carName" type="text" onChange={handleChange} className="focus:ring-blue-500 focus:border-blue-500" placeholder="Enter car name (e.g., Toyota Corolla)"/>
              <InputField label="Manufacturing Year" name="year" type="number" onChange={handleChange} className="focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., 2019"/>
              

              <div className="mb-4">
                <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 mb-1">
                  Fuel Type
                </label>
                <select
                  id="fuelType"
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 "
                  
                >
                  <option value="" disabled>Select fuel type</option>
                  {fuelTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            

            <div className="mb-4">
                <label htmlFor="carType" className="block text-sm font-medium text-gray-700 mb-1">
                  Car Type
                </label>
                <select
                  id="carType"
                  name="carType"
                  value={formData.carType}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                  
                >
                  <option value="" disabled>Select car type</option>
                  {carTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <InputField label="Brand" name="brand" type="text" onChange={handleChange} className="focus:ring-blue-500 focus:border-blue-500" placeholder="Enter car brand (e.g., Honda, BMW)"/>
              <InputField label="RC Book No" name="rcBookNo" type="text" onChange={handleChange} className="focus:ring-blue-500 focus:border-blue-500" placeholder="Enter RC book number"/>
              <InputField label="Expected Wage Daily" name="expectedWage" type="number" onChange={handleChange} className="focus:ring-blue-500 focus:border-blue-500" placeholder="Enter daily rent (e.g., 1500)"/>
            </div>
          </div>


          <div className="mb-6 border-t border-gray-100 pt-6">
            <h3 className="text-lg font-semibold mb-4">Car Location</h3>
          
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pin Location on Map <span className="text-red-500">*</span>
              </label>
              <div className="h-72 w-full rounded-lg overflow-hidden border border-gray-300">
                {/* <LocationPicker onSelectLocation={handleLocationSelect} /> */}
                <LocationPicker
  onSelectLocation={(lat, lng, address, landmark) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: { lat, lng },
        address: address || "",
        

      },
    }));
  }}
/>

              </div>

              {formData.location.coordinates.lat && formData.location.coordinates.lng && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected coordinates: {formData.location.coordinates.lat.toFixed(6)}, {formData.location.coordinates.lng.toFixed(6)}
                </p>
              )}
              {formData.location.address && (
  <p className="text-sm text-gray-500">
    <MapPin className="w-4 h-4 text-gray-500 inline-block mr-1" /> {formData.location.address}
  </p>
)}
 {formData.location.landmark && (
  <p className="text-sm text-gray-500">
    <MapPin className="w-4 h-4 text-gray-500 inline-block mr-1" /> {formData.location.landmark}
  </p>
)}
 {formData.location.coordinates && (
 <InputField 
                label="Landmark" 
                name="landmark" 
                type="text" 
                onChange={handleChange} 
                value={formData.location.landmark}
                className="focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nearby landmark (e.g., opposite City Mall)"
              />
            )}
            </div>
          </div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 border-t border-gray-100 pt-6">
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">Car Images</label>
    

    {formData.images.length > 0 && (
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-green-800 text-sm font-medium">
            {formData.images.length} image(s) uploaded ({5 - formData.images.length} remaining)
          </span>
          <LoadingButton
            type="button"
            onClick={() => {
              setFormData(prev => ({ ...prev, images: [] }));
              toast.success('Images reset!');
            }}
            className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded"
          >
            Reset All
          </LoadingButton>
        </div>
        
        {/* Image previews grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {formData.images.map((imageUrl, index) => (
            <div key={index} className="relative group border rounded-lg overflow-hidden shadow-sm bg-gray-50">
              <img
                src={imageUrl}
                alt={`Car image ${index + 1}`}
                className="w-full h-24 object-cover"
              />
              
              {/* Individual image remove button */}
              <LoadingButton
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    images: prev.images.filter((_, i) => i !== index)
                  }));
                  toast.success('Image removed!');
                }}
                className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title={`Remove image ${index + 1}`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </LoadingButton>
              
              {/* Image number indicator */}
              <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
    

    {formData.images.length < 5 && (
      <FileUpload 
        accept="image/*"
        multiple={true}
        maxFiles={5 - formData.images.length} 
        onUploadComplete={(uploadedUrls) => {
          if (Array.isArray(uploadedUrls) && uploadedUrls.length > 0) {
            setFormData(prev => ({ 
              ...prev, 
              images: [...prev.images, ...uploadedUrls] 
            }));
            toast.success(`${uploadedUrls.length} image(s) uploaded successfully!`);
          }
        }}
      />
    )}
    

    {formData.images.length >= 5 && (
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-sm">
        Maximum images uploaded (5/5). Use Reset All to start over.
      </div>
    )}
  </div>

  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">Car Video</label>
    {formData.videos.length > 0 ? (
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-green-800 text-sm font-medium">Video uploaded successfully!</span>
          <LoadingButton
            type="button"
            onClick={() => {
              setFormData(prev => ({ ...prev, videos: [] }));
              toast.success('Video reset!');
            }}
            className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded"
          >
            Reset
          </LoadingButton>
        </div>
        

        <div className="border rounded-lg overflow-hidden shadow-sm bg-gray-50">
          <video
            src={formData.videos[0]}
            controls
            className="w-full h-48 object-cover"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    ) : (
      <FileUpload 
        accept="video/*"
        multiple={false}
        maxFiles={1}
        onUploadComplete={(uploadedUrl) => {
          if (typeof uploadedUrl === 'string') {
            setFormData(prev => ({ ...prev, videos: [uploadedUrl] }));
            toast.success('Video uploaded successfully!');
          }
        }}
      />
    )}
  </div>
</div>
           <div>
                    <label className="block text-gray-700">Upload Insurance Proof *</label>
                    <FileUpload accept="image/*,application/pdf" multiple={false} onUploadComplete={handleFileInsuranceUpload} />
                    {formData.insuranceProof && <p className="text-green-600 mt-1">File uploaded successfully.</p>}
                  </div>
          

            <div>
                    <label className="block text-gray-700">Upload RCBook  Proof *</label>
                    <FileUpload accept="image/*,application/pdf" multiple={false} onUploadComplete={handleFileRCUpload} />
                    {formData.rcBookProof && <p className="text-green-600 mt-1">File uploaded successfully.</p>}
                  </div>
          


          <div className="flex justify-end space-x-4 mt-8 pt-4 border-t border-gray-100">
            <LoadingButton
              type="button"
              onClick={onClose}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </LoadingButton>
            <LoadingButton
              type="submit"
              className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Car'}
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddNewCarModal;
