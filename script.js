let projects = [];
let currentProject = null;

document.getElementById('add-project-btn').addEventListener('click', () => {
    document.getElementById('add-project-modal').style.display = 'flex';
    document.getElementById('error-message').innerText = '';
});

document.getElementById('next-btn').addEventListener('click', () => {
    let projectName = document.getElementById('project-name').value.trim();
    if (!projectName) {
        projectName = `Project${projects.length + 1}`;
        while (projects.some(project => project.name === projectName)) {
            projectName = `Project${projects.length + 1}`;
        }
    }
    if (projectName && !projects.some(project => project.name === projectName)) {
        currentProject = { name: projectName, price: 0, defaultPrice: 0, timestamp: Date.now() };
        document.getElementById('add-project-modal').style.display = 'none';
        document.getElementById('set-price-modal').style.display = 'flex';
    } else {
        document.getElementById('error-message').innerText = 'Project name must be unique.';
    }
});

document.getElementById('save-btn').addEventListener('click', () => {
    const projectPrice = parseFloat(document.getElementById('project-price').value);
    if (!isNaN(projectPrice)) {
        currentProject.price = projectPrice;
        currentProject.defaultPrice = projectPrice;
        projects.push(currentProject);
        currentProject = null;
        updateProjectList();
        document.getElementById('set-price-modal').style.display = 'none';
    }
});

document.getElementById('settings-btn').addEventListener('click', () => {
    document.getElementById('settings-modal').style.display = 'flex';
});

document.getElementById('settings-exit-btn').addEventListener('click', () => {
    document.getElementById('settings-modal').style.display = 'none';
});

document.getElementById('theme-switch').addEventListener('change', (event) => {
    if (event.target.checked) {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
    }
});

function updateProjectList() {
    const container = document.getElementById('projects-container');
    container.innerHTML = '';
    projects.forEach((project, index) => {
        const projectElement = document.createElement('div');
        projectElement.className = 'project';
        const elapsedTime = getElapsedTime(project.timestamp);
        const priceClass = project.price > project.defaultPrice ? 'price-increase' :
                           project.price < project.defaultPrice ? 'price-decrease' : 'price-default';
        const triangleClass = project.price > project.defaultPrice ? 'triangle-up' :
                              project.price < project.defaultPrice ? 'triangle-down' : '';
        projectElement.innerHTML = `
            <span>${project.name}</span>
            <span class="price-wrapper ${priceClass}">${project.price}€ <div class="${triangleClass}"></div></span>
            <span>${elapsedTime}</span>
            <button class="edit-button" onclick="editProjectName(${index})">&#9998;</button>
        `;
        projectElement.addEventListener('click', () => openBuyModal(index));
        container.appendChild(projectElement);
    });
}

function openBuyModal(index) {
    const project = projects[index];
    currentProject = index;
    document.getElementById('buy-project-name').innerText = project.name;
    document.getElementById('current-price').innerText = `${project.price}€`;
    document.getElementById('default-price').innerText = `Default price: ${project.defaultPrice}€`;
    document.getElementById('buy-modal').style.display = 'flex';
}

document.getElementById('bought-btn').addEventListener('click', () => {
    projects[currentProject].price += 0.5;
    document.getElementById('current-price').innerText = `${projects[currentProject].price}€`;
});

document.getElementById('delete-btn').addEventListener('click', () => {
    document.getElementById('confirm-delete-modal').style.display = 'flex';
});

document.getElementById('confirm-delete-yes').addEventListener('click', () => {
    projects.splice(currentProject, 1);
    document.getElementById('buy-modal').style.display = 'none';
    document.getElementById('confirm-delete-modal').style.display = 'none';
    updateProjectList();
});

document.getElementById('confirm-delete-no').addEventListener('click', () => {
    document.getElementById('confirm-delete-modal').style.display = 'none';
});

document.getElementById('exit-btn').addEventListener('click', () => {
    document.getElementById('buy-modal').style.display = 'none';
    updateProjectList();
});

function editProjectName(index) {
    currentProject = index;
    document.getElementById('edit-project-name').value = projects[index].name;
    document.getElementById('edit-error-message').innerText = '';
    document.getElementById('edit-name-modal').style.display = 'flex';
}

document.getElementById('save-name-btn').addEventListener('click', () => {
    const newName = document.getElementById('edit-project-name').value.trim();
    if (newName && !projects.some(project => project.name === newName)) {
        projects[currentProject].name = newName;
        updateProjectList();
        document.getElementById('edit-name-modal').style.display = 'none';
    } else if (newName === projects[currentProject].name) {
        // If the name hasn't changed, just close the modal
        document.getElementById('edit-name-modal').style.display = 'none';
    } else {
        document.getElementById('edit-error-message').innerText = 'Project name must be unique and not empty.';
    }
});

function updatePrices() {
    const now = Date.now();
    projects.forEach(project => {
        const elapsedDays = Math.floor((now - project.timestamp) / (24 * 60 * 60 * 1000));
        if (elapsedDays >= 7 && elapsedDays < 12) {
            // Second week: Decrease by 0.25 euros per day for 5 days
            project.price = Math.max(1, project.price - 0.25);
        } else if (elapsedDays >= 12) {
            // Subsequent weeks: Decrease by 1 euro per week
            const weeks = Math.floor((elapsedDays - 12) / 7);
            project.price = Math.max(1, project.price - 1 * weeks);
        }
    });
    updateProjectList();
}

function getElapsedTime(timestamp) {
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - timestamp) / 1000);
    if (elapsedSeconds < 60) {
        return `${elapsedSeconds} seconds ago`;
    }
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    if (elapsedMinutes < 60) {
        return `${elapsedMinutes} minutes ago`;
    }
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    if (elapsedHours < 24) {
        return `${elapsedHours} hours ago`;
    }
    const elapsedDays = Math.floor(elapsedHours / 24);
    return `${elapsedDays} days ago`;
}

setInterval(updatePrices, 24 * 60 * 60 * 1000); // Run updatePrices every day
setInterval(updateProjectList, 1000); // Update the project list every second to show elapsed time
