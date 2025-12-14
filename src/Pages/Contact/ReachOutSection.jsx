function ReachOutSection() {
  return (
    <section className="contact-section">
        <div className="container">
          <h2 className="section-title">Reach out anytime</h2>

          <div className="contact-grid">
            {/* Customer Support */}
            <a
              className="contact-card"
              target="_blank"
              rel="noreferrer"
            >
              <div className="icon-circle">💬</div>
              <div className="contact-text">
                <h3>Customer Support</h3>
                <p className="green-text">Visit Help Center</p>
              </div>
            </a>


            {/* Lifted Company */}
            <a
              href="/lifted"
              className="contact-card"
              target="_blank"
              rel="noreferrer"
            >
              <div className="icon-circle">🏢</div>
              <div className="contact-text">
                <h3>Lifted, a Herfa Company</h3>
                <p className="green-text">Contact Us</p>
              </div>
            </a>

            {/* Press Inquiries */}
            <a
              className="contact-card"
            >
              <div className="icon-circle">📰</div>
              <div className="contact-text">
                <h3>Press Inquiries</h3>
                <p className="green-text">press@herfa.com</p>
              </div>
            </a>
          </div>
        </div>
      </section>

  )
}

export default ReachOutSection