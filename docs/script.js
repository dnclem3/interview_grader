// React implementation of the Interview Feedback Helper
// Merge markers have been removed and the question bank is a simple object keyed by category

// The question bank is organized by category so sessions can be filtered easily
const questionBank = {
  Behavioral: [
    'Tell me about a time you led a team through a challenge.',
    'Describe a conflict you handled at work.',
  ],
  Estimation: [
    'How many umbrellas are sold each year in the US?',
  ],
  Strategy: [
    'What should our company prioritize in the next year?',
  ],
  Technical: [
    'Explain the concept of dependency injection.',
    'What are the benefits of using a relational database?',
  ],
};

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
    const build = [];
    if (category === 'Any') {
      Object.keys(questionBank).forEach((cat) => {
        questionBank[cat].forEach((text) => build.push({ category: cat, text }));
      });
    } else {
      questionBank[category].forEach((text) => build.push({ category, text }));
    }
    setSessionQuestions(shuffle(build).slice(0, numQuestions));
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
