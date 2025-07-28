import "./Header.scss";

function Header() {
  return (
    <>
      <header className="header">
        <div className="header__music header__item">Music</div>
        <div className="header__author header__item">Author</div>
        <div className="header_settings header__item">Settings</div>
      </header>
    </>
  );
}

export default Header;
