import Matter, {
  Engine,
  Render,
  Runner,
  Bodies,
  Composite,
  Body,
  Constraint,
  Mouse,
  MouseConstraint,
  Events,
} from "matter-js";

import {
  MAIN_BALL_CATEGORY,
  BALL_CATEGORY,
  createBoundary,
  createPocket,
  createBall,
} from "./bodies";
import { computeSwipeForce } from "./utils";

import { gameData } from "./parameters";

const {
  canvasSize,
  mainBallData,
  boardsData,
  pocketsData,
  ballsData,
  BALLS_TO_WIN,
} = gameData;

let engine!: Matter.Engine;
let world!: Matter.World;
let constraint!: Matter.Constraint;
let mainBall!: Matter.Body;
let balls: Matter.Body[] = [];
let isConstrained = true;
let mouseConstraint!: Matter.MouseConstraint;
let render!: Matter.Render;
let runner!: Matter.Runner;
let gameContainer!: HTMLElement;
let gameCanvas!: HTMLCanvasElement;
let scoreboard: Element | null = null;
let score = 0;
let amountOfBalls = ballsData.length;
const MAX_BALL_SPEED = 40;

type CollisionPair = { bodyA: Matter.Body; bodyB: Matter.Body };
type MatterCollisionEvent = { pairs: CollisionPair[] };

const addStoppers = (): void => {
  const pockets = pocketsData.map(({ x, y }) => createPocket(x, y));
  const boards = boardsData.map(({ x, y, width, height, slope, angle }) =>
    createBoundary(x, y, width, height, slope, angle),
  );
  const t = 100;
  const { x: w, y: h } = canvasSize;
  const outerWalls = [
    Bodies.rectangle(w / 2, -t / 2, w + t * 2, t, {
      isStatic: true,
      render: { visible: false },
    }),
    Bodies.rectangle(w / 2, h + t / 2, w + t * 2, t, {
      isStatic: true,
      render: { visible: false },
    }),
    Bodies.rectangle(-t / 2, h / 2, t, h, {
      isStatic: true,
      render: { visible: false },
    }),
    Bodies.rectangle(w + t / 2, h / 2, t, h, {
      isStatic: true,
      render: { visible: false },
    }),
  ];
  Composite.add(world, [...boards, ...pockets, ...outerWalls]);
};

const addBallsWithConstraint = (): void => {
  mainBall = createBall(mainBallData.x, mainBallData.y, true);
  balls = ballsData.map(({ x, y }) => createBall(x, y));
  constraint = Constraint.create({
    pointA: { x: mainBallData.x, y: mainBallData.y },
    bodyB: mainBall,
    stiffness: 0.2,
  });
  isConstrained = true;
  Composite.add(world, [...balls, mainBall, constraint]);
};

const handleCollisionActive = (): void => {
  if (isConstrained) return;
  if (
    Math.abs(mainBall.velocity.x) <= 0.25 &&
    Math.abs(mainBall.velocity.y) <= 0.25
  ) {
    Events.off(engine, "beforeUpdate", handleCollisionActive);
    mainBall.collisionFilter.category = MAIN_BALL_CATEGORY;
    isConstrained = true;
    const { x, y } = mainBall.position;
    constraint.pointA.x = x;
    constraint.pointA.y = y;
    Composite.add(world, constraint);
  }
};

const startTouch = { x: 0, y: 0 };
const endTouch = { x: 0, y: 0 };
const currentTouch = { x: 0, y: 0 };
let isAiming = false;

const onTouchStart = (e: TouchEvent): void => {
  e.preventDefault();
  if (!isConstrained) return;
  mouseConstraint.collisionFilter.mask = 0;
  startTouch.x = e.touches[0].clientX;
  startTouch.y = e.touches[0].clientY;
  currentTouch.x = startTouch.x;
  currentTouch.y = startTouch.y;
  isAiming = true;
};

