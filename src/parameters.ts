type BoardEntry = {
  x: number;
  y: number;
  width: number;
  height: number;
  slope: number;
  angle?: number;
};

type PocketEntry = {
  x: number;
  y: number;
};

type BallEntry = {
  x: number;
  y: number;
};

const canvasSize = { x: 750, y: 1334 };

const mainBallData: BallEntry = {
  x: 390,
  y: 950,
};

const boardsData: BoardEntry[] = [
  {
    x: 375,
    y: 0,
    width: 550,
    height: 105,
    slope: -0.4,
  },
  {
    x: 375,
    y: 1310,
    width: 685,
    height: 60,
    slope: 0.2,
  },
  {
    x: 30,
    y: 345,
    width: 490,
    height: 65,
    slope: -0.4,
    angle: -90,
  },
  {
    x: 30,
    y: 985,
    width: 490,
    height: 65,
    slope: -0.4,
    angle: -90,
  },
  {
    x: 720,
    y: 345,
    width: 490,
    height: 65,
    slope: -0.4,
    angle: 90,
  },
  {
    x: 720,
    y: 985,
    width: 490,
    height: 65,
    slope: -0.4,
    angle: 90,
  },
];

const pocketsData: PocketEntry[] = [
  { x: 25, y: 20 },
  { x: 725, y: 20 },
  { x: 735, y: 670 },
  { x: 15, y: 670 },
  { x: 20, y: 1314 },
  { x: 730, y: 1314 },
];

const topThePyramid = 420;
const centerOfTheTable = 390;
const ballDiameter = 44;
const ballsRadius = ballDiameter / 2;
const rowHeight = ballDiameter - 5;

const ballsData: BallEntry[] = [
  //first row
  { x: centerOfTheTable, y: topThePyramid },
  //second row
  { x: centerOfTheTable - ballsRadius, y: topThePyramid - rowHeight },
  { x: centerOfTheTable + ballsRadius, y: topThePyramid - rowHeight },
  //third row
  { x: centerOfTheTable - ballsRadius * 2, y: topThePyramid - rowHeight * 2 },
  { x: centerOfTheTable, y: topThePyramid - rowHeight * 2 },
  { x: centerOfTheTable + ballsRadius * 2, y: topThePyramid - rowHeight * 2 },
  //fourth row
  { x: centerOfTheTable - ballsRadius * 3, y: topThePyramid - rowHeight * 3 },
  { x: centerOfTheTable - ballsRadius, y: topThePyramid - rowHeight * 3 },
  { x: centerOfTheTable + ballsRadius, y: topThePyramid - rowHeight * 3 },
  { x: centerOfTheTable + ballsRadius * 3, y: topThePyramid - rowHeight * 3 },
  //fifth row
  { x: centerOfTheTable - ballsRadius * 4, y: topThePyramid - rowHeight * 4 },
  { x: centerOfTheTable - ballsRadius * 2, y: topThePyramid - rowHeight * 4 },
  { x: centerOfTheTable, y: topThePyramid - rowHeight * 4 },
  { x: centerOfTheTable + ballsRadius * 2, y: topThePyramid - rowHeight * 4 },
  { x: centerOfTheTable + ballsRadius * 4, y: topThePyramid - rowHeight * 4 },
];

const BALLS_TO_WIN = 8;

export const gameData = {
  canvasSize,
  mainBallData,
  boardsData,
  pocketsData,
  ballsData,
  BALLS_TO_WIN,
};
