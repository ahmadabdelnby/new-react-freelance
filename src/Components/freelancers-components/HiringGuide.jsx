import React from 'react'
import './HiringGuide.css'

function HiringGuide() {
  return (
    <section className="hiring-guide">
      <div className="container">
        <h2 className="hiring-guide-title">
          How To Hire Top Freelancers for Your Business
        </h2>
        <p className="hiring-guide-subtitle">
          From freelance designers to dedicated professionals, Herfa's global talent marketplace helps businesses of all sizes tap into creative professionals with the right technical skills and design style preferences.
        </p>

        <div className="guide-content">
          <h3 className="guide-section-title">
            Step-by-step guide to hiring a freelancer on Herfa
          </h3>
          <p className="guide-section-subtitle">
            To find and hire the right freelancer for your project on Herfa, follow this step-by-step guide:
          </p>

          {/* Step 1 */}
          <div className="guide-step">
            <h4 className="step-title">Step 1: Write a clear job post</h4>
            <p className="step-description">
              Start by creating a job post that explains exactly what you need. A clear job post helps attract freelancers who match your goals.
            </p>
            <p className="step-label">Include:</p>
            <ul className="step-list">
              <li>What the project is: For example: logo design, business cards, motion graphics, etc.</li>
              <li>Your style preferences: Do you like modern, minimalist, or retro designs?</li>
              <li>Hard skills needed: Like proficiency with Adobe Illustrator, Photoshop, or Figma.</li>
              <li>Soft skills needed: Good communication, problem solving, and creativity are all important.</li>
            </ul>
          </div>

          {/* Step 2 */}
          <div className="guide-step">
            <h4 className="step-title">Step 2: Search for freelance designers</h4>
            <p className="step-description">
              Use Herfa's Talent Marketplace to find designers. You can filter by category, budget, location, or language.
            </p>
            <p className="step-label">Look for:</p>
            <ul className="step-list">
              <li>Portfolios: Check their past work to see if their style works with your brand.</li>
              <li>Reviews and ratings: High scores and good feedback mean they've done great work before.</li>
              <li>Communication style: Reach out to them, possibly with questions about their availability or the project scope, to get a feel for their communication style.</li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="guide-step">
            <h4 className="step-title">Step 3: Interview and check for fit</h4>
            <p className="step-description">
              As designers respond to your job post and outreach efforts, create a shortlist of top candidates. Set up chats or video calls to ask more detailed questions about the project and to understand the candidates' methods.
            </p>
            <p className="step-label">Ask about:</p>
            <ul className="step-list">
              <li>Their design process: How they come up with ideas and handle revisions.</li>
              <li>Project management: How they deal with changes or updates.</li>
              <li>Communication: How often they'll give updates and join meetings, and the usual time when they are at work and will respond to messages.</li>
            </ul>
          </div>

          {/* Step 4 */}
          <div className="guide-step">
            <h4 className="step-title">Step 4: Agree on details and start the project</h4>
            <p className="step-description">
              Once you've found the right designer, set up the project terms on Herfa.
            </p>
            <p className="step-label">Decide on:</p>
            <ul className="step-list">
              <li>Budget: You and the freelancer will negotiate the fee. Choose hourly or fixed-price based on the nature of the work.</li>
              <li>Timeline: Agree on a deadline. Consider breaking fixed-price projects into milestones.</li>
              <li>Revisions: Decide how many rounds of edits are included and an appropriate rate for additional revisions. These are logged in the freelancer's Work Diary, which you can review and dispute if hours were not spent on the appropriate project.</li>
              <li>Affordability: Work with affordable designers from across the globe without agency markup.</li>
              <li>Wide Range of Talent: Herfa gives you access to a community of design talent with varied design capabilities and experiences.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HiringGuide
