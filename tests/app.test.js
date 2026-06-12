const { appState, calculateFootprint, gainXP } = require("../app.js");

describe("App Logic Tests", () => {
  beforeEach(() => {
    // Reset app state before each test
    appState.user.xp = 0;
    appState.user.level = 1;
    appState.calculator.footprints = { total: 0 };
  });

  it("should have initial state defined correctly", () => {
    expect(appState).toBeDefined();
    expect(appState.user.level).toBe(1);
    expect(appState.user.xp).toBe(0);
  });

  it("should calculate transport footprint accurately for petrol car", () => {
    const inputs = {
      transMode: "car-petrol",
      carDistance: 100, // 100 km/week
      flightsShort: 0,
      flightsLong: 0,
      energyKwh: 0,
      heatingSource: "none",
      solarPercent: 0,
      dietType: "vegan",
      foodLocal: "rarely",
      recycleHabits: "yes",
      shoppingHabits: "minimalist",
    };

    // Petrol factor is 0.22 kg/km. 100 * 52 = 5200 km.
    // 5200 * 0.22 = 1144 kg = 1.144 tonnes.
    const result = calculateFootprint(inputs);
    expect(result.transport).toBeCloseTo(1.144);
  });

  it("should calculate diet footprint correctly", () => {
    const inputs = {
      transMode: "walk-bike",
      carDistance: 0,
      flightsShort: 0,
      flightsLong: 0,
      energyKwh: 0,
      heatingSource: "none",
      solarPercent: 0,
      dietType: "meat-heavy", // 2.9 tonnes
      foodLocal: "mostly", // -0.25 tonnes
      recycleHabits: "yes",
      shoppingHabits: "minimalist",
    };

    const result = calculateFootprint(inputs);
    expect(result.diet).toBeCloseTo(2.65);
  });

  it("should reduce energy footprint with solar percentage", () => {
    const inputs = {
      transMode: "walk-bike",
      carDistance: 0,
      flightsShort: 0,
      flightsLong: 0,
      energyKwh: 100, // 1200 / yr. * 0.42 = 504 kg = 0.504 tonnes
      heatingSource: "none",
      solarPercent: 50, // reduces by 50% = 0.252 tonnes
      dietType: "vegan",
      foodLocal: "rarely",
      recycleHabits: "yes",
      shoppingHabits: "minimalist",
    };

    const result = calculateFootprint(inputs);
    expect(result.energy).toBeCloseTo(0.252);
  });
});
