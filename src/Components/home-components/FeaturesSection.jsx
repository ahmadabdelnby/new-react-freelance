import React from 'react'
import './FeaturesSection.css'
import { FaCode, FaPaintBrush, FaHandshake, FaPencilAlt, FaUserTie } from 'react-icons/fa'
import { AiOutlineRobot } from 'react-icons/ai'

const testimonials = [
  {
    id: 1,
    category: 'DEV & IT',
    icon: <FaCode />,
    text: '"Haris came in and helped us transfer knowledge from our departing developer, meeting a serious deadline without fail. His knowledge and experience are exceptional."',
    rating: 5,
    author: 'Haris S.',
    role: 'Full-Stack Developer',
    date: 'Apr 7, 2025',
    avatar: 'https://i.pravatar.cc/150?img=12'
  },
  {
    id: 2,
    category: 'DESIGN & CREATIVE',
    icon: <FaPaintBrush />,
    text: '"Ezzan did an amazing job editing my videos—fast turnaround, great attention to detail, and very easy to work with. He follows directions well and delivers high-quality work consistently. Highly recommend him!"',
    rating: 5,
    author: 'Ezzan S.',
    role: 'Short form and long form video editor needed!',
    date: 'Mar 14, 2025',
    avatar: 'https://i.pravatar.cc/150?img=33'
  },
  {
    id: 3,
    category: 'AI SERVICES',
    icon: <AiOutlineRobot />,
    text: '"Rick is a fantastic AI/ML engineer with specialization in LLMs, delivering end-to-end solutions. We had a few concepts when we started the work; ultimately, he delivered a working solution. Looking forward to working with him again."',
    rating: 4,
    author: 'Richard C.',
    role: 'LLM/RAG agent system development',
    date: 'Mar 28, 2025',
    avatar: 'https://i.pravatar.cc/150?img=68'
  },
  {
    id: 4,
    category: 'SALES & MARKETING',
    icon: <FaHandshake />,
    text: '"We loved working with Jibran and his team. They are very professional and know what they are doing. Very responsive and actually take the time to understand the project and are very methodical and thoughtful about how to approach each project. They are very knowledgeable and creative. We will definitely work with them again."',
    rating: 5,
    author: 'Jibran Z.',
    role: 'Social media posts and marketing',
    date: 'Mar 10, 2025',
    avatar: 'https://i.pravatar.cc/150?img=14'
  },
  {
    id: 5,
    category: 'WRITING & TRANSLATION',
    icon: <FaPencilAlt />,
    text: '"Michael is very skilled and highly professional. Understood the assignment, followed instructions, and was also able to be flexible and creative. One of the rare copywriters I\'ve worked with who can come up with something outside the box, but still on brand. Would definitely hire him again!"',
    rating: 5,
    author: 'Michael L.',
    role: 'Email marketing series to announce brand launch',
    date: 'Jan 31, 2025',
    avatar: 'https://i.pravatar.cc/150?img=51'
  },
  {
    id: 6,
    category: 'ADMIN & CUSTOMER SUPPORT',
    icon: <FaUserTie />,
    text: '"Ahmed was a great asset to our team. He brought a keen eye for inefficiencies, applied process rigor, and expertly configured ClickUp to ensure sustainable usage and management moving forward. His insights and structured approach have had a lasting impact on our workflows."',
    rating: 4,
    author: 'Ahmed A.',
    role: 'Technical Project Manager',
    date: 'Feb 5, 2025',
    avatar: 'https://i.pravatar.cc/150?img=60'
  }
]

function FeaturesSection() {
  return (
    <section className="testimonials-section">
      <div className="container">
        <h2 className="testimonials-title">Real results from clients</h2>
        
        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-header">
                <span className="testimonial-icon">{testimonial.icon}</span>
                <span className="testimonial-category">{testimonial.category}</span>
              </div>
              
              <p className="testimonial-text">{testimonial.text}</p>
              
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <span key={`rating-star-${i}`} className={i < testimonial.rating ? 'star filled' : 'star'}>★</span>
                ))}
              </div>
              
              <div className="testimonial-footer">
                <img src={testimonial.avatar} alt={testimonial.author} className="testimonial-avatar" />
                <div className="testimonial-info">
                  <p className="testimonial-author">Work done by {testimonial.author}</p>
                  <p className="testimonial-role">{testimonial.role}</p>
                  <p className="testimonial-date">{testimonial.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="wave-decoration" />
    </section>
  )
}

export default FeaturesSection