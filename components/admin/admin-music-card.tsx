"use client";
import { Edit, Trash2, Play, Pause } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Music } from "@/types/music";
import Image from "next/image";

interface AdminMusicCardProps {
  music: Music;
  isPlaying: boolean;
  isCurrentMusic: boolean;
  onPlay: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function AdminMusicCard({
  music,
  isPlaying,
  isCurrentMusic,
  onPlay,
  onEdit,
  onDelete,
}: AdminMusicCardProps) {
  const moodColors = {
    happy: "bg-yellow-100 text-yellow-800 border-yellow-200",
    sad: "bg-blue-100 text-blue-800 border-blue-200",
    angry: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={music.imageUrl || "/placeholder.svg"}
            alt={music.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
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

        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold truncate">{music.title}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {music.artists.join(", ")}
            </p>
          </div>

          <div className="flex flex-wrap gap-1">
            <Badge
              variant="outline"
              className={`text-xs ${
                moodColors[music.mood as keyof typeof moodColors] ||
                "bg-gray-100 text-gray-800"
              }`}
            >
              {music.mood}
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onEdit}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Music</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete &quot;{music.title}&quot;?
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
