interface BoardEntry {
    x: number;
    y: number;
    width: number;
    height: number;
    slope: number;
    angle?: number;
}

interface PocketEntry {
    x: number;
    y: number;
}

interface BallEntry {
    x: number;
    y: number;
}

const canvasSize = { x: 750, y: 1334 };

const mainBallData: BallEntry = {
    x: 390,
    y: 950
};

const boardsData: BoardEntry[] = [
    {
        x: 375,
        y: 0,
        width: 550,
        height: 105,
        slope: -0.4
    },
    {
        x: 375,
        y: 1310,
        width: 685,
        height: 60,
        slope: 0.2
    },
    {
        x: 30,
        y: 345,
        width: 490,
        height: 65,
        slope: -0.4,
        angle: -32.99
    },
    {
        x: 30,
        y: 985,
        width: 490,
        height: 65,
        slope: -0.4,
        angle: -32.99
    },
    {
        x: 720,
        y: 345,
        width: 490,
        height: 65,
        slope: -0.4,
        angle: 32.99
    },
    {
        x: 720,
        y: 985,
        width: 490,
        height: 65,
        slope: -0.4,
        angle: 32.99
    }
];

const pocketsData: PocketEntry[] = [
    { x: 25, y: 20 },
    { x: 725, y: 20 },
    { x: 735, y: 670 },
    { x: 15, y: 670 },
    { x: 20, y: 1314 },
    { x: 730, y: 1314 }
];

const topThePiramid = 420;
const centerOfTheTable = 390;
const ballDiameter = 44;
const ballsRadius = ballDiameter / 2;
const rowHeight = ballDiameter - 5;

const ballsData: BallEntry[] = [
    //first row
    { x: centerOfTheTable, y: topThePiramid },
    //second row
    { x: centerOfTheTable - ballsRadius, y: topThePiramid - rowHeight },
    { x: centerOfTheTable + ballsRadius, y: topThePiramid - rowHeight },
    //third row
    { x: centerOfTheTable - ballsRadius * 2, y: topThePiramid - rowHeight * 2 },
    { x: centerOfTheTable, y: topThePiramid - rowHeight * 2 },
    { x: centerOfTheTable + ballsRadius * 2, y: topThePiramid - rowHeight * 2 },
    //fourth row
    { x: centerOfTheTable - ballsRadius * 3, y: topThePiramid - rowHeight * 3 },
    { x: centerOfTheTable - ballsRadius, y: topThePiramid - rowHeight * 3 },
    { x: centerOfTheTable + ballsRadius, y: topThePiramid - rowHeight * 3 },
    { x: centerOfTheTable + ballsRadius * 3, y: topThePiramid - rowHeight * 3 },
    //fifth row
    { x: centerOfTheTable - ballsRadius * 4, y: topThePiramid - rowHeight * 4 },
    { x: centerOfTheTable - ballsRadius * 2, y: topThePiramid - rowHeight * 4 },
    { x: centerOfTheTable, y: topThePiramid - rowHeight * 4 },
    { x: centerOfTheTable + ballsRadius * 2, y: topThePiramid - rowHeight * 4 },
    { x: centerOfTheTable + ballsRadius * 4, y: topThePiramid - rowHeight * 4 }
];

const ballsToWin = 8;

export const gameData = {
    canvasSize,
    mainBallData,
    boardsData,
    pocketsData,
    ballsData,
    ballsToWin
};
