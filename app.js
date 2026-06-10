/* ====================================================
   TERRALIFE CORE APPLICATION CONTROLLER & LOGIC
   ==================================================== */

// State Management Container
let appState = {
    user: {
        name: "Swati Gupta",
        level: 1,
        xp: 0,
        totalSavedCo2: 0.0, // in kg
        levelUpThreshold: 100
    },
    calculator: {
        isBaselineCalculated: false,
        inputs: {
            transMode: "car-petrol",
            carDistance: 150,
            flightsShort: 2,
            flightsLong: 0,
            energyKwh: 250,
            heatingSource: "natural-gas",
            solarPercent: 0,
            dietType: "meat-moderate",
            foodLocal: "rarely",
            recycleHabits: "yes",
            shoppingHabits: "average"
        },
        footprints: {
            transport: 0,
            energy: 0,
            diet: 0,
            waste: 0,
            total: 0 // in tonnes CO2e / year
        }
    },
    dailyHabits: {
        lastLoggedDate: "",
        checkedHabits: []
    },
    customActions: [],
    challenges: [
        {
            id: "solar-sovereign",
            title: "Solar Sovereign",
            desc: "Switch your home energy mix to at least 50% renewable energy in the calculator.",
            xpReward: 150,
            co2Reward: 250, // simulated kg/year offset
            badgeId: "badge-solar",
            badgeName: "Solar Sovereign",
            icon: "sun",
            targetType: "solar-pct",
            targetVal: 50,
            progressText: "Solar percentage: ",
            isJoined: false,
            isCompleted: false
        },
        {
            id: "green-commuter",
            title: "Commuter Shield",
            desc: "Log sustainable transit ('Commuted by bicycle or walking' or 'Commute via public transit') 3 times in your daily habits.",
            xpReward: 200,
            co2Reward: 350,
            badgeId: "badge-commuter",
            badgeName: "Commuter Shield",
            icon: "bike",
            progress: 0,
            target: 3,
            isJoined: false,
            isCompleted: false
        },
        {
            id: "herbivore-week",
            title: "Green Fork",
            desc: "Log 'Had a plant-based meal today' 5 times to reduce agricultural carbon impact.",
            xpReward: 250,
            co2Reward: 400,
            badgeId: "badge-herbivore",
            badgeName: "Green Fork",
            icon: "leaf",
            progress: 0,
            target: 5,
            isJoined: false,
            isCompleted: false
        },
        {
            id: "waste-crusader",
            title: "Eco Champion",
            desc: "Lock in full recycling habits in the calculator and log 'Avoided single-use plastics' twice.",
            xpReward: 180,
            co2Reward: 300,
            badgeId: "badge-champion",
            badgeName: "Eco Champion",
            icon: "award",
            progress: 0,
            target: 2,
            isJoined: false,
            isCompleted: false
        }
    ],
    unlockedBadges: [],
    quiz: {
        isTakenToday: false,
        questions: [
            {
                q: "Which sector is responsible for the largest share of global greenhouse gas emissions?",
                options: [
                    "Transportation",
                    "Electricity & Heat Production",
                    "Agriculture & Forestry",
                    "Heavy Industry & Manufacturing"
                ],
                correctIndex: 1,
                explanation: "Electricity and heat production accounts for roughly 25% of global greenhouse gas emissions, followed closely by agriculture/land use (24%) and industry (21%)."
            },
            {
                q: "What is the warming potential of methane (CH4) compared to carbon dioxide (CO2) over a 100-year timescale?",
                options: [
                    "About 2 times more powerful",
                    "About 28-36 times more powerful",
                    "Exactly equal",
                    "About 150 times more powerful"
                ],
                correctIndex: 1,
                explanation: "Methane is a potent greenhouse gas. While it has a shorter lifetime in the atmosphere, it is 28-36 times more effective at trapping heat than CO2 over 100 years."
            },
            {
                q: "On average, how much carbon dioxide (CO2) does a mature, healthy tree absorb per year?",
                options: [
                    "About 2 kg",
                    "About 22 kg",
                    "About 150 kg",
                    "About 500 kg"
                ],
                correctIndex: 1,
                explanation: "A mature tree absorbs roughly 22 kg (48 lbs) of carbon dioxide per year, making forestry conservation a powerful climate tool."
            },
            {
                q: "Which dietary protein choice typically generates the absolute lowest greenhouse gas footprint?",
                options: [
                    "Farm-raised Salmon",
                    "Organic Chicken",
                    "Lentils and Beans",
                    "Grass-fed Beef"
                ],
                correctIndex: 2,
                explanation: "Plant proteins like lentils and beans produce up to 50 times less emissions than beef, and are significantly lower than poultry or fish."
            },
            {
                q: "What does the term 'embodied carbon' refer to?",
                options: [
                    "Carbon emissions locked in the soil of deep old-growth forests",
                    "The emissions generated during mining, manufacture, transport, and construction of materials",
                    "The amount of carbon dioxide stored within animal and human body structures",
                    "The carbon footprint offsets purchased by big corporate airlines"
                ],
                correctIndex: 1,
                explanation: "Embodied carbon is the sum of all greenhouse gas emissions that occur during extraction of raw materials, processing, transportation, and building assembly."
            }
        ],
        currentQuestionIndex: 0,
        score: 0,
        xpEarned: 0
    },
    // Historical trends for charting
    history: [
        { month: "Jan", emissions: 7.2 },
        { month: "Feb", emissions: 7.1 },
        { month: "Mar", emissions: 6.8 },
        { month: "Apr", emissions: 6.5 },
        { month: "May", emissions: 6.2 },
        { month: "Jun", emissions: 6.0 } // active month will update
    ]
};

// Global Habit definitions
const DEFAULT_HABITS = [
    {
        id: "commute-transit",
        name: "Commute via Public Transit",
        desc: "Took bus or train instead of single-occupancy petrol vehicle.",
        co2Save: 4.2, // in kg CO2e
        xpReward: 15,
        icon: "train",
        category: "transport"
    },
    {
        id: "commute-active",
        name: "Commute by Bicycle or Walking",
        desc: "Zero emission active travel for work or errands.",
        co2Save: 5.0,
        xpReward: 20,
        icon: "bike",
        category: "transport"
    },
    {
        id: "plant-diet",
        name: "Had a plant-based meal today",
        desc: "Substituted meat/dairy for legumes, grains, or vegetables.",
        co2Save: 2.1,
        xpReward: 15,
        icon: "leaf",
        category: "diet"
    },
    {
        id: "unplug-standby",
        name: "Unplug standby electronics",
        desc: "Turned off TV, microwave, and chargers at the wall outlet.",
        co2Save: 0.8,
        xpReward: 10,
        icon: "plug",
        category: "energy"
    },
    {
        id: "laundry-air",
        name: "Air-dried laundry instead of dryer",
        desc: "Used drying racks or washing lines outside.",
        co2Save: 1.8,
        xpReward: 10,
        icon: "wind",
        category: "energy"
    },
    {
        id: "shower-five",
        name: "Shower under 5 minutes",
        desc: "Saved hot water and reduced heating fuel consumption.",
        co2Save: 1.2,
        xpReward: 10,
        icon: "shower-head",
        category: "energy"
    },
    {
        id: "no-single-plastic",
        name: "Avoided single-use plastics",
        desc: "Used reusable grocery bags, water bottles, or coffee cups.",
        co2Save: 0.5,
        xpReward: 5,
        icon: "shopping-bag",
        category: "waste"
    }
];

