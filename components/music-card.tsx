"use client";

import { Play, Pause } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Music } from "@/types/music";
import Image from "next/image";

interface MusicCardProps {
  music: Music;
  isPlaying: boolean;
  isCurrentMusic: boolean;
  onPlay: () => void;
}

export function MusicCard({
  music,
  isPlaying,
  isCurrentMusic,
  onPlay,
}: MusicCardProps) {
  return (
    <Card className="group cursor-pointer overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg">
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={music.imageUrl || "/placeholder.svg"}
            alt={music.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <Button
            size="icon"
            variant="secondary"
            className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100"
            onClick={onPlay}
          >
            {isCurrentMusic && isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>
        </div>
        <div className="p-4">
          <h3 className="font-semibold truncate">{music.title}</h3>
          <p className="text-sm text-muted-foreground truncate">
            {music.artists.join(", ")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
