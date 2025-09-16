import React, { useState, useRef, useCallback } from 'react';
import { Icon } from '@iconify/react';

interface SinglePhotoUploadProps {
  photo: File | null;
  onPhotoChange: (photo: File | null) => void;
  disabled?: boolean;
}

const SinglePhotoUpload: React.FC<SinglePhotoUploadProps> = ({ 
  photo, 
  onPhotoChange, 
  disabled = false 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  React.useEffect(() => {
    if (photo) {
      const url = URL.createObjectURL(photo);
      setPreviewUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [photo]);

  // Cleanup camera stream when component unmounts or camera mode changes
  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleFileSelect = (file: File | null) => {
    if (!file || disabled) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      alert('File tidak didukung. Hanya JPG, PNG, dan WebP yang diperbolehkan.');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      alert('File terlalu besar. Maksimal 5MB per foto.');
      return;
    }

    onPhotoChange(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removePhoto = () => {
    onPhotoChange(null);
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Kamera tidak didukung di browser ini');
      return;
    }

    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setStream(mediaStream);
      setCameraMode(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraMode(false);
    setCameraError(null);
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0);

    // Convert canvas to blob and create file
    canvas.toBlob((blob) => {
      if (blob) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const file = new File([blob], `photo-${timestamp}.jpg`, { type: 'image/jpeg' });
        handleFileSelect(file);
        stopCamera();
      }
    }, 'image/jpeg', 0.8);
  }, []);

  const switchCamera = async () => {
    if (!stream) return;

    try {
      // Stop current stream
      stream.getTracks().forEach(track => track.stop());

      // Get current facing mode
      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      const currentFacingMode = settings.facingMode;

      // Switch to opposite camera
      const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: newFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (error) {
      console.error('Error switching camera:', error);
      // If switching fails, just restart with default camera
      startCamera();
    }
  };

  if (cameraMode) {
    return (
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Foto Cucian (Opsional)
        </label>
        
        <div className="bg-black rounded-lg overflow-hidden">
          <div className="relative aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Camera overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Crosshair/focus indicator */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-12 h-12 border-2 border-white opacity-50">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white"></div>
                </div>
              </div>
            </div>

            {/* Camera controls */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4 px-4">
              <button
                type="button"
                onClick={stopCamera}
                className="w-12 h-12 bg-gray-800 bg-opacity-75 text-white rounded-full flex items-center justify-center hover:bg-opacity-90 transition-all"
              >
                <Icon icon="mdi:close" width={24} />
              </button>
              
              <button
                type="button"
                onClick={capturePhoto}
                disabled={disabled}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 shadow-lg"
              >
                <div className="w-12 h-12 bg-white border-4 border-gray-300 rounded-full"></div>
              </button>
              
              <button
                type="button"
                onClick={switchCamera}
                className="w-12 h-12 bg-gray-800 bg-opacity-75 text-white rounded-full flex items-center justify-center hover:bg-opacity-90 transition-all"
              >
                <Icon icon="mdi:camera-flip" width={24} />
              </button>
            </div>
          </div>
        </div>

        {cameraError && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
            <Icon icon="mdi:alert-circle" width={16} className="inline mr-1" />
            {cameraError}
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Foto Cucian (Opsional)
      </label>
      
      {!photo ? (
        // Upload Area
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <Icon icon="mdi:cloud-upload" width={48} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            Seret foto ke sini atau klik untuk memilih
          </p>
          <p className="text-xs text-gray-500 mb-4">
            JPG, PNG, WebP • Maksimal 5MB
          </p>
          
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                !disabled && fileInputRef.current?.click();
              }}
              disabled={disabled}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
            >
              <Icon icon="mdi:folder" width={16} className="inline mr-1" />
              Pilih File
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                !disabled && startCamera();
              }}
              disabled={disabled}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
            >
              <Icon icon="mdi:camera" width={16} className="inline mr-1" />
              Kamera
            </button>
          </div>
        </div>
      ) : (
        // Photo Preview
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Foto yang dipilih
          </p>
          <div className="relative group max-w-sm">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={previewUrl || ''}
                alt="Preview foto cucian"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={removePhoto}
              disabled={disabled}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
            >
              <Icon icon="mdi:close" width={14} />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex justify-between items-center">
                <span className="truncate">{photo.name}</span>
                <span>{(photo.size / 1024 / 1024).toFixed(1)} MB</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              <Icon icon="mdi:swap-horizontal" width={16} className="inline mr-1" />
              Ganti foto
            </button>
            <button
              type="button"
              onClick={startCamera}
              disabled={disabled}
              className="text-sm text-green-600 hover:text-green-700 disabled:opacity-50"
            >
              <Icon icon="mdi:camera" width={16} className="inline mr-1" />
              Ambil foto baru
            </button>
          </div>
        </div>
      )}

      {cameraError && !cameraMode && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
          <Icon icon="mdi:alert-circle" width={16} className="inline mr-1" />
          {cameraError}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};

export default SinglePhotoUpload;