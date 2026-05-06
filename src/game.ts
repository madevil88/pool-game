import Matter, {
  Engine,
  Render,
  Runner,
  Bodies,
  Composite,
  Body,
  Constraint,
  Common,
  Mouse,
  MouseConstraint,
  Events,
} from "matter-js";
import * as polyDecomp from "poly-decomp";
import "matter-attractors";
import { gameData } from "./parameters";

Matter.use("matter-attractors");
Common.setDecomp(polyDecomp);

const MAIN_BALL_CATEGORY = 0x0001;
const BALL_CATEGORY = 0x0002;

const getRandomRange = (min: number, max: number): number =>
  Math.floor(
    ((Math.abs(+globalThis.crypto.getRandomValues(new Int8Array(1))) / 100) %
      1) *
      (max - min + 1),
  ) + min;

const {
  canvasSize,
  mainBallData,
  boardsData,
  pocketsData,
  ballsData,
  ballsToWin,
} = gameData;

let engine: Matter.Engine;
let world: Matter.World;
let constraint: Matter.Constraint;
let mainBall: Matter.Body;
let balls: Matter.Body[] = [];
let isConstrained = true;
let gameContainer: HTMLElement;
let gameCanvas: HTMLCanvasElement;
let scoreboard: Element | null = null;
let score = 0;
let amountOfBalls = ballsData.length;

type CollisionPair = { bodyA: Matter.Body; bodyB: Matter.Body };
type MatterCollisionEvent = { pairs: CollisionPair[] };

const createBoundary = (
  x: number,
  y: number,
  width: number,
  height: number,
  slope: number,
  angle = 0,
): Matter.Body => {
  const board = Bodies.trapezoid(x, y, width, height, slope, {
    isStatic: true,
    label: "boundary",
    render: { visible: false },
  });
  Body.rotate(board, angle);
  return board;
};

const createPocket = (x: number, y: number): Matter.Body =>
  Bodies.circle(x, y, 40, {
    isStatic: true,
    isSensor: true,
    label: "pocket",
    render: { visible: false },
  });

const getRandomColor = (): string =>
  `rgb(${getRandomRange(0, 255)}, ${getRandomRange(0, 255)}, ${getRandomRange(150, 170)})`;

const createBall = (x: number, y: number, isMain?: boolean): Matter.Body => {
  const category = isMain ? MAIN_BALL_CATEGORY : BALL_CATEGORY;
  const label = isMain ? "main-ball" : "ball";
  return Bodies.circle(x, y, 22, {
    restitution: 1,
    friction: 0.3,
    label,
    collisionFilter: { category },
    render: {
      fillStyle: isMain ? "#000000" : getRandomColor(),
      visible: true,
    },
  });
};

const addStoppers = (): void => {
  const pockets = pocketsData.map(({ x, y }) => createPocket(x, y));
  const boards = boardsData.map(({ x, y, width, height, slope, angle }) =>
    createBoundary(x, y, width, height, slope, angle),
  );
  Composite.add(world, [...boards, ...pockets]);
};

