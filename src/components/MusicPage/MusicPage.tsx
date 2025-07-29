import React from "react";
import MusicControl from "../MusicControl/MusicControl";
import type { Track, DirectoryInputProps } from "../../MainPage";

interface MusicPageProps {
  currentTrack: Track | null;
  tracks: Track[];
  hasTracks: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  trackProgressSliderRef: React.RefObject<HTMLInputElement | null>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setCurrentTrack: React.Dispatch<React.SetStateAction<Track | null>>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setSavedTime: React.Dispatch<React.SetStateAction<number>>;
  isAudioReady: boolean;
}

const formatTime = (time: number) => {
  if (isNaN(time)) return "00:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

const MusicPage: React.FC<MusicPageProps> = ({
  currentTrack,
  tracks,
  hasTracks,
  isPlaying,
  currentTime,
  duration,
  fileInputRef,
  trackProgressSliderRef,
  audioRef,
  onPlayPause,
  onNext,
  onPrevious,
  handleFileChange,
  handleSeek,
  setCurrentTrack,
  setIsPlaying,
  setSavedTime,
  isAudioReady,
}) => {
  return (
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
              <div className="music-card__title">{currentTrack.name}</div>
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
                      if (track === currentTrack) {
                        onPlayPause();
                      } else {
                        setSavedTime(0);
                        setCurrentTrack(track);
                        setIsPlaying(true);
                      }
                    }}>
                    <div className="track-item__name">
                      {track === currentTrack ? "● " : `${index + 1}. `}{" "}
                      {track.name}
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
            ref={trackProgressSliderRef}
            disabled={!hasTracks}
            className="track-progress__slider"
          />
          <div className="track-progress__time track-progress__time_duration">
            {formatTime(duration)}
          </div>
        </div>
        <MusicControl
          onPlayPause={onPlayPause}
          onNext={onNext}
          onPrevious={onPrevious}
          isPlaying={isPlaying}
          disabled={!isAudioReady}
        />
        <audio ref={audioRef} />
      </div>
    </main>
  );
};

export default MusicPage;
