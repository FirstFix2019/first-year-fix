// Telegram Config (የአንተ Bot Token እና Chat ID ተካቷል)
const TELEGRAM_BOT_TOKEN = "8662937348:AAFNbC3QAydzIFiJ4jmUcNhKKx9K773-Q6M";
const TELEGRAM_CHAT_ID = "7933278211";

// የሚፈለገው Secret Passcode (አንተ በፈለግከው ጊዜ መቀየር ትችላለህ)
const VALID_PASSCODE = "GEO2026"; 

let studentData = { name: "", phone: "" };
let startTime, endTime;

const questions = [
    {
        id: 1,
        question: "Nomadic pastoralists living in arid lowlands adjust their seasonal migration routes, wear lightweight clothing, and build portable dome-shaped dwellings in response to extreme heat. This behavior represents:",
        options: [
            "Environmental modification",
            "Human adaptation to environmental challenges",
            "Permanent industrial urbanization",
            "Soil degradation control"
        ],
        answer: 1 
    },
    {
        id: 2,
        question: "A designated telecommunication network service area centered around a major metropolitan hub, defined by the functional linkages binding outlying towns to the center, represents which type of region?",
        options: [
            "Formal (Uniform) Region",
            "Functional (Nodal) Region",
            "Astronomical Region",
            "Topographic Region"
        ],
        answer: 1
    },
    {
        id: 3,
        question: "Which shape classification describes a country that possesses one narrow, elongated portion extending outward from the main body of the state (such as Myanmar or Eritrea)?",
        options: [
            "Compact",
            "Fragmented",
            "Protruded",
            "Perforated"
        ],
        answer: 2
    },
    {
        id: 4,
        question: "A study focuses exclusively on the volumetric water discharge and catchment area of the Blue Nile River without examining surrounding human settlements. This research represents:",
        options: [
            "Regional Geography",
            "Systematic (Topical) Geography",
            "Cultural Anthropology",
            "Geopolitical Strategy"
        ],
        answer: 1
    },
    {
        id: 5,
        question: "What term refers to the proper name given to a specific geographic place on the Earth's surface?",
        options: [
            "Site",
            "Situation",
            "Toponym",
            "Isobar"
        ],
        answer: 2
    }
];

let currentQuestionIndex = 0;
let userAnswers = {};
let totalQuestions = questions.length;
let timeInSeconds = 30 * 60; 
let timerInterval;

// DOM Elements
const lobbyContainer = document.getElementById('lobby-container');
const examContainer = document.getElementById('exam-container');
const loginError = document.getElementById('login-error');

const questionNumberText = document.getElementById('question-number');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const questionGrid = document.getElementById('question-grid');
const navStatus = document.getElementById('nav-status');
const progressBar = document.getElementById('progress-bar');
const timerText = document.getElementById('timer-text');

// Modal Elements
const resultModal = document.getElementById('result-modal');
const scorePercentage = document.getElementById('score-percentage');
const scoreDetails = document.getElementById('score-details');
const telegramStatus = document.getElementById('telegram-status');

// Login & Passcode Validation
function startExam(e) {
    e.preventDefault();
    const name = document.getElementById('student-name').value;
    const phone = document.getElementById('student-phone').value;
    const passcode = document.getElementById('exam-passcode').value;

    if (passcode !== VALID_PASSCODE) {
        loginError.style.display = 'block';
        return;
    }

    studentData.name = name;
    studentData.phone = phone;
    startTime = new Date();

    lobbyContainer.style.display = 'none';
    examContainer.style.display = 'flex';

    initQuiz();
}

function initQuiz() {
    createNavigatorGrid();
    loadQuestion(currentQuestionIndex);
    updateNavigator();
    startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeInSeconds--;
        let minutes = Math.floor(timeInSeconds / 60);
        let seconds = timeInSeconds % 60;
        timerText.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (timeInSeconds <= 0) {
            clearInterval(timerInterval);
            submitExam();
        }
    }, 1000);
}

