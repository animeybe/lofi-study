import "./SettingsWindow.scss";
import React, { useEffect, useState } from "react";

interface SettingsWindowProps {
  setActive: React.Dispatch<React.SetStateAction<boolean>>;
  volume: number;
  onVolumeChange: (volume: number) => void;
}

const colorOptions = [
  { id: 1, generalColor: "#e8a236", backgroundColor: "#212121" },
  { id: 2, generalColor: "#D596F7", backgroundColor: "#370D8A" },
  { id: 3, generalColor: "#BAF2C5", backgroundColor: "#5C1B68" },
  { id: 4, generalColor: "#8BDA59", backgroundColor: "#1D4836" },
  { id: 5, generalColor: "#E3A215", backgroundColor: "#0D457C" },
  { id: 6, generalColor: "#F0DC9B", backgroundColor: "#7523CE" },
];

const SettingsWindow: React.FC<SettingsWindowProps> = ({
  setActive,
  volume,
  onVolumeChange,
}) => {
  const [currColorID, setCurrColorID] = useState(1);
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    onVolumeChange(newVolume);
  };
  const handleColorChange = (
    color: string,
    backgroundColor: string,
    colorID: number
  ) => {
    // Изменяем CSS-переменную
    document.documentElement.style.setProperty("--general-c", color);
    document.documentElement.style.setProperty(
      "--general-bgc",
      backgroundColor
    );
    setCurrColorID(colorID);
    // Можно также сохранить в localStorage для сохранения между сессиями
    localStorage.setItem("selectedColor", color);
    localStorage.setItem("selectedBgcColor", backgroundColor);
  };

  useEffect(() => {
    const currentColor = localStorage.getItem("selectedColor");
    const currentBgcColor = localStorage.getItem("selectedBgcColor");

    const colorOption =
      colorOptions.find(
        (option) =>
          option.generalColor === currentColor &&
          option.backgroundColor === currentBgcColor
      ) || colorOptions[0];
    setCurrColorID(colorOption.id);
  }, [currColorID]);

  return (
    <>
      <div
        className="settings-window"
        onClick={(e) => {
          if (e.target === e.currentTarget) setActive((val: boolean) => !val);
        }}>
        <div className="settings-window-content">
          <div
            className="settings__close-btn"
            onClick={() => setActive((val: boolean) => !val)}>
            Закрыть
          </div>
          <div className="settings-params">
            <div className="settings-volume">
              <div className="settings-volume__title">Настройка громкости:</div>
              <div className="settings-volume__control">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                />
              </div>
              <div className="settings-volume__percent">
                {Math.round(volume * 100)}%
              </div>
            </div>
            <div className="settings-select-color">
              <div className="settings-select-color__title">
                Выбери палитру сайта:
              </div>
              <ul className="settings-select-color__colors">
                {colorOptions.map((color) => (
                  <li
                    key={color.id}
                    className={`settings-select-color__color settings-select-color__color_${
                      color.id
                    } ${currColorID === color.id ? "active-color" : ""}`}
                    onClick={() =>
                      handleColorChange(
                        color.generalColor,
                        color.backgroundColor,
                        color.id
                      )
                    }
                    style={
                      {
                        "--color-select-element": color.generalColor,
                        "--color-bgc-select-element": color.backgroundColor,
                      } as React.CSSProperties
                    }
                    title={`Выбрать цвет ${color.generalColor}`}
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsWindow;
