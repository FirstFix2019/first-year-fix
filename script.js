// Telegram Config
const TELEGRAM_BOT_TOKEN = "8662937348:AAFNbC3QAydzIFiJ4jmUcNhKKx9K773-Q6M";
const TELEGRAM_CHAT_ID = "7933278211";

let studentData = { name: "", phone: "" };
let activeVaultPasscode = "";
let selectedVaultName = "";
let startTime, endTime;

const questions = [
    {
        id: 1,
        question: "The systematic field of Geography associations within regions of all or some of elements and their interrelationships.",
        options: ["True", "False"],
        answer: 0
    },
    {
        id: 2,
        question: "It refers to a particular place or position.",
        options: ["Place", "Region", "Movement", "Location"],
        answer: 3
    },
    {
        id: 3,
        question: "The location of a place is defined by its latitude and longitude.",
        options: ["Absolute location", "Relative location", "Vicinal location", "Location"],
        answer: 0
    },
    {
        id: 4,
        question: "The description of the physical characteristics or internal features of a place is known as:",
        options: ["Place/location", "Situation", "Toponym", "Site"],
        answer: 3
    },
    {
        id: 5,
        question: "It describes how humans modify their lifestyle to fit environmental conditions:",
        options: ["Modifications", "Dependency", "Adaptation", "None"],
        answer: 2
    },
    {
        id: 6,
        question: "Characterized by functional interrelationships in a spatial system defined by operational linkages:",
        options: ["Formal region", "Nodal region", "Region", "Functional and nodal region"],
        answer: 3
    },
    {
        id: 7,
        question: "Astronomically Ethiopia is located between 3°N and 15°N latitude and 33°E to 48°E longitude.",
        options: ["True", "False"],
        answer: 1
    },
    {
        id: 8,
        question: "In the relative location of Ethiopia, Kenya is to the south, and Eritrea is to:",
        options: ["The north and northeast", "The east and southeast", "The north and northwest", "The south and southwest"],
        answer: 0
    },
    {
        id: 9,
        question: "In the relative location of Ethiopia, Djibouti is to the east, and Somalia is to the:",
        options: ["North and northeast", "East and southeast", "West and northwest", "South"],
        answer: 1
    },
    {
        id: 10,
        question: "The size of Ethiopia solely affects the human environment of the country.",
        options: ["True", "False"],
        answer: 1
    },
    {
        id: 11,
        question: "Except one, all are the advantages of Ethiopia's large size:",
        options: [
            "Variety of natural resources",
            "Great depth in defense against external invasion",
            "Requires large army to protect its territory",
            "Have larger population size"
        ],
        answer: 2
    },
    {
        id: 12,
        question: "Countries that are divided/separated from their other parts by either water or land have a:",
        options: ["Perforated shape", "Protruded shape", "Elongated shape", " None of the above"],
        answer: 3
    },
    {
        id: 13,
        question: "A protruded shape of a country has one portion that is much more elongated than the rest of the country.",
        options: ["True", "False"],
        answer: 0
    },
    {
        id: 14,
        question: "A map is a one-dimensional scaled representation of part or whole of the Earth's surface on a flat body.",
        options: ["True", "False"],
        answer: 1
    },
    {
        id: 15,
        question: "Shows the distribution of specific aspects like temperature, vegetation, and population:",
        options: ["Topographical map", "Special purpose map", "Statistical map", "Special and statistics map"],
        answer: 1
    }
];

let currentQuestionIndex = 0;
let userAnswers = {};
let totalQuestions = questions.length;
let EXAM_DURATION_MINUTES = 20; 
let timeInSeconds = EXAM_DURATION_MINUTES * 60; 
let timerInterval;

// DOM Elements
const studentInfoCard = document.getElementById('student-info-card');
const vaultSelectionCard = document.getElementById('vault-selection-card');
const passcodeModal = document.getElementById('passcode-modal');
const passcodeError = document.getElementById('passcode-error');
const passcodeVaultTitle = document.getElementById('passcode-vault-title');
const vaultPasscodeInput = document.getElementById('vault-passcode-input');

const examContainer = document.getElementById('exam-container');
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

// Step 1: Proceed to Vault Selection
function goToVaultSelection(e) {
    e.preventDefault();
    studentData.name = document.getElementById('student-name').value;
    studentData.phone = document.getElementById('student-phone').value;

    studentInfoCard.style.display = 'none';
    vaultSelectionCard.style.display = 'block';
}

// Step 2: Open Passcode Modal when a Vault is clicked
function openPasscodeModal(vaultName, passcode) {
    selectedVaultName = vaultName;
    activeVaultPasscode = passcode;
    passcodeVaultTitle.textContent = `${vaultName}`;
    passcodeError.style.display = 'none';
    vaultPasscodeInput.value = '';
    passcodeModal.classList.add('active');
}

function closePasscodeModal() {
    passcodeModal.classList.remove('active');
}

// Step 3: Verify Passcode and Start Exam
function verifyPasscodeAndStart(e) {
    e.preventDefault();
    const enteredCode = vaultPasscodeInput.value;

    if (enteredCode !== activeVaultPasscode) {
        passcodeError.style.display = 'block';
        return;
    }

    closePasscodeModal();
    vaultSelectionCard.style.display = 'none';
    examContainer.style.display = 'flex';
    
    startTime = new Date();
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
    let timeTakenSeconds = (EXAM_DURATION_MINUTES * 60) - timeInSeconds;
    let timeTakenMin = Math.floor(timeTakenSeconds / 60);
    let timeTakenSec = timeTakenSeconds % 60;
    let timeString = `${timeTakenMin}m ${timeTakenSec}s`;

    scorePercentage.textContent = `${percentage}%`;
    scoreDetails.textContent = `You scored ${score} out of ${totalQuestions}`;
    resultModal.classList.add('active');

    // Send Result to Telegram Bot
    sendResultToTelegram(studentData.name, studentData.phone, selectedVaultName, score, totalQuestions, percentage, timeString);
}

function sendResultToTelegram(name, phone, vault, score, total, percent, timeSpent) {
    telegramStatus.textContent = "Sending result to instructor...";
    
    const message = `🎯 *NEW EXAM SUBMISSION*%0A%0A👤 *Name:* ${name}%0A📞 *Phone:* ${phone}%0A📚 *Vault:* ${vault}%0A📊 *Score:* ${score}/${total} (${percent}%)%0A⏱️ *Time Spent:* ${timeSpent}`;

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




