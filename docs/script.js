// React implementation of the interview feedback helper

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
  Strategy: ['Vision', 'Execution', 'Impact', 'Measurement'],
};

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function SetupScreen({ category, numQuestions, setCategory, setNumQuestions, onStart }) {
  return (
    <div id="setup" className="screen">
      <h1>Interview Session Setup</h1>
      <label>
        Category:
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Any">Any</option>
          <option value="Behavioral">Behavioral</option>
          <option value="Estimation">Estimation</option>
          <option value="Strategy">Strategy</option>
          <option value="Technical">Technical</option>
        </select>
      </label>
      <label>
        Number of Questions:
        <select value={numQuestions} onChange={(e) => setNumQuestions(parseInt(e.target.value, 10))}>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
      </label>
      <button onClick={onStart}>Start Session</button>
    </div>
  );
}

function RubricForm({ criteria, onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const evaluation = {
      rubric: criteria,
      scores: {},
      notes: formData.get('notes') || '',
    };
    let total = 0;
    criteria.forEach((c) => {
      const val = parseInt(formData.get(c), 10);
      evaluation.scores[c] = val;
      total += val;
    });
    evaluation.average = total / criteria.length;
    onSubmit(evaluation);
    e.target.reset();
  };

  return (
    <form onSubmit={handleSubmit} id="rubricForm">
      {criteria.map((c) => (
        <div className="criterion" key={c}>
          <label>
            {c}:
            <select name={c} defaultValue="1">
              {[1, 2, 3, 4, 5].map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </label>
        </div>
      ))}
      <div className="criterion">
        <label>
          Notes:
          <textarea name="notes" rows="2" cols="30"></textarea>
        </label>
      </div>
      <button type="submit">Save &amp; Next</button>
    </form>
  );
}

function QuestionScreen({ question, criteria, index, total, onSubmit }) {
  return (
    <div id="question" className="screen">
      <h2>{`Q${index + 1}: ${question}`}</h2>
      <RubricForm criteria={criteria} onSubmit={onSubmit} />
      <div id="progress">{`Question ${index + 1} of ${total}`}</div>
    </div>
  );
}

function SummaryScreen({ evaluations, onRestart }) {
  const overall = evaluations.reduce((sum, e) => sum + e.average, 0) / evaluations.length;
  const lines = evaluations.map((ev, idx) => {
    const scoreDetails = ev.rubric.map((c) => `${c}: ${ev.scores[c]}`).join(', ');
    return `Q${idx + 1}: ${ev.question}\nScores: ${scoreDetails}\nAverage: ${ev.average.toFixed(2)}\nNotes: ${ev.notes}`;
  });
  const summaryText = `Overall Score: ${overall.toFixed(2)}\n\n` + lines.join('\n\n');

  const copy = () => {
    navigator.clipboard.writeText(summaryText).then(() => {
      alert('Summary copied to clipboard');
    });
  };

  return (
    <div id="summary" className="screen">
      <h1>Session Summary</h1>
      <pre id="results">{summaryText}</pre>
      <button onClick={copy}>Copy Summary</button>
      <button onClick={onRestart}>New Session</button>
    </div>
  );
}

function App() {
  const [stage, setStage] = React.useState('setup');
  const [category, setCategory] = React.useState('Any');
  const [numQuestions, setNumQuestions] = React.useState(3);
  const [sessionQuestions, setSessionQuestions] = React.useState([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [evaluations, setEvaluations] = React.useState([]);

  const startSession = () => {
    const filtered = category === 'Any' ? questionBank : questionBank.filter((q) => q.category === category);
    setSessionQuestions(shuffle([...filtered]).slice(0, numQuestions));
    setEvaluations([]);
    setCurrentIndex(0);
    setStage('question');
  };

  const addEvaluation = (evaluation) => {
    const q = sessionQuestions[currentIndex];
    evaluation.question = q.text;
    const newEvals = [...evaluations, evaluation];
    setEvaluations(newEvals);
    if (currentIndex + 1 >= sessionQuestions.length) {
      setStage('summary');
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const restart = () => setStage('setup');

  let content = null;
  if (stage === 'setup') {
    content = (
      <SetupScreen
        category={category}
        numQuestions={numQuestions}
        setCategory={setCategory}
        setNumQuestions={setNumQuestions}
        onStart={startSession}
      />
    );
  } else if (stage === 'question') {
    const q = sessionQuestions[currentIndex];
    const criteria = rubricMap[q.category] || rubricMap.Default;
    content = (
      <QuestionScreen
        question={q.text}
        criteria={criteria}
        index={currentIndex}
        total={sessionQuestions.length}
        onSubmit={addEvaluation}
      />
    );
  } else if (stage === 'summary') {
    content = <SummaryScreen evaluations={evaluations} onRestart={restart} />;
  }

  return <div id="app">{content}</div>;
}

ReactDOM.render(<App />, document.getElementById('root'));
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