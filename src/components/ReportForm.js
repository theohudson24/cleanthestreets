'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import ImageUploader from './ImageUploader';
import LoadingSpinner from './LoadingSpinner';

// Dynamically import Map component
const Map = dynamic(() => import('./Map'), {
  ssr: false,
});

const MAX_DESCRIPTION_LENGTH = 500;

export default function ReportForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    description: '',
    issueType: 'pothole',
    severity: 1,
    latitude: null,
    longitude: null,
    address: '',
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [locationStatus, setLocationStatus] = useState('pending');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]);
  const centerOnCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          // fall back silently
        }
      );
    }
  };

  const toggleMap = () => {
    const nextShow = !showMap;
    setShowMap(nextShow);
    if (!showMap && formData.latitude && formData.longitude) {
      setMapCenter([formData.latitude, formData.longitude]);
    } else if (!showMap && (!formData.latitude || !formData.longitude)) {
      centerOnCurrentLocation();
    }
  };

  // Get user's location
  const getLocation = () => {
    setLocationStatus('loading');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setFormData({
            ...formData,
            latitude: lat,
            longitude: lng,
          });
          setMapCenter([lat, lng]);
          setLocationStatus('success');
        },
        (error) => {
          setLocationStatus('error');
          setError('Unable to retrieve your location. Please select on map.');
        }
      );
    } else {
      setLocationStatus('error');
      setError('Geolocation is not supported by your browser.');
    }
  };

  // Handle map click
  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setFormData({
      ...formData,
      latitude: lat,
      longitude: lng,
    });
    setLocationStatus('success');
  };

  // Upload images to Cloudinary
  const uploadImages = async (files) => {
    const uploadPromises = files.map(async (file, index) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'cleanthestreets');

      setUploadProgress(prev => ({ ...prev, [index]: 0 }));

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your-cloud-name'}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`Image ${index + 1} upload failed`);
        }

        const data = await response.json();
        setUploadProgress(prev => ({ ...prev, [index]: 100 }));
        return data.secure_url;
      } catch (error) {
        setUploadProgress(prev => ({ ...prev, [index]: -1 }));
        throw error;
      }
    });

    return Promise.all(uploadPromises);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.latitude || !formData.longitude) {
      setError('Please capture or select your location.');
      return;
    }

    if (!formData.description.trim()) {
      setError('Please provide a description.');
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrls = [];
      if (imageFiles.length > 0) {
        imageUrls = await uploadImages(imageFiles);
      }

      const reportData = {
        ...formData,
        imageUrls: imageUrls.length > 0 ? imageUrls : null,
        imageUrl: imageUrls[0] || null, // For backward compatibility
        status: 'reported',
        createdAt: new Date().toISOString(),
      };

      // Submit to backend API
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit report');
      }

      const result = await response.json();
      
      // Redirect to success page
      router.push(`/report/success?id=${result.id}`);
    } catch (err) {
      setError(err.message || 'An error occurred while submitting your report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const descriptionLength = formData.description.length;
  const remainingChars = MAX_DESCRIPTION_LENGTH - descriptionLength;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Report an Issue</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Location Pick Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  if (locationStatus === 'success') {
                    setFormData({
                      ...formData,
                      latitude: null,
                      longitude: null,
                    });
                    setLocationStatus('pending');
                  } else {
                    getLocation();
                  }
                }}
                disabled={locationStatus === 'loading'}
                className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {locationStatus === 'loading' ? (
                  <span className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Getting Location...
                  </span>
                ) : locationStatus === 'success' ? (
                  'Location Captured ✓'
                ) : (
                  'Use My Location'
                )}
              </button>
              
              <button
                type="button"
                onClick={toggleMap}
                className={`px-4 py-2 rounded-md shadow-sm font-semibold transition-colors ${
                  showMap
                    ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-[0_10px_25px_rgba(239,68,68,0.4)] hover:brightness-110'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {showMap ? 'Hide Map' : 'Choose on Map'}
              </button>
            </div>

            {showMap && (
              <div className="h-64 border border-gray-300 rounded-md overflow-hidden">
                <Map
                  key={`${formData.latitude ?? 'lat'}-${formData.longitude ?? 'lng'}-${showMap}`}
                  reports={[]}
                  center={mapCenter}
                  onMapClick={handleMapClick}
                />
                <p className="text-sm text-gray-600 mt-2">Click on the map to select location</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address (Optional)
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter address..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    value={formData.latitude?.toFixed(6) || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    value={formData.longitude?.toFixed(6) || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Details</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="issueType" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="issueType"
                value={formData.issueType}
                onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="pothole">Pothole</option>
                <option value="damaged_road">Damaged Road</option>
                <option value="debris">Debris</option>
                <option value="signage">Signage</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity (1-5) *
              </label>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4, 5].map((value) => {
                  const isActive = formData.severity >= value;
                  const colors = [
                    'from-emerald-500 to-lime-400 border-emerald-200',
                    'from-lime-500 to-amber-400 border-lime-200',
                    'from-amber-500 to-orange-400 border-amber-200',
                    'from-orange-500 to-red-400 border-orange-200',
                    'from-red-500 to-rose-500 border-red-200',
                  ];
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData({ ...formData, severity: value })}
                      className={`h-10 w-10 rounded-lg border transition-all ${
                        isActive
                          ? `bg-gradient-to-br ${colors[value - 1]} shadow-lg shadow-black/30 text-white`
                          : 'bg-gray-200/40 border-gray-400/20 text-gray-500'
                      }`}
                      aria-label={`Set severity ${value}`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description * ({remainingChars} characters remaining)
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) {
                    setFormData({ ...formData, description: e.target.value });
                  }
                }}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the issue..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {descriptionLength} / {MAX_DESCRIPTION_LENGTH} characters
              </p>
            </div>
          </div>
        </div>

        {/* Photos Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Photos (Optional)</h2>
          <ImageUploader
            images={imageFiles}
            onImagesChange={setImageFiles}
            maxImages={5}
            maxSizeMB={5}
          />
        </div>

        {/* Submit Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
          <div className="bg-gray-50 rounded-md p-4 mb-4">
            <div className="space-y-2 text-sm">
              <div><span className="font-semibold">Category:</span> {formData.issueType.replace('_', ' ')}</div>
              <div><span className="font-semibold">Severity:</span> {formData.severity}/5</div>
              <div><span className="font-semibold">Location:</span> {formData.latitude ? `${formData.latitude.toFixed(4)}, ${formData.longitude.toFixed(4)}` : 'Not set'}</div>
              <div><span className="font-semibold">Photos:</span> {imageFiles.length}</div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !formData.latitude || !formData.longitude || !formData.description.trim()}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <LoadingSpinner size="sm" className="mr-2" />
                Submitting...
              </span>
            ) : (
              'Submit Report'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