// Available badges config
const BADGE_CONFIG = {
    "badge-solar": {
        id: "badge-solar",
        name: "Solar Sovereign",
        desc: "Unlocked by achieving 50%+ renewable energy baseline.",
        icon: "sun",
        class: "gold-badge"
    },
    "badge-commuter": {
        id: "badge-commuter",
        name: "Commuter Shield",
        desc: "Unlocked by logging 3 active commutes in daily actions.",
        icon: "bike",
        class: ""
    },
    "badge-herbivore": {
        id: "badge-herbivore",
        name: "Green Fork",
        desc: "Unlocked by logging plant-based meals 5 times.",
        icon: "leaf",
        class: ""
    },
    "badge-champion": {
        id: "badge-champion",
        name: "Eco Champion",
        desc: "Unlocked by locking in recycling and logging plastic reduction twice.",
        icon: "award",
        class: "gold-badge"
    },
    "badge-quiz": {
        id: "badge-quiz",
        name: "Quiz Master",
        desc: "Unlocked by scoring 5/5 on the daily eco-trivia quiz.",
        icon: "brain",
        class: "gold-badge"
    }
};

// Global Chart References
let categoryChartRef = null;
let trendChartRef = null;

// DOM Content Loaded Handler
document.addEventListener("DOMContentLoaded", () => {
    // 1. Initial State Load
    loadStateFromStorage();
    
    // 2. Initialize Navigation and Core Tabs
    initNavigation();
    
    // 3. Render Dashboard Elements
    renderDashboard();
    
    // 4. Render Daily Habits Checkbox
    renderHabitsChecklist();
    
    // 5. Render Challenges and Badges
    renderChallengesAndBadges();
    
    // 6. Init Calculator Multi-step inputs & calculations
    initCalculator();

    // 7. Init Eco Hub Features (Simulator and Quiz)
    initEcoHub();

    // 8. Dynamic Date Setup
    setupHeaderDate();

    // 9. Init Theme Toggle
    initTheme();
    
    // Auto-update Lucide Icons
    lucide.createIcons();
});

// Setup date in the header
function setupHeaderDate() {
    const dateEl = document.getElementById("header-date");
    if (dateEl) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = new Date().toLocaleDateString('en-US', options);
    }
}

// ====================================================
// PERSISTENCE (LOCAL STORAGE)
// ====================================================
function saveStateToStorage() {
    localStorage.setItem("terralife_state_v1", JSON.stringify(appState));
}

function loadStateFromStorage() {
    const saved = localStorage.getItem("terralife_state_v1");
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // Deep merge keys
            appState.user = { ...appState.user, ...parsed.user };
            appState.calculator = { ...appState.calculator, ...parsed.calculator };
            appState.dailyHabits = { ...appState.dailyHabits, ...parsed.dailyHabits };
            appState.customActions = parsed.customActions || [];
            appState.unlockedBadges = parsed.unlockedBadges || [];
            appState.quiz = { ...appState.quiz, ...parsed.quiz };
            
            // Check if active day has changed (reset habits check list if new day)
            const todayStr = new Date().toDateString();
            if (appState.dailyHabits.lastLoggedDate !== todayStr) {
                appState.dailyHabits.lastLoggedDate = todayStr;
                appState.dailyHabits.checkedHabits = [];
            }
            
            // Sync challenges state
            if (parsed.challenges && Array.isArray(parsed.challenges)) {
                parsed.challenges.forEach(c => {
                    const localC = appState.challenges.find(x => x.id === c.id);
                    if (localC) {
                        localC.isJoined = c.isJoined;
                        localC.isCompleted = c.isCompleted;
                        localC.progress = c.progress !== undefined ? c.progress : localC.progress;
                    }
                });
            }
        } catch (e) {
            console.error("Error loading persisted state:", e);
        }
    } else {
        // First load defaults
        appState.dailyHabits.lastLoggedDate = new Date().toDateString();
    }
}

// ====================================================
// THEME SWITCHER
// ====================================================
function initTheme() {
    const themeBtn = document.getElementById("theme-toggle");
    const sunIcon = themeBtn.querySelector(".sun-icon");
    const moonIcon = themeBtn.querySelector(".moon-icon");

    // Load theme setting
    const lightThemeActive = localStorage.getItem("terralife_light_theme") === "true";
    if (lightThemeActive) {
        document.body.classList.add("light-mode");
        sunIcon.classList.add("hidden");
        moonIcon.classList.remove("hidden");
    }

    themeBtn.addEventListener("click", () => {
        const isLight = document.body.classList.toggle("light-mode");
        localStorage.setItem("terralife_light_theme", isLight ? "true" : "false");
        
        if (isLight) {
            sunIcon.classList.add("hidden");
            moonIcon.classList.remove("hidden");
        } else {
            sunIcon.classList.remove("hidden");
            moonIcon.classList.add("hidden");
        }

        // Re-render charts to update text colors
        renderCharts();
    });
}

// ====================================================
// NAVIGATION & PAGE CONTROL
// ====================================================
function initNavigation() {
    const navLinks = document.querySelectorAll(".nav-link");
    const tabPanes = document.querySelectorAll(".tab-pane");

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            const targetTab = link.getAttribute("data-tab");
            
            // Update active link styling
            navLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");
            
            // Switch viewport
            tabPanes.forEach(pane => {
                pane.classList.remove("active");
                if (pane.id === `tab-${targetTab}`) {
                    pane.classList.add("active");
                }
            });

            // Trigger redraw or state update on navigation
            if (targetTab === "dashboard") {
                renderDashboard();
            } else if (targetTab === "challenges") {
                renderChallengesAndBadges();
            }

            // Scroll main content to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // Close notification panel listener
    const closeNotif = document.getElementById("close-notification");
    if (closeNotif) {
        closeNotif.addEventListener("click", () => {
            document.getElementById("dynamic-notification").classList.add("hidden");
        });
    }
}

// Dynamic Toast Alert
function triggerNotification(message, iconName = "info") {
    const banner = document.getElementById("dynamic-notification");
    const text = document.getElementById("notification-text");
    const content = banner.querySelector(".notification-content");
    
    // Replace icon
    const iconPlaceholder = content.querySelector(".notification-icon");
    if (iconPlaceholder) {
        const newIcon = document.createElement("i");
        newIcon.setAttribute("data-lucide", iconName);
        newIcon.className = "notification-icon";
        content.replaceChild(newIcon, iconPlaceholder);
    }
    
    text.textContent = message;
    banner.classList.remove("hidden");
    lucide.createIcons();

    // Auto dismiss after 7 seconds
    setTimeout(() => {
        banner.classList.add("hidden");
    }, 7000);
}

// ====================================================
// LEVEL & XP METRICS
// ====================================================
function gainXP(amount) {
    appState.user.xp += amount;
    
    // Level Up loop
    let levelsGained = 0;
    while (appState.user.xp >= appState.user.levelUpThreshold) {
        appState.user.xp -= appState.user.levelUpThreshold;
        appState.user.level += 1;
        levelsGained++;
    }

    if (levelsGained > 0) {
        // Level up celebration!
        triggerNotification(`🎉 Congratulations! You reached Level ${appState.user.level} Eco-Hero! Keep it up!`, "award");
        launchCelebrationConfetti(3);
    }

    saveStateToStorage();
    updateXPDisplay();
}

function updateXPDisplay() {
    const lvlEl = document.getElementById("user-level");
    const xpEl = document.getElementById("user-xp");
    const barEl = document.getElementById("user-xp-bar");

    if (lvlEl) lvlEl.textContent = appState.user.level;
    if (xpEl) xpEl.textContent = `${appState.user.xp} / ${appState.user.levelUpThreshold} XP`;
    if (barEl) {
        const pct = (appState.user.xp / appState.user.levelUpThreshold) * 100;
        barEl.style.width = `${pct}%`;
    }

    // Sidebar total saved
    const sideSaved = document.getElementById("sidebar-saved-co2");
    if (sideSaved) sideSaved.textContent = appState.user.totalSavedCo2.toFixed(1);
}

// Confetti Launcher
function launchCelebrationConfetti(bursts = 1) {
    let currentBurst = 0;
    const interval = setInterval(() => {
        confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
        });
        currentBurst++;
        if (currentBurst >= bursts) {
            clearInterval(interval);
        }
    }, 250);
}

