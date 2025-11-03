document.addEventListener('DOMContentLoaded', () => {
  const background = document.querySelector('.background');
  if (!background) return;

  const numCircles = 2;

  const colors = [
    'rgba(141, 93, 255, 0.5)',
    '#68afff'
  ];

  for (let i = 0; i < numCircles; i++) {
    const circle = document.createElement('div');
    circle.classList.add('circle');

    const size = Math.random() * 100 + 70;
    const x = (Math.random() * 150) + 30;
    const y = (Math.random() * 150) + 30;
    const scale = Math.random() * 0.2 + 1.2;

    const delay = Math.random() * 2;
    const duration = Math.random() * 10 + 15;
    const color = colors[Math.floor(Math.random() * colors.length)];

    circle.style.setProperty('--x', `${x}%`);
    circle.style.setProperty('--y', `${y}%`);
    circle.style.setProperty('--scale', scale);

    circle.style.width = `${size}px`;
    circle.style.height = `${size}px`;
    circle.style.animationDelay = `${delay}s`;
    circle.style.animationDuration = `${duration}s`;
    circle.style.background = `radial-gradient(circle, ${color}, transparent 70%)`;

    background.appendChild(circle);
  }
});
