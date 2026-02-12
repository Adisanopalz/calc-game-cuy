/* ========================================
   GAME STATE & CONFIGURATION
   ======================================== */
const GameState = {
    currentScreen: 'mainMenu',
    gameMode: null, // 'difficulty' or 'education'
    difficulty: null,
    educationLevel: null,
    answerType: 'multiple',
    
    level: 1,
    score: 0,
    lives: 3,
    combo: 0,
    maxCombo: 0,
    correctAnswers: 0,
    
    currentQuestion: null,
    timer: null,
    timerValue: 100,
    timerSpeed: 100,
    isGameActive: false,
    
    questionsPerLevel: 3,
    questionCount: 0,
    
    // Time Attack specific
    isTimeAttack: false,
    globalTimer: 60
};

const DifficultyConfig = {
    easy: {
        lives: 5,
        timerSpeed: 120,
        numberRange: [1, 20],
        operations: ['+', '-'],
        complexityLevel: 1
    },
    normal: {
        lives: 3,
        timerSpeed: 100,
        numberRange: [1, 50],
        operations: ['+', '-', '*', '/'],
        complexityLevel: 2
    },
    hard: {
        lives: 2,
        timerSpeed: 80,
        numberRange: [1, 100],
        operations: ['+', '-', '*', '/', '^'],
        complexityLevel: 3
    },
    timeattack: {
        lives: 999, // No lives in time attack
        timerSpeed: 80,
        numberRange: [1, 50],
        operations: ['+', '-', '*', '/'],
        complexityLevel: 2
    }
};

/* ========================================
   UTILITY FUNCTIONS
   ======================================== */
const Utils = {
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    
    randomChoice: (array) => array[Math.floor(Math.random() * array.length)],
    
    shuffle: (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },
    
    formatNumber: (num) => {
        if (Number.isInteger(num)) return num;
        return parseFloat(num.toFixed(2));
    },
    
    showScreen: (screenId) => {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
        GameState.currentScreen = screenId;
    },
    
    playComboAnimation: (combo) => {
        const comboEl = document.getElementById('comboAnimation');
        comboEl.textContent = `${combo}x COMBO!`;
        comboEl.classList.add('show');
        setTimeout(() => comboEl.classList.remove('show'), 1000);
    }
};

/* ========================================
   QUESTION GENERATORS
   ======================================== */