// ====================================================
// CARBON CALCULATOR & FORMULAS
// ====================================================
function initCalculator() {
    const form = document.getElementById("footprint-calculator");
    
    // Sliders event listener mapping for live updates
    const sliders = [
        { id: "car-dist-input", bubble: "car-dist-bubble", suffix: " km/week" },
        { id: "energy-bill", bubble: "energy-bubble", suffix: " kWh/month" },
        { id: "solar-pct", bubble: "solar-bubble", suffix: "% (Renewable)" }
    ];

    sliders.forEach(slide => {
        const sliderEl = document.getElementById(slide.id);
        const bubbleEl = document.getElementById(slide.bubble);
        if (sliderEl && bubbleEl) {
            sliderEl.addEventListener("input", () => {
                bubbleEl.textContent = sliderEl.value + slide.suffix;
                // Trigger live estimate recalculation
                recalculateLiveEstimate();
            });
        }
    });

    // Inputs value change listener for real-time recalculation
    form.querySelectorAll("input, select").forEach(input => {
        input.addEventListener("change", recalculateLiveEstimate);
    });

    // Form Navigation
    const nextBtns = form.querySelectorAll(".btn-next");
    const prevBtns = form.querySelectorAll(".btn-prev");

    nextBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const nextStepId = btn.getAttribute("data-next");
            
            // Basic Step validation
            const currentStep = btn.closest(".calc-step");
            currentStep.classList.remove("active");
            
            const nextStep = document.getElementById(`calc-step-${nextStepId}`);
            nextStep.classList.add("active");
            
            // Sync step dot indicators
            const dots = document.querySelectorAll(".step-dot");
            dots.forEach(dot => {
                const sNum = parseInt(dot.getAttribute("data-step"));
                if (sNum === parseInt(nextStepId)) {
                    dot.classList.add("active");
                } else if (sNum < parseInt(nextStepId)) {
                    dot.classList.add("completed");
                    dot.classList.remove("active");
                } else {
                    dot.classList.remove("active", "completed");
                }
            });
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const prevStepId = btn.getAttribute("data-prev");
            
            const currentStep = btn.closest(".calc-step");
            currentStep.classList.remove("active");
            
            const prevStep = document.getElementById(`calc-step-${prevStepId}`);
            prevStep.classList.add("active");
            
            // Sync step dots
            const dots = document.querySelectorAll(".step-dot");
            dots.forEach(dot => {
                const sNum = parseInt(dot.getAttribute("data-step"));
                if (sNum === parseInt(prevStepId)) {
                    dot.classList.add("active");
                    dot.classList.remove("completed");
                } else if (sNum > parseInt(prevStepId)) {
                    dot.classList.remove("active", "completed");
                }
            });
        });
    });

    // Form Submission
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        // Finalize state inputs
        const formData = new FormData(form);
        appState.calculator.inputs = {
            transMode: formData.get("trans-mode"),
            carDistance: parseFloat(formData.get("car-distance")),
            flightsShort: parseInt(formData.get("flights-short")) || 0,
            flightsLong: parseInt(formData.get("flights-long")) || 0,
            energyKwh: parseFloat(formData.get("energy-kwh")),
            heatingSource: formData.get("heating-source"),
            solarPercent: parseFloat(formData.get("solar-percent")),
            dietType: formData.get("diet-type"),
            foodLocal: formData.get("food-local"),
            recycleHabits: formData.get("recycle-habits"),
            shoppingHabits: formData.get("shopping-habits")
        };

        // Recalculate
        const calcRes = calculateFootprint(appState.calculator.inputs);
        appState.calculator.footprints = calcRes;
        appState.calculator.isBaselineCalculated = true;
        
        // Update active history month baseline
        appState.history[appState.history.length - 1].emissions = parseFloat((calcRes.total).toFixed(1));
        
        // Grant baseline completion reward once
        if (localStorage.getItem("terralife_calculator_rewarded") !== "true") {
            gainXP(100);
            localStorage.setItem("terralife_calculator_rewarded", "true");
            triggerNotification("🎉 Baseline Footprint calculated! Earned 100 XP baseline reward.", "sparkles");
        } else {
            triggerNotification("🔄 Baseline Footprint updated successfully!", "check-circle");
        }

        // Trigger challenge evaluation for Solar Sovereign
        checkChallengeCriteria("solar-sovereign", appState.calculator.inputs.solarPercent);
        // Trigger challenge evaluation for Waste recycling
        if (appState.calculator.inputs.recycleHabits === "yes") {
            checkChallengeCriteria("waste-crusader");
        }

        saveStateToStorage();
        renderDashboard();

        // Redirect to Dashboard Tab
        const dashBtn = document.getElementById("nav-btn-dashboard");
        if (dashBtn) dashBtn.click();
    });

    // Trigger initial recalculation on load
    recalculateLiveEstimate();
}

// Standard Calculation Formula
function calculateFootprint(inputs) {
    let transport = 0;
    let energy = 0;
    let diet = 0;
    let waste = 0;

    // 1. TRANSPORTATION
    // Car weekly distance to annual CO2 (tonnes)
    // Mode factor: Petrol Car = 0.22 kg/km, EV = 0.05, Public transit = 0.03, Walk/Bike = 0.0
    let transFactor = 0.22;
    if (inputs.transMode === "car-electric") transFactor = 0.05;
    else if (inputs.transMode === "public-transit") transFactor = 0.03;
    else if (inputs.transMode === "walk-bike") transFactor = 0.00;

    // Weekly distance * 52 weeks = annual km
    const annualDist = inputs.carDistance * 52;
    transport += (annualDist * transFactor) / 1000; // in tonnes

    // Flight impact: short flight = 150 kg CO2, long flight = 950 kg CO2
    const shortFlightCO2 = inputs.flightsShort * 150;
    const longFlightCO2 = inputs.flightsLong * 950;
    transport += (shortFlightCO2 + longFlightCO2) / 1000; // in tonnes

    // 2. HOUSEHOLD ENERGY
    // Monthly electricity kWh * 12 * factor (0.42 kg CO2e / kWh)
    const annualKwh = inputs.energyKwh * 12;
    const standardGridCo2 = annualKwh * 0.42;
    // Offset by solar panels
    const netElectricityCo2 = standardGridCo2 * (1 - (inputs.solarPercent / 100));
    energy += netElectricityCo2 / 1000;

    // Primary heating source: gas = +1.2 tonnes, electric = +0.8 tonnes, none = 0
    if (inputs.heatingSource === "natural-gas") {
        energy += 1.20;
    } else if (inputs.heatingSource === "electricity") {
        energy += 0.80;
    }

    // 3. DIET & NUTRITION
    // Base food tonnes: heavy meat = 2.9, moderate = 1.8, vegetarian = 1.1, vegan = 0.6
    if (inputs.dietType === "meat-heavy") diet = 2.90;
    else if (inputs.dietType === "meat-moderate") diet = 1.80;
    else if (inputs.dietType === "vegetarian") diet = 1.10;
    else if (inputs.dietType === "vegan") diet = 0.60;

    // Sourcing organic discounts: rarely = 0, sometimes = -0.1t, mostly = -0.25t
    if (inputs.foodLocal === "sometimes") diet -= 0.10;
    else if (inputs.foodLocal === "mostly") diet -= 0.25;

    // 4. LIFESTYLE & WASTE
    // Shopping habits: minimalist = 0.5, average = 1.2, heavy = 2.2
    if (inputs.shoppingHabits === "minimalist") waste = 0.50;
    else if (inputs.shoppingHabits === "average") waste = 1.20;
    else if (inputs.shoppingHabits === "heavy") waste = 2.20;

    // Recycling discount: yes = -0.35 tonnes, partial = -0.15 tonnes
    if (inputs.recycleHabits === "yes") waste -= 0.35;
    else if (inputs.recycleHabits === "partial") waste -= 0.15;

    // Safeguard negative values
    transport = Math.max(0, transport);
    energy = Math.max(0, energy);
    diet = Math.max(0, diet);
    waste = Math.max(0, waste);

    const total = transport + energy + diet + waste;

    return {
        transport: parseFloat(transport.toFixed(2)),
        energy: parseFloat(energy.toFixed(2)),
        diet: parseFloat(diet.toFixed(2)),
        waste: parseFloat(waste.toFixed(2)),
        total: parseFloat(total.toFixed(2))
    };
}