const removeConstraint = (): void => {
  if (!isConstrained) return;
  isConstrained = false;
  mainBall.collisionFilter.category = BALL_CATEGORY;
  Composite.remove(world, constraint);
  Events.on(engine, "beforeUpdate", handleCollisionActive);
};

const onTouchMove = (e: TouchEvent): void => {
  e.preventDefault();
  if (!isConstrained) return;
  const touch = e.touches[0];
  currentTouch.x = touch.clientX;
  currentTouch.y = touch.clientY;
};

const onTouchEnd = (e: TouchEvent): void => {
  isAiming = false;
  if (!isConstrained) return;
  mouseConstraint.collisionFilter.mask = MAIN_BALL_CATEGORY;
  endTouch.x = e.changedTouches[0].clientX;
  endTouch.y = e.changedTouches[0].clientY;
  const touchRect = gameCanvas.getBoundingClientRect();
  const touchScale = canvasSize.x / touchRect.width;
  const swipe = computeSwipeForce(
    startTouch.x * touchScale,
    startTouch.y * touchScale,
    endTouch.x * touchScale,
    endTouch.y * touchScale,
  );
  Body.setVelocity(mainBall, {
    x: swipe.x * MAX_BALL_SPEED,
    y: swipe.y * MAX_BALL_SPEED,
  });
  removeConstraint();
};

const onMouseDown = (e: MouseEvent): void => {
  if (!isConstrained || isAiming) return;
  mouseConstraint.collisionFilter.mask = 0;
  startTouch.x = e.clientX;
  startTouch.y = e.clientY;
  currentTouch.x = e.clientX;
  currentTouch.y = e.clientY;
  isAiming = true;
};

const onMouseMove = (e: MouseEvent): void => {
  if (!isAiming) return;
  currentTouch.x = e.clientX;
  currentTouch.y = e.clientY;
};

const onMouseUp = (e: MouseEvent): void => {
  if (!isAiming) return;
  isAiming = false;
  if (!isConstrained) return;
  mouseConstraint.collisionFilter.mask = MAIN_BALL_CATEGORY;
  const mouseRect = gameCanvas.getBoundingClientRect();
  const mouseScale = canvasSize.x / mouseRect.width;
  const swipe = computeSwipeForce(
    startTouch.x * mouseScale,
    startTouch.y * mouseScale,
    e.clientX * mouseScale,
    e.clientY * mouseScale,
  );
  Body.setVelocity(mainBall, {
    x: swipe.x * MAX_BALL_SPEED,
    y: swipe.y * MAX_BALL_SPEED,
  });
  removeConstraint();
};

const setFinishGame = (result: string): void => {
  isAiming = false;
  gameContainer.classList.add(result);
  Events.off(engine, "beforeUpdate", handleCollisionActive);
  gameCanvas.removeEventListener("touchstart", onTouchStart);
  gameCanvas.removeEventListener("touchmove", onTouchMove);
  gameCanvas.removeEventListener("touchend", onTouchEnd);
  gameCanvas.removeEventListener("mousedown", onMouseDown);
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
};

const handleCollision = (event: MatterCollisionEvent): void => {
  const { pairs } = event;
  pairs.forEach((pair) => {
    const { bodyA, bodyB } = pair;
    let pocket: Matter.Body | null = null;
    let ball: Matter.Body | null = null;
    if (bodyA.label === "pocket") {
      pocket = bodyA;
      ball = bodyB;
    } else if (bodyB.label === "pocket") {
      pocket = bodyB;
      ball = bodyA;
    }
    if (!pocket || ball?.collisionFilter.category !== BALL_CATEGORY) return;
    if (ball.label === "main-ball") {
      handleScore(-1);
      Body.setVelocity(ball, { x: 0, y: 0 });
      Body.setPosition(ball, { x: mainBallData.x, y: mainBallData.y });
      mainBall.collisionFilter.category = MAIN_BALL_CATEGORY;
    } else {
      handleScore(1);
      Composite.remove(world, ball);
    }
  });
};

