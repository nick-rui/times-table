import { useState, useEffect, useRef } from 'react';
import './App.css';

// Load constants from JSON
import constantsJson from './constants.json';

type Constants = typeof constantsJson;

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFeedback(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function App() {
  const constants: Constants = constantsJson;
  const [min, setMin] = useState(constants.DEFAULT_MIN);
  const [max, setMax] = useState(constants.DEFAULT_MAX);
  const [a, setA] = useState(getRandomInt(min, max));
  const [b, setB] = useState(getRandomInt(min, max));
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | ''>('');
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, total: 0, startTime: Date.now(), times: [] as number[] });
  const [lastPair, setLastPair] = useState<[number, number] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate a new question, avoiding immediate repeats (order-insensitive)
  const nextQuestion = (newMin = min, newMax = max) => {
    let newA: number, newB: number;
    let tries = 0;
    do {
      newA = getRandomInt(newMin, newMax);
      newB = getRandomInt(newMin, newMax);
      tries++;
      // If only one possible pair, break to avoid infinite loop
      if (newMax - newMin === 0) break;
    } while (
      lastPair &&
      ((newA === lastPair[0] && newB === lastPair[1]) || (newA === lastPair[1] && newB === lastPair[0])) &&
      tries < 10
    );
    setA(newA);
    setB(newB);
    setLastPair([newA, newB]);
    setUserAnswer('');
    setFeedback('');
    setFeedbackType('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // When min/max changes, reset question
  useEffect(() => {
    nextQuestion(min, max);
    // eslint-disable-next-line
  }, [min, max]);

  // Handle answer submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const answer = parseInt(userAnswer.trim(), 10);
    const correct = a * b;
    const now = Date.now();
    if (answer === correct) {
      setFeedback(getRandomFeedback(constants.CORRECT_FEEDBACK));
      setFeedbackType('correct');
      setStats(s => ({
        ...s,
        correct: s.correct + 1,
        total: s.total + 1,
        times: [...s.times, now - (s.startTime + s.times.reduce((a, b) => a + b, 0))],
      }));
      setTimeout(() => nextQuestion(), 300);
    } else {
      setFeedback(getRandomFeedback(constants.INCORRECT_FEEDBACK) + ` (${a} × ${b} = ${correct})`);
      setFeedbackType('incorrect');
      setStats(s => ({ ...s, incorrect: s.incorrect + 1, total: s.total + 1 }));
      setTimeout(() => nextQuestion(), 700);
    }
  };

  // Keyboard shortcut: Enter submits
  useEffect(() => {
    inputRef.current?.focus();
  }, [a, b]);

  // Stats
  const avgTime = stats.times.length ? (stats.times.reduce((a, b) => a + b, 0) / stats.times.length / 1000).toFixed(2) : '-';

  return (
    <div className="app-container">
      <h1>{constants.APP_TITLE}</h1>
      <div className="settings">
        <label>
          Min:
          <input
            type="number"
            min={constants.MIN_MULTIPLIER}
            max={max}
            value={min}
            onChange={e => setMin(Math.max(constants.MIN_MULTIPLIER, Math.min(Number(e.target.value), max)))}
          />
        </label>
        <label>
          Max:
          <input
            type="number"
            min={min}
            max={constants.MAX_MULTIPLIER}
            value={max}
            onChange={e => setMax(Math.min(constants.MAX_MULTIPLIER, Math.max(Number(e.target.value), min)))}
          />
        </label>
      </div>
      <div className="question-area">
        <span className="question">{a} × {b} = ?</span>
        <form onSubmit={handleSubmit} autoComplete="off">
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            className="answer-input"
            value={userAnswer}
            onChange={e => setUserAnswer(e.target.value)}
            autoFocus
            required
          />
        </form>
        {feedback && (
          <div className={`feedback ${feedbackType}`}>{feedback}</div>
        )}
      </div>
      <div className="stats">
        <span>Correct: {stats.correct}</span>
        <span>Incorrect: {stats.incorrect}</span>
        <span>Avg Time: {avgTime}s</span>
      </div>
    </div>
  );
}

export default App;
