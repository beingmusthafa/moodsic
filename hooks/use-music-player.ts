"use client";

import { useState, useRef, useEffect } from "react";
import type { Music } from "@/types/music";

export function useMusicPlayer() {
  const [currentMusic, setCurrentMusic] = useState<Music | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState<Music[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (currentMusic && audioRef.current) {
      audioRef.current.src = currentMusic.audioUrl;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentMusic]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      playNext();
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentMusic]);

  const playMusic = (music: Music, musicList: Music[] = []) => {
    setCurrentMusic(music);
    setPlaylist(musicList);
    const index = musicList.findIndex((m) => m._id === music._id);
    setCurrentIndex(index >= 0 ? index : 0);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentMusic) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    if (playlist.length === 0 || currentIndex >= playlist.length - 1) return;
    const nextMusic = playlist[currentIndex + 1];
    setCurrentMusic(nextMusic);
    setCurrentIndex(currentIndex + 1);
    setIsPlaying(true);
  };

  const playPrevious = () => {
    if (playlist.length === 0 || currentIndex <= 0) return;
    const prevMusic = playlist[currentIndex - 1];
    setCurrentMusic(prevMusic);
    setCurrentIndex(currentIndex - 1);
    setIsPlaying(true);
  };

  const canPlayNext = playlist.length > 0 && currentIndex < playlist.length - 1;
  const canPlayPrevious = playlist.length > 0 && currentIndex > 0;

  return {
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
  };
}
