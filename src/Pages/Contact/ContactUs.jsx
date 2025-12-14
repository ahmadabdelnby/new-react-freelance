import "./ContactUs.css";
import ReachOutSection from "./ReachOutSection";
import OfficeSection from "./OfficeSection";

const ContactUs = () => {
  return (
    <main className="contact-wrapper">
      {/* ===== HERO SECTION ===== */}
      <section className="contact-section hero">
        <div className="container">
          <h1 className="contact-title">Contact Us</h1>
        </div>
      </section>

      {/* ===== REACH OUT SECTION ===== */}
      <ReachOutSection />
      {/* ===== OFFICE SECTION ===== */}
       <OfficeSection />
    </main>
  );
};

export default ContactUs;
