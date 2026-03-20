'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Trash, MapPin } from 'lucide-react';

import InputField from '@/components/InputField';
import FileUpload from '@/components/FileUpload';
import LocationPicker from '@/components/maps/LocationPicker';
import toast from 'react-hot-toast';

import { Car, CarFormData } from '@/types/authTypes';
import LoadingButton from '../common/LoadingButton';

interface EditCarModalProps {
  isOpen: boolean;
  onClose: () => void;
  car: Car;
  onUpdateCar: (updatedCar: CarFormData) => void | Promise<void>;
}

const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
const carTypes = ['Sedan', 'SUV', 'Hatchback', 'VAN/MUV'];

export default function EditCarModal({
  isOpen,
  onClose,
  car,
  onUpdateCar,
}: EditCarModalProps) {
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState<CarFormData>({
    carName: car.carName || '',
    brand: car.brand || '',
    year: car.year || '',
    fuelType: car.fuelType || '',
    carType: car.carType || '',
    rcBookNo: car.rcBookNo || '',
    expectedWage: car.expectedWage || '',
    location:
      car.location || {
        address: '',
        landmark: '',
        coordinates: { lat: null, lng: null },
      },
    images: car.images || [],
    videos: car.videos || [],
    // available: car.available ?? true,
    rcBookProof: car.rcBookProof || '',
    insuranceProof: car.insuranceProof || '',
  });

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        carName: car.carName || '',
        brand: car.brand || '',
        year: car.year || '',
        fuelType: car.fuelType || '',
        carType: car.carType || '',
        rcBookNo: car.rcBookNo || '',
        expectedWage: car.expectedWage || '',
        location:
          car.location || {
            address: '',
            landmark: '',
            coordinates: { lat: null, lng: null },
          },
        images: car.images || [],
        videos: car.videos || [],
        // available: car.available ?? true,
        rcBookProof: car.rcBookProof || '',
        insuranceProof: car.insuranceProof || '',
      });
    }
  }, [car, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'address' || name === 'landmark') {
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [name]: value,
        },
      }));
      return;
    }

    // if (name === 'available') {
    //   setFormData((prev) => ({ ...prev, available: value === 'true' }));
    //   return;
    // }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== indexToRemove),
    }));
  };

  const handleRemoveVideo = () => {
    setFormData((prev) => ({ ...prev, videos: [] }));
  };


  const handleFileInsuranceUpload = (uploadedUrl: string | string[]) => {
    if (typeof uploadedUrl === 'string') {
      setFormData((prev) => ({ ...prev, insuranceProof: uploadedUrl }));
      toast.success('Insurance proof uploaded!');
    } else if (uploadedUrl[0]) {
      setFormData((prev) => ({ ...prev, insuranceProof: uploadedUrl[0] }));
      toast.success('Insurance proof uploaded!');
    }
  };

  const handleFileRCUpload = (uploadedUrl: string | string[]) => {
    if (typeof uploadedUrl === 'string') {
      setFormData((prev) => ({ ...prev, rcBookProof: uploadedUrl }));
      toast.success('RC book proof uploaded!');
    } else if (uploadedUrl[0]) {
      setFormData((prev) => ({ ...prev, rcBookProof: uploadedUrl[0] }));
      toast.success('RC book proof uploaded!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateCar(formData);
    toast.success('Car updated successfully!');
    onClose();
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        {/* header */}
        <div className="flex justify-between items-center mb-6 pb-3 border-b">
          <h2 className="text-2xl font-bold">Edit Car Details</h2>
          <LoadingButton
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 rounded-full p-1"
          >
            <X className="w-6 h-6" />
          </LoadingButton>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <InputField
                label="Car Name"
                name="carName"
                type="text"
                value={formData.carName}
                onChange={handleChange}
                className="focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter car name (e.g., Toyota Corolla)"
              />

              <InputField
                label="Manufacturing Year"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleChange}
                className="focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 2019"
              />

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuel Type
                </label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" disabled>
                    Select fuel type
                  </option>
                  {fuelTypes.map((ft) => (
                    <option key={ft} value={ft}>
                      {ft}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Car Type
                </label>
                <select
                  name="carType"
                  value={formData.carType}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" disabled>
                    Select car type
                  </option>
                  {carTypes.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <InputField
                label="Brand"
                name="brand"
                type="text"
                value={formData.brand}
                onChange={handleChange}
                className="focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter car brand (e.g., Honda, BMW)"
              />

              <InputField
                label="RC Book No"
                name="rcBookNo"
                type="text"
                value={formData.rcBookNo}
                onChange={handleChange}
                className="focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter RC book number"
              />

              <InputField
                label="Expected Wage Daily"
                name="expectedWage"
                type="number"
                value={formData.expectedWage}
                onChange={handleChange}
                className="focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter daily rent (e.g., 1500)"
              />

              {/* <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Availability
                </label>
                <select
                  name="available"
                  value={formData.available?.toString()}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="true">Available</option>
                  <option value="false">Not Available</option>
                </select>
              </div> */}
            </div>
          </div>

          
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Car Location</h3>

            <div className="h-72 w-full rounded-lg overflow-hidden border">
              <LocationPicker
                onSelectLocation={(lat, lng, address, landmark) => {
                  setFormData((prev) => ({
                    ...prev,
                    location: {
                      ...prev.location,
                      coordinates: { lat, lng },
                      address: address || prev.location.address,
                      landmark: landmark || prev.location.landmark,
                    },
                  }));
                }}
              />
            </div>

            {formData.location.coordinates?.lat != null &&
              formData.location.coordinates?.lng != null && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected coordinates:{' '}
                  {formData.location.coordinates.lat.toFixed(6)},{' '}
                  {formData.location.coordinates.lng.toFixed(6)}
                </p>
              )}

            {formData.location.address && (
              <p className="text-sm text-gray-500 mt-1">
                <MapPin className="w-4 h-4 inline-block mr-1" />
                {formData.location.address}
              </p>
            )}

            <InputField
              label="Landmark"
              name="landmark"
              type="text"
              value={formData.location.landmark}
              onChange={handleChange}
              className="focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nearby landmark (e.g., opposite City Mall)"
            />
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Car Images
              </label>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {formData.images.map((url, idx) => (
                    <div key={`${url}-${idx}`} className="relative group">
                      <img
                        src={url}
                        alt={`img-${idx + 1}`}
                        className="w-full h-32 object-cover rounded-md border"
                      />
                      <LoadingButton
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                        title="Remove image"
                      >
                        <Trash className="w-4 h-4" />
                      </LoadingButton>
                    </div>
                  ))}
                </div>
              )}

              <FileUpload
                accept="image/*"
                multiple
                maxFiles={Math.max(0, 5 - formData.images.length)}
                onUploadComplete={(uploaded) => {
                  const urls = Array.isArray(uploaded) ? uploaded : [uploaded];
                  const safe = urls.filter(Boolean) as string[];
                  if (!safe.length) return;
                  setFormData((prev) => ({
                    ...prev,
                    images: [...prev.images, ...safe].slice(0, 5),
                  }));
                  toast.success(`${safe.length} image(s) added!`);
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.images.length}/5 images
              </p>
            </div>

            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Car Video
              </label>

              {formData.videos.length > 0 ? (
                <div className="relative group mb-3">
                  <video
                    src={formData.videos[0]}
                    controls
                    className="w-full h-48 object-cover rounded-md border"
                  />
                  <LoadingButton
                    type="button"
                    onClick={handleRemoveVideo}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                  >
                    <Trash className="w-4 h-4" />
                  </LoadingButton>
                </div>
              ) : null}

              {formData.videos.length === 0 && (
                <FileUpload
                  accept="video/*"
                  multiple={false}
                  maxFiles={1}
                  onUploadComplete={(uploaded) => {
                    const url =
                      typeof uploaded === 'string' ? uploaded : uploaded?.[0];
                    if (!url) return;
                    setFormData((prev) => ({ ...prev, videos: [url] }));
                    toast.success('Video uploaded!');
                  }}
                />
              )}
            </div>
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Upload Insurance Proof *
              </label>
              <FileUpload
                accept="image/*,application/pdf"
                multiple={false}
                onUploadComplete={handleFileInsuranceUpload}
              />
              {formData.insuranceProof && (
                <div className="mt-2 text-sm">
                  {formData.insuranceProof.toLowerCase().endsWith('.pdf') ? (
                    <a
                      href={formData.insuranceProof}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      View uploaded PDF
                    </a>
                  ) : (
                    <img
                      src={formData.insuranceProof}
                      alt="Insurance Proof"
                      className="w-28 h-28 object-cover rounded border"
                    />
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Upload RC Book Proof *
              </label>
              <FileUpload
                accept="image/*,application/pdf"
                multiple={false}
                onUploadComplete={handleFileRCUpload}
              />
              {formData.rcBookProof && (
                <div className="mt-2 text-sm">
                  {formData.rcBookProof.toLowerCase().endsWith('.pdf') ? (
                    <a
                      href={formData.rcBookProof}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      View uploaded PDF
                    </a>
                  ) : (
                    <img
                      src={formData.rcBookProof}
                      alt="RC Book Proof"
                      className="w-28 h-28 object-cover rounded border"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          
          <div className="flex justify-end gap-3 border-t pt-6">
            <LoadingButton
              type="button"
              onClick={onClose}
              className="bg-gray-100 text-gray-800 px-5 py-2 rounded-md hover:bg-gray-200"
            >
              Cancel
            </LoadingButton>
            <LoadingButton
              type="submit"
              className="bg-black text-white px-5 py-2 rounded-md hover:bg-gray-800"
            >
              Update Car
            </LoadingButton>
          </div>
        </form>
      </motion.div>
    </motion.div>,
    document.body
  );
}
