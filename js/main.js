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
        8. SERVICES MARQUEE — rAF-driven, seamless loop
     ───────────────────────────────────────────── */

    /**
     * Initialise a JS-driven infinite marquee on .services-track elements.
     * Replaces the old CSS-animation approach so we can:
     *   • Pause/resume from exact pixel position on hover
     *   • Nudge left/right smoothly with arrows without ever resetting to zero
     *   • Loop seamlessly (track contains duplicated items, so at half-width we snap back silently)
     */
    function initServicesMarquee(wrapper) {
        var clip  = wrapper.querySelector('.marquee-clip');
        var track = wrapper.querySelector('.services-track');
        if (!clip || !track) return;

        // Force disable CSS animation so JS can control transform
        track.style.setProperty('animation', 'none', 'important');

        // Speed in px/s
        var BASE_SPEED = 80;

        // State
        var offset   = 0;      // current translateX offset (positive = scrolled left)
        var isHovered= false;
        var manualDir= 0;      // -1 for left arrow, 1 for right arrow, 0 for none
        var lastTime = null;
        var halfW    = 0;      
        var rafId    = null;

        // Touch Drag State
        var isDragging = false;
        var dragLastX  = 0;

        function getHalfW() {
            // Items are duplicated, so half the scrollWidth = one full set
            return track.scrollWidth / 2;
        }

        function applyOffset() {
            track.style.transform = 'translateX(' + (-offset) + 'px)';
        }

        function tick(ts) {
            rafId = requestAnimationFrame(tick);
            if (lastTime === null) { lastTime = ts; }
            var dt = (ts - lastTime) / 1000;  // seconds
            lastTime = ts;

            var currentSpeed = 0;
            
            if (manualDir !== 0) {
                // If arrow is held, move fast (e.g. 800 px/sec)
                currentSpeed = manualDir * 800;
            } else if (!isHovered) {
                // Normal auto-play
                currentSpeed = BASE_SPEED;
            }

            if (currentSpeed !== 0) {
                halfW = getHalfW();
                offset += currentSpeed * dt;

                // Seamless loop logic: when we've scrolled one full set, snap back silently
                if (halfW > 0) {
                    if (offset >= halfW) {
                        offset -= halfW;
                    } else if (offset < 0) {
                        offset += halfW;
                    }
                }

                applyOffset();
            }
        }

        // Start
        rafId = requestAnimationFrame(tick);

        // ── Hover pause ──
        wrapper.addEventListener('mouseenter', function () {
            isHovered = true;
        });
        wrapper.addEventListener('mouseleave', function () {
            isHovered = false;
            manualDir = 0; // Release manual scroll if mouse leaves wrapper entirely
        });

        // ── Touch Drag ──
        track.addEventListener('touchstart', function(e) {
            isDragging = true;
            isHovered = true; // Pause auto-play
            dragLastX = e.touches[0].clientX;
        }, {passive: true});

        track.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            var currentX = e.touches[0].clientX;
            var diff = currentX - dragLastX;
            dragLastX = currentX;

            // diff > 0 means finger moved right -> track should move right -> offset decreases
            offset -= diff;

            halfW = getHalfW();
            if (halfW > 0) {
                if (offset >= halfW) offset -= halfW;
                else if (offset < 0) offset += halfW;
            }
            applyOffset();
        }, {passive: true});

        track.addEventListener('touchend', function() {
            isDragging = false;
            isHovered = false; // Resume auto-play
        });
        track.addEventListener('touchcancel', function() {
            isDragging = false;
            isHovered = false;
        });

        // ── Expose manual direction control ──
        wrapper._setManualDir = function(dir) {
            manualDir = dir;
        };
    }

    // Boot all services wrappers
    document.querySelectorAll('.services-wrapper').forEach(function (wrapper) {
        initServicesMarquee(wrapper);
    });

    // ── Service arrow buttons ──
    document.querySelectorAll('.service-arrow-left').forEach(function (btn) {
        var wrapper = btn.closest('.marquee-wrapper');
        
        function start() { if (wrapper && wrapper._setManualDir) wrapper._setManualDir(-1); }
        function stop()  { if (wrapper && wrapper._setManualDir) wrapper._setManualDir(0); }

        btn.addEventListener('pointerdown', function (e) { e.preventDefault(); start(); });
        btn.addEventListener('pointerup',     stop);
        btn.addEventListener('pointercancel', stop);
        btn.addEventListener('mouseleave',    stop);
    });

    document.querySelectorAll('.service-arrow-right').forEach(function (btn) {
        var wrapper = btn.closest('.marquee-wrapper');
        
        function start() { if (wrapper && wrapper._setManualDir) wrapper._setManualDir(1); }
        function stop()  { if (wrapper && wrapper._setManualDir) wrapper._setManualDir(0); }

        btn.addEventListener('pointerdown', function (e) { e.preventDefault(); start(); });
        btn.addEventListener('pointerup',     stop);
        btn.addEventListener('pointercancel', stop);
        btn.addEventListener('mouseleave',    stop);
    });

    // Fallback stop
    document.addEventListener('pointerup', function() {
        document.querySelectorAll('.services-wrapper').forEach(function(wrapper) {
            if (wrapper._setManualDir) wrapper._setManualDir(0);
        });
    });
    document.addEventListener('touchend', function() {
        document.querySelectorAll('.services-wrapper').forEach(function(wrapper) {
            if (wrapper._setManualDir) wrapper._setManualDir(0);
        });
    });

    // ── Project / Partner marquee arrows (CSS-animation based, unchanged) ──
    function moveMarquee(btn, direction) {
        var wrapper = $(btn).closest('.marquee-wrapper');
        var track   = wrapper.find('.marquee-track:not(.services-track)')[0];
        if (!track) return;
        var clip    = wrapper.find('.marquee-clip')[0];
        var item    = track.querySelector('.project-item, .partner-item, .client-item');
        var step    = item ? item.getBoundingClientRect().width + 20 : 300;
        var maxOff  = Math.max(0, track.scrollWidth - (clip ? clip.clientWidth : 0));
        var current = parseFloat(track.dataset.offset || '0');
        var next    = current + direction * step;
        var wrapped = false;
        if (next < 0)       { next = maxOff; wrapped = true; }
        else if (next > maxOff) { next = 0;  wrapped = true; }
        track.classList.add('is-manual');
        track.classList.toggle('loop-reset', wrapped);
        track.style.transform = 'translateX(' + (-next) + 'px)';
        track.dataset.offset  = String(next);
        if (wrapped) { setTimeout(function () { track.classList.remove('loop-reset'); }, 30); }
        clearTimeout(track._resume);
        track._resume = setTimeout(function () {
            track.classList.remove('is-manual', 'loop-reset');
            track.style.transform = '';
            track.dataset.offset  = '0';
            track.style.animationPlayState = '';
        }, 3500);
    }

    $('.project-prev, .partner-prev').on('click', function (e) { e.preventDefault(); moveMarquee(this, -1); });
    $('.project-next, .partner-next').on('click', function (e) { e.preventDefault(); moveMarquee(this,  1); });

    // Hover pause for NON-services marquees (CSS-animation based)
    $('.marquee-wrapper:not(.services-wrapper)').on('mouseenter', function () {
        var track = $(this).find('.marquee-track')[0];
        if (track && !track.classList.contains('is-manual')) track.style.animationPlayState = 'paused';
    }).on('mouseleave', function () {
        var track = $(this).find('.marquee-track')[0];
        if (track && !track.classList.contains('is-manual')) track.style.animationPlayState = '';
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

    /* ─────────────────────────────────────────────
       12. OFFCANVAS MENU SPLIT CLICK
    ───────────────────────────────────────────── */
    $('.sh-offcanvas-dropdown > a.sh-offcanvas-link, .sh-offcanvas-subgroup > a.sh-offcanvas-sublink').each(function() {
        var $el = $(this);
        
        // Remove inline onclick handler to prevent it from firing automatically
        $el.removeAttr('onclick');
        $el.prop('onclick', null);
        
        // Ensure "About" links go to about.html instead of "#"
        if ($el.attr('href') === '#') {
            var txt = $el.text().trim();
            if (txt.indexOf('About') === 0) {
                $el.attr('href', 'about.html');
            }
        }
        
        // Wrap the text node in a span so we can detect clicks specifically on the text
        $el.contents().filter(function() {
            return this.nodeType === 3 && this.nodeValue.trim().length > 0;
        }).wrap('<span class="nav-text-target" style="padding-right: 15px; cursor: pointer;"></span>');
        
        // Handle click
        $el.on('click', function(e) {
            var $target = $(e.target);
            
            // If the user clicked the text span, let the browser follow the link naturally
            if ($target.closest('.nav-text-target').length > 0) {
                return true;
            }
            
            // Otherwise (they clicked the chevron or the empty space), prevent navigation and toggle
            e.preventDefault();
            if ($el.hasClass('sh-offcanvas-link')) {
                $el.siblings('.sh-offcanvas-submenu').toggleClass('open');
            } else {
                $el.siblings('.sh-offcanvas-subsub').toggleClass('open');
            }
        });
    });

})(jQuery);
