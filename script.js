document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. Mobile Navigation Menu Toggle --- */
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileMenu.classList.toggle('hidden');
        });

        // Close mobile menu when clicking outside or on a link
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileMenu.classList.add('hidden');
            }
        });

        const mobileLinks = mobileMenu.querySelectorAll('.mobile-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }


    /* --- 2. Flip Project Cards Logic (Desktop Hover + Mobile Tap) --- */
    const projectCards = document.querySelectorAll('.project-card');
    let activeCard = null;

    projectCards.forEach(card => {
        // Desktop hover
        card.addEventListener('mouseenter', () => {
            if (activeCard && activeCard !== card) {
                activeCard.classList.remove('flipped');
            }
            card.classList.add('flipped');
            activeCard = card;
        });

        // Click / Tap support (vital for mobile touchscreens)
        card.addEventListener('click', (e) => {
            // Don't toggle flip if clicking an action link directly
            if (e.target.closest('a')) return;

            const isFlipped = card.classList.contains('flipped');
            if (activeCard && activeCard !== card) {
                activeCard.classList.remove('flipped');
            }
            if (isFlipped) {
                card.classList.remove('flipped');
                activeCard = null;
            } else {
                card.classList.add('flipped');
                activeCard = card;
            }
        });
    });

    // Remove flipped class when mouse leaves projects grid
    document.addEventListener('mousemove', (e) => {
        if (!activeCard) return;
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


    /* --- 3. Professional Skills Filter Tabs Logic --- */
    const filterTabs = document.querySelectorAll('#skill-filter-tabs .skill-tab-btn');
    const skillItems = document.querySelectorAll('#skills-grid .skill-item');

    if (filterTabs.length > 0 && skillItems.length > 0) {
        // Set initial state based on active tab (default: languages)
        const activeTab = document.querySelector('#skill-filter-tabs .skill-tab-btn.active') || filterTabs[0];
        const initialFilter = activeTab ? activeTab.getAttribute('data-filter') : 'languages';

        skillItems.forEach(item => {
            const category = item.getAttribute('data-category');
            if (category === initialFilter) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });

        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const filter = tab.getAttribute('data-filter');

                // Update active tab styles
                filterTabs.forEach(t => {
                    t.classList.remove('active', 'bg-primary', 'text-primary-foreground', 'shadow-md', 'shadow-primary/20');
                    t.classList.add('bg-card/60', 'border', 'border-border/80', 'text-muted-foreground');
                });
                tab.classList.add('active', 'bg-primary', 'text-primary-foreground', 'shadow-md', 'shadow-primary/20');
                tab.classList.remove('bg-card/60', 'text-muted-foreground');

                // Filter skills with subtle fade animation
                skillItems.forEach(item => {
                    const category = item.getAttribute('data-category');
                    if (category === filter) {
                        item.classList.remove('hidden');
                        item.style.animation = 'none';
                        void item.offsetWidth; // trigger reflow
                        item.style.animation = 'fadeInUp 0.35s ease-out forwards';
                    } else {
                        item.classList.add('hidden');
                    }
                });
            });
        });
    }

    /* --- 3.1 Resume Actions (View & Download PDF) --- */
    const downloadResumeBtns = document.querySelectorAll('#hero-download-resume, a[download]');
    downloadResumeBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const fileUrl = btn.getAttribute('href') || './assets/resume.pdf';
            const fileName = btn.getAttribute('download') || 'Eftekar_Hossen_Resume.pdf';

            // If hosted over http/https, use fetch blob to guarantee file download
            if (window.location.protocol.startsWith('http')) {
                e.preventDefault();
                try {
                    const response = await fetch(fileUrl);
                    if (!response.ok) throw new Error('Fetch failed');
                    const blob = await response.blob();
                    const blobUrl = window.URL.createObjectURL(blob);
                    const tempAnchor = document.createElement('a');
                    tempAnchor.style.display = 'none';
                    tempAnchor.href = blobUrl;
                    tempAnchor.download = fileName;
                    document.body.appendChild(tempAnchor);
                    tempAnchor.click();
                    window.URL.revokeObjectURL(blobUrl);
                    tempAnchor.remove();
                } catch (err) {
                    window.location.href = fileUrl;
                }
            }
        });
    });


    /* --- 4. Working Contact Form Logic (FormSubmit AJAX + Feedback) --- */
    const contactForm = document.getElementById('contact-form');
    const contactStatus = document.getElementById('contact-form-status');
    const submitBtn = document.getElementById('contact-submit-btn');
    const submitBtnText = document.getElementById('submit-btn-text');

    if (contactForm && submitBtn) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('contact-name');
            const emailInput = document.getElementById('contact-email');
            const subjectInput = document.getElementById('contact-subject');
            const messageInput = document.getElementById('contact-message');

            const name = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const subject = subjectInput && subjectInput.value.trim() ? subjectInput.value.trim() : 'New Portfolio Contact';
            const message = messageInput ? messageInput.value.trim() : '';

            // Validation
            if (!name || !email || !message) {
                renderStatusMessage('Please fill in all required fields (Name, Email, Message).', 'error');
                return;
            }

            // Simple email regex
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                renderStatusMessage('Please provide a valid email address.', 'error');
                return;
            }

            // Set loading state
            submitBtn.disabled = true;
            const originalBtnContent = submitBtnText.innerHTML;
            submitBtnText.innerHTML = `
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-950 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Sending your message...</span>
            `;

            try {
                const formData = new FormData(contactForm);

                // Send via FormSubmit AJAX endpoint directly to user's email
                const response = await fetch("https://formsubmit.co/ajax/eftekarhossen3223@gmail.com", {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json'
                    },
                    body: formData
                });

                const data = await response.json();

                if (response.ok && (data.success === "true" || data.success === true || data.message)) {
                    renderStatusMessage(
                        'Thank you! Your message has been sent successfully. Eftekar will receive it directly at eftekarhossen3223@gmail.com and get back to you soon.',
                        'success'
                    );
                    contactForm.reset();
                } else {
                    throw new Error(data.message || 'Submission failed');
                }
            } catch (err) {
                console.warn('FormSubmit AJAX issue, showing fallback option:', err);
                const mailtoUrl = `mailto:eftekarhossen3223@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent('From: ' + name + ' (' + email + ')\n\n' + message)}`;
                renderStatusMessage(
                    `Network notice: Could not dispatch directly via web API. <a href="${mailtoUrl}" class="underline font-bold text-white hover:text-primary ml-1">Click here to send directly via your Email client &rarr;</a>`,
                    'warning'
                );
            } finally {
                submitBtn.disabled = false;
                submitBtnText.innerHTML = originalBtnContent;
                if (window.lucide) {
                    lucide.createIcons();
                }
            }
        });
    }

    function renderStatusMessage(msg, type) {
        if (!contactStatus) return;
        contactStatus.classList.remove('hidden');

        if (type === 'success') {
            contactStatus.className = 'p-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs sm:text-sm flex items-start gap-3 animate-fade-in-up';
            contactStatus.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 text-emerald-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <div class="leading-relaxed">${msg}</div>
            `;
        } else if (type === 'warning') {
            contactStatus.className = 'p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs sm:text-sm flex items-start gap-3 animate-fade-in-up';
            contactStatus.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 text-amber-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <div class="leading-relaxed">${msg}</div>
            `;
        } else {
            contactStatus.className = 'p-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs sm:text-sm flex items-start gap-3 animate-fade-in-up';
            contactStatus.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 text-rose-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <div class="leading-relaxed">${msg}</div>
            `;
        }
    }


    /* --- 5. Show More / Show Less Logic --- */
    function setupShowMore(btnId, gridId) {
        const btn = document.getElementById(btnId);
        const grid = document.getElementById(gridId);

        if (!btn || !grid) return;

        const hiddenItems = Array.from(grid.querySelectorAll('.hidden-item'));
        if (hiddenItems.length === 0) {
            btn.parentElement?.classList.add('hidden');
            return;
        }

        btn.addEventListener('click', () => {
            const isExpanded = btn.getAttribute('data-expanded') === 'true';

            if (!isExpanded) {
                hiddenItems.forEach(item => {
                    item.classList.remove('hidden-item', 'hidden');
                    item.classList.add('animate-fade-in-up');
                });
                btn.textContent = 'Show Less';
                btn.setAttribute('data-expanded', 'true');
            } else {
                hiddenItems.forEach(item => {
                    item.classList.add('hidden-item', 'hidden');
                    item.classList.remove('animate-fade-in-up');
                });
                btn.textContent = 'Show More';
                btn.setAttribute('data-expanded', 'false');

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

    // Initialize Lucide icons if available
    if (window.lucide) {
        lucide.createIcons();
    }
});
