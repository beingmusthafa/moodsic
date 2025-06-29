"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { MusicCard } from "@/components/music-card";
import { MusicPlayer } from "@/components/music-player";
import { MoodButton } from "@/components/mood-button";
import { useMusicPlayer } from "@/hooks/use-music-player";
import { useAuthStore } from "@/store/auth-store";
import type { Music, MusicByMood } from "@/types/music";
import axiosInstance from "@/lib/api";

export default function HomePage() {
  const [musicData, setMusicData] = useState<MusicByMood>({});
  const [allMusic, setAllMusic] = useState<Music[]>([]);
  const [loading, setLoading] = useState(true);
  const { initializeAuth } = useAuthStore();

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
    fetchMusic();
  }, []);

  const fetchMusic = async () => {
    try {
      const { data } = await axiosInstance.get("/public/musics");
      setMusicData(data.data);

      // Flatten all music into a single array
      const flattenedMusic = Object.values(data.data).flat();
      setAllMusic(flattenedMusic as any);
    } catch (error) {
      console.error("Error fetching music:", error);
      setMusicData({});
      setAllMusic([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayMusic = (music: Music) => {
    if (currentMusic?._id === music._id) {
      togglePlay();
    } else {
      playMusic(music, allMusic);
    }
  };

  const handleMoodDetected = (moodMusic: Music[]) => {
    if (moodMusic.length > 0) {
      playMusic(moodMusic[0], moodMusic);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
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
      <Header />

      <main className="container px-4 py-8">
        <div className="space-y-8">
          {Object.entries(musicData).map(([mood, musicList]) => (
            <section key={mood} className="space-y-4">
              <h2 className="text-2xl font-bold capitalize">{mood} Music</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {musicList.map((music) => (
                  <MusicCard
                    key={music._id}
                    music={music}
                    isPlaying={isPlaying}
                    isCurrentMusic={currentMusic?._id === music._id}
                    onPlay={() => handlePlayMusic(music)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
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

      <MoodButton onMusicDetected={handleMoodDetected} />
    </div>
  );
}
