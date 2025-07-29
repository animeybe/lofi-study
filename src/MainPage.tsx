import "./MainPage.scss";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import SettingsWindow from "./components/SettingsWindow/SettingsWindow";
import MusicPage from "./components/MusicPage/MusicPage";
import RadioPage from "./components/RadioPage/RadioPage";
import React, { useState, useRef, useEffect } from "react";
import * as jsmediatags from "jsmediatags";

export interface Track {
  name: string;
  path: string;
  artist: string;
  album: string;
  cover?: string;
  file: File;
}

export interface DirectoryInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  webkitdirectory?: string;
  directory?: string;
}

const MainPage: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [settingsWindowActive, setSettingsWindowActive] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasTracks, setHasTracks] = useState(false);
  const [activeTab, setActiveTab] = useState<"music" | "radio">("music");
  const [savedTime, setSavedTime] = useState(0);
  const [isAudioReady, setIsAudioReady] = useState(false);

  const trackProgressSliderRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const extractMetadata = (file: File): Promise<Track> => {
    return new Promise((resolve) => {
      new jsmediatags.Reader(file).read({
        onSuccess: (tag) => {
          const tags = tag.tags;

          const cover = tags.picture
            ? URL.createObjectURL(
                new Blob([new Uint8Array(tags.picture.data)], {
                  type: tags.picture.format,
                })
              )
            : undefined;

          resolve({
            name: tags.title || file.name.replace(/\.[^/.]+$/, ""),
            path: URL.createObjectURL(file),
            artist: tags.artist || "Неизвестный исполнитель",
            album: tags.album || "Без альбома",
            cover,
            file,
          });
        },
        onError: (error) => {
          console.error("Ошибка чтения тегов:", error);
          resolve({
            name: file.name.replace(/\.[^/.]+$/, ""),
            path: URL.createObjectURL(file),
            artist: "Неизвестный исполнитель",
            album: "Без альбома",
            file,
          });
        },
      });
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setHasTracks(!!files && files.length > 0);

    const audioFiles = Array.from(files).filter((file) =>
      file.type.startsWith("audio/")
    );

    const newTracks = await Promise.all(
      audioFiles.map((file) => extractMetadata(file))
    );

    setTracks(newTracks);
    if (newTracks.length > 0) {
      setCurrentTrack(newTracks[0]);
    }
  };

  const handleNext = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex((t) => t.path === currentTrack.path);
    const nextIndex = (currentIndex + 1) % tracks.length;

    // Сбрасываем сохранённое время при переключении трека
    setSavedTime(0);
    setCurrentTrack(tracks[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex((t) => t.path === currentTrack.path);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;

    // Сбрасываем сохранённое время при переключении трека
    setSavedTime(0);
    setCurrentTrack(tracks[prevIndex]);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    if (activeTab !== "music") {
      setActiveTab("music");
      setIsPlaying(true);
      return;
    }

    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newTime = parseFloat(e.target.value);
    setSavedTime(newTime);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Эффект для управления аудио
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentTrack) return;

    audio.src = currentTrack.path;
    audio.load();
    setIsAudioReady(false);

    const handleLoadedMetadata = () => {
      audio.currentTime = savedTime;
      setIsAudioReady(true);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = handleNext;
    const handleError = (e: Event) => {
      console.error("Audio error:", (e.target as HTMLAudioElement).error);
      setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [currentTrack, activeTab]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      // Всегда обновляем currentTime, независимо от activeTab
      setCurrentTime(audio.currentTime);

      // Если мы на вкладке музыки, также обновляем savedTime
      if (activeTab === "music") {
        setSavedTime(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleDurationChange = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("durationchange", handleDurationChange);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("durationchange", handleDurationChange);
    };
  }, [activeTab]);

  // Эффект для управления воспроизведением
  useEffect(() => {
    if (!isAudioReady || !audioRef.current || activeTab !== "music") return;

    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        console.error("Playback failed:", error);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, isAudioReady, activeTab]);

  // Эффект для очистки
  useEffect(() => {
    return () => {
      tracks.forEach((track) => {
        URL.revokeObjectURL(track.path);
        if (track.cover) URL.revokeObjectURL(track.cover);
      });
    };
  }, [tracks]);

  // Эффект для громкости
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Эффект для инициализации
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--general-c",
      localStorage.getItem("selectedColor") || "#e8a236"
    );
    document.documentElement.style.setProperty(
      "--general-bgc",
      localStorage.getItem("selectedBgcColor") || "#212121"
    );

    const savedVolume = localStorage.getItem("volume");
    if (savedVolume) {
      const volumeValue = parseFloat(savedVolume);
      if (!isNaN(volumeValue) && volumeValue >= 0 && volumeValue <= 1) {
        setVolume(volumeValue);
      }
    }
  }, []);

  return (
    <div className="wrapper">
      <Header
        setActive={setSettingsWindowActive}
        activeTab={activeTab}
        setActiveTab={(str: "music" | "radio"): void => {
          setSavedTime(currentTime);
          setActiveTab(str);
        }}
      />
      {settingsWindowActive && (
        <SettingsWindow
          setActive={setSettingsWindowActive}
          volume={volume}
          onVolumeChange={(volume: number): void => {
            setVolume(volume);
            localStorage.setItem("volume", volume.toString());
          }}
        />
      )}

      {activeTab === "music" ? (
        <MusicPage
          currentTrack={currentTrack}
          tracks={tracks}
          hasTracks={hasTracks}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          fileInputRef={fileInputRef}
          trackProgressSliderRef={trackProgressSliderRef}
          audioRef={audioRef}
          onPlayPause={handlePlayPause}
          onNext={handleNext}
          onPrevious={handlePrevious}
          handleFileChange={handleFileChange}
          handleSeek={handleSeek}
          setCurrentTrack={setCurrentTrack}
          setIsPlaying={setIsPlaying}
          setSavedTime={setSavedTime}
          isAudioReady={isAudioReady}
        />
      ) : (
        <RadioPage />
      )}

      <Footer />
    </div>
  );
};

export default MainPage;
