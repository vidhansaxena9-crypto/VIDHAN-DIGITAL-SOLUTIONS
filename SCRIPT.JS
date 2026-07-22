const getApiBase = () => {
    if (window.location.protocol === 'file:') {
        return 'http://localhost:3000';
    }
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000';
    }
    return window.location.origin;
};

document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("header");
    const menuBtn = document.querySelector(".menu-btn");
    const nav = document.querySelector("nav");
    const topBtn = document.getElementById("topBtn");
    const revealElements = document.querySelectorAll(".reveal");
    const counters = document.querySelectorAll(".counter");
    const typing = document.querySelector(".typing");
    const loader = document.querySelector(".loader");
    const form = document.querySelector(".contact-form");
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll("nav a");
    const themeToggle = document.getElementById("themeToggle");
    const heroSlides = document.querySelectorAll('.hero-slide');
    const heroDots = document.querySelectorAll('.dot');
    const faqItems = document.querySelectorAll('.faq-item');
    const chatWidget = document.getElementById('aiChatWidget');
    const chatToggle = document.getElementById('chatToggle');
    const chatClose = document.getElementById('chatClose');
    const chatForm = document.getElementById('chatForm');
    const auditModal = document.getElementById('auditModal');
    const openAuditBtn = document.getElementById('openAuditBtn');
    const auditClose = document.getElementById('auditClose');
    const estimateAmount = document.getElementById('estimateAmount');
    const websiteType = document.getElementById('websiteType');
    const prefersDark = true;

    if (heroSlides.length) {
        let heroIndex = 0;
        const showHeroSlide = (index) => {
            heroSlides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
            heroDots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        };
        const cycleHeroSlides = () => {
            heroIndex = (heroIndex + 1) % heroSlides.length;
            showHeroSlide(heroIndex);
        };
        heroDots.forEach(dot => {
            dot.addEventListener('click', () => {
                heroIndex = Number(dot.dataset.slide);
                showHeroSlide(heroIndex);
            });
        });
        setInterval(cycleHeroSlides, 4000);
        showHeroSlide(0);
    }

    if (faqItems.length) {
        faqItems.forEach(item => {
            const button = item.querySelector('.faq-question');
            button?.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                faqItems.forEach(otherItem => otherItem.classList.remove('active'));
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });
    }

    if (chatToggle && chatWidget) {
        chatToggle.addEventListener('click', () => {
            chatWidget.classList.toggle('open');
        });
        chatClose?.addEventListener('click', () => {
            chatWidget.classList.remove('open');
        });
        chatForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = chatForm.querySelector('input');
            if (input) {
                input.value = '';
            }
            chatWidget.classList.remove('open');
        });
    }

    if (openAuditBtn && auditModal) {
        openAuditBtn.addEventListener('click', () => {
            auditModal.classList.add('open');
            auditModal.setAttribute('aria-hidden', 'false');
        });
        auditClose?.addEventListener('click', () => {
            auditModal.classList.remove('open');
            auditModal.setAttribute('aria-hidden', 'true');
        });
        auditModal.addEventListener('click', (event) => {
            if (event.target === auditModal) {
                auditModal.classList.remove('open');
                auditModal.setAttribute('aria-hidden', 'true');
            }
        });
    }

    const updateEstimate = () => {
        if (!estimateAmount || !websiteType) return;
        const prices = {
            restaurant: '₹14999',
            school: '₹17999',
            hospital: '₹19999',
            business: '₹7999'
        };
        estimateAmount.textContent = prices[websiteType.value] || '₹7999';
    };
    websiteType?.addEventListener('change', updateEstimate);
    updateEstimate();

    if (themeToggle) {
        const applyTheme = (dark) => {
            document.body.classList.toggle('dark', dark);
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = dark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
            }
            localStorage.setItem('vd-theme', dark ? 'dark' : 'light');
        };

        const storedTheme = localStorage.getItem('vd-theme');
        const shouldBeDark = storedTheme ? storedTheme === 'dark' : prefersDark;
        applyTheme(shouldBeDark);

        themeToggle.addEventListener('click', () => {
            const dark = !document.body.classList.contains('dark');
            applyTheme(dark);
        });
    }

    window.addEventListener("scroll", () => {
        header.classList.toggle("scrolled", window.scrollY > 40);
        if (topBtn) {
            topBtn.style.display = window.scrollY > 450 ? "grid" : "none";
        }

        let currentId = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 140;
            if (window.scrollY >= sectionTop) {
                currentId = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.toggle("active", link.getAttribute("href") === `#${currentId}`);
        });
    });

    if (menuBtn) {
        menuBtn.addEventListener("click", () => {
            nav.classList.toggle("active");
            menuBtn.classList.toggle("active");
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            const href = this.getAttribute("href");
            if (!href || href === "#") return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
            if (nav) nav.classList.remove("active");
            if (menuBtn) menuBtn.classList.remove("active");
        });
    });

    if (topBtn) {
        topBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    const reveal = () => {
        revealElements.forEach(el => {
            const revealTop = el.getBoundingClientRect().top;
            if (revealTop < window.innerHeight - 100) {
                el.classList.add("active");
            }
        });
    };
    window.addEventListener("scroll", reveal);
    reveal();

    counters.forEach(counter => {
        const target = Number(counter.dataset.target);
        let current = 0;
        const duration = 1200;
        const stepTime = 20;
        const step = target / (duration / stepTime);
        const update = () => {
            current += step;
            if (current < target) {
                counter.textContent = `${Math.ceil(current)}+`;
                setTimeout(update, stepTime);
            } else {
                counter.textContent = `${target}+`;
            }
        };
        update();
    });

    if (typing) {
        const words = ["Websites", "Software", "Apps", "AI solutions", "Digital growth"];
        let wordIndex = 0;
        let charIndex = 0;
        let deleting = false;

        const type = () => {
            const currentWord = words[wordIndex];
            if (!deleting) {
                typing.textContent = currentWord.substring(0, charIndex++);
                if (charIndex > currentWord.length) {
                    deleting = true;
                    setTimeout(type, 1000);
                    return;
                }
            } else {
                typing.textContent = currentWord.substring(0, charIndex--);
                if (charIndex < 0) {
                    deleting = false;
                    wordIndex = (wordIndex + 1) % words.length;
                }
            }
            setTimeout(type, deleting ? 60 : 120);
        };
        type();
    }

    if (form) {
        const statusBox = form.querySelector('.form-status');
        const isFileMode = window.location.protocol === 'file:';
        const submitBtn = form.querySelector('button[type="submit"]');
        const setServerError = (text) => {
            statusBox.textContent = text;
            statusBox.className = 'form-status error';
            submitBtn.disabled = true;
        };
        const clearServerError = () => {
            statusBox.textContent = '';
            statusBox.className = 'form-status';
            submitBtn.disabled = false;
        };

        if (isFileMode) {
            fetch('http://localhost:3000/api/health')
                .then(response => {
                    if (response.ok) {
                        window.location.replace('http://localhost:3000/request.html');
                    } else {
                        clearServerError();
                    }
                })
                .catch(() => {
                    clearServerError();
                });
        } else {
            fetch(`${getApiBase()}/api/health`)
                .then(response => {
                    if (!response.ok) throw new Error('Server health check failed');
                    return response.json();
                })
                .then(() => {
                    clearServerError();
                })
                .catch(() => {
                    setServerError('The backend server is not available. Start the app with npm start and reload this page.');
                });
        }

        form.addEventListener("submit", async e => {
            e.preventDefault();
            if (isFileMode) {
                setServerError('Cannot submit from file://. Start the server with npm start and open http://localhost:3000/request.html instead.');
                return;
            }
            if (submitBtn.disabled) {
                return;
            }
            const name = form.querySelector('input[name="name"]');
            const email = form.querySelector('input[name="email"]');
            const company = form.querySelector('input[name="company"]');
            const service = form.querySelector('select[name="service"]');
            const budget = form.querySelector('input[name="budget"]');
            const message = form.querySelector('textarea[name="message"]');

            if (!name.value.trim()) {
                statusBox.textContent = "Please enter your name.";
                statusBox.className = "form-status error";
                return;
            }
            if (!email.value.trim()) {
                statusBox.textContent = "Please enter your email.";
                statusBox.className = "form-status error";
                return;
            }
            if (!service.value.trim()) {
                statusBox.textContent = "Please select the service you need.";
                statusBox.className = "form-status error";
                return;
            }
            if (!message.value.trim()) {
                statusBox.textContent = "Please write a short message about your project.";
                statusBox.className = "form-status error";
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = "Sending...";
            statusBox.textContent = "Sending your request...";
            statusBox.className = "form-status";

            try {
                const apiUrl = `${getApiBase()}/api/contact`;
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: name.value.trim(),
                        email: email.value.trim(),
                        business: company?.value.trim() || '',
                        company: company?.value.trim() || '',
                        service: service.value.trim(),
                        budget: budget?.value.trim() || '',
                        message: message.value.trim(),
                    }),
                });

                const text = await response.text();
                let data = {};
                if (text) {
                    try {
                        data = JSON.parse(text);
                    } catch (parseError) {
                        data = { message: 'The server returned an invalid response.' };
                    }
                }

                if (!response.ok) throw new Error(data.message || 'Unable to send request');
                statusBox.textContent = data.message || 'Request received successfully.';
                statusBox.className = "form-status success";
                form.reset();
            } catch (error) {
                const message = error.message.includes('Failed to fetch')
                    ? 'Could not connect to the server. Start the app with npm start and reload this page.'
                    : error.message || 'Unable to send the request.';
                statusBox.textContent = message;
                statusBox.className = 'form-status error';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Request a Free Consultation';
            }
        });
    }

    if (loader) {
        window.addEventListener("load", () => {
            loader.classList.add("hidden");
            setTimeout(() => loader.remove(), 500);
        });
    }
});