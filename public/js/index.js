window.addEventListener('DOMContentLoaded', () => {
    const body = document.body; // select the body element
    if (localStorage.getItem('darkmode') === 'enabled') {
        body.classList.add('dark-mode');
    }
});
/* Search logic moved to searchbar.js */


/* Grid loading logic moved to grid.js */

/* resizeMasonry moved to grid.js */