const QuestionGenerator = {
    generateBasic: (range, operations) => {
        const [min, max] = range;
        const num1 = Utils.randomInt(min, max);
        const num2 = Utils.randomInt(min, max);
        const operation = Utils.randomChoice(operations);
        
        let question, answer;
        
        switch (operation) {
            case '+':
                question = `${num1} + ${num2}`;
                answer = num1 + num2;
                break;
            case '-':
                question = `${num1} + ${num2}`;
                answer = num1 + num2;
                question = `${answer} - ${num2}`;
                answer = num1;
                break;
            case '*':
                question = `${num1} × ${num2}`;
                answer = num1 * num2;
                break;
            case '/':
                const dividend = num1 * num2;
                question = `${dividend} ÷ ${num2}`;
                answer = num1;
                break;
            case '^':
                const base = Utils.randomInt(2, 10);
                const exp = Utils.randomInt(2, 3);
                question = `${base}^${exp}`;
                answer = Math.pow(base, exp);
                break;
        }
        
        return { question, answer: Utils.formatNumber(answer) };
    },
    
    generateTK: () => {
        const num1 = Utils.randomInt(1, 10);
        const num2 = Utils.randomInt(1, 10);
        const question = `${num1} + ${num2}`;
        return { question, answer: num1 + num2 };
    },
    
    generateSD: () => {
        const operations = ['+', '-', '*', '/'];
        return QuestionGenerator.generateBasic([1, 30], operations);
    },
    
    generateSMP: () => {
        const type = Utils.randomInt(1, 3);
        
        if (type === 1) {
            // Negative numbers
            const num1 = Utils.randomInt(-20, 20);
            const num2 = Utils.randomInt(-20, 20);
            const question = `${num1} + (${num2})`;
            return { question, answer: num1 + num2 };
        } else if (type === 2) {
            // Square
            const num = Utils.randomInt(2, 15);
            const question = `${num}²`;
            return { question, answer: num * num };
        } else {
            // Fraction
            const num1 = Utils.randomInt(1, 10);
            const num2 = Utils.randomInt(2, 12);
            const num3 = Utils.randomInt(1, 10);
            const num4 = num2;
            const question = `${num1}/${num2} + ${num3}/${num4}`;
            return { question, answer: Utils.formatNumber((num1 + num3) / num2) };
        }
    },
    
    generateSMA: () => {
        const type = Utils.randomInt(1, 3);
        
        if (type === 1) {
            // Square root
            const num = Utils.randomInt(1, 15);
            const square = num * num;
            const question = `√${square}`;
            return { question, answer: num };
        } else if (type === 2) {
            // Linear equation
            const a = Utils.randomInt(2, 10);
            const b = Utils.randomInt(1, 20);
            const x = Utils.randomInt(1, 10);
            const result = a * x + b;
            const question = `${a}x + ${b} = ${result}, x = ?`;
            return { question, answer: x };
        } else {
            // Trigonometry (degrees)
            const angles = [0, 30, 45, 60, 90];
            const angle = Utils.randomChoice(angles);
            const sinValues = { 0: 0, 30: 0.5, 45: 0.71, 60: 0.87, 90: 1 };
            const question = `sin(${angle}°) ≈ ?`;
            return { question, answer: sinValues[angle] };
        }
    },
    
    generateSMK: () => {
        const type = Utils.randomInt(1, 2);
        
        if (type === 1) {
            // Percentage
            const price = Utils.randomInt(50, 500) * 100;
            const discount = Utils.randomChoice([10, 15, 20, 25, 30]);
            const question = `Rp ${price.toLocaleString()} diskon ${discount}%, bayar?`;
            const answer = price * (100 - discount) / 100;
            return { question, answer };
        } else {
            // Profit calculation
            const cost = Utils.randomInt(50, 200) * 100;
            const profit = Utils.randomChoice([10, 20, 30, 40, 50]);
            const question = `Modal Rp ${cost.toLocaleString()}, profit ${profit}%, jual?`;
            const answer = cost * (100 + profit) / 100;
            return { question, answer };
        }
    },
    
    generateD3: () => {
        const type = Utils.randomInt(1, 2);
        
        if (type === 1) {
            // Mean
            const nums = Array.from({ length: 5 }, () => Utils.randomInt(1, 20));
            const sum = nums.reduce((a, b) => a + b, 0);
            const question = `Mean dari ${nums.join(', ')}?`;
            return { question, answer: Utils.formatNumber(sum / nums.length) };
        } else {
            // Probability
            const total = Utils.randomInt(20, 50);
            const success = Utils.randomInt(5, 15);
            const question = `P(A) = ${success}/${total}, desimal?`;
            return { question, answer: Utils.formatNumber(success / total) };
        }
    },
    
    generateS1: () => {
        const type = Utils.randomInt(1, 3);
        
        if (type === 1) {
            // Limit
            const a = Utils.randomInt(2, 10);
            const question = `lim(x→${a}) (x² - ${a}²)/(x - ${a})`;
            return { question, answer: 2 * a };
        } else if (type === 2) {
            // Derivative
            const a = Utils.randomInt(2, 10);
            const b = Utils.randomInt(1, 10);
            const question = `f(x) = ${a}x² + ${b}x, f'(x) koef. x?`;
            return { question, answer: 2 * a };
        } else {
            // Matrix determinant 2x2
            const a = Utils.randomInt(1, 5);
            const b = Utils.randomInt(1, 5);
            const c = Utils.randomInt(1, 5);
            const d = Utils.randomInt(1, 5);
            const question = `Det |${a} ${b}; ${c} ${d}|`;
            return { question, answer: a * d - b * c };
        }
    },
    
    generateS2: () => {
        const type = Utils.randomInt(1, 2);
        
        if (type === 1) {
            // Simple integral
            const n = Utils.randomInt(2, 5);
            const question = `∫x^${n} dx, koefisien?`;
            return { question, answer: Utils.formatNumber(1 / (n + 1)) };
        } else {
            // Partial derivative
            const a = Utils.randomInt(2, 5);
            const b = Utils.randomInt(2, 5);
            const question = `f(x,y) = ${a}xy + ${b}y², ∂f/∂y koef. y?`;
            return { question, answer: 2 * b };
        }
    },
    
    generateS3: () => {
        const type = Utils.randomInt(1, 3);
        
        if (type === 1) {
            // Complex calculation
            const a = Utils.randomInt(5, 15);
            const b = Utils.randomInt(2, 8);
            const c = Utils.randomInt(10, 30);
            const question = `(${a}² - ${b}³) × ${c}`;
            const answer = (a * a - b * b * b) * c;
            return { question, answer };
        } else if (type === 2) {
            // Mixed operations
            const nums = [Utils.randomInt(5, 20), Utils.randomInt(2, 10), Utils.randomInt(3, 12)];
            const question = `${nums[0]} × ${nums[1]} - ${nums[2]}²`;
            const answer = nums[0] * nums[1] - nums[2] * nums[2];
            return { question, answer };
        } else {
            // Advanced percentage
            const base = Utils.randomInt(100, 500) * 10;
            const inc1 = Utils.randomChoice([10, 20, 30]);
            const dec1 = Utils.randomChoice([10, 15, 20]);
            const question = `${base} +${inc1}% -${dec1}%`;
            const answer = base * (1 + inc1/100) * (1 - dec1/100);
            return { question, answer: Utils.formatNumber(answer) };
        }
    },
    
    generate: (mode, level, difficulty) => {
        if (mode === 'difficulty') {
            const config = DifficultyConfig[difficulty];
            return QuestionGenerator.generateBasic(config.numberRange, config.operations);
        } else {
            const generators = {
                tk: QuestionGenerator.generateTK,
                sd: QuestionGenerator.generateSD,
                smp: QuestionGenerator.generateSMP,
                sma: QuestionGenerator.generateSMA,
                smk: QuestionGenerator.generateSMK,
                d3: QuestionGenerator.generateD3,
                s1: QuestionGenerator.generateS1,
                s2: QuestionGenerator.generateS2,
                s3: QuestionGenerator.generateS3
            };
            return generators[level]();
        }
    }
};

