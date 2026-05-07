import { computeSwipeForce, getRandomRange, getRandomColor } from "../utils";
import {
  MAIN_BALL_CATEGORY,
  BALL_CATEGORY,
  createBoundary,
  createPocket,
  createBall,
} from "../bodies";

// ─── utils ───────────────────────────────────────────────────────────────────

describe("getRandomRange", () => {
  it("always returns a value within [min, max]", () => {
    for (let i = 0; i < 200; i++) {
      const result = getRandomRange(5, 10);
      expect(result).toBeGreaterThanOrEqual(5);
      expect(result).toBeLessThanOrEqual(10);
    }
  });

  it("returns an integer", () => {
    for (let i = 0; i < 50; i++) {
      expect(Number.isInteger(getRandomRange(0, 255))).toBe(true);
    }
  });

  it("works when min equals max", () => {
    expect(getRandomRange(7, 7)).toBe(7);
  });
});

describe("getRandomColor", () => {
  it("returns a valid rgb() string", () => {
    const color = getRandomColor();
    expect(color).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
  });

  it("blue channel is always 150–170", () => {
    for (let i = 0; i < 50; i++) {
      const match = /rgb\(\d+, \d+, (\d+)\)/.exec(getRandomColor());
      const blue = Number(match?.[1]);
      expect(blue).toBeGreaterThanOrEqual(150);
      expect(blue).toBeLessThanOrEqual(170);
    }
  });
});

describe("computeSwipeForce", () => {
  it("returns zero force when start equals end", () => {
    expect(computeSwipeForce(100, 100, 100, 100)).toEqual({ x: 0, y: 0 });
  });

  it("applies forceScale to the distance", () => {
    const force = computeSwipeForce(0, 0, 30, 0);
    expect(force.x).toBeCloseTo(-30 / 150);
    expect(force.y).toBeCloseTo(0);
  });

  it("clamps magnitude at MAX_PIXELS (150)", () => {
    const capped = computeSwipeForce(0, 0, 300, 0);
    const atMax = computeSwipeForce(0, 0, 150, 0);
    expect(capped.x).toBeCloseTo(atMax.x);
    expect(capped.y).toBeCloseTo(atMax.y);
  });

  it("preserves swipe direction (inverted)", () => {
    const force = computeSwipeForce(0, 0, 3, 4);
    expect(force.x / force.y).toBeCloseTo(3 / 4);
  });

  it("works in all four quadrants", () => {
    const ne = computeSwipeForce(0, 0, 10, 10);
    const sw = computeSwipeForce(0, 0, -10, -10);
    expect(ne.x).toBeLessThan(0);
    expect(ne.y).toBeLessThan(0);
    expect(sw.x).toBeGreaterThan(0);
    expect(sw.y).toBeGreaterThan(0);
  });
});

// ─── bodies ──────────────────────────────────────────────────────────────────

describe("collision categories", () => {
  it("MAIN_BALL_CATEGORY and BALL_CATEGORY are distinct powers of 2", () => {
    expect(MAIN_BALL_CATEGORY).toBe(0x0001);
    expect(BALL_CATEGORY).toBe(0x0002);
    expect(MAIN_BALL_CATEGORY & BALL_CATEGORY).toBe(0);
  });
});

describe("createBoundary", () => {
  it("is static and labelled 'boundary'", () => {
    const body = createBoundary(100, 100, 200, 20, 0);
    expect(body.isStatic).toBe(true);
    expect(body.label).toBe("boundary");
  });

  it("is positioned at the given coordinates", () => {
    const body = createBoundary(50, 75, 100, 10, 0);
    expect(body.position.x).toBeCloseTo(50);
    expect(body.position.y).toBeCloseTo(75);
  });

  it("rotates when angle is provided", () => {
    const flat = createBoundary(0, 0, 100, 10, 0, 0);
    const rotated = createBoundary(0, 0, 100, 10, 0, 45);
    expect(rotated.angle).not.toBeCloseTo(flat.angle);
  });
});

describe("createPocket", () => {
  it("is static, a sensor, and labelled 'pocket'", () => {
    const pocket = createPocket(200, 200);
    expect(pocket.isStatic).toBe(true);
    expect(pocket.isSensor).toBe(true);
    expect(pocket.label).toBe("pocket");
  });

  it("is positioned at the given coordinates", () => {
    const pocket = createPocket(300, 400);
    expect(pocket.position.x).toBeCloseTo(300);
    expect(pocket.position.y).toBeCloseTo(400);
  });
});

describe("createBall", () => {
  it("creates a regular ball with BALL_CATEGORY", () => {
    const ball = createBall(100, 100);
    expect(ball.label).toBe("ball");
    expect(ball.collisionFilter.category).toBe(BALL_CATEGORY);
    expect(ball.isStatic).toBe(false);
  });

  it("creates a main ball with MAIN_BALL_CATEGORY", () => {
    const ball = createBall(100, 100, true);
    expect(ball.label).toBe("main-ball");
    expect(ball.collisionFilter.category).toBe(MAIN_BALL_CATEGORY);
  });

  it("is positioned at the given coordinates", () => {
    const ball = createBall(150, 250);
    expect(ball.position.x).toBeCloseTo(150);
    expect(ball.position.y).toBeCloseTo(250);
  });

  it("has restitution 1 and friction 0.3", () => {
    const ball = createBall(0, 0);
    expect(ball.restitution).toBe(1);
    expect(ball.friction).toBe(0.3);
  });
});
