"use client";

import type React from "react";

import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { Music } from "@/types/music";
import Image from "next/image";

interface MusicPlayerProps {
  currentMusic: Music | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  canPlayNext: boolean;
  canPlayPrevious: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export function MusicPlayer({
  currentMusic,
  isPlaying,
  currentTime,
  duration,
  canPlayNext,
  canPlayPrevious,
  onTogglePlay,
  onNext,
  onPrevious,
  audioRef,
}: MusicPlayerProps) {
  if (!currentMusic) return null;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
    }
  };

  return (
    <>
      <audio ref={audioRef} />
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Music Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative h-12 w-12 overflow-hidden rounded-md">
                <Image
                  src={currentMusic.imageUrl || "/placeholder.svg"}
                  alt={currentMusic.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{currentMusic.title}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {currentMusic.artists.join(", ")}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={onPrevious}
                disabled={!canPlayPrevious}
                className="h-8 w-8"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button size="icon" onClick={onTogglePlay} className="h-10 w-10">
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={onNext}
                disabled={!canPlayNext}
                className="h-8 w-8"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress */}
            <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
              <span className="text-xs text-muted-foreground w-10">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
