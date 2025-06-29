"use client";

import type React from "react";

import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, Upload, Loader2, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import type { Music } from "@/types/music";
import { authApi } from "@/api/auth-api";

interface MoodDetectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMusicDetected: (music: Music[]) => void;
}

type ModalStep = "selection" | "camera" | "preview" | "uploading";

export function MoodDetectionModal({
  open,
  onOpenChange,
  onMusicDetected,
}: MoodDetectionModalProps) {
  const [step, setStep] = useState<ModalStep>("selection");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cleanup camera stream when modal closes
  useEffect(() => {
    if (!open) {
      stopCamera();
      resetModal();
    }
  }, [open]);

  // Handle video stream setup
  useEffect(() => {
    if (stream && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = stream;

      const handleLoadedMetadata = () => {
        setCameraReady(true);
        video.play().catch(console.error);
      };

      const handleCanPlay = () => {
        setCameraReady(true);
      };

      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("canplay", handleCanPlay);

      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("canplay", handleCanPlay);
      };
    }
  }, [stream]);

  const startCamera = async () => {
    try {
      setError(null);
      setCameraReady(false);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 },
          facingMode: "user",
        },
        audio: false,
      });

      setStream(mediaStream);
      setStep("camera");
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      if (err.name === "NotAllowedError") {
        setError(
          "Camera access denied. Please allow camera permissions and try again."
        );
      } else if (err.name === "NotFoundError") {
        setError("No camera found. Please use the upload option instead.");
      } else if (err.name === "NotReadableError") {
        setError("Camera is already in use by another application.");
      } else {
        setError(
          "Failed to access camera. Please try uploading an image instead."
        );
      }
      toast("Camera access failed");
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      setStream(null);
      setCameraReady(false);
    }
  }, [stream]);

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || !cameraReady) return;

    setIsCapturing(true);

    // Add a small delay for the capture animation
    setTimeout(() => {
      const video = videoRef.current!;
      const canvas = canvasRef.current!;
      const context = canvas.getContext("2d");

      if (!context) {
        setIsCapturing(false);
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], "captured-photo.jpg", {
              type: "image/jpeg",
            });
            setSelectedFile(file);
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
            stopCamera();
            setStep("preview");
          }
          setIsCapturing(false);
        },
        "image/jpeg",
        0.9
      );
    }, 200);
  };

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setStep("preview");
    } else {
      toast("Please select a valid image file");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
    return interval;
  };

  const handleAnalyzeMood = async () => {
    if (!selectedFile) return;

    setStep("uploading");
    setIsUploading(true);
    const progressInterval = simulateProgress();

    try {
      const { musicList, mood } = await authApi.getMoodMusic(selectedFile);
      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        onMusicDetected(musicList);
        onOpenChange(false);
        resetModal();
        toast(
          mood === "not_found"
            ? "Sorry! Unable to analyse your mood"
            : `You are looking ${mood?.toUpperCase()}! Playing recommended music.`
        );
      }, 500);
    } catch (error: any) {
      clearInterval(progressInterval);
      toast(
        error.response?.data?.message ||
          "Failed to analyze mood. Please try again."
      );
      setStep("preview");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetModal = () => {
    setStep("selection");
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
    setCameraReady(false);
    setIsCapturing(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    if (!isUploading) {
      onOpenChange(false);
    }
  };

  const goBack = () => {
    if (step === "camera") {
      stopCamera();
      setStep("selection");
    } else if (step === "preview") {
      setStep("selection");
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  };

  const retakePhoto = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    startCamera();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Detect Your Mood
          </DialogTitle>
          <DialogDescription>
            {step === "selection" &&
              "Choose how you'd like to capture your photo for mood detection."}
            {step === "camera" &&
              "Position yourself in the camera and click capture when ready."}
            {step === "preview" && "Review your photo and analyze your mood."}
            {step === "uploading" && "Analyzing your mood..."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selection Step */}
          {step === "selection" && (
            <div className="space-y-4 animate-in fade-in-0 duration-300">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md animate-in slide-in-from-top-2 duration-300">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
                  onClick={startCamera}
                  disabled={!!error}
                >
                  <Camera className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                  <span className="text-sm">Take Photo</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                  <span className="text-sm">Upload Image</span>
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          )}

          {/* Camera Step */}
          {step === "camera" && (
            <div className="space-y-4 animate-in fade-in-0 slide-in-from-right-4 duration-500">
              <div className="relative bg-black rounded-lg overflow-hidden">
                {!cameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                    <div className="text-center text-white">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm">Starting camera...</p>
                    </div>
                  </div>
                )}

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-64 object-cover transition-opacity duration-500 ${
                    cameraReady ? "opacity-100" : "opacity-0"
                  }`}
                />

                {/* Capture flash effect */}
                {isCapturing && (
                  <div className="absolute inset-0 bg-white animate-pulse" />
                )}

                {/* Camera overlay */}
                <div className="absolute inset-0 border-2 border-white/20 rounded-lg pointer-events-none">
                  <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-white/60"></div>
                  <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-white/60"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-white/60"></div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-white/60"></div>
                </div>

                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={goBack}
                  className="flex-1 transition-all duration-200 hover:scale-105"
                  disabled={isCapturing}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={capturePhoto}
                  className="flex-1 transition-all duration-200 hover:scale-105 active:scale-95"
                  disabled={!cameraReady || isCapturing}
                >
                  {isCapturing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4 mr-2" />
                  )}
                  {isCapturing ? "Capturing..." : "Capture"}
                </Button>
              </div>
            </div>
          )}

          {/* Preview Step */}
          {step === "preview" && selectedFile && previewUrl && (
            <div className="space-y-4 animate-in fade-in-0 slide-in-from-left-4 duration-500">
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Captured photo"
                  className="w-full h-64 object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={goBack}
                  className="flex-1 transition-all duration-200 hover:scale-105"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={retakePhoto}
                  className="flex-1 transition-all duration-200 hover:scale-105"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake
                </Button>
                <Button
                  onClick={handleAnalyzeMood}
                  className="flex-1 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Analyze Mood
                </Button>
              </div>
            </div>
          )}

          {/* Uploading Step */}
          {step === "uploading" && (
            <div className="space-y-4 text-center animate-in fade-in-0 zoom-in-95 duration-500">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-primary/20 animate-pulse" />
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground animate-pulse">
                  Analyzing your mood...
                </p>
                <Progress
                  value={uploadProgress}
                  className="w-full transition-all duration-300"
                />
                <p className="text-xs text-muted-foreground">
                  {Math.round(uploadProgress)}% complete
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
