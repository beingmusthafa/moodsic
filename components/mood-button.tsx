"use client";

import { useState } from "react";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoodDetectionModal } from "@/components/music-detection-modal";
import { useAuthStore } from "@/store/auth-store";
import type { Music } from "@/types/music";

interface MoodButtonProps {
  onMusicDetected: (music: Music[]) => void;
}

export function MoodButton({ onMusicDetected }: MoodButtonProps) {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const { user } = useAuthStore();

  const handleMoodClick = () => {
    if (user) {
      setShowMoodModal(true);
    } else {
      setShowLoginDialog(true);
    }
  };

  return (
    <>
      <Button
        size="lg"
        onClick={handleMoodClick}
        className=" bg-white text-black fixed right-6 top-1/2 transform -translate-y-1/2 z-40 h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      >
        <Smile className="size-8" />
        <span className="sr-only">Detect mood</span>
      </Button>

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
            <DialogDescription>
              Please login to use this feature. You&apos;ll be able to take a
              photo and get music recommendations based on your mood.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowLoginDialog(false)}>Got it</Button>
          </div>
        </DialogContent>
      </Dialog>

      <MoodDetectionModal
        open={showMoodModal}
        onOpenChange={setShowMoodModal}
        onMusicDetected={onMusicDetected}
      />
    </>
  );
}
