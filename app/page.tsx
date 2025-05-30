"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { MusicCard } from "@/components/music-card";
import { MusicPlayer } from "@/components/music-player";
import { MoodButton } from "@/components/mood-button";
import { useMusicPlayer } from "@/hooks/use-music-player";
import api from "@/lib/api";
import type { Music, MusicByMood } from "@/types/music";

export default function HomePage() {
  const [musicData, setMusicData] = useState<MusicByMood>({});
  const [allMusic, setAllMusic] = useState<Music[]>([]);
  const [loading, setLoading] = useState(true);

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
    fetchMusic();
  }, []);

  const fetchMusic = async () => {
    try {
      const response = await api.get("/music/");
      setMusicData(response.data);

      // Flatten all music into a single array
      const flattenedMusic = Object.values(response.data).flat();
      setAllMusic(flattenedMusic as any);
    } catch (error) {
      console.error("Error fetching music:", error);
      // Mock data for development
      const mockData: MusicByMood = {
        happy: [
          {
            id: "1",
            title: "Sunshine Vibes",
            audioUrl: "/placeholder.svg?height=400&width=400",
            imageUrl: "/placeholder.svg?height=400&width=400",
            artists: ["Happy Artist", "Sunshine Band"],
          },
          {
            id: "2",
            title: "Good Times",
            audioUrl: "/placeholder.svg?height=400&width=400",
            imageUrl: "/placeholder.svg?height=400&width=400",
            artists: ["Feel Good Inc"],
          },
        ],
        sad: [
          {
            id: "3",
            title: "Melancholy Blues",
            audioUrl: "/placeholder.svg?height=400&width=400",
            imageUrl: "/placeholder.svg?height=400&width=400",
            artists: ["Blue Artist"],
          },
        ],
        energetic: [
          {
            id: "4",
            title: "Power Up",
            audioUrl: "/placeholder.svg?height=400&width=400",
            imageUrl: "/placeholder.svg?height=400&width=400",
            artists: ["Energy Band", "Power Duo"],
          },
        ],
      };
      setMusicData(mockData);
      setAllMusic(Object.values(mockData).flat());
    } finally {
      setLoading(false);
    }
  };

  const handlePlayMusic = (music: Music) => {
    if (currentMusic?.id === music.id) {
      togglePlay();
    } else {
      playMusic(music, allMusic);
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
                    key={music.id}
                    music={music}
                    isPlaying={isPlaying}
                    isCurrentMusic={currentMusic?.id === music.id}
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
        audioRef={audioRef}
      />

      <MoodButton />
    </div>
  );
}
