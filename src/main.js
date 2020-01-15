const WIDTH = 480;
const HEIGHT = 320;
const APP_FPS = 30;

// stats
let stats = new Stats();
console.log(stats);
stats.showPanel(0); // 0: fps, 1: ms; 2: mb, 3: custom
document.body.appendChild(stats.dom);

// init
let app = new PIXI.Application({
  width: WIDTH,
  height: HEIGHT
});
let canvas = document.getElementById("canvas");
canvas.appendChild(app.view);
app.renderer.backgroundColor = 0x000000;
app.stage.interactive = true;
app.ticker.remove(app.render, app);
const fpsDelta = 60 / APP_FPS;

let bg;
let elapsedTime = 0;

let container_bg = new PIXI.Container();
container_bg.x = 0;
container_bg.y = 0;
app.stage.addChild(container_bg);

let container = new PIXI.Container();
container.width = 480;
container.height = 320;
container.x = 0;
container.y = 0;
app.stage.addChild(container);

// asset property
const ASSET_BG = "images/pic_uzu.jpg";
const ASSET_OBJ = "images/pic_confetti.png";

// obj property
const ROTATE_NONE = 0;
const ROTATE_LEFT = 1;
const ROTATE_RIGHT = 2;
const MAX_NUM = 100;
let CURRENT_NUM = MAX_NUM;

// obj property range
const MAX_SCALE = 1.5;
const MIN_SCALE = 0.8;
const MAX_ACCEL = 10;
const MIN_ACCEL = 1;
const MIN_ALPHA = 0.3;
const MAX_ALPHA = 1;
const MAX_RADIUS = 5;
const MIN_RADIUS = 1;
const MAX_ROTATE = 0.5;
const MIN_ROTATE = 0.02;

let objs = [];
let radiusNums = [];
let angleNums = [];
let accelNums = [];
let rotateNums = [];
let rotateDirecNums = [];
let obj;
let offsetY = 100;

PIXI.loader.add("bg_data", ASSET_BG);
PIXI.loader.add("obj_data", ASSET_OBJ);
PIXI.loader.load(onAssetsLoaded);

/**
 * Asset load Complete
 * @param { object } loader object
 * @param { object } res asset data
 */
function onAssetsLoaded(loader, res) {
  // BG
  bg = new PIXI.Sprite(res.bg_data.texture);
  container_bg.addChild(bg);
  bg.x = 0;
  bg.y = 0;

  // Text
  let text = new PIXI.Text("Fall Confetti", {
    fontFamily: "Arial",
    fontSize: 30,
    fill: 0xff8c00,
    align: "center",
    fontWeight: "bold",
    stroke: "#ffffff",
    strokeThickness: 4,
    dropShadow: false,
    dropShadowColor: "#cccccc",
    lineJoin: "round"
  });
  container.addChild(text);
  text.x = WIDTH / 2 - text.width / 2;
  text.y = 20;

  // Fall object
  for (let i = 0; i < MAX_NUM; i++) {
    obj = PIXI.Sprite.from(res.obj_data.texture);
    obj.anchor.set(0.5, 0.5);
    obj.tint = getRandomColor();

    // x pos
    let xNum = Math.floor(Math.random() * WIDTH + 1);
    obj.x = xNum;

    // y pos
    let yNum = -Math.floor(Math.random() * offsetY + 1);
    obj.y = yNum;

    // xy scale
    let scaleNum = Math.floor((Math.random() * (MAX_SCALE - MIN_SCALE) + MIN_SCALE) * 10) / 10;
    console.log(scaleNum);
    obj.scale.x = obj.scale.y = scaleNum;

    // rotate direction
    r = Math.floor(Math.random() * (5 - 1 + 1) + 1);
    rotateDirecNums[i] = ROTATE_NONE;
    if (r === 1 || r === 2) {
      rotateDirecNums[i] = ROTATE_LEFT;
    } else if (r === 3 || r === 4) {
      rotateDirecNums[i] = ROTATE_RIGHT;
    }

    // acceleration
    // let accelNum = Math.floor(Math.random() * MAX_ACCEL + 1);
    let accelNum = Math.floor(Math.random() * (MAX_ACCEL - MIN_ACCEL) + MIN_ACCEL);
    accelNums.push(accelNum);

    // transparency
    let alphaNum = Math.floor((Math.random() * (MAX_ALPHA - MIN_ALPHA) + MIN_ALPHA) * 10) / 10;
    // obj.alpha = alphaNum; // When using tint, it is better not to change the transparency.
    // obj.blendMode = PIXI.BLEND_MODES.ADD; // BlendMode too.

    // radius
    let radiusNum = Math.random() * (MAX_RADIUS - MIN_RADIUS) + MIN_RADIUS;
    radiusNums.push(radiusNum);

    // angle(use for make radian)
    let angleNum = Math.floor(Math.random() * 360 + 1);
    angleNums.push(angleNum);

    // rotate
    let rotateNum = Math.floor((Math.random() * (MAX_ROTATE - MIN_ROTATE) + MIN_ROTATE) * 10) / 10;
    rotateNums.push(rotateNum);

    objs.push(obj);
    container.addChild(obj);
  }

  let ticker = PIXI.ticker.shared;
  ticker.autoStart = false;
  ticker.stop();
  PIXI.settings.TARGET_FPMS = 0.06;
  app.ticker.add(tick);
}

/**
 * adjust fps
 * @param { number } delta time
 */
function tick(delta) {
  elapsedTime += delta;

  if (elapsedTime >= fpsDelta) {
    //enough time passed, update app
    update(elapsedTime);

    //reset
    elapsedTime = 0;
  }
}

/**
 * app rendering
 * @param { number } delta  time
 */
function update(delta) {
  stats.begin();

  for (let i = 0; i < MAX_NUM; i++) {
    // radian
    let radian = (angleNums[i] * Math.PI) / 180;

    // x
    objs[i].x += radiusNums[i] * Math.cos(radian);

    // y
    // let offsetAccel = Math.floor(Math.random() * (4 - 1 + 1) + 1);
    objs[i].y += 1 * accelNums[i]; // + offsetAccel;

    // rotation
    if (rotateDirecNums[i] === ROTATE_RIGHT) {
      objs[i].rotation -= rotateNums[i];
    } else if (rotateDirecNums[i] === ROTATE_LEFT) {
      objs[i].rotation += rotateNums[i];
    }

    // limit y
    if (HEIGHT + objs[i].height < objs[i].y) {
      let xNew = Math.floor(Math.random() * WIDTH + 1);
      objs[i].x = xNew;
      objs[i].y = -objs[i].height;
    }
  }

  stats.end();

  //render the canvas
  app.render();
}

function getRandomColor() {
  let letters = "0123456789ABCDEF";
  let color = "0x";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
