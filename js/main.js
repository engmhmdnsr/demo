(function ($) {
    "use strict";

    /* ─────────────────────────────────────────────
       1. SPINNER — remove immediately using vanilla JS
    ───────────────────────────────────────────── */
    (function removeSpinner(){
        var spinner = document.getElementById('spinner');
        if (spinner) spinner.classList.remove('show');
    })();


    /* ─────────────────────────────────────────────
       2. UNIFIED SCROLL HANDLER (debounced, passive)
       Replaces 3 separate scroll listeners for better performance
    ───────────────────────────────────────────── */
    var _scrollRaf = null;

    function onScroll() {
        // Scroll Progress Bar
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        var bar = document.getElementById('scroll-progress-bar');
        if (bar) bar.style.width = progress + '%';

        // Navbar scroll state
        if (scrollTop > 30) {
            document.querySelector('.sh-navbar') && document.querySelector('.sh-navbar').classList.add('navbar-scrolled');
        } else {
            document.querySelector('.sh-navbar') && document.querySelector('.sh-navbar').classList.remove('navbar-scrolled');
        }

        // Back to Top button
        var btt = document.querySelector('.back-to-top');
        if (btt) {
            btt.style.display = scrollTop > 300 ? 'flex' : 'none';
        }

        // Parallax shift for breadcrumb
        var breadcrumb = document.querySelector('.bg-breadcrumb');
        if (breadcrumb) {
            breadcrumb.style.backgroundPositionY = 'calc(50% + ' + (scrollTop * 0.3) + 'px)';
        }

        _scrollRaf = null;
    }

    // Scroll progress bar element
    var progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress-bar';
    document.body.prepend(progressBar);

    window.addEventListener('scroll', function() {
        if (!_scrollRaf) {
            _scrollRaf = requestAnimationFrame(onScroll);
        }
    }, { passive: true });


    /* ─────────────────────────────────────────────
       3. WOW.JS INIT
    ───────────────────────────────────────────── */
    new WOW().init();


    /* ─────────────────────────────────────────────
       4. INTERSECTION OBSERVER — REVEAL ON SCROLL
    ───────────────────────────────────────────── */
    if ('IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll(
            '.service-item, .achievement-item, .footer-item, .feature-item'
        ).forEach(function (el) {
            el.classList.add('reveal-on-scroll');
            revealObserver.observe(el);
        });

        /* Section title animated lines */
        var titleObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('title-animate');
                    titleObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        document.querySelectorAll('.section-title, .sub-style').forEach(function (el) {
            titleObserver.observe(el);
        });

        /* Image lazy fade-in */
        var imgObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('img-loaded');
                    imgObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.05, rootMargin: '200px 0px' });

        document.querySelectorAll('.service-img img, .about img, .project-item img').forEach(function (img) {
            img.classList.add('img-fade');
            imgObserver.observe(img);
        });
    }


    /* ─────────────────────────────────────────────
       5. 3D TILT ON SERVICE CARDS
    ───────────────────────────────────────────── */
    // Only enable on non-touch devices
    if (!('ontouchstart' in window)) {
        document.querySelectorAll('.service-item').forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                var rect = card.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;
                var centerX = rect.width / 2;
                var centerY = rect.height / 2;
                var rotateX = ((y - centerY) / centerY) * -5;
                var rotateY = ((x - centerX) / centerX) * 5;
                card.style.transform = 'perspective(900px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-6px)';
                card.style.transition = 'transform 0.1s ease';
            });
            card.addEventListener('mouseleave', function () {
                card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateY(0)';
                card.style.transition = 'transform 0.5s ease';
            });
        });
    }


    /* ─────────────────────────────────────────────
       6. ACHIEVEMENT GLOW FOLLOW MOUSE
    ───────────────────────────────────────────── */
    if (!('ontouchstart' in window)) {
        document.querySelectorAll('.achievement-item').forEach(function (item) {
            item.addEventListener('mousemove', function (e) {
                var rect = item.getBoundingClientRect();
                item.style.setProperty('--glow-x', (e.clientX - rect.left) + 'px');
                item.style.setProperty('--glow-y', (e.clientY - rect.top) + 'px');
            });
        });
    }


    /* ─────────────────────────────────────────────
       7. ANIMATED COUNTER (easeOutCubic) — fires once
    ───────────────────────────────────────────── */
    function animateCounters() {
        document.querySelectorAll('.counter').forEach(function(el) {
            var target = parseInt(el.getAttribute('data-target'), 10);
            var startTime = null;
            var duration = 2500;

            function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

            function animate(timestamp) {
                if (!startTime) startTime = timestamp;
                var progress = Math.min((timestamp - startTime) / duration, 1);
                el.textContent = Math.floor(easeOutCubic(progress) * target);
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    el.textContent = target;
                }
            }
            requestAnimationFrame(animate);
        });
    }

    var achievementsEl = document.querySelector('.achievements');
    var counterFired = false;
    if (achievementsEl) {
        var counterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !counterFired) {
                    counterFired = true;
                    achievementsEl.classList.add('animate-numbers');
                    animateCounters();
                    counterObserver.disconnect(); // fire only once
                }
            });
        }, { threshold: 0.3 });
        counterObserver.observe(achievementsEl);
    }


    /* ─────────────────────────────────────────────
       8. MARQUEE NAV BUTTONS
    ───────────────────────────────────────────── */
    function moveServiceTrack(btn, direction) {
        var wrapper = $(btn).closest('.marquee-wrapper');
        var track = wrapper.find('.marquee-track')[0];
        if (!track) return;

        wrapper.removeClass('auto-run');
        var clip = wrapper.find('.marquee-clip')[0];
        var step = track.querySelector('.service-item') ? track.querySelector('.service-item').getBoundingClientRect().width + 20 : 340;
        var maxOffset = Math.max(0, track.scrollWidth - clip.clientWidth);
        var currentOffset = parseFloat(track.dataset.offset || '0');
        var nextOffset = currentOffset + (direction * step);
        var wrapped = false;

        if (nextOffset < 0) {
            nextOffset = maxOffset;
            wrapped = true;
        } else if (nextOffset > maxOffset) {
            nextOffset = 0;
            wrapped = true;
        }

        track.classList.add('is-manual');
        track.classList.toggle('loop-reset', wrapped);
        track.style.transform = 'translateX(' + (-nextOffset) + 'px)';
        track.dataset.offset = String(nextOffset);

        if (wrapped) {
            setTimeout(function () {
                track.classList.remove('loop-reset');
            }, 30);
        }
    }

    var serviceHoldTimer = null;
    var serviceHoldButton = null;
    var serviceHoldDirection = 0;
    var serviceResumeTimer = null;

    function startServiceHold(btn, direction) {
        if (serviceResumeTimer) { clearTimeout(serviceResumeTimer); serviceResumeTimer = null; }
        stopServiceHold();
        serviceHoldButton = btn;
        serviceHoldDirection = direction;
        moveServiceTrack(btn, direction);
        serviceHoldTimer = setInterval(function () {
            moveServiceTrack(serviceHoldButton, serviceHoldDirection);
        }, 220);
    }

    function stopServiceHold() {
        if (serviceHoldTimer) { clearInterval(serviceHoldTimer); serviceHoldTimer = null; }
        if (serviceResumeTimer) { clearTimeout(serviceResumeTimer); serviceResumeTimer = null; }
        serviceHoldButton = null;
        serviceHoldDirection = 0;
    }

    function resumeServiceAuto() {
        var wrapper = document.querySelector('.services-wrapper');
        var track = wrapper ? wrapper.querySelector('.services-track') : null;
        if (!track || !wrapper) return;
        track.classList.remove('is-manual', 'loop-reset');
        track.style.transform = '';
        track.dataset.offset = '0';
        wrapper.classList.add('auto-run');
        track.style.animationPlayState = 'running';
    }

    $('.service-arrow-left')
        .on('pointerdown mousedown touchstart', function (e) {
            e.preventDefault();
            startServiceHold(this, -1);
        })
        .on('pointerup pointercancel mouseleave touchend touchcancel', function () {
            stopServiceHold();
            serviceResumeTimer = setTimeout(resumeServiceAuto, 3000);
        });

    $('.service-arrow-right')
        .on('pointerdown mousedown touchstart', function (e) {
            e.preventDefault();
            startServiceHold(this, 1);
        })
        .on('pointerup pointercancel mouseleave touchend touchcancel', function () {
            stopServiceHold();
            serviceResumeTimer = setTimeout(resumeServiceAuto, 3000);
        });

    $(document).on('pointerup mouseup touchend touchcancel', function () {
        stopServiceHold();
        serviceResumeTimer = setTimeout(resumeServiceAuto, 3000);
    });

    function pauseMarquee(btn) {
        var wrapper = $(btn).closest('.marquee-wrapper');
        var track = wrapper.find('.marquee-track')[0];
        if (track) track.style.animationPlayState = 'paused';
    }

    function resumeMarquee(btn) {
        var wrapper = $(btn).closest('.marquee-wrapper');
        var track = wrapper.find('.marquee-track')[0];
        if (track) track.style.animationPlayState = 'running';
    }

    $('.project-prev, .project-next').on('mousedown touchstart', function () {
        pauseMarquee(this);
    }).on('mouseup mouseleave touchend touchcancel', function () {
        resumeMarquee(this);
    });


    /* ─────────────────────────────────────────────
       9. BACK TO TOP (smooth scroll via native)
    ───────────────────────────────────────────── */
    var bttBtn = document.querySelector('.back-to-top');
    if (bttBtn) {
        bttBtn.style.display = 'none';
        bttBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    /* ─────────────────────────────────────────────
       10. NAVBAR LOGO PULSE ON LOAD
    ───────────────────────────────────────────── */
    setTimeout(function () {
        var brand = document.querySelector('.navbar-brand');
        if (brand) {
            brand.classList.add('logo-pulse');
            setTimeout(function () { brand.classList.remove('logo-pulse'); }, 900);
        }
    }, 900);


    /* ─────────────────────────────────────────────
       11. Nested Submenu Hover
    ───────────────────────────────────────────── */
    $('.dropdown-submenu').on('mouseenter', function () {
        $(this).addClass('show-menu');
    }).on('mouseleave', function () {
        $(this).removeClass('show-menu');
    });

})(jQuery);
