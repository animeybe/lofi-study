import "./MusicControl.scss";
import React from "react";

interface MusicControlProps {
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  isPlaying: boolean;
}

const MusicControl: React.FC<MusicControlProps> = ({
  onPlayPause,
  onNext,
  onPrevious,
  isPlaying,
}) => {
  return (
    <div className="music-control">
      <div
        className="music-control__left-btn music-control__btn"
        onClick={onPrevious}
        title="Предыдущий трек"></div>

      <div
        className={`music-control__play-pause music-control__btn ${
          isPlaying ? "active" : ""
        }`}
        onClick={onPlayPause}
        title={isPlaying ? "Пауза" : "Воспроизведение"}>
        <span style={isPlaying ? { background: "red" } : {}}></span>
        <span style={isPlaying ? { background: "red" } : {}}></span>
      </div>

      <div
        className="music-control__right-btn music-control__btn"
        onClick={onNext}
        title="Следующий трек"></div>
    </div>
  );
};

export default MusicControl;
