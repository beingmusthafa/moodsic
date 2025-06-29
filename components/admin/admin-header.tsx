"use client";

import { Music, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

interface AdminHeaderProps {
  onAddMusic: () => void;
  selectedMood: string;
  onMoodChange: (mood: string) => void;
  musicCount: number;
}

export function AdminHeader({
  onAddMusic,
  selectedMood,
  onMoodChange,
  musicCount,
}: AdminHeaderProps) {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 px-6">
      <div className="flex items-center justify-between mb-6">
        <Link
          href={"/"}
          title="Go back to homepage"
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Music className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Music Admin</h1>
            <p className="text-muted-foreground">Manage your music library</p>
          </div>
        </Link>
        <Button onClick={onAddMusic}>
          <Plus className="h-4 w-4 mr-2" />
          Add Music
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Filter by mood:</span>
            <Select value={selectedMood} onValueChange={onMoodChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All moods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All moods</SelectItem>
                <SelectItem value="happy">Happy</SelectItem>
                <SelectItem value="sad">Sad</SelectItem>
                <SelectItem value="angry">Angry</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {musicCount} {musicCount === 1 ? "song" : "songs"}
        </div>
      </div>
    </div>
  );
}
