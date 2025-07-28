import "./Header.scss";

interface HeaderProps {
  active: boolean;
  setActive: (val: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ active, setActive }) => {
  return (
    <>
      <header className="header">
        <div className="header__music header__item">Music</div>
        <div className="header__author header__item">Author</div>
        <div
          className="header_settings header__item"
          onClick={() => {
            if (!active) setActive(true);
          }}>
          Settings
        </div>
      </header>
    </>
  );
};

export default Header;
