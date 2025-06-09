const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const rathaImg = new Image();
rathaImg.src = 'ratha.png';

let speed = 0;
let isUnstable = false;
let pulling = false;
let pullStartTime = null;
let releaseTime = null;

let rathaX = 100;
let distance = 0;
const maxSpeed = 100;
const redZoneStart = 80;
const pullDurationToRed = 3000;
const maxDistance = 300;

function drawEverything() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawRatha();
  drawSpeedometer();
  drawPullButton();
  drawDistanceBar();
  if (isUnstable && speed >= 70) {
    drawTooFastWarning();
  }

  if (distance >= maxDistance) {
    drawGoalReached();
  }
}

function drawRatha() {
  if (rathaImg.complete) {
    const y = canvas.height - 250;
    ctx.save();
    if (isUnstable) {
      const shake = Math.sin(Date.now() / 100) * 5;
      ctx.translate(rathaX + shake, y);
    } else {
      ctx.translate(rathaX, y);
    }
    ctx.drawImage(rathaImg, 0, 0, 200, 200);
    ctx.restore();
  }
}

function drawSpeedometer() {
    const x = canvas.width - 250;
    const barX = x + 60;
    const barY = 20;
    const barWidth = 150;
    const barHeight = 20;
  
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "black";
    ctx.fillText("Speed", x, 30);
  
    // Draw segmented background
    ctx.fillStyle = "red";
    ctx.fillRect(barX, barY, barWidth * 0.2, barHeight); // 0–20
  
    ctx.fillStyle = "green";
    ctx.fillRect(barX + barWidth * 0.2, barY, barWidth * 0.5, barHeight); // 20–70
  
    ctx.fillStyle = "red";
    ctx.fillRect(barX + barWidth * 0.7, barY, barWidth * 0.3, barHeight); // 70–100
  
    // Draw current speed bar
    ctx.fillStyle = speed >= 70 || speed <= 20 ? "rgba(255,0,0,0.6)" : "rgba(0,255,0,0.6)";
    const clampedWidth = Math.min(speed / maxSpeed, 1) * barWidth;
    ctx.fillRect(barX, barY, clampedWidth, barHeight);
  }
  
  

function drawDistanceBar() {
  const barX = 20;
  const barY = canvas.height - 30;
  const barWidth = canvas.width - 40;
  const percent = Math.min(distance / maxDistance, 1);

  ctx.fillStyle = "#eee";
  ctx.fillRect(barX, barY, barWidth, 10);

  ctx.fillStyle = "green";
  ctx.fillRect(barX, barY, barWidth * percent, 10);
}

function drawPullButton() {
  ctx.fillStyle = "#000";
  ctx.fillRect(canvas.width - 120, canvas.height - 100, 100, 50);
  ctx.fillStyle = "#fff";
  ctx.font = "20px sans-serif";
  ctx.fillText("PULL", canvas.width - 95, canvas.height - 70);
}

function drawTooFastWarning() {
    ctx.font = "28px sans-serif";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText("⚠️ Too Fast! Slow down!", canvas.width / 2, canvas.height / 2 - 100);
  }
    

function drawGoalReached() {
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "48px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("🎉 Goal Reached! 🎉", canvas.width / 2, canvas.height / 2);
}

function update() {
  if (distance >= maxDistance) {
    drawEverything();
    return;
  }

  if (pulling && pullStartTime && !isUnstable) {
    const duration = Date.now() - pullStartTime;
    speed = Math.min((duration / pullDurationToRed) * maxSpeed, maxSpeed);
    if (speed >= redZoneStart) {
      isUnstable = true;
      releaseTime = null;
      ctx.fillText("⚠️ Too Fast! Slow down!", canvas.width / 2, canvas.height / 2 - 100);
      console.log("🚨 Ratha unstable! Release and wait 1 second.");
    }
  }

  if (isUnstable) {
    speed = redZoneStart;
    if (!pulling) {
      if (!releaseTime) {
        releaseTime = Date.now();
      } else if (Date.now() - releaseTime >= 1000) {
        isUnstable = false;
        speed = 0;
        pullStartTime = null;
        releaseTime = null;
        console.log("✅ Ratha stabilized. Pull again!");
      }
    } else {
      releaseTime = null;
    }
  } else {
    releaseTime = null;
  }

  if (!isUnstable && speed > 20 && speed < 70) {
    distance += speed * 0.01;
    rathaX = 100 + (distance / maxDistance) * (canvas.width - 300);
  }
  

  drawEverything();
  requestAnimationFrame(update);
}

function startPull() {
  if (!pulling) {
    pulling = true;
    if (!isUnstable) {
      pullStartTime = Date.now();
      speed = 0;
    }
  }
}

function stopPull() {
  pulling = false;
  pullStartTime = null;

  if (isUnstable) {
    console.log("🚨 Ratha unstable! Wait 1 sec after release.");
  } else {
    console.log("✅ Safe pull.");
    speed = 0;
  }
}

// Input Handling
canvas.addEventListener("mousedown", handlePress);
canvas.addEventListener("mouseup", handleRelease);
canvas.addEventListener("touchstart", handlePress);
canvas.addEventListener("touchend", handleRelease);

function handlePress(e) {
  const x = e.clientX || (e.touches && e.touches[0].clientX);
  const y = e.clientY || (e.touches && e.touches[0].clientY);
  const btnX = canvas.width - 120;
  const btnY = canvas.height - 100;

  if (x >= btnX && x <= btnX + 100 && y >= btnY && y <= btnY + 50) {
    startPull();
  }
}

function handleRelease() {
  stopPull();
}

rathaImg.onload = () => {
  drawEverything();
  update();
};
