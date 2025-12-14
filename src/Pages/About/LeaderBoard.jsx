import React, { useState } from 'react'
import './LeaderBoard.css'

function LeaderBoard() {
    const leaders = [
        {
            id: 1,
            name: 'Hayden Brown',
            position: 'President and CEO',
            image: 'https://cdn.prod.website-files.com/604761b6a7e539ea274cfd6b/6900ea01f7071d844d0acb76_Screenshot%202025-10-28%20at%209.06.12%E2%80%AFAM.png',
            shortDescription: 'Hayden Brown is president and CEO of Upwork, the world\'s human and AI-powered work marketplace, where Fortune 100 companies through small businesses and highly',
            fullDescription: 'Hayden Brown is president and CEO of Upwork, the world\'s human and AI-powered work marketplace, where Fortune 100 companies through small businesses and highly skilled independent professionals connect and collaborate to power innovation and achieve success.'
        },
        {
            id: 2,
            name: 'Erica Gessert',
            position: 'Chief Financial Officer',
            image: 'https://cdn.prod.website-files.com/604761b6a7e539ea274cfd6b/6900ea01f7071d844d0acb76_Screenshot%202025-10-28%20at%209.06.12%E2%80%AFAM.png',
            shortDescription: 'Erica Gessert is Chief Financial Officer at Upwork, where she oversees Upwork\'s global finance team and operations.',
            fullDescription: 'Erica Gessert is Chief Financial Officer at Upwork, where she oversees Upwork\'s global finance team and operations. She brings extensive experience in financial strategy and business operations.'
        },
        {
            id: 3,
            name: 'Sunita Solao',
            position: 'Chief People Officer',
            image: 'https://cdn.prod.website-files.com/604761b6a7e539ea274cfd6b/6900ea01f7071d844d0acb76_Screenshot%202025-10-28%20at%209.06.12%E2%80%AFAM.png',
            shortDescription: 'As Chief People Officer at Upwork, Sunita is responsible for driving innovation in the company\'s workforce strategy and designing a world-class team member experience',
            fullDescription: 'As Chief People Officer at Upwork, Sunita is responsible for driving innovation in the company\'s workforce strategy and designing a world-class team member experience through inclusive culture.'
        },
        {
            id: 4,
            name: 'Andrew Rabinovich',
            position: 'Chief Technology Officer, Head of AI/ML',
            image: 'https://cdn.prod.website-files.com/604761b6a7e539ea274cfd6b/6900ea01f7071d844d0acb76_Screenshot%202025-10-28%20at%209.06.12%E2%80%AFAM.png',
            shortDescription: 'Andrew Rabinovich is Chief Technology Officer and head of artificial intelligence (AI) & machine learning at Upwork, where he leads all aspects of the company\'s',
            fullDescription: 'Andrew Rabinovich is Chief Technology Officer and head of artificial intelligence (AI) & machine learning at Upwork, where he leads all aspects of the company\'s technology vision and AI/ML initiatives.'
        },
        {
            id: 5,
            name: 'Anthony Kappus',
            position: 'Chief Operating Officer',
            image: 'https://cdn.prod.website-files.com/604761b6a7e539ea274cfd6b/6900ea01f7071d844d0acb76_Screenshot%202025-10-28%20at%209.06.12%E2%80%AFAM.png',
            shortDescription: 'As Upwork\'s Chief Operating Officer, Anthony Kappus leads a team spanning legal, information security, payments & fraud, customer support, and communications.',
            fullDescription: 'As Upwork\'s Chief Operating Officer, Anthony Kappus leads a team spanning legal, information security, payments & fraud, customer support, and communications to ensure operational excellence.'
        },
        {
            id: 6,
            name: 'Dave Bottoms',
            position: 'GM, Marketplace',
            image: 'https://cdn.prod.website-files.com/604761b6a7e539ea274cfd6b/6900ea01f7071d844d0acb76_Screenshot%202025-10-28%20at%209.06.12%E2%80%AFAM.png',
            shortDescription: 'Dave Bottoms leads Upwork\'s Marketplace organization, a global team responsible for the core Talent Marketplace, search & discovery, site & monetization, core stories',
            fullDescription: 'Dave Bottoms leads Upwork\'s Marketplace organization, a global team responsible for the core Talent Marketplace, search & discovery, site & monetization, and ensuring the best experience for clients and talent.'
        },
        {
            id: 7,
            name: 'Jacob McQuown',
            position: 'Chief Legal Officer',
            image: 'https://cdn.prod.website-files.com/604761b6a7e539ea274cfd6b/6900ea01f7071d844d0acb76_Screenshot%202025-10-28%20at%209.06.12%E2%80%AFAM.png',
            shortDescription: 'Jacob McQuown oversees Upwork\'s legal, regulatory, and government affairs functions globally, providing strategic counsel to the company as it continues to shape the future.',
            fullDescription: 'Jacob McQuown oversees Upwork\'s legal, regulatory, and government affairs functions globally, providing strategic counsel to the company as it continues to shape the future of work.'
        },
        {
            id: 8,
            name: 'Peter Sanborn',
            position: 'VP, Strategic Corporate Development and Partnerships',
            image: 'https://cdn.prod.website-files.com/604761b6a7e539ea274cfd6b/6900ea01f7071d844d0acb76_Screenshot%202025-10-28%20at%209.06.12%E2%80%AFAM.png',
            shortDescription: 'Peter Sanborn is Vice President, Strategic Corporate Development and Partnerships at Upwork, where he oversees Upwork\'s corporate strategy, M&A, and investing activities.',
            fullDescription: 'Peter Sanborn is Vice President, Strategic Corporate Development and Partnerships at Upwork, where he oversees Upwork\'s corporate strategy, M&A, and investing activities to drive growth and innovation.'
        }
    ]

    const [expandedLeaders, setExpandedLeaders] = useState({})

    const toggleReadMore = (leaderId) => {
        setExpandedLeaders(prev => ({
            ...prev,
            [leaderId]: !prev[leaderId]
        }))
    }

    return (
        <section className="leaderboard-section">
            <div className="leaderboard-container">
                <div className="leaderboard-header">
                    <h2 className="leaderboard-title-green">Our Leaders</h2>
                    <h3 className="leaderboard-title-dark">Board of Directors</h3>
                </div>
                <div className="leaders-list">
                    {leaders.map((leader) => (
                        <div key={leader.id} className="leader-card">
                            <div className="leader-image-wrapper">
                                <img
                                    src={leader.image}
                                    alt={leader.name}
                                    className="leader-image"
                                />
                            </div>
                            <div className="leader-info">
                                <h4 className="leader-name">{leader.name}</h4>
                                <p className="leader-position">{leader.position}</p>
                                <p className="leader-description">
                                    {expandedLeaders[leader.id] ? leader.fullDescription : leader.shortDescription}
                                </p>
                                <button
                                    className="read-more-btn"
                                    onClick={() => toggleReadMore(leader.id)}
                                >
                                    {expandedLeaders[leader.id] ? 'Read less' : 'Read more'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default LeaderBoard