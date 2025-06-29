"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminMusicCard } from "@/components/admin/admin-music-card";
import { MusicFormModal } from "@/components/admin/music-form-modal";
import { MusicPlayer } from "@/components/music-player";
import { useMusicPlayer } from "@/hooks/use-music-player";
import { useAuthStore } from "@/store/auth-store";
import type { Music } from "@/types/music";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import axiosInstance from "@/lib/api";
import { adminApi } from "@/api/admin-api";

export default function AdminPage() {
  const router = useRouter();
  const { user, initializeAuth } = useAuthStore();
  const [music, setMusic] = useState<Music[]>([]);
  const [filteredMusic, setFilteredMusic] = useState<Music[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState("all");
  const [showMusicForm, setShowMusicForm] = useState(false);
  const [editingMusic, setEditingMusic] = useState<Music | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const {
    currentMusic,
    isPlaying,
    currentTime,
    duration,
    audioRef,
    playMusic,
    togglePlay,
    playNext,
    playPrevious,
    canPlayNext,
    canPlayPrevious,
  } = useMusicPlayer();

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (user === null) {
      // Still loading
      return;
    }

    if (!user || user.role !== "admin") {
      router.push("/");
      return;
    }

    fetchMusic();
  }, [user, router]);

  useEffect(() => {
    if (selectedMood === "all") {
      setFilteredMusic(music);
    } else {
      setFilteredMusic(music.filter((m) => m.mood.includes(selectedMood)));
    }
  }, [music, selectedMood]);

  const fetchMusic = async () => {
    try {
      const { data } = await axiosInstance.get("/admin/musics");
      // Flatten all music into a single array
      const flattenedMusic = Object.values(data.data).flat();
      setMusic(flattenedMusic as any);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMusic = () => {
    setEditingMusic(null);
    setShowMusicForm(true);
  };

  const handleEditMusic = (music: Music) => {
    setEditingMusic(music);
    setShowMusicForm(true);
  };

  const handleDeleteMusic = async (musicId: string) => {
    try {
      await adminApi.deleteMusic(musicId);
      setMusic((prev) => prev.filter((m) => m._id !== musicId));
      toast("Music deleted successfully");
    } catch (error: any) {
      console.log(error);
      toast("Failed to delete music");
    }
  };

  const handleMusicSubmit = async (data: any) => {
    setFormLoading(true);
    try {
      if (editingMusic) {
        await adminApi.updateMusic(editingMusic._id, data);
        fetchMusic();
        toast("Music updated successfully");
      } else {
        await adminApi.createMusic(data);
        fetchMusic();
        toast("Music added successfully");
      }
    } catch (error: any) {
      toast(error.response?.data?.message || "Failed to save music");
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handlePlayMusic = (music: Music) => {
    if (currentMusic?._id === music._id) {
      togglePlay();
    } else {
      playMusic(music, filteredMusic);
    }
  };

  // Show loading while checking authentication
  if (user === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect if not admin (this should not show due to useEffect redirect)
  if (!user || user.role !== "admin") {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminHeader
          onAddMusic={handleAddMusic}
          selectedMood={selectedMood}
          onMoodChange={setSelectedMood}
          musicCount={0}
        />
        <div className="container px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-muted animate-pulse rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AdminHeader
        onAddMusic={handleAddMusic}
        selectedMood={selectedMood}
        onMoodChange={setSelectedMood}
        musicCount={filteredMusic.length}
      />

      <main className="container px-4 py-8">
        {filteredMusic.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              {selectedMood === "all"
                ? "No music found"
                : `No ${selectedMood} music found`}
            </div>
            {selectedMood !== "all" && (
              <button
                onClick={() => setSelectedMood("all")}
                className="text-primary hover:underline"
              >
                Show all music
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredMusic.map((musicItem) => (
              <AdminMusicCard
                key={musicItem._id}
                music={musicItem}
                isPlaying={isPlaying}
                isCurrentMusic={currentMusic?._id === musicItem._id}
                onPlay={() => handlePlayMusic(musicItem)}
                onEdit={() => handleEditMusic(musicItem)}
                onDelete={() => handleDeleteMusic(musicItem._id)}
              />
            ))}
          </div>
        )}
      </main>

      <MusicPlayer
        currentMusic={currentMusic}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        canPlayNext={canPlayNext}
        canPlayPrevious={canPlayPrevious}
        onTogglePlay={togglePlay}
        onNext={playNext}
        onPrevious={playPrevious}
        audioRef={audioRef as any}
      />

      <MusicFormModal
        open={showMusicForm}
        onOpenChange={setShowMusicForm}
        music={editingMusic}
        onSubmit={handleMusicSubmit}
        isLoading={formLoading}
      />
    </div>
  );
}
