import { useLanguage } from "../../context/LanguageContext";

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
        className="nav-link language-link"
        onClick={handleLanguageChange}
      >
        {lang === "en" ? "العربية" : "English"}
      </a>
    </li>
  );
}

export default LanguageNavItem;