function loadQuestion(index) {
    let q = questions[index];
    questionNumberText.textContent = `QUESTION ${index + 1} OF ${totalQuestions}`;
    questionText.textContent = q.question;
    
    let progress = ((index + 1) / totalQuestions) * 100;
    progressBar.style.width = `${progress}%`;

    optionsContainer.innerHTML = "";
    q.options.forEach((opt, i) => {
        let optionLetter = String.fromCharCode(65 + i);
        let isSelected = userAnswers[index] === i ? 'selected' : '';
        
        let card = document.createElement('div');
        card.className = `option-card ${isSelected}`;
        card.innerHTML = `
            <div class="option-badge">${optionLetter}</div>
            <div class="option-label">${opt}</div>
        `;
        
        card.addEventListener('click', () => selectOption(index, i));
        optionsContainer.appendChild(card);
    });

    prevBtn.style.visibility = index === 0 ? "hidden" : "visible";
    nextBtn.textContent = index === totalQuestions - 1 ? "Finish Exam →" : "Next Question →";

    updateNavigatorStyles();
}

function selectOption(qIndex, optIndex) {
    userAnswers[qIndex] = optIndex;
    loadQuestion(qIndex);
    updateNavigator();
}

function createNavigatorGrid() {
    questionGrid.innerHTML = "";
    for (let i = 0; i < totalQuestions; i++) {
        let item = document.createElement('div');
        item.className = 'nav-item';
        item.textContent = i + 1;
        item.addEventListener('click', () => {
            currentQuestionIndex = i;
            loadQuestion(currentQuestionIndex);
        });
        questionGrid.appendChild(item);
    }
}

function updateNavigator() {
    let answeredCount = Object.keys(userAnswers).length;
    navStatus.textContent = `${answeredCount} of ${totalQuestions} Answered`;
    updateNavigatorStyles();
}

function updateNavigatorStyles() {
    const items = document.querySelectorAll('.nav-item');
    items.forEach((item, i) => {
        item.classList.remove('answered', 'current');
        if (userAnswers[i] !== undefined) item.classList.add('answered');
        if (i === currentQuestionIndex) item.classList.add('current');
    });
}

function submitExam() {
    clearInterval(timerInterval);
    endTime = new Date();
    
    let score = 0;
    questions.forEach((q, index) => {
        if (userAnswers[index] === q.answer) score++;
    });

    let percentage = Math.round((score / totalQuestions) * 100);
    let timeTakenMin = Math.floor((30 * 60 - timeInSeconds) / 60);
    let timeTakenSec = (30 * 60 - timeInSeconds) % 60;
    let timeString = `${timeTakenMin}m ${timeTakenSec}s`;

    scorePercentage.textContent = `${percentage}%`;
    scoreDetails.textContent = `You scored ${score} out of ${totalQuestions}`;
    resultModal.classList.add('active');

    // Send Result to Telegram Bot
    sendResultToTelegram(studentData.name, studentData.phone, score, totalQuestions, percentage, timeString);
}

function sendResultToTelegram(name, phone, score, total, percent, timeSpent) {
    telegramStatus.textContent = "Sending result to instructor...";
    
    const message = `🎯 *NEW EXAM SUBMISSION*%0A%0A👤 *Name:* ${name}%0A📞 *Phone:* ${phone}%0A📚 *Subject:* Geography Ch.1%0A📊 *Score:* ${score}/${total} (${percent}%)%0A⏱️ *Time Spent:* ${timeSpent}`;

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${message}&parse_mode=Markdown`;

    fetch(url)
        .then(response => {
            if (response.ok) {
                telegramStatus.textContent = "✓ Result successfully sent to instructor!";
            } else {
                telegramStatus.textContent = "✓ Submitted locally.";
            }
        })
        .catch(err => {
            telegramStatus.textContent = "✓ Submitted locally.";
        });
}

// Event Listeners
nextBtn.addEventListener('click', () => {
    if (currentQuestionIndex < totalQuestions - 1) {
        currentQuestionIndex++;
        loadQuestion(currentQuestionIndex);
    } else {
        submitExam();
    }
});

prevBtn.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion(currentQuestionIndex);
    }
});

submitBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to submit your exam?")) {
        submitExam();
    }
});

