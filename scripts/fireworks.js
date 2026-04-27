const canvas = document.createElement('canvas');
canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999;';
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const colors = ['#ff4444','#ff8800','#ffdd00','#ff66aa','#ffffff','#ff6600','#66aaff'];

function Particle(x, y, vx, vy, color, life) {
    return { x, y, vx, vy, color, life, maxLife: life, size: Math.random() * 3 + 1 };
}

function explode(x, y) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < 100; i++) {
        const angle = (Math.PI * 2 * i) / 100 + (Math.random() - 0.5) * 0.3;
        const speed = Math.random() * 6 + 2;
        particles.push(Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 60 + Math.random() * 40));
    }
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        particles.push(Particle(x, y, Math.cos(angle) * Math.random() * 2, Math.sin(angle) * Math.random() * 2, '#ffffff', 30 + Math.random() * 20));
    }
}

function draw() {
    if (particles.length > 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.vx *= 0.98;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
}

draw();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

function detonateFireworks() {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const x = window.innerWidth * (0.1 + Math.random() * 0.8);
            const y = window.innerHeight * (0.1 + Math.random() * 0.6);
            explode(x, y);
        }, i * 200 + Math.random() * 100);
    }
}