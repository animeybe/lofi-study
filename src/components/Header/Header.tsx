import "./Header.scss";

interface HeaderProps {
  setActive: React.Dispatch<React.SetStateAction<boolean>>;
  activeTab: "music" | "radio";
  setActiveTab: (tab: "music" | "radio") => void;
}

const Header: React.FC<HeaderProps> = ({
  setActive,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="header">
      <div
        className={`header__music header__item ${
          activeTab === "music" ? "active" : ""
        }`}
        onClick={() => setActiveTab("music")}>
        Music
      </div>
      <div
        className={`header__radio header__item ${
          activeTab === "radio" ? "active" : ""
        }`}
        onClick={() => setActiveTab("radio")}>
        RadioFM
      </div>
      <div
        className="header_settings header__item"
        onClick={() => {
          setActive((val: boolean) => !val);
        }}>
        Settings
      </div>
    </header>
  );
};

export default Header;
