import React from "react";
import HeroSection from "./HeroSection";
import ContactForm from "./ContactForm";
import styles from "./LiftedPage.module.css";

const LiftedPage = () => {
  return (
    <div className={styles.liftedContainer}>
      <div className={styles.heroWrapper}>
        <HeroSection />
      </div>
      <div className={styles.formWrapper}>
        <ContactForm />
      </div>
    </div>
  );
};

export default LiftedPage;
