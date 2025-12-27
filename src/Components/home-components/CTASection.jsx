import React from 'react'
import './CTASection.css'
import { useLanguage } from "../../context/LanguageContext";

function CTASection() {
    const { t } = useLanguage();

  return (
    <section className="cta-section-v2">
      <div className="container">
        <div className="cta-card">
          <h2 className="cta-title">{t.cta.title}</h2>
          <button className="cta-button">{t.cta.button}</button>
        </div>
      </div>
    </section>
  );
}


export default CTASection