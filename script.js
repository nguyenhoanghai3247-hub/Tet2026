// ============================================
// --- PHẦN 1: LOGIC ĐẾM NGƯỢC & GIAO DIỆN ---
// ============================================

//const targetDate = new Date().getTime() + 10 * 1000;
const targetDate = new Date("Feb 17, 2026 00:00:00").getTime();
let fireworksEnabled = false;

const screenStart = document.getElementById("start-screen");
const screenCountdown = document.getElementById("countdown-screen");
const screenGreeting = document.getElementById("greeting-screen");
const btnStart = document.getElementById("btn-start");
const elDays = document.getElementById("days");
const elHours = document.getElementById("hours");
const elMinutes = document.getElementById("minutes");
const elSeconds = document.getElementById("seconds");
const audio = document.getElementById("bgMusic");
const popup = document.getElementById("wishes-popup");
const wishesText = document.getElementById("wishes-text");

// THÊM CÁC CÂU CHÚC MỚI VỀ NĂM NGỰA
const listWishes = [
  "Mã đáo thành công, vạn sự hanh thông!",
  "Năm mới sức khỏe dẻo dai như ngựa chiến, tiền về như nước!",
  "Chúc bạn năm Ngựa phi nước đại trên con đường sự nghiệp!",
  "Tấn tài tấn lộc, mã đáo an khang.",
  "Tiền vào như nước sông Đà, tiền ra nhỏ giọt như cà phê phin!",
  "Năm mới vạn sự như ý, tỷ sự như mơ!",
  "Gia đình hạnh phúc, con đàn cháu đống!",
  "Lộc biếc mai vàng xuân hạnh phúc - Đời vui sức khỏe tết an khang.",
  "Sự nghiệp lên hương, người thương tâm đầu ý hợp!",
  "Chúc bạn 12 tháng phú quý, 365 ngày phát tài!",
];

btnStart.addEventListener("click", () => {
  screenStart.classList.remove("active");
  screenCountdown.classList.add("active");

  // Bắt đầu tính giờ
  startRealTimeCountdown();

  audio.volume = 0.5;
  audio.play().catch((e) => console.log(e));
});
function startRealTimeCountdown() {
  const interval = setInterval(() => {
    const now = new Date().getTime();
    const distance = targetDate - now;

    // Tính toán thời gian
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Hiển thị ra màn hình (thêm số 0 đằng trước nếu nhỏ hơn 10)
    elDays.innerText = days < 10 ? "0" + days : days;
    elHours.innerText = hours < 10 ? "0" + hours : hours;
    elMinutes.innerText = minutes < 10 ? "0" + minutes : minutes;
    elSeconds.innerText = seconds < 10 ? "0" + seconds : seconds;

    // Nếu đã đến giờ G (distance < 0)
    if (distance < 0) {
      clearInterval(interval);
      // Set tất cả về 0
      elDays.innerText = "00";
      elHours.innerText = "00";
      elMinutes.innerText = "00";
      elSeconds.innerText = "00";
      happyNewYear();
    }
  }, 1000);
}

function happyNewYear() {
  screenCountdown.classList.remove("active");
  screenGreeting.classList.add("active");
  audio.volume = 1.0;
  fireworksEnabled = true;

  // 1. Kích hoạt bắn pháo hoa tên lửa
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      launchRocket();
    }, i * 200);
  }

  // 2. Kích hoạt mưa lì xì sau 1 giây
  setTimeout(() => {
    startEnvelopesRain();
  }, 1000);
}

function closePopup() {
  popup.style.display = "none";
}

// ============================================
// --- PHẦN 2: PHÁO HOA TÊN LỬA (CANVAS 1) ---
// ============================================
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
let rockets = [];

