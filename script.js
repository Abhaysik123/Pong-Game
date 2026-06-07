// Canvas and context setup
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleHeight = 80;
const paddleWidth = 15;
const ballSize = 8;

// Player paddle (left)
const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    maxSpeed: 6
};

// Computer paddle (right)
const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    maxSpeed: 4.5
};

// Ball object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 5,
    dy: 5,
    radius: ballSize,
    maxSpeed: 8
};

// Score tracking
let playerScore = 0;
let computerScore = 0;

// Keyboard controls
const keys = {
    ArrowUp: false,
    ArrowDown: false
};

// Mouse control
let mouseY = canvas.height / 2;

// Event listeners for keyboard
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') keys.ArrowUp = true;
    if (e.key === 'ArrowDown') keys.ArrowDown = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') keys.ArrowUp = false;
    if (e.key === 'ArrowDown') keys.ArrowDown = false;
});

// Event listener for mouse
document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Update player paddle position
function updatePlayer() {
    // Arrow key control
    if (keys.ArrowUp && player.y > 0) {
        player.y -= player.maxSpeed;
    }
    if (keys.ArrowDown && player.y < canvas.height - player.height) {
        player.y += player.maxSpeed;
    }

    // Mouse control
    if (mouseY > 0 && mouseY < canvas.height) {
        const centerY = player.y + player.height / 2;
        const distance = mouseY - centerY;
        
        if (Math.abs(distance) > 10) {
            if (distance > 0 && player.y < canvas.height - player.height) {
                player.y += Math.min(player.maxSpeed, distance);
            } else if (distance < 0 && player.y > 0) {
                player.y += Math.max(-player.maxSpeed, distance);
            }
        }
    }

    // Keep paddle in bounds
    player.y = Math.max(0, Math.min(player.y, canvas.height - player.height));
}

// Update computer paddle position (AI)
function updateComputer() {
    const computerCenterY = computer.y + computer.height / 2;
    const distance = ball.y - computerCenterY;

    // Simple AI: follow the ball with some prediction
    if (distance > 35) {
        computer.y += computer.maxSpeed;
    } else if (distance < -35) {
        computer.y -= computer.maxSpeed;
    }

    // Keep paddle in bounds
    computer.y = Math.max(0, Math.min(computer.y, canvas.height - computer.height));
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.dy = -ball.dy;
    }
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.dy = -ball.dy;
    }

    // Ball collision with paddles
    // Player paddle collision
    if (
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height &&
        ball.dx < 0
    ) {
        ball.x = player.x + player.width + ball.radius;
        ball.dx = -ball.dx;

        // Add spin based on where ball hits paddle
        const deltaY = ball.y - (player.y + player.height / 2);
        ball.dy = (deltaY / (player.height / 2)) * 4;

        // Increase speed slightly
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        if (speed < ball.maxSpeed) {
            ball.dx *= 1.05;
            ball.dy *= 1.05;
        }
    }

    // Computer paddle collision
    if (
        ball.x + ball.radius > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height &&
        ball.dx > 0
    ) {
        ball.x = computer.x - ball.radius;
        ball.dx = -ball.dx;

        // Add spin based on where ball hits paddle
        const deltaY = ball.y - (computer.y + computer.height / 2);
        ball.dy = (deltaY / (computer.height / 2)) * 4;

        // Increase speed slightly
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        if (speed < ball.maxSpeed) {
            ball.dx *= 1.05;
            ball.dy *= 1.05;
        }
    }

    // Ball goes out of bounds - score point
    if (ball.x - ball.radius < 0) {
        computerScore++;
        resetBall();
    }
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        resetBall();
    }

    // Update score display
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;

    // Check for win condition
    if (playerScore >= 11 || computerScore >= 11) {
        endGame();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    
    // Random direction
    const angle = (Math.random() - 0.5) * Math.PI / 2;
    const speed = 5;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * speed * Math.cos(angle);
    ball.dy = speed * Math.sin(angle);
}

// End game function
function endGame() {
    const winner = playerScore >= 11 ? 'Player' : 'Computer';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#667eea';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${winner} Wins!`, canvas.width / 2, canvas.height / 2 - 40);
    
    ctx.font = '24px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Press F5 to play again', canvas.width / 2, canvas.height / 2 + 40);
    
    // Stop game loop
    return true;
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#667eea';
    ctx.shadowColor = 'rgba(102, 126, 234, 0.8)';
    ctx.shadowBlur = 10;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowColor = 'transparent';
}

function drawBall() {
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';
}

function drawNetLine() {
    ctx.strokeStyle = '#667eea';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw game elements
    drawNetLine();
    drawPaddle(player);
    drawPaddle(computer);
    drawBall();
}

// Game loop
let gameEnded = false;

function gameLoop() {
    if (!gameEnded) {
        updatePlayer();
        updateComputer();
        updateBall();
        draw();

        if (playerScore >= 11 || computerScore >= 11) {
            gameEnded = true;
            draw();
            endGame();
            return;
        }
    }

    requestAnimationFrame(gameLoop);
}

// Start the game
resetBall();
gameLoop();