const addBallsWithConstraint = (): void => {
  mainBall = createBall(mainBallData.x, mainBallData.y, true);
  balls = ballsData.map(({ x, y }) => createBall(x, y));
  constraint = Constraint.create({
    pointA: { x: mainBallData.x, y: mainBallData.y },
    bodyB: mainBall,
    stiffness: 0.2,
  });
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

const onTouchStart = (e: TouchEvent): void => {
  e.preventDefault();
  if (!isConstrained) return;
  startTouch.x = e.touches[0].clientX;
  startTouch.y = e.touches[0].clientY;
  mainBall.isSensor = true;
};

const checkForce = (start: number, end: number): number => {
  const MAX_FORCE = 50;
  const forceReducer = -0.005;
  const deltaPosition = end - start;
  const defaultForce =
    deltaPosition < 0 ? -MAX_FORCE * forceReducer : MAX_FORCE * forceReducer;
  return Math.abs(deltaPosition) > MAX_FORCE
    ? defaultForce
    : deltaPosition * forceReducer;
};

const removeConstraint = (): void => {
  const timeoutID = setTimeout(() => {
    isConstrained = false;
    Composite.remove(world, constraint);
    Events.on(engine, "beforeUpdate", handleCollisionActive);
    clearTimeout(timeoutID);
  }, 25);
  mainBall.collisionFilter.category = BALL_CATEGORY;
};

const onTouchEnd = (e: TouchEvent): void => {
  if (!isConstrained) return;
  endTouch.x = e.changedTouches[0].clientX;
  endTouch.y = e.changedTouches[0].clientY;
  const force = {
    x: checkForce(startTouch.x, endTouch.x),
    y: checkForce(startTouch.y, endTouch.y),
  };
  mainBall.isSensor = false;
  Body.applyForce(mainBall, mainBall.position, force);
  removeConstraint();
};

const setFinishGame = (result: string): void => {
  gameContainer.classList.add(result);
  Events.off(engine, "beforeUpdate", handleCollisionActive);
  gameCanvas.removeEventListener("touchstart", onTouchStart);
  gameCanvas.removeEventListener("touchend", onTouchEnd);
};

const handleCollision = (event: MatterCollisionEvent): void => {
  const { pairs } = event;
  pairs.forEach((pair) => {
    const { bodyA, bodyB } = pair;
    if (
      bodyA.label === "pocket" &&
      bodyB.collisionFilter.category === BALL_CATEGORY
    ) {
      if (bodyB.label === "main-ball") {
        handleScore(-1);
        Body.setVelocity(bodyB, { x: 0, y: 0 });
        Body.setPosition(bodyB, { x: mainBallData.x, y: mainBallData.y });
        mainBall.collisionFilter.category = MAIN_BALL_CATEGORY;
      } else {
        handleScore(1);
        Composite.remove(world, bodyB);
      }
    }
  });
};

function handleScore(point = 0): void {
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
  if (score < 0 || amountOfBalls + score < ballsToWin) {
    setFinishGame("game-over");
  } else if (score === ballsToWin) {
    setFinishGame("you-win");
  }
}

const resetGame = (): void => {
  gameCanvas.removeEventListener("touchstart", onTouchStart);
  gameCanvas.removeEventListener("touchend", onTouchEnd);
  Composite.remove(world, [...balls, mainBall, constraint]);
  handleScore();
  addBallsWithConstraint();
  Events.on(engine, "beforeUpdate", handleCollisionActive);
  gameCanvas.addEventListener("touchstart", onTouchStart);
  gameCanvas.addEventListener("touchend", onTouchEnd);
};

export const startGame = (): void => {
  engine = Engine.create();
  world = engine.world;
  engine.gravity.y = 0;
  world.bounds = { min: { x: 0, y: 0 }, max: canvasSize };

  gameContainer =
    document.querySelector<HTMLElement>(".game-container") ?? document.body;
  scoreboard = document.querySelector(".score");

  const render = Render.create({
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
    render: { visible: true },
  };
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: mouseConstraintOptions,
  });
  mouseConstraint.collisionFilter.mask = MAIN_BALL_CATEGORY;

  addStoppers();
  addBallsWithConstraint();
  Composite.add(world, [mouseConstraint]);
  Events.on(engine, "collisionStart", handleCollision);

  gameContainer.addEventListener("mouseup", removeConstraint);
  gameContainer.addEventListener("mouseout", removeConstraint);
  gameCanvas.addEventListener("touchstart", onTouchStart);
  gameCanvas.addEventListener("touchend", onTouchEnd);

  document.querySelector(".reset-button")?.addEventListener("click", resetGame);

  Render.run(render);
  const runner = Runner.create();
  Runner.run(runner, engine);
};
