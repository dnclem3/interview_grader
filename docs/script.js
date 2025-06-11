const questionBank = [
    { category: 'Behavioral', text: 'Tell me about a time you led a team through a challenge.' },
    { category: 'Behavioral', text: 'Describe a conflict you handled at work.' },
    { category: 'Estimation', text: 'How many umbrellas are sold each year in the US?' },
    { category: 'Strategy', text: 'What should our company prioritize in the next year?' },
    { category: 'Technical', text: 'Explain the concept of dependency injection.' },
    { category: 'Technical', text: 'What are the benefits of using a relational database?' },
];

const rubricMap = {
    Default: ['Clarity', 'Structure', 'Insight', 'Relevance'],
    Behavioral: ['Situation', 'Task', 'Action', 'Result'],
    Strategy: ['Vision', 'Execution', 'Impact', 'Measurement']
};

let sessionQuestions = [];
let currentIndex = 0;
let evaluations = [];
let currentCriteria = rubricMap.Default;

const setupScreen = document.getElementById('setup');
const questionScreen = document.getElementById('question');
const summaryScreen = document.getElementById('summary');

const startBtn = document.getElementById('startBtn');
const qText = document.getElementById('qText');
const progress = document.getElementById('progress');
const rubricForm = document.getElementById('rubricForm');
const resultsDiv = document.getElementById('results');
const copyBtn = document.getElementById('copyBtn');
const restartBtn = document.getElementById('restartBtn');

startBtn.addEventListener('click', startSession);
rubricForm.addEventListener('submit', saveEvaluation);
copyBtn.addEventListener('click', copySummary);
restartBtn.addEventListener('click', () => location.reload());

function renderRubric(criteria) {
    rubricForm.innerHTML = '';
    criteria.forEach(name => {
        const div = document.createElement('div');
        div.className = 'criterion';
        const label = document.createElement('label');
        label.textContent = `${name}:`;

        const select = document.createElement('select');
        select.name = name;
        for (let i = 1; i <= 5; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = i;
            select.appendChild(opt);
        }

        label.appendChild(select);
        div.appendChild(label);
        rubricForm.appendChild(div);
    });

    const notesDiv = document.createElement('div');
    notesDiv.className = 'criterion';
    notesDiv.innerHTML = '<label>Notes:</label><textarea name="notes" rows="2" cols="30"></textarea>';
    rubricForm.appendChild(notesDiv);

    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.textContent = 'Save & Next';
    rubricForm.appendChild(btn);
}

function startSession() {
    const category = document.getElementById('category').value;
    const numQuestions = parseInt(document.getElementById('numQuestions').value, 10);

    const filtered = category === 'Any' ? questionBank : questionBank.filter(q => q.category === category);
    sessionQuestions = shuffle([...filtered]).slice(0, numQuestions);

    setupScreen.style.display = 'none';
    questionScreen.style.display = 'block';
    currentIndex = 0;
    evaluations = [];
    showQuestion();
}

function showQuestion() {
    if (currentIndex >= sessionQuestions.length) {
        showSummary();
        return;
    }
    const q = sessionQuestions[currentIndex];
    qText.textContent = `Q${currentIndex + 1}: ${q.text}`;
    currentCriteria = rubricMap[q.category] || rubricMap.Default;
    renderRubric(currentCriteria);
    progress.textContent = `Question ${currentIndex + 1} of ${sessionQuestions.length}`;
}

function saveEvaluation(event) {
    event.preventDefault();
    const formData = new FormData(rubricForm);
    const evaluation = {
        question: sessionQuestions[currentIndex].text,
        rubric: currentCriteria,
        scores: {},
        notes: formData.get('notes') || ''
    };
    let total = 0;
    currentCriteria.forEach(name => {
        const val = parseInt(formData.get(name), 10);
        evaluation.scores[name] = val;
        total += val;
    });
    evaluation.average = total / currentCriteria.length;
    evaluations.push(evaluation);
    currentIndex++;
    showQuestion();
}

function showSummary() {
    questionScreen.style.display = 'none';
    summaryScreen.style.display = 'block';

    let total = 0;
    const lines = evaluations.map((ev, idx) => {
        total += ev.average;
        const scoreDetails = ev.rubric.map(c => `${c}: ${ev.scores[c]}`).join(', ');
        return `Q${idx + 1}: ${ev.question}\nScores: ${scoreDetails}\nAverage: ${ev.average.toFixed(2)}\nNotes: ${ev.notes}`;
    });

    const overall = (total / evaluations.length).toFixed(2);
    resultsDiv.textContent = `Overall Score: ${overall}\n\n` + lines.join('\n\n');
}

function copySummary() {
    const text = resultsDiv.textContent;
    navigator.clipboard.writeText(text).then(() => {
        alert('Summary copied to clipboard');
    });
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
