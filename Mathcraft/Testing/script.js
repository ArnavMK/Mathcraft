// Add this to your script.js
const particleCanvas = document.createElement('canvas');
document.body.appendChild(particleCanvas);
const particleCtx = particleCanvas.getContext('2d');
particleCanvas.width = window.innerWidth;
particleCanvas.height = window.innerHeight;
particleCanvas.style.position = 'absolute';
particleCanvas.style.top = '0';
particleCanvas.style.left = '0';
particleCanvas.style.zIndex = '-1'; // Behind the graph canvas

const particles = [];
const numParticles = 100;

class Particle {
  constructor() {
    this.x = Math.random() * particleCanvas.width;
    this.y = Math.random() * particleCanvas.height;
    this.size = Math.random() * 3 + 1;
    this.speedX = Math.random() * 2 - 1;
    this.speedY = Math.random() * 2 - 1;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x > particleCanvas.width || this.x < 0) this.speedX *= -1;
    if (this.y > particleCanvas.height || this.y < 0) this.speedY *= -1;
  }

  draw() {
    particleCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    particleCtx.beginPath();
    particleCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    particleCtx.fill();
  }
}

for (let i = 0; i < numParticles; i++) {
  particles.push(new Particle());
}

function animateParticles() {
  particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
  particles.forEach(particle => {
    particle.update();
    particle.draw();
  });
  requestAnimationFrame(animateParticles);
}

animateParticles();