// Sidepanel Live Calculation Preview
function recalculateLiveEstimate() {
    const transMode = document.querySelector('input[name="trans-mode"]:checked')?.value || "car-petrol";
    const carDistance = parseFloat(document.getElementById("car-dist-input")?.value) || 0;
    
    // Show/hide car distance slider based on mode choice
    const distGroup = document.getElementById("group-car-distance");
    if (distGroup) {
        if (transMode === "walk-bike") {
            distGroup.style.display = "none";
        } else {
            distGroup.style.display = "block";
        }
    }

    const flightsShort = parseInt(document.getElementById("flights-short")?.value) || 0;
    const flightsLong = parseInt(document.getElementById("flights-long")?.value) || 0;
    const energyKwh = parseFloat(document.getElementById("energy-bill")?.value) || 0;
    const heatingSource = document.querySelector('input[name="heating-source"]:checked')?.value || "natural-gas";
    const solarPercent = parseFloat(document.getElementById("solar-pct")?.value) || 0;
    const dietType = document.querySelector('input[name="diet-type"]:checked')?.value || "meat-moderate";
    const foodLocal = document.querySelector('select[name="food-local"]')?.value || "rarely";
    const recycleHabits = document.querySelector('input[name="recycle-habits"]:checked')?.value || "yes";
    const shoppingHabits = document.querySelector('input[name="shopping-habits"]:checked')?.value || "average";

    const mockInputs = {
        transMode, carDistance, flightsShort, flightsLong, energyKwh, heatingSource, solarPercent, dietType, foodLocal, recycleHabits, shoppingHabits
    };

    const res = calculateFootprint(mockInputs);

    // Update Side panel fields
    const scoreVal = document.getElementById("live-calc-score");
    if (scoreVal) scoreVal.textContent = res.total.toFixed(1);

    const transportVal = document.getElementById("side-val-transport");
    if (transportVal) transportVal.textContent = res.transport.toFixed(1) + " t";
    
    const energyVal = document.getElementById("side-val-energy");
    if (energyVal) energyVal.textContent = res.energy.toFixed(1) + " t";

    const dietVal = document.getElementById("side-val-diet");
    if (dietVal) dietVal.textContent = res.diet.toFixed(1) + " t";

    const wasteVal = document.getElementById("side-val-waste");
    if (wasteVal) wasteVal.textContent = res.waste.toFixed(1) + " t";

    // Progress bar comparison (vs standard average of 10.0 tonnes/year)
    const progressFill = document.getElementById("live-score-progress");
    if (progressFill) {
        const percentage = Math.min(100, (res.total / 10.0) * 100);
        progressFill.style.width = `${percentage}%`;
        
        // Alert colors
        if (percentage < 40) {
            progressFill.style.backgroundColor = "var(--primary)";
        } else if (percentage < 80) {
            progressFill.style.backgroundColor = "var(--accent)";
        } else {
            progressFill.style.backgroundColor = "var(--danger)";
        }
    }

    // Interactive comparative prompt
    const comparisonText = document.getElementById("live-score-comparison");
    if (comparisonText) {
        if (res.total <= 2.0) {
            comparisonText.innerHTML = "✨ <strong>Excellent!</strong> You are at the target climate neutrality goal (2.0 tonnes/year).";
        } else if (res.total <= 5.0) {
            comparisonText.innerHTML = "👍 <strong>Good score:</strong> You are well below the national average of 10.0 tonnes/year.";
        } else if (res.total <= 9.0) {
            comparisonText.innerHTML = "⚠️ <strong>Moderate:</strong> You are close to the average citizen's output. Look at transport/energy tabs to trim down.";
        } else {
            comparisonText.innerHTML = "🚨 <strong>High footprint:</strong> Swapping some car trips or switching electricity sources will make a massive impact!";
        }
    }
}

// ====================================================
// USER DASHBOARD RENDERING
// ====================================================
function renderDashboard() {
    updateXPDisplay();

    const baselineCalculated = appState.calculator.isBaselineCalculated;
    const monthlyFootprintEl = document.getElementById("dashboard-monthly-footprint");
    const gaugeStatusEl = document.getElementById("dashboard-gauge-status");
    const totalSavedEl = document.getElementById("dashboard-saved-co2");
    const savedEquivalentEl = document.getElementById("dashboard-saved-equivalent");
    const comparisonPctEl = document.getElementById("dashboard-comparison-pct");
    const comparisonSubEl = document.getElementById("dashboard-comparison-sub");
    
    // Dynamic welcome greeting based on baseline
    const welcomeBanner = document.getElementById("welcome-banner");
    if (welcomeBanner) {
        welcomeBanner.textContent = baselineCalculated 
            ? `Welcome back, Swati Gupta!` 
            : `Let's set your baseline carbon footprint!`;
    }

    // Set Saved emissions
    const totalSavedKg = appState.user.totalSavedCo2;
    if (totalSavedEl) totalSavedKg === 0 ? totalSavedEl.textContent = "0.0 kg" : totalSavedEl.textContent = `${totalSavedKg.toFixed(1)} kg`;
    if (savedEquivalentEl) {
        const equivalentTrees = (totalSavedKg / 22.0).toFixed(1);
        savedEquivalentEl.textContent = `Equivalent to ${equivalentTrees} mature trees planted`;
    }

    // Baseline stats calculations
    if (baselineCalculated) {
        const footprintTonnes = appState.calculator.footprints.total;
        // monthly footprint in kg CO2e = (tonnes * 1000) / 12 months
        // Offset by whatever daily offset has been achieved today
        const baselineMonthlyKg = (footprintTonnes * 1000) / 12;
        const currentActiveSavingsKg = parseFloat(document.getElementById("today-co2-saved")?.textContent) || 0;
        const netMonthlyKg = Math.max(0, baselineMonthlyKg - currentActiveSavingsKg);

        if (monthlyFootprintEl) monthlyFootprintEl.textContent = Math.round(netMonthlyKg);

        // Circular Gauge
        // Dasharray total is 251.2 (2 * pi * r = 2 * 3.14 * 40)
        // Target: 2.0 tonnes/year baseline monthly average is 166 kg CO2e.
        // We compare user's current baseline relative to national average (10 tonnes/year = 833 kg/month)
        const gaugeEl = document.getElementById("dashboard-gauge");
        if (gaugeEl) {
            const fraction = Math.min(1.0, netMonthlyKg / 833);
            const offset = 251.2 - (fraction * 251.2);
            gaugeEl.style.strokeDashoffset = offset;
            
            // Set Color based on footprint rating
            if (fraction < 0.35) {
                gaugeEl.style.stroke = "var(--primary)";
            } else if (fraction < 0.75) {
                gaugeEl.style.stroke = "var(--accent)";
            } else {
                gaugeEl.style.stroke = "var(--danger)";
            }
        }

        if (gaugeStatusEl) {
            if (netMonthlyKg <= 166) {
                gaugeStatusEl.textContent = "Climate Neutral Champion";
                gaugeStatusEl.style.color = "var(--primary)";
            } else if (netMonthlyKg <= 416) {
                gaugeStatusEl.textContent = "Eco Conscious";
                gaugeStatusEl.style.color = "var(--secondary)";
            } else {
                gaugeStatusEl.textContent = "Action Needed";
                gaugeStatusEl.style.color = "var(--accent)";
            }
        }

        // Compare against local standard average (10.0 tonnes/year)
        const diffPercent = ((10.0 - footprintTonnes) / 10.0) * 100;
        if (comparisonPctEl) {
            if (diffPercent >= 0) {
                comparisonPctEl.textContent = `${Math.round(diffPercent)}% Less`;
                comparisonPctEl.style.color = "var(--primary)";
            } else {
                comparisonPctEl.textContent = `${Math.round(Math.abs(diffPercent))}% More`;
                comparisonPctEl.style.color = "var(--danger)";
            }
        }
        if (comparisonSubEl) {
            comparisonSubEl.textContent = `Compared to average citizen (10.0t)`;
        }

        // Generate insights
        generatePersonalizedInsights();

    } else {
        // Defaults if calculator not run
        if (monthlyFootprintEl) monthlyFootprintEl.textContent = "—";
        if (gaugeStatusEl) gaugeStatusEl.textContent = "Click 'Calculator' to set baseline";
        if (comparisonPctEl) comparisonPctEl.textContent = "0%";
        if (comparisonSubEl) comparisonSubEl.textContent = "Baseline not calculated yet";
        
        // Show fallback in donut wrapper
        const categoryFallback = document.getElementById("category-chart-fallback");
        if (categoryFallback) categoryFallback.classList.remove("hidden");
    }

    // Render Charts
    renderCharts();
}

