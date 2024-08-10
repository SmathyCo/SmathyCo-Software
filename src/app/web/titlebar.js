document.querySelector('.minimize').addEventListener('click', () => {
    window.api.minimizeWindow();
});

document.querySelector('.maximize').addEventListener('click', () => {
    window.api.toggleMaximizeWindow();
});

document.querySelector('.close').addEventListener('click', () => {
    window.api.closeWindow();
});