function random(min, max) {
  return Math.random() * (max - min) + min;
}
function getRandomColor() {
  const colors = [
    "#ff004c",
    "#ff9100",
    "#ffd700",
    "#00ffcc",
    "#ffffff",
    "#e600ff",
    "#33ff57",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

class Rocket {
  constructor() {
    this.x = random(100, canvas.width - 100);
    this.y = canvas.height;
    this.dy = random(-12, -17);
    this.dx = random(-1, 1);
    this.color = getRandomColor();
    this.trail = [];
    this.gravity = 0.2;
  }
  draw() {
    ctx.beginPath();
    ctx.fillStyle = "#fff";
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    if (this.trail.length > 0) {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      for (let i = this.trail.length - 1; i >= 0; i--) {
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
        ctx.globalAlpha = i / this.trail.length;
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
  update(index) {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 15) this.trail.shift();
    this.dy += this.gravity;
    this.x += this.dx;
    this.y += this.dy;
    if (this.dy >= -1.5) {
      rockets.splice(index, 1);
      triggerExplosion(this.x, this.y, this.color);
    } else if (this.y < -50 || this.x < -50 || this.x > canvas.width + 50) {
      rockets.splice(index, 1);
    }
  }
}

class Particle {
  constructor(x, y, dx, dy, color, sparkle) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.color = color;
    this.radius = random(1, 3);
    this.alpha = 1;
    this.gravity = 0.05;
    this.friction = 0.95;
    this.decay = random(0.008, 0.015);
    this.sparkle = sparkle;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha =
      this.sparkle && Math.random() < 0.2 ? this.alpha * 0.5 : this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
  update() {
    this.dy += this.gravity;
    this.dx *= this.friction;
    this.dy *= this.friction;
    this.x += this.dx;
    this.y += this.dy;
    this.alpha -= this.decay;
  }
}

function createSphereFirework(x, y, mainColor) {
  const particleCount = 80;
  for (let i = 0; i < particleCount; i++) {
    const power = random(2, 6);
    const angle = random(0, Math.PI * 2);
    particles.push(
      new Particle(
        x,
        y,
        Math.cos(angle) * power,
        Math.sin(angle) * power,
        mainColor,
        Math.random() < 0.3
      )
    );
  }
}
function createMultiColorFirework(x, y) {
  const particleCount = 100;
  for (let i = 0; i < particleCount; i++) {
    const power = random(3, 7);
    const angle = random(0, Math.PI * 2);
    particles.push(
      new Particle(
        x,
        y,
        Math.cos(angle) * power,
        Math.sin(angle) * power,
        getRandomColor(),
        true
      )
    );
  }
}
function triggerExplosion(x, y, rocketColor) {
  Math.random() < 0.5
    ? createSphereFirework(x, y, rocketColor)
    : createMultiColorFirework(x, y);
}
function launchRocket() {
  rockets.push(new Rocket());
}

function animateFireworks() {
  requestAnimationFrame(animateFireworks);
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  rockets.forEach((rocket, index) => {
    rocket.draw();
    rocket.update(index);
  });
  particles.forEach((particle, index) => {
    if (particle.alpha > 0) {
      particle.update();
      particle.draw();
    } else {
      particles.splice(index, 1);
    }
  });
  if (fireworksEnabled && Math.random() < 0.04) launchRocket();
}

// ============================================
// --- PHẦN 3: MƯA LÌ XÌ (CANVAS 2) ---
// ============================================
const envCanvas = document.getElementById("envelope-canvas");
const envCtx = envCanvas.getContext("2d");
envCanvas.width = window.innerWidth;
envCanvas.height = window.innerHeight;

let envelopes = [];
let rainEnabled = false;

// --- THÊM MỚI: Tải hình ảnh Lì xì của bạn ---
const imgLixi = new Image();
imgLixi.src = "baolixi.png"; // <-- Đảm bảo tên file ảnh đúng y hệt ở đây

// Class Bao Lì Xì
class Envelope {
  constructor() {
    // --- CHỈNH KÍCH THƯỚC ẢNH TẠI ĐÂY ---
    this.width = 60; // Chiều rộng bao lì xì
    this.height = 90; // Chiều cao bao lì xì (Nên giữ tỷ lệ theo ảnh gốc)

    this.x = Math.random() * (envCanvas.width - this.width);
    this.y = -100; // Xuất phát từ trên cao
    this.speed = Math.random() * 2 + 1; // Tốc độ rơi
    this.angle = Math.random() * 0.5 - 0.25; // Góc nghiêng ban đầu
    this.spin = Math.random() * 0.02 - 0.01; // Tốc độ xoay nhẹ khi rơi
  }

  draw() {
    envCtx.save();
    envCtx.translate(this.x + this.width / 2, this.y + this.height / 2);
    envCtx.rotate(this.angle); // Xoay hình

    // --- SỬA ĐỔI: Vẽ hình ảnh thay vì vẽ khối màu ---
    // Kiểm tra ảnh đã tải xong chưa rồi mới vẽ
    if (imgLixi.complete) {
      envCtx.drawImage(
        imgLixi,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
    } else {
      // (Dự phòng) Trong lúc chờ ảnh tải thì vẽ tạm ô vuông đỏ
      envCtx.fillStyle = "red";
      envCtx.fillRect(
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
    }

    envCtx.restore();
  }

  update() {
    this.y += this.speed;
    this.angle += this.spin; // Làm cho bao lì xì xoay nhẹ khi rơi
  }
}

function startEnvelopesRain() {
  rainEnabled = true;
  animateEnvelopes();
  // Tạo bao lì xì mới mỗi 0.5s
  setInterval(() => {
    if (envelopes.length < 20) {
      // Giới hạn số lượng trên màn hình
      envelopes.push(new Envelope());
    }
  }, 500);
}

function animateEnvelopes() {
  if (!rainEnabled) return;
  requestAnimationFrame(animateEnvelopes);

  // Xóa frame cũ
  envCtx.clearRect(0, 0, envCanvas.width, envCanvas.height);

  envelopes.forEach((env, index) => {
    env.draw();
    env.update();
    // Xóa nếu rơi ra khỏi màn hình
    if (env.y > envCanvas.height) {
      envelopes.splice(index, 1);
    }
  });
}

// Xử lý Click vào bao lì xì
envCanvas.addEventListener("click", (e) => {
  const rect = envCanvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  // Duyệt ngược để ưu tiên bao nằm trên
  for (let i = envelopes.length - 1; i >= 0; i--) {
    const env = envelopes[i];

    // Kiểm tra va chạm (Click trúng vùng ảnh)
    // Vì ảnh đang xoay nên tính toán đơn giản theo hộp bao quanh (bounding box)
    if (
      clickX >= env.x &&
      clickX <= env.x + env.width &&
      clickY >= env.y &&
      clickY <= env.y + env.height
    ) {
      // 1. Mở popup
      const randomWish =
        listWishes[Math.floor(Math.random() * listWishes.length)];
      wishesText.innerText = randomWish;
      popup.style.display = "flex";

      // 2. Xóa bao lì xì đó đi
      envelopes.splice(i, 1);
      break;
    }
  }
});

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  envCanvas.width = window.innerWidth;
  envCanvas.height = window.innerHeight;
});

// Chạy vòng lặp pháo hoa
animateFireworks();
