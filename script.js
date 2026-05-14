document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. Flip Cards Logic --- */
    const projectCards = document.querySelectorAll('.project-card');
    let activeCard = null;

    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Remove flipped class from previously active card
            if (activeCard && activeCard !== card) {
                activeCard.classList.remove('flipped');
            }
            // Add flipped class to current card
            card.classList.add('flipped');
            activeCard = card;
        });
    });

    // Remove flipped class when moving away from all cards
    document.addEventListener('mousemove', (e) => {
        const isOverCard = Array.from(projectCards).some(card => {
            const rect = card.getBoundingClientRect();
            return e.clientX >= rect.left && e.clientX <= rect.right &&
                e.clientY >= rect.top && e.clientY <= rect.bottom;
        });

        if (!isOverCard && activeCard) {
            activeCard.classList.remove('flipped');
            activeCard = null;
        }
    });


    /* --- 2. Skills Circular Layout Logic --- */
    const skillsData = {
        "Backend": [
            { name: "NodeJS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
            { name: "Express", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" },
            { name: "Python", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
            { name: "Java", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" }
        ],
        "Frontend": [
            { name: "React", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
            { name: "HTML5", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
            { name: "CSS3", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
            { name: "Tailwind", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg" },
            { name: "JavaScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" }
        ],
        "Database": [
            { name: "MongoDB", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
            { name: "MySQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
            { name: "PostgreSQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" }
        ],
        "Mobile": [
            { name: "Flutter", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg" },
            { name: "React Native", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" }
        ],
        "AI/ML": [
            { name: "TensorFlow", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg" },
            { name: "PyTorch", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg" },
            { name: "Pandas", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg" }
        ],
        "IoT": [
            { name: "Arduino", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/arduino/arduino-original.svg" },
            { name: "Raspberry Pi", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/raspberrypi/raspberrypi-original.svg" }
        ],
        "Other": [
            { name: "Git", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
            { name: "Docker", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
            { name: "AWS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" }
        ]
    };

    const orbitContainer = document.getElementById('skills-orbit');
    if (!orbitContainer) return; // Guard clause

    const contentTitle = document.getElementById('skill-category-title');
    const contentList = document.getElementById('skill-list');
    const categories = Object.keys(skillsData);
    const totalCategories = categories.length;

    // Updated dimensions based on new HTML (340x340)
    const containerSize = 340;
    const center = containerSize / 2; // 170
    const btnSize = 50;
    const radius = 135; // Adjusted to fit within 340px container (170 + 135 + 25 = 330 < 340)

    // Render Orbit Buttons
    categories.forEach((category, index) => {
        const btn = document.createElement('div');
        btn.classList.add('skill-orbit-btn');
        btn.textContent = category; // Full name
        btn.setAttribute('title', category);

        // Calculate position
        const angle = (index / totalCategories) * 2 * Math.PI; // radians


        const x = Math.cos(angle) * radius + center - (btnSize / 2);
        const y = Math.sin(angle) * radius + center - (btnSize / 2);

        btn.style.left = `${x}px`;
        btn.style.top = `${y}px`;

        btn.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('.skill-orbit-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Render Content
            renderSkills(category);
        });

        orbitContainer.appendChild(btn);
    });

    // Initial Render
    if (categories.length > 0) {
        // Select first one after a small delay to ensure DOM is ready? No, immediate is fine.
        const firstBtn = orbitContainer.querySelector('.skill-orbit-btn');
        if (firstBtn) firstBtn.click();
    }

    function renderSkills(category) {
        contentTitle.textContent = category;
        contentList.innerHTML = '';
        const skills = skillsData[category];

        const rightCol = document.getElementById('skills-content');
        rightCol.classList.remove('animate-fade-in-up');
        void rightCol.offsetWidth;
        rightCol.classList.add('animate-fade-in-up');

        // Single horizontal row with scrolling, centered
        contentList.className = "flex justify-center gap-4 w-full overflow-x-auto pb-2";

        skills.forEach(skill => {
            const skillCard = document.createElement('div');
            skillCard.className = "tech-card w-[140px] h-[140px] flex flex-col items-center justify-center gap-3 p-4 rounded-3xl cursor-pointer group relative overflow-visible";

            // Use actual logo images
            skillCard.innerHTML = `
                <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                <div class="w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-all duration-300 z-10">
                    <img src="${skill.logo}" alt="${skill.name}" class="w-full h-full object-contain" />
                </div>
                <span class="font-semibold text-slate-200 text-xs tracking-wide group-hover:text-white transition-colors z-10 text-center">${skill.name}</span>
            `;
            contentList.appendChild(skillCard);
        });
    }


    /* --- 3. Show More / Show Less Logic --- */
    function setupShowMore(btnId, gridId) {
        const btn = document.getElementById(btnId);
        const grid = document.getElementById(gridId);

        if (!btn || !grid) return;

        // Store references to the items that are hidden by default
        const hiddenItems = Array.from(grid.querySelectorAll('.hidden-item'));

        btn.addEventListener('click', () => {
            const isExpanded = btn.getAttribute('data-expanded') === 'true';

            if (!isExpanded) {
                // Expand: Show all hidden items
                hiddenItems.forEach(item => {
                    item.classList.remove('hidden-item', 'hidden');
                    item.classList.add('animate-fade-in-up');
                });
                btn.textContent = 'Show Less';
                btn.setAttribute('data-expanded', 'true');
            } else {
                // Collapse: Hide items again
                hiddenItems.forEach(item => {
                    item.classList.add('hidden-item', 'hidden');
                    item.classList.remove('animate-fade-in-up');
                });
                btn.textContent = 'Show More';
                btn.setAttribute('data-expanded', 'false');

                // Smooth scroll back to the start of the grid or section
                // Using 'nearest' or 'center' might be better to keep context
                const section = grid.closest('section');
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    }

    setupShowMore('show-more-projects', 'projects-grid');
    setupShowMore('show-more-blog', 'blog-grid');
    setupShowMore('show-more-activities', 'activities-grid');

});