// Generate Dynamic Eco-Insights
function generatePersonalizedInsights() {
    const inputs = appState.calculator.inputs;
    const footprint = appState.calculator.footprints;
    const container = document.getElementById("dashboard-insights");
    container.innerHTML = ""; // Clear

    let insightsList = [];

    // Insight 1: Heavy travel emissions
    if (footprint.transport > 2.5) {
        insightsList.push({
            type: "warning",
            text: "Your transportation footprint is high. Swapping 2 commutes a week to public transit or cycling in the Habits tab saves up to 450kg CO₂e/year!"
        });
    }

    // Insight 2: Renewable energy
    if (inputs.solarPercent < 30) {
        insightsList.push({
            type: "suggestion",
            text: "Switching home grid mix to at least 50% clean energy will drop your Energy baseline footprint by up to 1.1 tonnes."
        });
    }

    // Insight 3: Beef intake
    if (inputs.dietType === "meat-heavy") {
        insightsList.push({
            type: "warning",
            text: "Agriculture and meat processing are major emission sources. Trying a vegetarian meal plan for 3 days a week offsets ~350kg CO₂e/year."
        });
    }

    // Insight 4: Air conditioning/heating fuel
    if (inputs.heatingSource === "natural-gas") {
        insightsList.push({
            type: "suggestion",
            text: "Gas heating adds 1.2 tonnes of overhead. Setting thermostats 1.5°C lower in winter or air drying laundry offers rapid savings."
        });
    }

    // Insight 5: Zero-waste/recycling
    if (inputs.recycleHabits !== "yes") {
        insightsList.push({
            type: "suggestion",
            text: "Plastic waste contributes to carbon footprint via landfill breakdown. Try turning on recycling in the calculator for a -350kg discount."
        });
    }

    // Fallback default insight
    if (insightsList.length === 0) {
        insightsList.push({
            type: "achievement",
            text: "Fantastic lifestyle balance! Your baseline carbon values are extremely optimal. Check challenges to earn further badges."
        });
    }

    // Render list
    insightsList.forEach(ins => {
        const item = document.createElement("div");
        item.className = `insight-item ${ins.type}`;
        
        const dot = document.createElement("div");
        dot.className = "insight-dot";
        
        const text = document.createElement("p");
        text.textContent = ins.text;

        item.appendChild(dot);
        item.appendChild(text);
        container.appendChild(item);
    });
}

// Draw Charts using Chart.js
function renderCharts() {
    const isLightMode = document.body.classList.contains("light-mode");
    const fontColor = isLightMode ? "#4b5563" : "#9ca3af";
    const gridColor = isLightMode ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)";

    // 1. Donut Chart
    const canvasCategory = document.getElementById("categoryChart");
    if (canvasCategory) {
        const hasBaseline = appState.calculator.isBaselineCalculated;
        const categoryFallback = document.getElementById("category-chart-fallback");

        if (categoryFallback) {
            if (hasBaseline) {
                categoryFallback.classList.add("hidden");
                canvasCategory.classList.remove("hidden");
            } else {
                categoryFallback.classList.remove("hidden");
                canvasCategory.classList.add("hidden");
                return; // skip drawing
            }
        }

        // Destroy old instance if exists
        if (categoryChartRef) {
            categoryChartRef.destroy();
        }

        const data = appState.calculator.footprints;
        categoryChartRef = new Chart(canvasCategory, {
            type: 'doughnut',
            data: {
                labels: ['Transport', 'Energy', 'Food & Diet', 'Waste & Buy'],
                datasets: [{
                    data: [data.transport, data.energy, data.diet, data.waste],
                    backgroundColor: [
                        '#10b981', // Mint
                        '#06b6d4', // Cyan
                        '#f59e0b', // Amber
                        '#8b5cf6'  // Purple
                    ],
                    borderWidth: isLightMode ? 2 : 0,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: fontColor,
                            font: { family: 'Inter', size: 11 }
                        }
                    }
                },
                cutout: '65%'
            }
        });
    }

    // 2. Trend Line Chart
    const canvasTrend = document.getElementById("trendChart");
    if (canvasTrend) {
        if (trendChartRef) {
            trendChartRef.destroy();
        }

        // Dynamically adjust active month if baseline is calculated
        if (appState.calculator.isBaselineCalculated) {
            appState.history[appState.history.length - 1].emissions = parseFloat((appState.calculator.footprints.total).toFixed(1));
        }

        const labels = appState.history.map(h => h.month);
        const dataVals = appState.history.map(h => h.emissions);

        trendChartRef = new Chart(canvasTrend, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Carbon Footprint (tonnes CO₂e/yr)',
                    data: dataVals,
                    borderColor: '#10b981',
                    borderWidth: 3,
                    tension: 0.4,
                    pointBackgroundColor: '#10b981',
                    pointHoverRadius: 6,
                    fill: true,
                    backgroundColor: (context) => {
                        const chart = context.chart;
                        const {ctx, chartArea} = chart;
                        if (!chartArea) return null;
                        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
                        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
                        return gradient;
                    }
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: fontColor,
                            font: { family: 'Inter', size: 11 }
                        }
                    },
                    y: {
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: fontColor,
                            font: { family: 'Inter', size: 11 }
                        }
                    }
                }
            }
        });
    }
}

// ====================================================
// DAILY HABITS TRACKER LOGIC
// ====================================================
function renderHabitsChecklist() {
    const listContainer = document.getElementById("habits-checklist");
    if (!listContainer) return;
    listContainer.innerHTML = "";

    // Load active logs and custom actions
    const allHabits = [...DEFAULT_HABITS, ...appState.customActions];

    allHabits.forEach(habit => {
        const isChecked = appState.dailyHabits.checkedHabits.includes(habit.id);
        
        const row = document.createElement("div");
        row.className = `habit-item ${isChecked ? 'completed' : ''}`;
        row.setAttribute("data-habit-id", habit.id);

        const leftDiv = document.createElement("div");
        leftDiv.className = "habit-left";

        const chkWrapper = document.createElement("label");
        chkWrapper.className = "custom-checkbox-wrapper";

        const input = document.createElement("input");
        input.type = "checkbox";
        input.checked = isChecked;
        
        // Check box click logic
        input.addEventListener("change", (e) => {
            toggleHabitCompletion(habit, e.target.checked);
        });

        const checkMark = document.createElement("span");
        checkMark.className = "checkbox-checkmark";

        chkWrapper.appendChild(input);
        chkWrapper.appendChild(checkMark);

        const infoDiv = document.createElement("div");
        infoDiv.className = "habit-info";

        const nameSpan = document.createElement("span");
        nameSpan.className = "habit-name";
        nameSpan.textContent = habit.name;

        const impactSpan = document.createElement("span");
        impactSpan.className = "habit-impact-tag";
        impactSpan.innerHTML = `<i data-lucide="trending-down"></i> Saves ${habit.co2Save.toFixed(1)} kg CO₂e`;

        infoDiv.appendChild(nameSpan);
        infoDiv.appendChild(impactSpan);

        leftDiv.appendChild(chkWrapper);
        leftDiv.appendChild(infoDiv);

        const badge = document.createElement("div");
        badge.className = "habit-points-badge";
        badge.innerHTML = `<i data-lucide="zap"></i> +${habit.xpReward} XP`;

        row.appendChild(leftDiv);
        row.appendChild(badge);

        listContainer.appendChild(row);
    });

    lucide.createIcons();
    updateImpactMetrics();
}

