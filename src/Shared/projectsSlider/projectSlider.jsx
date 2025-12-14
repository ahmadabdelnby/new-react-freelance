import React from 'react';
import { Carousel } from 'react-bootstrap';
import logger from '../../Services/logger';
import './projectSlider.css';

// Boosted Illustration Component
const BoostedIllustration = () => (
    <div className="boosted-illustration">
        <div className="proposals-stack">
            <div className="proposal-card proposal-3">
                <div className="proposal-lines">
                    <div className="line"></div>
                    <div className="line"></div>
                    <div className="line"></div>
                </div>
            </div>
            <div className="proposal-card proposal-2">
                <div className="proposal-lines">
                    <div className="line"></div>
                    <div className="line"></div>
                    <div className="line"></div>
                </div>
            </div>
            <div className="proposal-card proposal-1 boosted">
                <div className="boosted-badge">BOOSTED</div>
                <div className="proposal-lines">
                    <div className="line"></div>
                    <div className="line"></div>
                    <div className="line"></div>
                </div>
            </div>
        </div>
    </div>
);

// Premium Star Badge Illustration
const PremiumIllustration = () => (
    <div className="premium-illustration">
        <div className="premium-badge-container">
            <div className="premium-star-badge">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
                    {/* Outer glow rings */}
                    <circle cx="60" cy="60" r="55" fill="none" stroke="rgba(255, 215, 0, 0.1)" strokeWidth="2" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255, 215, 0, 0.15)" strokeWidth="2" />

                    {/* Main gradient background circle */}
                    <defs>
                        <linearGradient id="premiumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 0.3 }} />
                            <stop offset="100%" style={{ stopColor: '#FFA500', stopOpacity: 0.5 }} />
                        </linearGradient>
                        <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#FFD700' }} />
                            <stop offset="50%" style={{ stopColor: '#FFC700' }} />
                            <stop offset="100%" style={{ stopColor: '#FFB300' }} />
                        </linearGradient>
                    </defs>

                    <circle cx="60" cy="60" r="45" fill="url(#premiumGradient)" opacity="0.8" />

                    {/* Modern star shape */}
                    <path d="M60 25 L67 48 L91 48 L72 62 L79 85 L60 71 L41 85 L48 62 L29 48 L53 48 Z"
                        fill="url(#starGradient)"
                        stroke="#FFE55C"
                        strokeWidth="1.5"
                        strokeLinejoin="round" />

                    {/* Inner shine effect */}
                    <circle cx="60" cy="60" r="12" fill="rgba(255, 255, 255, 0.4)" />
                    <circle cx="60" cy="60" r="8" fill="rgba(255, 255, 255, 0.6)" />

                    {/* Sparkle effects */}
                    <circle cx="75" cy="35" r="2" fill="#fff" opacity="0.9" />
                    <circle cx="45" cy="40" r="1.5" fill="#fff" opacity="0.8" />
                    <circle cx="85" cy="60" r="2.5" fill="#fff" opacity="0.7" />
                    <circle cx="35" cy="70" r="2" fill="#fff" opacity="0.8" />

                    {/* Small cross sparkles */}
                    <path d="M90 45 L92 45 M91 44 L91 46" stroke="#fff" strokeWidth="1.5" opacity="0.9" strokeLinecap="round" />
                    <path d="M30 55 L32 55 M31 54 L31 56" stroke="#fff" strokeWidth="1.5" opacity="0.8" strokeLinecap="round" />
                </svg>
            </div>
            <div className="premium-features-icons">
                <div className="feature-item">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <div className="feature-item">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="feature-item">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                </div>
            </div>
        </div>
    </div>
);

// Success & Growth Illustration
const SuccessIllustration = () => (
    <div className="success-illustration">
        <div className="success-chart-container">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 140" fill="none">
                {/* Growth Chart Bars */}
                <rect x="20" y="90" width="25" height="40" fill="rgba(255, 255, 255, 0.3)" rx="4" />
                <rect x="55" y="70" width="25" height="60" fill="rgba(255, 255, 255, 0.5)" rx="4" />
                <rect x="90" y="50" width="25" height="80" fill="rgba(255, 255, 255, 0.7)" rx="4" />
                <rect x="125" y="25" width="25" height="105" fill="#FFD700" rx="4" />

                {/* Success Checkmark Circle */}
                <circle cx="138" cy="20" r="18" fill="#4CAF50" stroke="white" strokeWidth="3" />
                <path d="M130 20L136 26L146 16" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />

                {/* Connecting People Icons */}
                <circle cx="25" cy="20" r="12" fill="rgba(255, 255, 255, 0.3)" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="2" />
                <path d="M25 26c-4 0-7 2-7 4h14c0-2-3-4-7-4z" fill="rgba(255, 255, 255, 0.3)" />

                <circle cx="55" cy="15" r="12" fill="rgba(255, 255, 255, 0.3)" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="2" />
                <path d="M55 21c-4 0-7 2-7 4h14c0-2-3-4-7-4z" fill="rgba(255, 255, 255, 0.3)" />

                <circle cx="85" cy="18" r="12" fill="rgba(255, 255, 255, 0.3)" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="2" />
                <path d="M85 24c-4 0-7 2-7 4h14c0-2-3-4-7-4z" fill="rgba(255, 255, 255, 0.3)" />
            </svg>
        </div>
    </div>
);

const ProjectSlider = () => {
    const slides = [
        {
            title: "Rise to the top of the client's list",
            subtitle: 'Boosted Proposals deliver 10x more earnings on ad spend',
            ctaText: 'Boost now',
            ctaAction: () => console.log('Boost now clicked'),
            customContent: <BoostedIllustration />
        },
        {
            title: 'Stand out from the competition',
            subtitle: 'Premium freelancers get hired 2x faster',
            ctaText: 'Upgrade to Premium',
            ctaAction: () => console.log('Upgrade clicked'),
            customContent: <PremiumIllustration />
        },
        {
            title: 'Connect with quality clients',
            subtitle: 'Join thousands of successful freelancers',
            ctaText: 'Start Earning',
            ctaAction: () => console.log('Start Earning clicked'),
            customContent: <SuccessIllustration />
        }
    ];

    return (
        <div className="project-slider-wrapper">
            <Carousel
                interval={5000}
                pause="hover"
                indicators={true}
                controls={true}
            >
                {slides.map((slide, index) => (
                    <Carousel.Item key={index}>
                        <div className="slider-content-container">
                            <div className="row align-items-center h-100">
                                <div className="col-lg-7 col-md-6">
                                    <div className="slide-text-content">
                                        <h3 className="slide-title">{slide.title}</h3>
                                        <h2 className="slide-subtitle">{slide.subtitle}</h2>
                                        {slide.ctaText && (
                                            <button
                                                className="slide-cta-btn"
                                                onClick={slide.ctaAction}
                                            >
                                                {slide.ctaText}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="col-lg-5 col-md-6">
                                    <div className="slide-illustration">
                                        {slide.customContent}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Carousel.Item>
                ))}
            </Carousel>
        </div>
    );
};

export default ProjectSlider;
