import { useLanguage } from "../../context/LanguageContext";
import { FaGlobe } from "react-icons/fa";

function LanguageNavItem({ closeMobileMenu }) {
  const { lang, setLang } = useLanguage();

  const handleLanguageChange = (e) => {
    e.preventDefault(); 
    setLang(lang === "en" ? "ar" : "en");
    closeMobileMenu?.();
  };

  return (
    <li className="nav-item">
      <a
        href="#"
        className="nav-link navbar-icon-btn language-toggle-btn"
        onClick={handleLanguageChange}
        title={lang === "en" ? "Switch to Arabic" : "Switch to English"}
      >
        <FaGlobe className="navbar-icon" />
        <span className="language-code">{lang === "en" ? "AR" : "EN"}</span>
      </a>
    </li>
  );
}

export default LanguageNavItem;
