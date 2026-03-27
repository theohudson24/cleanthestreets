'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { apiFetch } from '@/lib/client/csrf';
import ImageUploader from './ImageUploader';
import LoadingSpinner from './LoadingSpinner';

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
  const [mapCenter, setMapCenter] = useState([40.7128, -74.006]);

  const centerOnCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude]);
        },
        () => {}
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

  const getLocation = () => {
    setLocationStatus('loading');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setFormData((current) => ({
            ...current,
            latitude: lat,
            longitude: lng,
          }));
          setMapCenter([lat, lng]);
          setLocationStatus('success');
        },
        () => {
          setLocationStatus('error');
          setError('Unable to retrieve your location. Please select on map.');
        }
      );
    } else {
      setLocationStatus('error');
      setError('Geolocation is not supported by your browser.');
    }
  };

  const handleMapClick = (event) => {
    const { lat, lng } = event.latlng;
    setFormData((current) => ({
      ...current,
      latitude: lat,
      longitude: lng,
    }));
    setLocationStatus('success');
  };

  const uploadImages = async (files) => {
    if (files.length === 0) return [];

    const signatureResponse = await apiFetch('/api/uploads/signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const signatureData = await signatureResponse.json();
    if (!signatureResponse.ok) {
      throw new Error(
        signatureData.error || 'Image uploads are not configured for this environment.'
      );
    }

    const {
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder,
      allowedFormats,
      maxFileBytes,
      uploadTag,
    } = signatureData;

    return Promise.all(
      files.map(async (file, index) => {
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        if (!allowedFormats.includes(extension)) {
          throw new Error(`Image ${index + 1} must be a JPG, PNG, or WebP file`);
        }

        if (file.size > maxFileBytes) {
          throw new Error(`Image ${index + 1} exceeds the 5MB upload limit`);
        }

        const payload = new FormData();
        payload.append('file', file);
        payload.append('api_key', apiKey);
        payload.append('timestamp', String(timestamp));
        payload.append('signature', signature);
        payload.append('folder', folder);
        payload.append('allowed_formats', allowedFormats.join(','));
        payload.append('max_file_size', String(maxFileBytes));
        payload.append('resource_type', 'image');
        payload.append('tags', uploadTag);

        setUploadProgress((current) => ({ ...current, [index]: 0 }));

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: payload,
          }
        );

        const data = await response.json();
        if (!response.ok) {
          setUploadProgress((current) => ({ ...current, [index]: -1 }));
          throw new Error(data.error?.message || `Image ${index + 1} upload failed`);
        }

        setUploadProgress((current) => ({ ...current, [index]: 100 }));
        return {
          url: data.secure_url,
          publicId: data.public_id,
          width: data.width,
          height: data.height,
          format: data.format,
          bytes: data.bytes,
        };
      })
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

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
      const images = imageFiles.length > 0 ? await uploadImages(imageFiles) : [];

      const response = await apiFetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images,
        }),
      });

      const result = await response.json();
      if (response.status === 401) {
        router.push('/signin?redirect=/report');
        return;
      }

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit report');
      }

      router.push(`/report/success?id=${result.id}`);
    } catch (submitError) {
      setError(submitError.message || 'An error occurred while submitting your report.');
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
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  if (locationStatus === 'success') {
                    setFormData((current) => ({
                      ...current,
                      latitude: null,
                      longitude: null,
                    }));
                    setLocationStatus('pending');
                  } else {
                    getLocation();
                  }
                }}
                disabled={locationStatus === 'loading'}
                className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50"
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
                    ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white'
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
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, address: event.target.value }))
                  }
                  placeholder="Enter address..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
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
                onChange={(event) =>
                  setFormData((current) => ({ ...current, issueType: event.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
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
              <input
                type="range"
                min="1"
                max="5"
                value={formData.severity}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    severity: Number(event.target.value),
                  }))
                }
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">Current severity: {formData.severity}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    description: event.target.value.slice(0, MAX_DESCRIPTION_LENGTH),
                  }))
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="Describe the issue..."
              />
              <div className="text-xs text-gray-500 mt-1">{remainingChars} characters remaining</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Photos</h2>
          <ImageUploader
            images={[]}
            onImagesChange={setImageFiles}
            maxImages={5}
            maxSizeMB={5}
          />
          {Object.keys(uploadProgress).length > 0 && (
            <div className="mt-4 space-y-1 text-sm text-gray-600">
              {Object.entries(uploadProgress).map(([index, progress]) => (
                <div key={index}>
                  Image {Number(index) + 1}:{' '}
                  {progress === -1 ? 'failed' : `${progress}%`}
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}
