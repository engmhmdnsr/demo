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
       2. SCROLL PROGRESS BAR
    ───────────────────────────────────────────── */
    $('body').prepend('<div id="scroll-progress-bar"></div>');
    $(window).scroll(function () {
        var scrollTop = $(this).scrollTop();
        var docHeight = $(document).height() - $(window).height();
        var progress = (scrollTop / docHeight) * 100;
        $('#scroll-progress-bar').css('width', progress + '%');
    });


    /* ─────────────────────────────────────────────
       3. WOW.JS INIT
    ───────────────────────────────────────────── */
    new WOW().init();


    /* ─────────────────────────────────────────────
       4. NAVBAR — transparent on scroll
    ───────────────────────────────────────────── */
    $(window).scroll(function () {
        if ($(this).scrollTop() > 30) {
            $('.sh-navbar').addClass('navbar-scrolled');
        } else {
            $('.sh-navbar').removeClass('navbar-scrolled');
        }
    });

    /* ─────────────────────────────────────────────
       5. INTERSECTION OBSERVER — REVEAL ON SCROLL
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
        }, { threshold: 0.05 });

        document.querySelectorAll('.service-img img, .about img, .project-item img').forEach(function (img) {
            img.classList.add('img-fade');
            imgObserver.observe(img);
        });
    }


    /* ─────────────────────────────────────────────
       7. 3D TILT ON SERVICE CARDS
    ───────────────────────────────────────────── */
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


    /* ─────────────────────────────────────────────
       8. ACHIEVEMENT GLOW FOLLOW MOUSE
    ───────────────────────────────────────────── */
    document.querySelectorAll('.achievement-item').forEach(function (item) {
        item.addEventListener('mousemove', function (e) {
            var rect = item.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            item.style.setProperty('--glow-x', x + 'px');
            item.style.setProperty('--glow-y', y + 'px');
        });
    });


    /* ─────────────────────────────────────────────
       9. ANIMATED COUNTER (easeOutCubic)
    ───────────────────────────────────────────── */
    function animateCounters() {
        $('.counter').each(function () {
            var $this = $(this);
            var target = parseInt($this.data('target'));
            var startTime = null;
            var duration = 2500;

            function easeOutCubic(t) {
                return 1 - Math.pow(1 - t, 3);
            }

            function animate(timestamp) {
                if (!startTime) startTime = timestamp;
                var progress = Math.min((timestamp - startTime) / duration, 1);
                $this.text(Math.floor(easeOutCubic(progress) * target));
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    $this.text(target);
                }
            }
            requestAnimationFrame(animate);
        });
    }

    function resetCounters() {
        $('.counter').each(function () {
            $(this).text('0');
        });
    }

    var achievementsEl = document.querySelector('.achievements');
    if (achievementsEl) {
        var counterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-numbers');
                    resetCounters();
                    animateCounters();
                } else {
                    entry.target.classList.remove('animate-numbers');
                    resetCounters();
                }
            });
        }, { threshold: 0.3 });
        counterObserver.observe(achievementsEl);
    }


    /* ─────────────────────────────────────────────
       10. MODAL VIDEO
    ───────────────────────────────────────────── */
    $(document).ready(function () {
        var $videoSrc;
        $('.btn-play').click(function () {
            $videoSrc = $(this).data('src');
        });
        $('#videoModal').on('shown.bs.modal', function () {
            $('#video').attr('src', $videoSrc + '?autoplay=1&amp;modestbranding=1&amp;showinfo=0');
        });
        $('#videoModal').on('hide.bs.modal', function () {
            $('#video').attr('src', $videoSrc);
        });
    });


    /* ─────────────────────────────────────────────
       11. TESTIMONIAL CAROUSEL
    ───────────────────────────────────────────── */
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        center: true,
        dots: true,
        loop: true,
        margin: 25,
        nav: true,
        navText: [
            '<i class="bi bi-arrow-left"></i>',
            '<i class="bi bi-arrow-right"></i>'
        ],
        responsiveClass: true,
        responsive: {
            0: { items: 1 },
            576: { items: 1 },
            768: { items: 1 },
            992: { items: 1 },
            1200: { items: 1 }
        }
    });


    /* ─────────────────────────────────────────────
       12. MARQUEE NAV BUTTONS
    ───────────────────────────────────────────── */
    $('.project-prev, .partner-prev').click(function () {
        var wrapper = $(this).closest('.marquee-wrapper');
        var track = wrapper.find('.marquee-track')[0];
        track.style.animationPlayState = 'paused';
        var matrix = new DOMMatrix(getComputedStyle(track).transform);
        track.style.transform = 'translateX(' + (matrix.m41 + 200) + 'px)';
    });

    $('.project-next, .partner-next').click(function () {
        var wrapper = $(this).closest('.marquee-wrapper');
        var track = wrapper.find('.marquee-track')[0];
        track.style.animationPlayState = 'paused';
        var matrix = new DOMMatrix(getComputedStyle(track).transform);
        track.style.transform = 'translateX(' + (matrix.m41 - 200) + 'px)';
    });

    $('.marquee-btn').on('click', function () {
        var track = $(this).closest('.marquee-wrapper').find('.marquee-track')[0];
        setTimeout(function () {
            track.style.transform = '';
            track.style.animationPlayState = 'running';
        }, 2000);
    });


    /* ─────────────────────────────────────────────
       13. BACK TO TOP
    ───────────────────────────────────────────── */
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({ scrollTop: 0 }, 1500, 'easeInOutExpo');
        return false;
    });


    /* ─────────────────────────────────────────────
       14. NAVBAR LOGO PULSE ON LOAD
    ───────────────────────────────────────────── */
    setTimeout(function () {
        $('.navbar-brand').addClass('logo-pulse');
        setTimeout(function () { $('.navbar-brand').removeClass('logo-pulse'); }, 900);
    }, 900);


    /* ─────────────────────────────────────────────
       17. SECTION PARALLAX SHIFT (subtle)
    ───────────────────────────────────────────── */
    $(window).on('scroll.parallax', function () {
        var scrollY = $(this).scrollTop();
        $('.bg-breadcrumb').css('background-position-y', 'calc(50% + ' + (scrollY * 0.3) + 'px)');
    });

    /* ─────────────────────────────────────────────
       Nested Submenu Hover
    ───────────────────────────────────────────── */
    $('.dropdown-submenu').on('mouseenter', function () {
        $(this).addClass('show-menu');
    }).on('mouseleave', function () {
        $(this).removeClass('show-menu');
    });

})(jQuery);
