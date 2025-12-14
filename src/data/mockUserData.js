// Mock User Data for Profile Page
export const mockUserData = {
    // Basic Info
    name: "Mahmoud Abouelhassan",
    title: "Software Engineer",
    location: "Egypt",
    profileImage: "/mahmoud.jpeg",
    isOnline: true,

    // Statistics
    rating: 5,
    reviewsCount: 1,
    projectCompletion: 100.0,
    onTimeDelivery: 100.0,
    rehireRate: 0.0,
    communicationSuccess: 100.0,
    avgResponseTime: 16,
    completedProjects: 1,

    // Membership
    registrationDate: "April 17, 2025",
    lastSeen: "2 minutes ago",

    // Verifications
    verifications: [
        { name: "Email Address", verified: true },
        { name: "Phone Number", verified: false },
        { name: "Identity Document", verified: true },
    ],

    // About Section
    about: "I am Mahmoud Abu Al-Hassan, an experienced and specialized programmer in converting designs to live web applications. I graduated from the Information Technology Institute (ITI) after completing a practical training course in full-stack web development. In addition to design and development of interactive and responsive websites.",

    skills: [
        "HTML",
        "CSS",
        "JavaScript",
        "PHP",
        "Bootstrap",
        "Responsive Design",
        "WordPress",
        "Pro Elements",
        "VMware",
        "FileZilla",
        "Git",
        "GitHub",
        "ERD",
        "OOP (C++)",
    ],

    goals: "I am distinguished by credibility, professionalism, and a quick response. I am keen to deliver work perfectly and on time. My goal is to provide professional quality services and maintain long-term relationships with clients, while constantly developing my skills to provide unique and innovative solutions.",

    // Reviews
    reviews: [
        {
            id: 1,
            clientName: "Ahmed Mohamed",
            rating: 5,
            date: "November 15, 2024",
            projectTitle: "E-commerce Website Development",
            comment: "Excellent work! Mahmoud delivered a high-quality website ahead of schedule. Very professional and responsive to feedback. Highly recommended!",
            budget: 1500,
            duration: "2 weeks",
        },
        {
            id: 2,
            clientName: "Sarah Johnson",
            rating: 5,
            date: "October 28, 2024",
            projectTitle: "Portfolio Website Design",
            comment: "Outstanding developer! Created a beautiful and functional portfolio site. Great attention to detail and excellent communication throughout the project.",
            budget: 800,
            duration: "1 week",
        },
        {
            id: 3,
            clientName: "Omar Ali",
            rating: 4,
            date: "September 10, 2024",
            projectTitle: "Restaurant Booking System",
            comment: "Very good work overall. The booking system works smoothly and the design is clean. Minor delays but the final result was worth it.",
            budget: 2000,
            duration: "3 weeks",
        },
    ],

    // Portfolio
    portfolio: [
        {
            id: 1,
            title: "E-Commerce Platform",
            description: "A full-featured e-commerce platform with payment integration, product management, and user authentication.",
            image: "https://images.unsplash.com/photo-1557821552-17105176677c?w=500",
            technologies: ["React", "Node.js", "MongoDB", "Stripe"],
            liveUrl: "https://example.com",
            githubUrl: "https://github.com/example",
        },
        {
            id: 2,
            title: "Portfolio Website",
            description: "Modern portfolio website with smooth animations and responsive design for showcasing creative work.",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500",
            technologies: ["HTML", "CSS", "JavaScript", "Bootstrap"],
            liveUrl: "https://example.com",
            githubUrl: "https://github.com/example",
        },
        {
            id: 3,
            title: "Restaurant Management System",
            description: "Complete restaurant management solution with table booking, menu management, and order tracking.",
            image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500",
            technologies: ["PHP", "MySQL", "JavaScript", "Bootstrap"],
            liveUrl: "https://example.com",
            githubUrl: null,
        },
        {
            id: 4,
            title: "Real Estate Listing Platform",
            description: "Property listing website with advanced search filters, map integration, and user dashboard.",
            image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500",
            technologies: ["React", "Firebase", "Google Maps API", "Tailwind CSS"],
            liveUrl: "https://example.com",
            githubUrl: "https://github.com/example",
        },
    ],

    // Projects
    projects: [
        {
            id: 1,
            title: "E-Commerce Website Development",
            description: "Built a complete e-commerce platform with shopping cart, payment gateway integration, product management system, and admin dashboard. Implemented user authentication, order tracking, and email notifications.",
            status: "completed",
            budget: 1500,
            duration: "2 weeks",
            completedDate: "November 15, 2024",
            technologies: ["React", "Node.js", "Express", "MongoDB", "Stripe"],
        },
        {
            id: 2,
            title: "Portfolio Website Design & Development",
            description: "Created a modern, responsive portfolio website with smooth animations, contact form, and project showcase section. Optimized for performance and SEO.",
            status: "completed",
            budget: 800,
            duration: "1 week",
            completedDate: "October 28, 2024",
            technologies: ["HTML5", "CSS3", "JavaScript", "Bootstrap"],
        },
        {
            id: 3,
            title: "Restaurant Booking & Management System",
            description: "Developed a comprehensive restaurant management solution featuring online table reservations, menu management, order processing, and customer feedback system.",
            status: "completed",
            budget: 2000,
            duration: "3 weeks",
            completedDate: "September 10, 2024",
            technologies: ["PHP", "MySQL", "JavaScript", "Bootstrap", "jQuery"],
        },
        {
            id: 4,
            title: "Real Estate Listing Platform",
            description: "Built a property listing platform with advanced search and filtering, Google Maps integration, image galleries, and agent dashboard for property management.",
            status: "completed",
            budget: 2500,
            duration: "4 weeks",
            completedDate: "August 5, 2024",
            technologies: ["React", "Firebase", "Google Maps API", "Material-UI"],
        },
    ],
};
