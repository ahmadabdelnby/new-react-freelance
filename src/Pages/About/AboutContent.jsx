import React from 'react'
import './AboutContent.css'

function AboutContent() {
  return (
    <section className="about-content-section">
      <div className="about-content-container">
        <div className="about-text-content">
          <p className="about-paragraph">
            For more than two decades, Upwork has been a pioneer of a better way to work. We've enabled businesses and professionals to thrive through major shifts – from migrating to the cloud, capturing the potential of mobile, to creating new value through social media. No matter how needs and skills evolve, our purpose remains the same: To create opportunity in every era of work.
          </p>
          
          <p className="about-paragraph">
            Today, we stand at a new frontier. AI is transforming what is possible for companies and careers alike. Once again, Upwork is the place where businesses and talent come to meet this moment. Our platform empowers everyone – from Fortune 100 enterprises to ambitious startups – to access the human and AI expertise they need to move fast, solve problems, and scale. Facilitated by our mindful AI work agent, Uma™, our AI-powered operating system supports every step of turning aspirations into reality.
          </p>
          
          <p className="about-paragraph">
            Upwork is where clients and talent achieve things that they never imagined possible. Whether you're here to grow your business, advance your craft, or lead your industry into this new era, we are glad you have found Upwork.
          </p>
          
          <p className="about-closing">
            Let's build what's next – together.
          </p>
          
          <div className="about-signature">
            <img 
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 60'%3E%3Cpath d='M10 40 Q 30 10, 50 40 T 90 40 M 95 40 Q 115 10, 135 40 T 175 40' stroke='%23333' stroke-width='2' fill='none'/%3E%3C/svg%3E"
              alt="Hayden Brown Signature"
              className="signature-image"
            />
            <p className="signature-text">
              <strong>Hayden Brown,</strong><br />
              President and CEO
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutContent