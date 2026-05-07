# Pool Game

Браузерна 2D-гра в більярд на TypeScript + Matter.js з реалістичною фізикою та сенсорним керуванням.

---

## Стек

| Технологія | Версія | Призначення |
|---|---|---|
| TypeScript | 5.2 | Мова, `strict: true` |
| Matter.js | 0.19 | Фізичний движок |
| Webpack | 5 | Збірка та dev-сервер |
| Jest | — | Unit-тести |
| Playwright | — | E2E тести |

## Швидкий старт

```bash
npm install
npm start        # http://localhost:8080
```

## Команди

```bash
npm start         # dev-сервер з hot reload
npm run build     # production build → dist/
npm test          # unit-тести (Jest)
npm run e2e       # E2E тести (Playwright)
```

## Структура проєкту

```
src/
├── game.ts          # ініціалізація, game loop, події вводу
├── bodies.ts        # фабрики фізичних тіл (куля, бортик, луза)
├── parameters.ts    # ігрові константи (розміри, позиції)
├── utils.ts         # чисті утиліти (computeSwipeForce тощо)
├── index.ts         # точка входу Webpack
├── styles/
│   └── creative.scss
└── __tests__/
    └── index.test.ts

assets/
├── index.html
└── Images/          # текстури столу та фону

e2e/
└── index.spec.ts    # Playwright E2E тести
```

## Геймплей

- Проведіть свайп від кулі — чим далі, тим сильніший удар (максимум 150 px)
- Забийте **8 куль**, щоб перемогти
- Якщо рахунок стає від'ємним або куль не вистачає — програш
- Кнопка **Reset** перезапускає партію

## Архітектура

- Вся фізика — Matter.js `Engine` + `World`; тіла створюються через фабрики в `bodies.ts`
- Константи централізовані в `parameters.ts` → `gameData`; в `game.ts` числа не хардкодяться
- Чисті функції без сайд-ефектів — в `utils.ts`
- Canvas: **750 × 1334 px** (мобільна орієнтація, portrait)