/* ========================================
   ANSWER SYSTEM
   ======================================== */
const AnswerSystem = {
    generateDistractors: (correctAnswer) => {
        const distractors = [];
        const offset = Math.max(Math.abs(correctAnswer * 0.3), 5);
        
        while (distractors.length < 3) {
            const variation = Utils.randomInt(-offset, offset);
            let distractor = Utils.formatNumber(correctAnswer + variation);
            
            if (distractor !== correctAnswer && !distractors.includes(distractor)) {
                distractors.push(distractor);
            }
        }
        
        return distractors;
    },
    
    createMultipleChoice: (question, answer) => {
        const distractors = AnswerSystem.generateDistractors(answer);
        const allOptions = Utils.shuffle([answer, ...distractors]);
        
        return {
            type: 'multiple',
            question,
            answer,
            options: allOptions
        };
    },
    
    createEssay: (question, answer) => {
        return {
            type: 'essay',
            question,
            answer
        };
    },
    
    create: (answerType) => {
        const { question, answer } = QuestionGenerator.generate(
            GameState.gameMode,
            GameState.educationLevel || GameState.difficulty,
            GameState.difficulty
        );
        
        let type = answerType;
        if (answerType === 'random') {
            type = Math.random() > 0.5 ? 'multiple' : 'essay';
        }
        
        return type === 'multiple' 
            ? AnswerSystem.createMultipleChoice(question, answer)
            : AnswerSystem.createEssay(question, answer);
    }
};

/* ========================================
   UI CONTROLLER
   ======================================== */