const handleScore = (point = 0): void => {
  if (!scoreboard) return;
  score += point;
  switch (point) {
    case 0:
      score = 0;
      amountOfBalls = ballsData.length;
      gameContainer.className = "game-container";
      break;
    case 1:
      amountOfBalls--;
      break;
  }
  scoreboard.textContent = `Score: ${score}`;
  if (score < 0 || amountOfBalls + score < BALLS_TO_WIN) {
    setFinishGame("game-over");
  } else if (score >= BALLS_TO_WIN) {
    setFinishGame("you-win");
  }
};

const resetGame = (): void => {
  isAiming = false;
  Events.off(engine, "beforeUpdate", handleCollisionActive);
  mouseConstraint.collisionFilter.mask = MAIN_BALL_CATEGORY;
  gameCanvas.removeEventListener("touchstart", onTouchStart);
  gameCanvas.removeEventListener("touchmove", onTouchMove);
  gameCanvas.removeEventListener("touchend", onTouchEnd);
  gameCanvas.removeEventListener("mousedown", onMouseDown);
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
  Composite.remove(world, [...balls, mainBall, constraint]);
  handleScore();
  addBallsWithConstraint();
  gameCanvas.addEventListener("touchstart", onTouchStart);
  gameCanvas.addEventListener("touchmove", onTouchMove, { passive: false });
  gameCanvas.addEventListener("touchend", onTouchEnd);
  gameCanvas.addEventListener("mousedown", onMouseDown);
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
};

const onBeforeUpdate = (): void => {
  if (isConstrained) return;
  const { x, y } = mainBall.velocity;
  const speed = Math.hypot(x, y);
  if (speed > MAX_BALL_SPEED) {
    Body.setVelocity(mainBall, {
      x: (x / speed) * MAX_BALL_SPEED,
      y: (y / speed) * MAX_BALL_SPEED,
    });
  }
};

const onAfterRender = (): void => {
  if (!isAiming) return;
  const ctx = render.context;
  const rect = gameCanvas.getBoundingClientRect();
  const scale = canvasSize.x / rect.width;
  const { x: bx, y: by } = mainBall.position;
  const dx = currentTouch.x - startTouch.x;
  const dy = currentTouch.y - startTouch.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 5) return;
  const ex = bx + dx * scale;
  const ey = by + dy * scale;

  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 6]);
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.beginPath();
  ctx.arc(ex, ey, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

export const startGame = (): void => {
  if (render) {
    Render.stop(render);
    Runner.stop(runner);
  }
  engine = Engine.create();
  world = engine.world;
  engine.gravity.y = 0;
  world.bounds = { min: { x: 0, y: 0 }, max: canvasSize };

  gameContainer =
    document.querySelector<HTMLElement>(".game-container") ?? document.body;
  scoreboard = document.querySelector(".score");

  render = Render.create({
    element: gameContainer,
    engine,
    options: {
      width: world.bounds.max.x,
      height: world.bounds.max.y,
      wireframes: false,
      background: "transparent",
    },
  });

  gameCanvas = render.canvas;
  const mouse = Mouse.create(gameCanvas);
  render.mouse = mouse;
  const mouseConstraintOptions = {
    angularStiffness: 0,
    render: { visible: false },
  };
  mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: mouseConstraintOptions,
  });
  mouseConstraint.collisionFilter.mask = MAIN_BALL_CATEGORY;

  addStoppers();
  addBallsWithConstraint();
  Composite.add(world, [mouseConstraint]);
  Events.on(engine, "collisionStart", handleCollision);

  gameCanvas.addEventListener("mousedown", onMouseDown);
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
  gameCanvas.addEventListener("touchstart", onTouchStart);
  gameCanvas.addEventListener("touchmove", onTouchMove, { passive: false });
  gameCanvas.addEventListener("touchend", onTouchEnd);

  Events.on(engine, "beforeUpdate", onBeforeUpdate);

  document.querySelector(".reset-button")?.addEventListener("click", resetGame);

  Events.on(render, "afterRender", onAfterRender);

  Render.run(render);
  runner = Runner.create();
  Runner.run(runner, engine);
};
