window.addEventListener('DOMContentLoaded', () => {
    const darkmodeSwitch = document.getElementById('darkmodeSwitch');
    const body = document.body;

    if (localStorage.getItem('darkmode') === 'enabled') {
        body.classList.add('dark-mode');
    }

    darkmodeSwitch.addEventListener('click', () => {
        body.classList.toggle('dark-mode');

        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('darkmode', 'enabled');
        } else {
            localStorage.setItem('darkmode', 'disabled');
        }
    });
});
