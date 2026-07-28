let serial;
let soundA, soundB, soundC;
let bgImages = []; 
let currentLevel = 0; 
let progress = 0; 
let fadeAlpha = 255; 

let junkItems = []; 
const TOTAL_HITS_NEEDED = 40; 
let restartBtn;

function preload() {
  // Use filenames without spaces. Rename 'bg 1.jpg' to 'bg1.jpg' in your sidebar
  bgImages[0] = loadImage('bg0.jpg'); 
  bgImages[1] = loadImage('bg1.jpg'); 
  bgImages[2] = loadImage('bg2.jpg');
  bgImages[3] = loadImage('bg3.jpg');
  bgImages[4] = loadImage('bg4.jpg');
  
  soundA = loadSound('kick.mp3');
  soundB = loadSound('snare.mp3');
  soundC = loadSound('hihat.mp3');
}

function setup() {
  createCanvas(800, 600);
  serial = createSerial();
  userStartAudio();

  let connBtn = createButton('CONNECT GEAR');
  connBtn.position(20, 20);
  applyButtonStyle(connBtn); 
  
  connBtn.mousePressed(() => {
    try { 
      if (!serial.opened()) {
        serial.open(115200); 
      }
    } catch(e) { 
      console.log("Serial check: " + e.message); 
    }
  });

  restartBtn = createButton('RESTART AGAIN!');
  restartBtn.position(width/2 - 80, height/2 + 80);
  applyButtonStyle(restartBtn);
  restartBtn.mousePressed(resetGame);
  restartBtn.hide();
}

function draw() {
  background(0);

  let targetLevel = floor(map(progress, 0, 100, 0, 4.99));
  
  if (targetLevel > currentLevel) {
    image(bgImages[targetLevel], 0, 0, width, height);
    push();
    tint(255, fadeAlpha); 
    image(bgImages[currentLevel], 0, 0, width, height);
    pop();
    fadeAlpha -= 12; 
    if (fadeAlpha <= 0) {
      currentLevel = targetLevel;
      fadeAlpha = 255; 
    }
  } else {
    image(bgImages[currentLevel], 0, 0, width, height);
  }

  for (let i = junkItems.length - 1; i >= 0; i--) {
    junkItems[i].update();
    junkItems[i].display();
    if (junkItems[i].isOffScreen()) junkItems.splice(i, 1);
  }

  drawGamingProgressBar();

  if (progress >= 100) {
    drawWinOverlay();
  }

  if (serial.opened() && serial.available() > 0) {
    let rawData = serial.readUntil('\n');
    if (rawData) {
      let parts = split(trim(rawData), ':'); 
      if (parts.length === 2 && progress < 100) triggerHit(parts[0]);
    }
  }
}

function drawGamingProgressBar() {
  let x = 100, y = height - 80, w = 600, h = 35;
  textAlign(CENTER);
  textStyle(BOLD);
  textSize(24); // FIXED: Added missing ) and ;
  
  fill(0); text("RESTORATION PROGRESS: " + floor(progress) + "%", width/2+2, y-15+2);
  fill(255); text("RESTORATION PROGRESS: " + floor(progress) + "%", width/2, y-15);

  stroke(0); strokeWeight(5);
  fill(30, 200);
  rect(x, y, w, h, 8);

  let fillW = map(progress, 0, 100, 0, w);
  noStroke();
  for (let i = 0; i < fillW; i++) {
    let inter = map(i, 0, w, 0, 1);
    let c = lerpColor(color('#FF00FF'), color('#00FFFF'), inter);
    fill(c);
    rect(x + i, y + 4, 1, h - 8);
  }
}

function triggerHit(label) {
  progress = min(progress + (100 / TOTAL_HITS_NEEDED), 100);
  let types = ["tire", "can", "box", "bottle"];
  for(let i=0; i<3; i++) junkItems.push(new Junk(random(types)));

  if (label === 'A' && soundA.isLoaded()) soundA.play();
  else if (label === 'B' && soundB.isLoaded()) soundB.play();
  else if (label === 'C' && soundC.isLoaded()) soundC.play();
}

class Junk {
  constructor(t) {
    this.t = t;
    this.x = random(200, 600); this.y = 400;
    this.vx = random(-10, 10); this.vy = random(-20, -10);
    this.rot = 0; this.rotS = random(-0.2, 0.2);
  }
  update() { 
    this.x += this.vx; this.y += this.vy; this.vy += 0.8; this.rot += this.rotS; 
  }
  display() {
    push();
    translate(this.x, this.y); rotate(this.rot);
    stroke(0); strokeWeight(3);
    // FIXED: Corrected unclosed blocks
    if(this.t=="tire"){ 
      fill(50); ellipse(0,0,50,50); fill(100); ellipse(0,0,20,20); 
    } else if(this.t=="can"){ 
      fill(200,0,0); rect(-10,-20,20,40,5); 
    } else if(this.t=="box"){ 
      fill(210,180,140); rect(-25,-25,50,50); 
    } else if(this.t=="bottle"){ 
      fill(180, 210, 255, 180); rect(-10, -20, 20, 45, 3); 
    }
    pop();
  }
  isOffScreen() { return this.y > height + 50; }
}

// Function must be defined clearly to avoid scope errors
function applyButtonStyle(btn) {
  btn.style('background', 'black');
  btn.style('color', '#00FFFF');
  btn.style('border', '3px solid #00FFFF'); 
  btn.style('font-weight', 'bold');
  btn.style('padding', '10px 20px');
  btn.style('cursor', 'pointer');
}

function drawWinOverlay() {
  fill(0, 180); rect(0,0,width,height);
  fill(0, 255, 255); textAlign(CENTER); textSize(50); 
  text("TRANSFORMED!", width/2, height/2);
  restartBtn.show();
}

function resetGame() { 
  progress = 0; currentLevel = 0; fadeAlpha = 255; 
  restartBtn.hide(); junkItems = []; 
}