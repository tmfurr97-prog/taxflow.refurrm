import { useCallback, useRef, useState } from 'react';
import { Upload, Camera, FileText, Image, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

interface DocumentUploadZoneProps {
  onUpload: (files: File[]) => Promise<void>;
  isUploading?: boolean;
}

export default function DocumentUploadZone({ onUpload, isUploading = false }: DocumentUploadZoneProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const validateFile = (file: File): boolean => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({
        title: 'Unsupported file type',
        description: `${file.name} is not supported. Use PDF, JPEG, PNG, or WEBP.`,
        variant: 'destructive',
      });
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File too large',
        description: `${file.name} exceeds 20MB limit.`,
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const handleUpload = useCallback(
    async (files: File[]) => {
      const valid = files.filter(validateFile);
      if (valid.length > 0) {
        await onUpload(valid);
      }
    },
    [onUpload, toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleUpload(Array.from(e.dataTransfer.files));
    },
    [handleUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleUpload(Array.from(e.target.files));
        e.target.value = '';
      }
    },
    [handleUpload]
  );

  const handleCameraCapture = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleUpload(Array.from(e.target.files));
        setCameraActive(false);
        e.target.value = '';
      }
    },
    [handleUpload]
  );

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      toast({
        title: 'Camera access denied',
        description: 'Please enable camera permissions to take photos.',
        variant: 'destructive',
      });
    }
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
            handleUpload([file]);
            stopCamera();
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  if (cameraActive) {
    return (
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={capturePhoto}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Capture & Upload
                </>
              )}
            </Button>
            <Button
              onClick={stopCamera}
              variant="outline"
              className="flex-1"
              disabled={isUploading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main drag-drop area */}
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-emerald-400 bg-emerald-500/5'
            : 'border-gray-200 hover:border-emerald-600 hover:bg-white'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
            <p className="text-gray-500 text-sm">Processing your documents...</p>
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-900 font-medium mb-1">Drop files here or click to browse</p>
            <p className="text-gray-500 text-sm">PDF, JPEG, PNG, WEBP — up to 20MB each</p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp,.heic"
          onChange={handleFileInput}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {/* Quick action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={startCamera}
          variant="outline"
          className="w-full"
          disabled={isUploading}
        >
          <Camera className="w-4 h-4 mr-2" />
          Snap Photo
        </Button>
        <Button
          onClick={() => cameraInputRef.current?.click()}
          variant="outline"
          className="w-full"
          disabled={isUploading}
        >
          <Image className="w-4 h-4 mr-2" />
          Upload File
        </Button>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCameraCapture}
          className="hidden"
          disabled={isUploading}
        />
      </div>
    </div>
  );
}
