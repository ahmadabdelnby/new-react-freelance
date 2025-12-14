function OfficeSection() {
  return (
     <section className="contact-section offices">
        <div className="container">
          <h2 className="section-title">Our Offices</h2>

          <div className="office-grid">
            <div className="office-card">
              <img
                src="https://cdn.prod.website-files.com/603fea6471d9d8559d077603/6059ee60cf45f5094ecc1aaa_map.png"
                alt="Map"
                className="map-image"
              />
              <div>
                <h3>Global HQ</h3>
                <p>
                  530 Lytton Ave<br />
                  Suite 301<br />
                  Palo Alto, CA 94301
                </p>
              </div>
            </div>

            <div className="office-card">
              <img
                src="https://cdn.prod.website-files.com/603fea6471d9d8559d077603/6059ee60cf45f5094ecc1aaa_map.png"
                alt="Map"
                className="map-image"
              />
              <div>
                <h3>Mailing Address</h3>
                <p>
                  3490 S 4400 W #70008<br />
                  West Valley City, UT 84120
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
  )
}

export default OfficeSection