// Habit log event action
function toggleHabitCompletion(habit, isChecked) {
    const checkedIndex = appState.dailyHabits.checkedHabits.indexOf(habit.id);

    if (isChecked) {
        if (checkedIndex === -1) {
            appState.dailyHabits.checkedHabits.push(habit.id);
            appState.user.totalSavedCo2 += habit.co2Save;
            
            // Add timeline event
            addTimelineEvent(habit.name, habit.co2Save, habit.xpReward);
            
            // Trigger confetti for checking!
            confetti({
                particleCount: 40,
                angle: 60,
                spread: 55,
                origin: { x: 0 }
            });
            
            // Add points
            gainXP(habit.xpReward);

            // Evaluate challenge progress
            if (habit.id === "commute-active" || habit.id === "commute-transit") {
                checkChallengeCriteria("green-commuter");
            }
            if (habit.id === "plant-diet") {
                checkChallengeCriteria("herbivore-week");
            }
            if (habit.id === "no-single-plastic") {
                checkChallengeCriteria("waste-crusader");
            }
        }
    } else {
        if (checkedIndex !== -1) {
            appState.dailyHabits.checkedHabits.splice(checkedIndex, 1);
            appState.user.totalSavedCo2 = Math.max(0.0, appState.user.totalSavedCo2 - habit.co2Save);
            
            // Subtract XP (safeguard floor 0)
            appState.user.xp = Math.max(0, appState.user.xp - habit.xpReward);
            
            // Remove timeline event
            removeTimelineEvent(habit.name);
            
            saveStateToStorage();
            updateXPDisplay();
        }
    }

    // Toggle row class visual
    const habitRow = document.querySelector(`.habit-item[data-habit-id="${habit.id}"]`);
    if (habitRow) {
        if (isChecked) habitRow.classList.add("completed");
        else habitRow.classList.remove("completed");
    }

    updateImpactMetrics();
}

// Custom Action Logging
const addCustomBtn = document.getElementById("add-custom-action-btn");
if (addCustomBtn) {
    addCustomBtn.addEventListener("click", () => {
        const inputName = document.getElementById("custom-action-name");
        const selectImpact = document.getElementById("custom-action-impact");

        if (!inputName || !inputName.value.trim()) {
            triggerNotification("⚠️ Please enter a description for your custom action.", "info");
            return;
        }

        const name = inputName.value.trim();
        const co2Save = parseFloat(selectImpact.value);
        let xpReward = 10;
        if (co2Save >= 3.0) xpReward = 25;
        else if (co2Save >= 1.5) xpReward = 15;

        const customHabit = {
            id: `custom-${Date.now()}`,
            name: name,
            co2Save: co2Save,
            xpReward: xpReward,
            icon: "sparkles",
            category: "custom"
        };

        // Add to state
        appState.customActions.push(customHabit);
        
        // Log it as checked immediately!
        appState.dailyHabits.checkedHabits.push(customHabit.id);
        appState.user.totalSavedCo2 += customHabit.co2Save;
        
        // Trigger rewards
        addTimelineEvent(customHabit.name, customHabit.co2Save, customHabit.xpReward);
        gainXP(customHabit.xpReward);

        // Reset fields
        inputName.value = "";
        
        // Re-render
        renderHabitsChecklist();
        triggerNotification(`✅ Successfully logged action: "${name}"`, "check-circle");
    });
}

// Reset checked habits logic
const resetHabitsBtn = document.getElementById("reset-habits-btn");
if (resetHabitsBtn) {
    resetHabitsBtn.addEventListener("click", () => {
        appState.dailyHabits.checkedHabits = [];
        saveStateToStorage();
        renderHabitsChecklist();
        triggerNotification("🔄 Checked habits have been reset.", "rotate-ccw");
    });
}

// Update Tracker totals
function updateImpactMetrics() {
    const todaySavedEl = document.getElementById("today-co2-saved");
    const todayXPEl = document.getElementById("today-xp-gained");
    const todayEquivalentBanner = document.getElementById("today-equivalent-banner");

    let totalSaved = 0;
    let totalXP = 0;

    const allHabits = [...DEFAULT_HABITS, ...appState.customActions];
    
    appState.dailyHabits.checkedHabits.forEach(hId => {
        const match = allHabits.find(h => h.id === hId);
        if (match) {
            totalSaved += match.co2Save;
            totalXP += match.xpReward;
        }
    });

    if (todaySavedEl) todaySavedEl.textContent = totalSaved.toFixed(1);
    if (todayXPEl) todayXPEl.textContent = totalXP;

    if (todayEquivalentBanner) {
        if (totalSaved === 0) {
            todayEquivalentBanner.innerHTML = "<p>Start checking habits to see your carbon offsets visualized!</p>";
        } else {
            const plasticBottles = Math.round(totalSaved / 0.08); // avg plastic bottle is 80g carbon
            const phoneCharges = Math.round(totalSaved / 0.008); // avg phone charge is 8g carbon
            todayEquivalentBanner.innerHTML = `<p>✨ <strong>Impact:</strong> Offsetting ${totalSaved.toFixed(1)} kg CO₂e is equivalent to saving <strong>${phoneCharges}</strong> smartphone charges or avoiding <strong>${plasticBottles}</strong> single-use plastic bottles!</p>`;
        }
    }

    // Dashboard daily count update
    const dashCount = document.getElementById("dashboard-actions-count");
    if (dashCount) {
        dashCount.textContent = `${appState.dailyHabits.checkedHabits.length}/${DEFAULT_HABITS.length}`;
    }
}

// Timeline feed additions
function addTimelineEvent(name, co2, xp) {
    const container = document.getElementById("timeline-feed");
    if (!container) return;

    // Clear empty fallback
    const emptyMsg = container.querySelector(".timeline-empty");
    if (emptyMsg) emptyMsg.style.display = "none";

    const item = document.createElement("div");
    item.className = "timeline-item";
    item.setAttribute("data-timeline-ref", name);

    const iconDot = document.createElement("div");
    iconDot.className = "timeline-icon-dot";
    iconDot.innerHTML = `<i data-lucide="check"></i>`;

    const textDiv = document.createElement("div");
    textDiv.className = "timeline-text";
    textDiv.innerHTML = `Completed <strong>${name}</strong>: saved ${co2.toFixed(1)}kg CO₂e`;

    const timeSpan = document.createElement("span");
    timeSpan.className = "timeline-time";
    timeSpan.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    item.appendChild(iconDot);
    item.appendChild(textDiv);
    item.appendChild(timeSpan);
    
    // Insert at front
    container.insertBefore(item, container.firstChild);
    lucide.createIcons();
}

function removeTimelineEvent(name) {
    const container = document.getElementById("timeline-feed");
    if (!container) return;

    const item = container.querySelector(`.timeline-item[data-timeline-ref="${name}"]`);
    if (item) {
        container.removeChild(item);
    }

    if (container.children.length === 0 || (container.children.length === 1 && container.querySelector(".timeline-empty"))) {
        const emptyMsg = container.querySelector(".timeline-empty");
        if (emptyMsg) emptyMsg.style.display = "block";
    }
}

