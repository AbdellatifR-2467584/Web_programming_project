window.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    if (localStorage.getItem('darkmode') === 'enabled') {
        body.classList.add('dark-mode');
    }
});
