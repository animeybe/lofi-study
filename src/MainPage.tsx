import "./MainPage.scss";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import MusicControl from "./components/MusicControl/MusicControl";
import SettingsWindow from "./components/SettingsWindow/SettingsWindow";
import React, { useState, useRef, useEffect } from "react";
import * as jsmediatags from "jsmediatags";

interface Track {
  name: string;
  path: string;
  artist: string;
  album: string;
  cover?: string;
  file: File;
}

interface DirectoryInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  webkitdirectory?: string;
  directory?: string;
}

const trackTitleFormating = (title: string): string => {
  const badWordsList = [
    "[muzcha.net]",
    "[muzchanet]",
    "muzcha.net",
    "muzchanet",
  ];

  return badWordsList
    .reduce(
      (acc, word) =>
        acc.replace(
          new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"),
          ""
        ),
      title
    )
    .replace(/\[\s*\]/g, "")
    .trim()
    .replace(/\d{4,}/g, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const MainPage: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [settingsWindowActive, setSettingsWindowActive] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
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

    const audioFiles = Array.from(files).filter((file) =>
      file.type.startsWith("audio/")
    );

    // Параллельная загрузка метаданных
    const newTracks = await Promise.all(
      audioFiles.map((file) => extractMetadata(file))
    );

    setTracks(newTracks);
    if (newTracks.length > 0) {
      setCurrentTrack(newTracks[0]);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;

    // Если трек уже играет - ставим на паузу
    if (!audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    // Если трек на паузе - возобновляем
    else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((error) => {
          console.error("Ошибка воспроизведения:", error);
          setIsPlaying(false);
        });
    }
  };

  // Форматирование времени из секунд в MM:SS
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Обработчик изменения позиции трека
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    // 1. Установка источника и загрузка трека
    audio.src = currentTrack.path;
    audio.load();

    // 2. Обработчики событий
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      const currentIndex = tracks.findIndex(
        (t) => t.path === currentTrack.path
      );
      const nextIndex = (currentIndex + 1) % tracks.length;
      setCurrentTrack(tracks[nextIndex]);
      setIsPlaying(true);
    };
    const handleError = (e: Event) => {
      console.error("Audio error:", (e.target as HTMLAudioElement).error);
      setIsPlaying(false);
    };

    // 3. Подписка на события
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    // 4. Автовоспроизведение при isPlaying === true
    if (isPlaying) {
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Playback failed:", error);
          setIsPlaying(false);
        });
      }
    }

    // 5. Очистка эффекта
    return () => {
      audio.pause();
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.src = ""; // Очищаем источник
    };
  }, [currentTrack]);

  useEffect(() => {
    return () =>
      tracks.forEach((track) => {
        URL.revokeObjectURL(track.path);
        if (track.cover) URL.revokeObjectURL(track.cover);
      });
  }, [tracks]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--general-c",
      localStorage.getItem("selectedColor")
    );
    document.documentElement.style.setProperty(
      "--general-bgc",
      localStorage.getItem("selectedBgcColor")
    );
    // Установка громкости из localStorage
    const savedVolume = localStorage.getItem("volume");
    if (savedVolume) {
      const volumeValue = parseFloat(savedVolume);
      // Проверяем корректность значения (0-1)
      if (!isNaN(volumeValue) && volumeValue >= 0 && volumeValue <= 1) {
        setVolume(volumeValue);
        // Непосредственное применение к аудиоэлементу
        if (audioRef.current) {
          audioRef.current.volume = volumeValue;
        }
      }
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
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
  }, []);

  return (
    <div className="wrapper">
      <Header
        active={settingsWindowActive}
        setActive={setSettingsWindowActive}
      />
      {settingsWindowActive && (
        <SettingsWindow
          active={settingsWindowActive}
          setActive={setSettingsWindowActive}
          volume={volume}
          onVolumeChange={(volume: number): void => {
            setVolume(volume);
            localStorage.setItem("volume", volume.toString());
          }}
        />
      )}

      <main className="content">
        <div className="content-left">
          <div className="music-card">
            {currentTrack?.cover ? (
              <img
                src={currentTrack.cover}
                alt={currentTrack.name}
                className="music-card__cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            ) : (
              <div className="music-card__logo">
                <div className="music-card__logo-mask"></div>
              </div>
            )}
            {currentTrack && (
              <>
                <div className="music-card__title">
                  {trackTitleFormating(currentTrack.name)}
                </div>
                <div className="music-card__description">
                  {currentTrack.artist} • {currentTrack.album}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="content-right">
          <div className="track-queues">
            <div className="track-queues__title">Следующие треки:</div>
            <div className="track-queues_list">
              {tracks.length === 0 ? (
                <div
                  className="select-folder-btn"
                  onClick={() => fileInputRef.current?.click()}>
                  <span>Выбрать папку с треками</span>
                </div>
              ) : (
                <ul
                  className="track-list"
                  style={{
                    overflowY: tracks.length > 4 ? "scroll" : "hidden",
                    maxHeight: "23rem",
                  }}>
                  {tracks.map((track, index) => (
                    <li
                      key={index}
                      className={`track-item ${
                        currentTrack?.path === track.path ? "active" : ""
                      }`}
                      onClick={() => {
                        if (track === currentTrack) handlePlayPause();
                        else {
                          setCurrentTrack(track);
                          setIsPlaying(true);
                        }
                      }}>
                      <div className="track-item__name">
                        {track === currentTrack ? "● " : `${index + 1}. `}{" "}
                        {trackTitleFormating(track.name)}
                      </div>
                      <div className="track-item__artist">{track.artist}</div>
                    </li>
                  ))}
                </ul>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
                webkitdirectory=""
                directory=""
                multiple
                accept="audio/*"
                {...({} as DirectoryInputProps)}
              />
            </div>
          </div>
          <div className="track-progress">
            <div className="track-progress__time track-progress__time_curr">
              {formatTime(currentTime)}
            </div>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="track-progress__slider"
            />
            <div className="track-progress__time track-progress__time_duration">
              {formatTime(duration)}
            </div>
          </div>
          <MusicControl
            onPlayPause={handlePlayPause}
            onNext={() => {
              if (!currentTrack || tracks.length === 0) return;
              const currentIndex = tracks.findIndex(
                (t) => t.path === currentTrack.path
              );
              const nextIndex = (currentIndex + 1) % tracks.length;
              setCurrentTrack(tracks[nextIndex]);
              setIsPlaying(true);
            }}
            onPrevious={() => {
              if (!currentTrack || tracks.length === 0) return;
              const currentIndex = tracks.findIndex(
                (t) => t.path === currentTrack.path
              );
              const prevIndex =
                (currentIndex - 1 + tracks.length) % tracks.length;
              setCurrentTrack(tracks[prevIndex]);
              setIsPlaying(true);
            }}
            isPlaying={isPlaying}
          />
          <audio ref={audioRef} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainPage;