// ====================================================
// GAMIFIED CHALLENGES & BADGES
// ====================================================
function renderChallengesAndBadges() {
    const container = document.getElementById("challenges-list");
    if (!container) return;
    container.innerHTML = "";

    appState.challenges.forEach(chal => {
        const card = document.createElement("div");
        card.className = "challenge-item-card";

        const top = document.createElement("div");
        top.className = "challenge-top";

        const preview = document.createElement("div");
        preview.className = "challenge-badge-preview";
        preview.innerHTML = `<i data-lucide="${chal.icon}"></i>`;

        const details = document.createElement("div");
        details.className = "challenge-details";

        const title = document.createElement("div");
        title.className = "challenge-title";
        title.textContent = chal.title;

        const desc = document.createElement("div");
        desc.className = "challenge-desc";
        desc.textContent = chal.desc;

        details.appendChild(title);
        details.appendChild(desc);

        const rewards = document.createElement("div");
        rewards.className = "challenge-rewards";
        rewards.innerHTML = `
            <span class="reward-xp">+${chal.xpReward} XP</span>
            <span class="reward-co2">-${chal.co2Reward}kg CO₂e</span>
        `;

        top.appendChild(preview);
        top.appendChild(details);
        top.appendChild(rewards);
        card.appendChild(top);

        // Progress bar display if joined or complete
        if (chal.isJoined || chal.isCompleted) {
            const bottom = document.createElement("div");
            bottom.className = "challenge-bottom";

            const progArea = document.createElement("div");
            progArea.className = "challenge-progress-area";

            const progMeta = document.createElement("div");
            progMeta.className = "challenge-progress-meta";

            let pct = 0;
            let currentText = "";

            if (chal.isCompleted) {
                pct = 100;
                currentText = "Completed";
            } else if (chal.targetType === "solar-pct") {
                const currentPct = appState.calculator.inputs.solarPercent;
                pct = Math.min(100, (currentPct / chal.targetVal) * 100);
                currentText = `${currentPct}% / ${chal.targetVal}%`;
            } else {
                pct = Math.min(100, (chal.progress / chal.target) * 100);
                currentText = `${chal.progress} / ${chal.target}`;
            }

            progMeta.innerHTML = `
                <span>Progress: ${currentText}</span>
                <span>${Math.round(pct)}%</span>
            `;

            const progBarBg = document.createElement("div");
            progBarBg.className = "challenge-progress-bar-bg";

            const progBarFill = document.createElement("div");
            progBarFill.className = "challenge-progress-bar-fill";
            progBarFill.style.width = `${pct}%`;

            progBarBg.appendChild(progBarFill);
            progArea.appendChild(progMeta);
            progArea.appendChild(progBarBg);
            bottom.appendChild(progArea);

            // Action button
            if (chal.isCompleted) {
                const claimBadge = document.createElement("span");
                claimBadge.className = "btn btn-secondary-outline btn-xs";
                claimBadge.style.color = "var(--primary)";
                claimBadge.style.borderColor = "var(--primary)";
                claimBadge.innerHTML = `<i data-lucide="check-circle-2"></i> Claimed`;
                bottom.appendChild(claimBadge);
            } else {
                const checkBtn = document.createElement("button");
                checkBtn.className = "btn btn-primary btn-xs";
                checkBtn.textContent = "Check Progress";
                checkBtn.addEventListener("click", () => {
                    evaluateManualProgress(chal);
                });
                bottom.appendChild(checkBtn);
            }

            card.appendChild(bottom);
        } else {
            // Join Button
            const bottom = document.createElement("div");
            bottom.className = "challenge-bottom";
            bottom.innerHTML = `<div></div>`; // space

            const joinBtn = document.createElement("button");
            joinBtn.className = "btn btn-secondary-outline btn-xs";
            joinBtn.textContent = "Join Challenge";
            joinBtn.addEventListener("click", () => {
                chal.isJoined = true;
                saveStateToStorage();
                renderChallengesAndBadges();
                triggerNotification(`Joined challenge: "${chal.title}". Get to work!`, "award");
            });

            bottom.appendChild(joinBtn);
            card.appendChild(bottom);
        }

        container.appendChild(card);
    });

    renderBadgesShelf();
    lucide.createIcons();
}

// Evaluate manual progress updates for joined challenges
function evaluateManualProgress(chal) {
    if (chal.isCompleted) return;

    if (chal.id === "solar-sovereign") {
        const solar = appState.calculator.inputs.solarPercent;
        if (solar >= chal.targetVal) {
            completeChallenge(chal);
        } else {
            triggerNotification(`Solar percentage is currently ${solar}%. Set renewable mix above 50% in the calculator.`, "info");
        }
    } else {
        // Evaluate other logs
        triggerNotification(`Keep checking items off in your Daily habits tab! Progress is ${chal.progress}/${chal.target}.`, "info");
    }
}

// Automatically check increments upon daily logging
function checkChallengeCriteria(chalId, value = null) {
    const chal = appState.challenges.find(c => c.id === chalId);
    if (!chal || !chal.isJoined || chal.isCompleted) return;

    if (chal.id === "solar-sovereign" && value !== null) {
        if (value >= chal.targetVal) {
            completeChallenge(chal);
        }
    } else {
        // Increment progress tally
        chal.progress = (chal.progress || 0) + 1;
        if (chal.progress >= chal.target) {
            completeChallenge(chal);
        } else {
            saveStateToStorage();
            renderChallengesAndBadges();
        }
    }
}

// Trigger completion rewards and badge updates
function completeChallenge(chal) {
    chal.isCompleted = true;
    chal.progress = chal.target;
    
    // Unlock Badge
    if (!appState.unlockedBadges.includes(chal.badgeId)) {
        appState.unlockedBadges.push(chal.badgeId);
    }

    // Award rewards
    gainXP(chal.xpReward);
    
    // Confetti
    launchCelebrationConfetti(2);
    
    triggerNotification(`🏆 Challenge Complete: "${chal.title}" unlocked! Earned +${chal.xpReward} XP and a new badge!`, "award");
    
    saveStateToStorage();
    renderChallengesAndBadges();
}

// Render Badge shelf
function renderBadgesShelf() {
    const shelf = document.getElementById("badge-shelf");
    if (!shelf) return;
    shelf.innerHTML = "";

    Object.keys(BADGE_CONFIG).forEach(bId => {
        const badge = BADGE_CONFIG[bId];
        const isUnlocked = appState.unlockedBadges.includes(bId);

        const card = document.createElement("div");
        card.className = `badge-item ${isUnlocked ? '' : 'locked'}`;
        card.setAttribute("title", isUnlocked ? badge.desc : "Locked Challenge");

        const iconBox = document.createElement("div");
        iconBox.className = `badge-icon-box ${badge.class}`;
        iconBox.innerHTML = `<i data-lucide="${isUnlocked ? badge.icon : 'lock'}"></i>`;

        const title = document.createElement("div");
        title.className = "badge-title";
        title.textContent = badge.name;

        card.appendChild(iconBox);
        card.appendChild(title);
        
        if (isUnlocked) {
            const dateSpan = document.createElement("span");
            dateSpan.className = "badge-unlock-date";
            dateSpan.textContent = "Unlocked";
            card.appendChild(dateSpan);
        }

        shelf.appendChild(card);
    });

    lucide.createIcons();
}