const UI = {
    updateScore: () => {
        document.getElementById('scoreDisplay').textContent = GameState.score;
    },
    
    updateLevel: () => {
        document.getElementById('levelDisplay').textContent = GameState.level;
    },
    
    updateCombo: () => {
        document.getElementById('comboValue').textContent = GameState.combo;
        if (GameState.combo >= 3) {
            Utils.playComboAnimation(GameState.combo);
        }
    },
    
    updateLives: () => {
        const livesContainer = document.getElementById('livesDisplay');
        if (GameState.isTimeAttack) {
            livesContainer.innerHTML = '';
            return;
        }
        
        livesContainer.innerHTML = '';
        for (let i = 0; i < GameState.lives; i++) {
            const heart = document.createElement('span');
            heart.className = 'life-icon';
            heart.textContent = '❤️';
            livesContainer.appendChild(heart);
        }
    },
    
    updateTimer: () => {
        const timerBar = document.getElementById('timerBar');
        const timerText = document.getElementById('timerText');
        
        if (GameState.isTimeAttack) {
            timerText.textContent = `${GameState.globalTimer}s`;
            timerBar.style.width = `${(GameState.globalTimer / 60) * 100}%`;
            
            if (GameState.globalTimer <= 10) {
                timerBar.classList.add('warning');
            }
        } else {
            timerText.textContent = '';
            timerBar.style.width = `${GameState.timerValue}%`;
            
            if (GameState.timerValue <= 20) {
                timerBar.classList.add('warning');
            } else {
                timerBar.classList.remove('warning');
            }
        }
    },
    
    displayQuestion: (questionData) => {
        document.getElementById('questionText').textContent = questionData.question;
        
        if (questionData.type === 'multiple') {
            document.getElementById('optionsContainer').style.display = 'grid';
            document.getElementById('essayContainer').style.display = 'none';
            
            const optionsContainer = document.getElementById('optionsContainer');
            optionsContainer.innerHTML = '';
            
            questionData.options.forEach(option => {
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.textContent = option;
                btn.onclick = () => GameEngine.checkAnswer(option);
                optionsContainer.appendChild(btn);
            });
        } else {
            document.getElementById('optionsContainer').style.display = 'none';
            document.getElementById('essayContainer').style.display = 'flex';
            
            const input = document.getElementById('essayInput');
            input.value = '';
            input.focus();
        }
    },
    
    showCorrectFeedback: (element) => {
        if (element) {
            element.classList.add('correct');
            setTimeout(() => element.classList.remove('correct'), 500);
        }
    },
    
    showWrongFeedback: (element) => {
        if (element) {
            element.classList.add('wrong');
            setTimeout(() => element.classList.remove('wrong'), 500);
        }
    },
    
    showGameOver: () => {
        document.getElementById('finalScore').textContent = GameState.score;
        document.getElementById('finalLevel').textContent = GameState.level;
        document.getElementById('finalCombo').textContent = GameState.maxCombo;
        document.getElementById('finalCorrect').textContent = GameState.correctAnswers;
        
        Utils.showScreen('gameOverScreen');
    }
};

/* ========================================
   GAME ENGINE
   ======================================== */
const GameEngine = {
    init: () => {
        GameState.level = 1;
        GameState.score = 0;
        GameState.combo = 0;
        GameState.maxCombo = 0;
        GameState.correctAnswers = 0;
        GameState.questionCount = 0;
        GameState.isGameActive = true;
        
        const config = DifficultyConfig[GameState.difficulty] || DifficultyConfig.normal;
        GameState.lives = config.lives;
        GameState.timerSpeed = config.timerSpeed;
        GameState.timerValue = 100;
        
        if (GameState.difficulty === 'timeattack') {
            GameState.isTimeAttack = true;
            GameState.globalTimer = 60;
        } else {
            GameState.isTimeAttack = false;
        }
        
        UI.updateScore();
        UI.updateLevel();
        UI.updateCombo();
        UI.updateLives();
        UI.updateTimer();
        
        Utils.showScreen('gameScreen');
        GameEngine.nextQuestion();
        
        if (GameState.isTimeAttack) {
            GameEngine.startGlobalTimer();
        }
    },
    
    nextQuestion: () => {
        if (!GameState.isGameActive) return;
        
        GameState.currentQuestion = AnswerSystem.create(GameState.answerType);
        GameState.timerValue = 100;
        
        UI.displayQuestion(GameState.currentQuestion);
        GameEngine.startTimer();
    },
    
    startTimer: () => {
        if (GameState.timer) clearInterval(GameState.timer);
        
        if (GameState.isTimeAttack) return;
        
        GameState.timer = setInterval(() => {
            GameState.timerValue -= 1;
            UI.updateTimer();
            
            if (GameState.timerValue <= 0) {
                clearInterval(GameState.timer);
                GameEngine.wrongAnswer();
            }
        }, GameState.timerSpeed);
    },
    
    startGlobalTimer: () => {
        const globalTimerInterval = setInterval(() => {
            if (!GameState.isGameActive) {
                clearInterval(globalTimerInterval);
                return;
            }
            
            GameState.globalTimer--;
            UI.updateTimer();
            
            if (GameState.globalTimer <= 0) {
                clearInterval(globalTimerInterval);
                GameEngine.endGame();
            }
        }, 1000);
    },
    
    checkAnswer: (userAnswer) => {
        if (!GameState.isGameActive) return;
        
        clearInterval(GameState.timer);
        
        const parsedAnswer = parseFloat(userAnswer);
        const correctAnswer = parseFloat(GameState.currentQuestion.answer);
        const isCorrect = Math.abs(parsedAnswer - correctAnswer) < 0.01;
        
        if (isCorrect) {
            GameEngine.correctAnswer();
        } else {
            GameEngine.wrongAnswer();
        }
    },
    
    corr
