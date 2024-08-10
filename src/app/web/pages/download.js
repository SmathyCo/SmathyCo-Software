document.getElementById('playButton').addEventListener('click', () => {
    window.api.playGame().then(() => {
      console.log('Play function executed.');
    }).catch(error => {
      console.error(`Error: ${error}`);
    });
});

window.api.on('uninstall', (event, text) => {
    const uni = document.getElementById('uninstall');
    if (uni) {
        uni.innerHTML = text;
    } else {
        console.error('Button not found.');
    }
});

window.api.unir('uninstallrm', (event) => {
    const uni = document.getElementById('uninstall');
    if (uni) {
        uni.remove();
    } else {
        console.error('Button not found.');
    }
});

document.getElementById('uninstall').addEventListener('click', () => {
    window.api.uninstallClick().then(() => {
        console.log('Uninstall function executed.');
    }).catch(error => {
        console.error(`Error: ${error}`);
    })
});

window.api.onUpdateButtonText((event, text) => {
    const button = document.getElementById('playButton');
    if (button) {
        button.textContent = text;
    } else {
        console.error('Button not found.');
    }
});