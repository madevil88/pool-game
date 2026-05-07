import Matter, { Bodies, Body } from "matter-js";
import { getRandomColor } from "./utils";

export const MAIN_BALL_CATEGORY = 0x0001;
export const BALL_CATEGORY = 0x0002;

export const createBoundary = (
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
  Body.rotate(board, (angle * Math.PI) / 180);
  return board;
};

export const createPocket = (x: number, y: number): Matter.Body =>
  Bodies.circle(x, y, 40, {
    isStatic: true,
    isSensor: true,
    label: "pocket",
    render: { visible: false },
  });

export const createBall = (
  x: number,
  y: number,
  isMain?: boolean,
): Matter.Body => {
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
