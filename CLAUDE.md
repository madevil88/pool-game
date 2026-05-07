# pool-game

Браузерна 2D-гра в більярд на TypeScript + Matter.js з фізичним движком.

## Стек

- **TypeScript 5.2** — суворий режим (`strict: true`)
- **Matter.js 0.19** — фізичний движок (тіла, зіткнення, обмеження)
- **matter-attractors** — плагін притягання для Matter.js
- **poly-decomp** — декомпозиція полігонів
- **Webpack 5** — збірка та dev-сервер
- **Playwright** — E2E тести

## Структура

```
src/
  game.ts        # точка входу гри: ініціалізація, game loop, події
  bodies.ts      # фабрики фізичних тіл (куля, бортик, лузa)
  parameters.ts  # всі ігрові константи (розміри, позиції)
  utils.ts       # чисті утиліти (наприклад, computeSwipeForce)
  index.ts       # точка входу webpack
  styles/
    creative.scss
  types/
    poly-decomp.d.ts

assets/
  index.html
  Images/        # текстури столу

e2e/
  index.spec.ts  # Playwright E2E тести

src/__tests__/
  index.test.ts  # unit тести
```

## Команди

```bash
npm start        # webpack dev-server (http://localhost:8080)
npm run build    # production build → dist/
npm run e2e      # Playwright E2E тести
```

## Архітектура

- **Фізика**: Matter.js engine + world. Всі тіла створюються через фабрики в `bodies.ts`.
- **Параметри**: всі ігрові константи централізовані в `parameters.ts` → `gameData`. Не хардкодити цифри в `game.ts`.
- **Утиліти**: чисті функції без сайд-ефектів — в `utils.ts`.
- **Canvas**: 750×1334px (мобільна орієнтація).

## Конвенції

- `strict: true` — `any` заборонений, тільки `unknown` з narrowing
- Явні типи повернення на exported функціях
- Чисті функції для обчислень (без мутацій аргументів)
- Булеві змінні: префікс `is`, `has`, `can` (наприклад, `isConstrained`)
- Приватні властивості класу: префікс `_`
