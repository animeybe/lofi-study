import "./MainPage.scss";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import MusicControl from "./components/MusicControl/MusicControl";
import React, { useState, useRef, useEffect } from "react";
import * as mm from "music-metadata-browser";

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

  // 1. Удаляем запрещенные слова (без учета регистра)
  let formattedTitle = title;
  badWordsList.forEach((word) => {
    // Экранируем все специальные символы для regex
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Используем replaceAll вместо replace с флагом g
    formattedTitle = formattedTitle.replace(new RegExp(escapedWord, "gi"), "");
  });

  // 2. Удаляем оставшиеся квадратные скобки, если они пустые
  formattedTitle = formattedTitle.replace(/\[\s*\]/g, "");

  // 3. Удаляем пробелы в начале и конце
  formattedTitle = formattedTitle.trim();

  // 4. Удаляем последовательности из более чем 3 цифр
  formattedTitle = formattedTitle.replace(/\d{4,}/g, "");

  // 5. Заменяем подчеркивания на пробелы
  formattedTitle = formattedTitle.replace(/_/g, " ");

  // 6. Удаляем возможные двойные пробелы после всех преобразований
  formattedTitle = formattedTitle.replace(/\s+/g, " ").trim();

  return formattedTitle;
};

const MainPage: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [trackQueuesListActive, setTrackQueuesListActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const extractMetadata = async (file: File): Promise<Track> => {
    try {
      const metadata = await mm.parseBlob(file);
      let coverUrl = undefined;

      if (metadata.common.picture?.[0]) {
        const picture = metadata.common.picture[0];
        coverUrl = URL.createObjectURL(
          new Blob([picture.data], { type: picture.format })
        );
      }

      return {
        name: metadata.common.title || file.name.replace(/\.[^/.]+$/, ""),
        path: URL.createObjectURL(file),
        artist: metadata.common.artists?.at(0) || "Неизвестный исполнитель",
        album: metadata.common.album || "Без альбома",
        cover: coverUrl,
        file: file,
      };
    } catch (error) {
      console.error("Error extracting metadata:", error);
      return {
        name: file.name.replace(/\.[^/.]+$/, ""),
        path: URL.createObjectURL(file),
        artist: "Неизвестный исполнитель",
        album: "Без альбома",
        file: file,
      };
    }
  };

  const handleSelectFolder = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const audioFiles = Array.from(files).filter((file) =>
      file.type.startsWith("audio/")
    );

    const newTracks = await Promise.all(
      audioFiles.map((file) => extractMetadata(file))
    );

    setTracks(newTracks);
    setTrackQueuesListActive(true);
    if (newTracks.length > 0) {
      setCurrentTrack(newTracks[0]);
    }
  };

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.path;
      if (isPlaying) {
        audioRef.current.play().catch((e) => console.error("Play error:", e));
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    return () => {
      tracks.forEach((track) => {
        URL.revokeObjectURL(track.path);
        if (track.cover) URL.revokeObjectURL(track.cover);
      });
    };
  }, [tracks]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((e) => console.error("Play error:", e));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      <div className="wrapper">
        <Header />
        <main className="content">
          <div className="content-left">
            <div className="music-card">
              <div className="music-card__logo">
                <div className="music-card__logo-mask"></div>
              </div>
              {currentTrack ? (
                <>
                  <div className="music-card__title">
                    {trackTitleFormating(currentTrack.name)}
                  </div>
                  <div className="music-card__description">
                    {currentTrack.artist} • {currentTrack.album}
                  </div>
                </>
              ) : (
                <>
                  <div className="music-card__title"></div>
                  <div className="music-card__description"></div>
                </>
              )}
            </div>
          </div>
          <div className="content-right">
            <div className="track-queues">
              <div className="track-queues__title">Следующие треки:</div>
              <div className="track-queues_list">
                {!trackQueuesListActive ? (
                  <div
                    className="select-folder-btn"
                    onClick={handleSelectFolder}>
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
                        onClick={() => setCurrentTrack(track)}>
                        <div className="track-item__name">
                          {track === currentTrack ? "●" : ""}{" "}
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
                  webkitdirectory="true"
                  directory="true"
                  multiple
                  accept="audio/*"
                  // Приводим тип к нашему кастомному интерфейсу
                  {...({} as DirectoryInputProps)}
                />
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
    </>
  );
};

export default MainPage;
