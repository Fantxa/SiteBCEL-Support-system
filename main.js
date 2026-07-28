// ============================
// Sliding navigation
// ============================
const navMenu = document.getElementById('nav-menu');
const navHandle = document.getElementById('nav-handle');

function openNav() {
    navHandle.setAttribute('aria-expanded', 'true');
}
function closeNav() {
    navHandle.setAttribute('aria-expanded', 'false');
}

navMenu.addEventListener('mouseenter', openNav);
navMenu.addEventListener('mouseleave', closeNav);

// Keyboard users: clicking the handle toggles the menu too
navHandle.addEventListener('click', () => {
    const isOpen = navHandle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeNav() : openNav();
    navMenu.style.transform = isOpen ? '' : 'translateX(0)';
});

// ============================
// Difficulty selector
// ============================
const difficultyOptions = document.querySelectorAll('.difficulty-option');
const glider = document.querySelector('.difficulty-glider');
const readout = document.getElementById('difficulty-readout');

const levelIndex = { easy: 0, medium: 1, hard: 2 };

difficultyOptions.forEach((option) => {
    option.addEventListener('click', () => {
        difficultyOptions.forEach((btn) => btn.classList.remove('active'));
        option.classList.add('active');

        const level = option.dataset.level;
        glider.style.transform = `translateX(${levelIndex[level] * 100}%)`;
        readout.textContent = option.dataset.readout;
    });
});