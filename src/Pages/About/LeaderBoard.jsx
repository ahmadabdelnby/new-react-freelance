import React from 'react'
import './LeaderBoard.css'
import { FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa'

function LeaderBoard() {
    const teamMembers = [
        {
            id: 1,
            name: 'Ahmed Abdelnaby',
            role: 'MEARN Stack Developer',
            image: '/Ahmed.jpeg',
            description: 'Passionate about building scalable web applications and creating seamless user experiences.',
            skills: ['React', 'Angular' ,'Node.js', 'Express' , 'MongoDB'],
            linkedin: 'https://www.linkedin.com/in/ahmad-abdelnaby-6807b9225/',
            github: 'https://github.com/ahmadabdelnby',
            email: 'ahmadalnajar13@gmail.com'
        },
        {
            id: 2,
            name: 'Mahmoud Abouelhasan',
            role: 'MEARN Stack Developer',
            image: '/Mahmoud.jpeg',
            description: 'Specialized in building robust APIs and database architecture for high-performance applications.',
           skills: ['React', 'Angular' ,'Node.js', 'Express' , 'MongoDB'],
            linkedin: '#',
            github: '#',
            email: 'mahmoud@example.com'
        },
        {
            id: 3,
            name: 'Mohamed Makram',
           role: 'MEARN Stack Developer',
            image: '/makram.jpeg',
            description: 'Creative developer focused on crafting beautiful and intuitive user interfaces.',
           skills: ['React', 'Angular' ,'Node.js', 'Express' , 'MongoDB'],
            linkedin: 'https://www.linkedin.com/in/mohamed-makram-ba559a331/',
            github: 'https://github.com/makram-12',
            email: 'ma4501146@gmail.com'
        },
        {
            id: 4,
            name: 'Radwa Farrag',
            role: 'MEARN Stack Developer',
            image: '/radwa.jpeg',
            description: 'Designing user-centered experiences that combine aesthetics with functionality.',
            skills: ['React', 'Angular' ,'Node.js', 'Express' , 'MongoDB'],
            linkedin: '#',
            github: 'https://github.com/Radwa-Farrag',
            email: 'radwafarag01@gmail.com'
        },
        {
            id: 5,
            name: 'Rehab Bakhet',
            role: 'MEARN Stack Developer',
            image: '/Rehab.jpeg',
            description: 'Building end-to-end solutions with a focus on clean code and best practices.',
            skills: ['React', 'Angular' ,'Node.js', 'Express' , 'MongoDB'],
            linkedin: 'https://www.linkedin.com/in/rehab-bakhet-mahgoub-7694b1231',
            github: 'https://github.com/RehabBakhet',
            email: 'bakhetrehab@gmail.com'
        }
    ]

    return (
        <section className="about-team-section">
            <div className="about-team-container">
                {/* Section Header */}
                <div className="about-team-header">
                    <span className="about-team-label">Our Team</span>
                    <h2 className="about-team-title">Meet the Developers</h2>
                    <p className="about-team-subtitle">
                        We are a passionate team of developers dedicated to building the best freelancing platform.
                    </p>
                </div>

                {/* Team Grid */}
                <div className="about-team-grid">
                    {teamMembers.map((member) => (
                        <div key={member.id} className="about-team-card">
                            <div className="about-team-card-image">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    onError={(e) => {
                                        e.target.src = '/user-default-img.png'
                                    }}
                                />
                                <div className="about-team-card-overlay">
                                    <div className="about-team-social-links">
                                        <a href={member.linkedin} className="about-social-link" title="LinkedIn">
                                            <FaLinkedin />
                                        </a>
                                        <a href={member.github} className="about-social-link" title="GitHub">
                                            <FaGithub />
                                        </a>
                                        <a href={`mailto:${member.email}`} className="about-social-link" title="Email">
                                            <FaEnvelope />
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="about-team-card-content">
                                <h3 className="about-team-member-name">{member.name}</h3>
                                <span className="about-team-member-role">{member.role}</span>
                                <p className="about-team-member-desc">{member.description}</p>
                                <div className="about-team-member-skills">
                                    {member.skills.map((skill, index) => (
                                        <span key={index} className="about-skill-tag">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default LeaderBoard
