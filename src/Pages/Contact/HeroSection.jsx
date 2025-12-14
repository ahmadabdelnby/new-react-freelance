import React from "react";
import styles from "./HeroSection.module.css";

const HeroSection = () => {
  return (
    <section className={styles.hero}>
      <h1>Connect with our workforce experts</h1>
      <p>
        Looking to gain deeper insight into contingent workforce management
        solutions? Our team is here to provide the expertise and industry
        knowledge you need.
      </p>

      <ul>
        <li>Clarify the benefits and features of our solution</li>
        <li>Offer guidance on optimizing your workforce strategy</li>
        <li>Share best practices for vendor management and compliance</li>
        <li>Provide data-driven recommendations tailored to your enterprise</li>
      </ul>
    </section>
  );
};

export default HeroSection;