// ====================================================
// ECO HUB: SIMULATOR & QUIZ
// ====================================================
function initEcoHub() {
    // 1. Swap Simulator
    const commuteSlider = document.getElementById("swap-slider-commute");
    const meatSlider = document.getElementById("swap-slider-meat");
    const flightSlider = document.getElementById("swap-slider-flight");
    const energySlider = document.getElementById("swap-slider-energy");

    const slidersList = [
        { el: commuteSlider, label: "swap-val-commute", saved: "swap-saved-commute", unit: " km", factor: 10.4 }, // km * 52 * 0.2
        { el: meatSlider, label: "swap-val-meat", saved: "swap-saved-meat", unit: " meals", factor: 78.0 },   // meal * 52 * 1.5
        { el: flightSlider, label: "swap-val-flight", saved: "swap-saved-flight", unit: " flights", factor: 450.0 }, // flight * 450
        { el: energySlider, label: "swap-val-energy", saved: "swap-saved-energy", unit: "%", factor: 12.6 } // default electricity kwh base
    ];

    slidersList.forEach(obj => {
        if (obj.el) {
            obj.el.addEventListener("input", () => {
                document.getElementById(obj.label).textContent = obj.el.value + obj.unit;
                
                // Saved calculation
                let factor = obj.factor;
                // If solar, adjust factor using their baseline energy footprint if available
                if (obj.el.id === "swap-slider-energy" && appState.calculator.isBaselineCalculated) {
                    factor = (appState.calculator.footprints.energy * 1000) / 100; // factor per 1%
                }
                const savedCo2 = obj.el.value * factor;
                document.getElementById(obj.saved).textContent = savedCo2.toFixed(0);

                calculateSwapSimulatorTotal();
            });
        }
    });

    // 2. Trivia Quiz Engine
    const startQuizBtn = document.getElementById("start-quiz-btn");
    const quizWelcomeScreen = document.getElementById("quiz-welcome-screen");
    const quizActiveScreen = document.getElementById("quiz-active-screen");
    const quizCompletedScreen = document.getElementById("quiz-completed-screen");
    
    if (startQuizBtn) {
        startQuizBtn.addEventListener("click", startQuiz);
    }

    const nextQuizBtn = document.getElementById("quiz-next-btn");
    if (nextQuizBtn) {
        nextQuizBtn.addEventListener("click", loadNextQuestion);
    }

    const restartQuizBtn = document.getElementById("restart-quiz-btn");
    if (restartQuizBtn) {
        restartQuizBtn.addEventListener("click", startQuiz);
    }
}

// Calculate Swap simulator sums
function calculateSwapSimulatorTotal() {
    const commuteVal = parseFloat(document.getElementById("swap-slider-commute").value) || 0;
    const meatVal = parseFloat(document.getElementById("swap-slider-meat").value) || 0;
    const flightVal = parseFloat(document.getElementById("swap-slider-flight").value) || 0;
    const energyVal = parseFloat(document.getElementById("swap-slider-energy").value) || 0;

    const commuteSaved = commuteVal * 10.4;
    const meatSaved = meatVal * 78.0;
    const flightSaved = flightVal * 450.0;
    
    let energyFactor = 12.6;
    if (appState.calculator.isBaselineCalculated) {
        energyFactor = (appState.calculator.footprints.energy * 1000) / 100;
    }
    const energySaved = energyVal * energyFactor;

    // Total in kg CO2 saved per year
    const totalKg = commuteSaved + meatSaved + flightSaved + energySaved;
    // Tonnes conversion
    const totalTonnes = totalKg / 1000;

    const totalSavedDisplay = document.getElementById("swap-total-saved");
    if (totalSavedDisplay) {
        totalSavedDisplay.textContent = totalTonnes.toFixed(2);
    }
}

// Trivia Quiz Methods
function startQuiz() {
    appState.quiz.currentQuestionIndex = 0;
    appState.quiz.score = 0;
    appState.quiz.xpEarned = 0;

    document.getElementById("quiz-welcome-screen").classList.add("hidden");
    document.getElementById("quiz-completed-screen").classList.add("hidden");
    document.getElementById("quiz-active-screen").classList.remove("hidden");

    loadQuizQuestion();
}

function loadQuizQuestion() {
    const quiz = appState.quiz;
    const currentQ = quiz.questions[quiz.currentQuestionIndex];

    // Reset components
    document.getElementById("quiz-next-btn").classList.add("hidden");
    document.getElementById("quiz-explanation-box").classList.add("hidden");

    // Title & numbers
    document.getElementById("quiz-question-num").textContent = `Question ${quiz.currentQuestionIndex + 1} of 5`;
    document.getElementById("quiz-points-accumulated").textContent = `Score: ${quiz.score} / ${quiz.currentQuestionIndex}`;
    document.getElementById("quiz-question-text").textContent = currentQ.q;

    // Progress Bar
    const progressFill = document.getElementById("quiz-progress-fill");
    if (progressFill) {
        const pct = ((quiz.currentQuestionIndex + 1) / 5) * 100;
        progressFill.style.width = `${pct}%`;
    }

    // Fill Options list
    const optionsContainer = document.getElementById("quiz-options-list");
    optionsContainer.innerHTML = "";

    currentQ.options.forEach((opt, index) => {
        const button = document.createElement("button");
        button.className = "quiz-option-btn";
        button.textContent = opt;
        button.addEventListener("click", () => {
            selectQuizAnswer(index);
        });
        optionsContainer.appendChild(button);
    });
}

function selectQuizAnswer(selectedIndex) {
    const quiz = appState.quiz;
    const currentQ = quiz.questions[quiz.currentQuestionIndex];
    
    // Disable all options
    const optionsContainer = document.getElementById("quiz-options-list");
    const optionButtons = optionsContainer.querySelectorAll(".quiz-option-btn");
    optionButtons.forEach(btn => btn.disabled = true);

    const isCorrect = (selectedIndex === currentQ.correctIndex);
    
    // Visual formatting
    optionButtons[selectedIndex].classList.add(isCorrect ? "correct" : "incorrect");
    if (!isCorrect) {
        optionButtons[currentQ.correctIndex].classList.add("correct");
    }

    // Explanation Box display
    const explanationBox = document.getElementById("quiz-explanation-box");
    const explanationTitle = document.getElementById("quiz-answer-title");
    const explanationDesc = document.getElementById("quiz-answer-desc");

    explanationBox.classList.remove("hidden");
    
    if (isCorrect) {
        quiz.score += 1;
        quiz.xpEarned += 25;
        explanationBox.classList.remove("incorrect-explanation");
        explanationTitle.className = "";
        explanationTitle.textContent = "Correct Answer! (+25 XP)";
        
        // Minor confetti blast
        confetti({
            particleCount: 20,
            spread: 40,
            origin: { y: 0.8 }
        });
    } else {
        explanationBox.classList.add("incorrect-explanation");
        explanationTitle.className = "incorrect-title";
        explanationTitle.textContent = "Incorrect Answer";
    }

    explanationDesc.textContent = currentQ.explanation;
    
    // Show Next Button
    document.getElementById("quiz-next-btn").classList.remove("hidden");
}

function loadNextQuestion() {
    appState.quiz.currentQuestionIndex += 1;
    if (appState.quiz.currentQuestionIndex < 5) {
        loadQuizQuestion();
    } else {
        showQuizResults();
    }
}

function showQuizResults() {
    document.getElementById("quiz-active-screen").classList.add("hidden");
    document.getElementById("quiz-completed-screen").classList.remove("hidden");

    const finalScoreEl = document.getElementById("quiz-final-score-text");
    const finalXPEl = document.getElementById("quiz-points-bonus-text");

    finalScoreEl.textContent = `You got ${appState.quiz.score} out of 5 questions correct!`;
    finalXPEl.textContent = `You earned +${appState.quiz.xpEarned} XP!`;

    // Award XP
    if (appState.quiz.xpEarned > 0) {
        gainXP(appState.quiz.xpEarned);
    }

    // perfect score badge unlock
    if (appState.quiz.score === 5) {
        if (!appState.unlockedBadges.includes("badge-quiz")) {
            appState.unlockedBadges.push("badge-quiz");
            triggerNotification("🏆 Perfect Score! Unlocked the 'Quiz Master' profile badge!", "award");
            launchCelebrationConfetti(3);
        }
    }

    saveStateToStorage();
}
