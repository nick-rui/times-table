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

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function App() {
  const constants: Constants = constantsJson;
  const [firstMin, setFirstMin] = useState(constants.DEFAULT_FIRST_MIN);
  const [firstMax, setFirstMax] = useState(constants.DEFAULT_FIRST_MAX);
  const [secondMin, setSecondMin] = useState(constants.DEFAULT_SECOND_MIN);
  const [secondMax, setSecondMax] = useState(constants.DEFAULT_SECOND_MAX);
  const [a, setA] = useState(getRandomInt(firstMin, firstMax));
  const [b, setB] = useState(getRandomInt(secondMin, secondMax));
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | ''>('');
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, total: 0, startTime: Date.now(), times: [] as number[] });
  const [lastPair, setLastPair] = useState<[number, number] | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [totalSessionTime, setTotalSessionTime] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update total session time
  useEffect(() => {
    if (!sessionStarted) return;
    
    const interval = setInterval(() => {
      if (sessionStartTime) {
        setTotalSessionTime(Date.now() - sessionStartTime);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [sessionStarted, sessionStartTime]);

  // Generate a new question, avoiding immediate repeats (order-insensitive)
  const nextQuestion = () => {
    let firstNum: number, secondNum: number;
    let tries = 0;
    do {
      firstNum = getRandomInt(firstMin, firstMax);
      secondNum = getRandomInt(secondMin, secondMax);
      tries++;
      // If only one possible pair, break to avoid infinite loop
      if ((firstMax - firstMin === 0) && (secondMax - secondMin === 0)) break;
    } while (
      lastPair &&
      ((firstNum === lastPair[0] && secondNum === lastPair[1]) || (firstNum === lastPair[1] && secondNum === lastPair[0])) &&
      tries < 10
    );
    
    // Randomly swap the order for presentation
    const shouldSwap = Math.random() < 0.5;
    const displayA = shouldSwap ? secondNum : firstNum;
    const displayB = shouldSwap ? firstNum : secondNum;
    
    setA(displayA);
    setB(displayB);
    setLastPair([firstNum, secondNum]); // Store the original pair for repeat detection
    setUserAnswer('');
    setFeedback('');
    setFeedbackType('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // When ranges change, reset question
  useEffect(() => {
    nextQuestion();
    // eslint-disable-next-line
  }, [firstMin, firstMax, secondMin, secondMax]);

  // Handle start button
  const handleStart = () => {
    setSessionStarted(true);
    setSessionStartTime(Date.now());
    setTotalSessionTime(0);
    setStats({ correct: 0, incorrect: 0, total: 0, startTime: Date.now(), times: [] });
    nextQuestion();
  };

  // Handle answer submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionStarted) return;
    
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
    if (sessionStarted) {
      inputRef.current?.focus();
    }
  }, [a, b, sessionStarted]);

  // Stats
  const avgTime = stats.times.length ? (stats.times.reduce((a, b) => a + b, 0) / stats.times.length / 1000).toFixed(2) : '-';
  const accuracy = stats.total > 0 ? ((stats.correct / stats.total) * 100).toFixed(1) : '0.0';

  return (
    <div className="app-container">
      <h1>{constants.APP_TITLE}</h1>
      <div className="settings">
        <div className="range-group">
          <label>
            First Number Min:
            <input
              type="number"
              min={constants.MIN_MULTIPLIER}
              max={firstMax}
              value={firstMin}
              onChange={e => setFirstMin(Math.max(constants.MIN_MULTIPLIER, Math.min(Number(e.target.value), firstMax)))}
            />
          </label>
          <label>
            First Number Max:
            <input
              type="number"
              min={firstMin}
              max={constants.MAX_MULTIPLIER}
              value={firstMax}
              onChange={e => setFirstMax(Math.min(constants.MAX_MULTIPLIER, Math.max(Number(e.target.value), firstMin)))}
            />
          </label>
        </div>
        <div className="range-group">
          <label>
            Second Number Min:
            <input
              type="number"
              min={constants.MIN_MULTIPLIER}
              max={secondMax}
              value={secondMin}
              onChange={e => setSecondMin(Math.max(constants.MIN_MULTIPLIER, Math.min(Number(e.target.value), secondMax)))}
            />
          </label>
          <label>
            Second Number Max:
            <input
              type="number"
              min={secondMin}
              max={constants.MAX_MULTIPLIER}
              value={secondMax}
              onChange={e => setSecondMax(Math.min(constants.MAX_MULTIPLIER, Math.max(Number(e.target.value), secondMin)))}
            />
          </label>
        </div>
      </div>
      
      {!sessionStarted ? (
        <button className="start-button" onClick={handleStart}>
          Start Practice Session
        </button>
      ) : (
        <>
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
            <span>Accuracy: {accuracy}%</span>
            <span>Avg Time: {avgTime}s</span>
            <span>Total Time: {formatTime(totalSessionTime)}</span>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
