document.addEventListener('DOMContentLoaded', function() {
    const bookElement = document.getElementById('book');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageNum = document.getElementById('pageNum');
    const pageTotal = document.getElementById('pageTotal');

    let bookWidth = 450;
    let bookHeight = 600;

    if (window.innerWidth < 992) {
        bookWidth = 380;
        bookHeight = 550;
    }
    if (window.innerWidth < 768) {
        bookWidth = 320;
        bookHeight = 480;
    }

    const allPages = document.querySelectorAll('.page');
    pageTotal.textContent = allPages.length;

    const pageFlip = new St.PageFlip(bookElement, {
        width: bookWidth,
        height: bookHeight,
        size: "fixed",
        minWidth: 300,
        maxWidth: 600,
        minHeight: 400,
        maxHeight: 800,
        maxShadowOpacity: 0.5,
        showCover: true,
        mobileScrollSupport: false
    });

    pageFlip.loadFromHTML(allPages);

    pageFlip.on('flip', (e) => {
        pageNum.textContent = e.data + 1;
    });

    prevBtn.addEventListener('click', () => {
        pageFlip.flipPrev();
    });

    nextBtn.addEventListener('click', () => {
        pageFlip.flipNext();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') pageFlip.flipPrev();
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') pageFlip.flipNext();
    });
});
