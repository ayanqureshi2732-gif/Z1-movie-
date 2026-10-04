import React, { useState } from 'react';
import { Delete } from 'lucide-react';

export const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [hasEvaluated, setHasEvaluated] = useState(false);

  const handleNumber = (n: string) => {
    if (hasEvaluated || display === '0') {
      setDisplay(n);
      setHasEvaluated(false);
    } else {
      setDisplay((prev) => (prev.length < 12 ? prev + n : prev));
    }
  };

  const handleDecimal = () => {
    if (hasEvaluated) {
      setDisplay('0.');
      setHasEvaluated(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay((prev) => prev + '.');
    }
  };

  const handleOperator = (op: string) => {
    setEquation(`${display} ${op} `);
    setDisplay('0');
    setHasEvaluated(false);
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setHasEvaluated(false);
  };

  const handleDelete = () => {
    if (hasEvaluated) {
      handleClear();
      return;
    }
    setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const handlePercent = () => {
    const val = parseFloat(display);
    setDisplay(String(val / 100));
  };

  const handlePlusMinus = () => {
    const val = parseFloat(display);
    setDisplay(String(-val));
  };

  const handleEquals = () => {
    if (!equation) return;
    try {
      const parts = equation.trim().split(' ');
      const num1 = parseFloat(parts[0]);
      const op = parts[1];
      const num2 = parseFloat(display);

      let result = 0;
      switch (op) {
        case '+':
          result = num1 + num2;
          break;
        case '−':
        case '-':
          result = num1 - num2;
          break;
        case '×':
        case '*':
          result = num1 * num2;
          break;
        case '÷':
        case '/':
          result = num2 !== 0 ? num1 / num2 : 0;
          break;
      }

      setEquation(`${equation}${display} =`);
      setDisplay(String(Number(result.toFixed(6))));
      setHasEvaluated(true);
    } catch {
      setDisplay('Error');
      setHasEvaluated(true);
    }
  };

  return (
    <div className="w-full h-full bg-[#181920] text-white flex flex-col justify-between p-5 select-none overflow-hidden">
      {/* Display Screen */}
      <div className="flex-1 flex flex-col justify-end text-right pb-4 pt-6">
        <span className="text-xs font-mono text-neutral-400 h-6 truncate">{equation}</span>
        <h1 className="text-5xl font-light font-mono text-white tracking-tight truncate drop-shadow">
          {display}
        </h1>
      </div>

      {/* Calculator Buttons Grid (4x5) */}
      <div className="grid grid-cols-4 gap-2.5 pb-2">
        {/* Row 1 */}
        <button
          type="button"
          onClick={handleClear}
          className="h-14 rounded-2xl bg-neutral-700/80 hover:bg-neutral-600 active:scale-95 text-red-400 font-semibold text-base transition-all"
        >
          C
        </button>
        <button
          type="button"
          onClick={handlePlusMinus}
          className="h-14 rounded-2xl bg-neutral-700/80 hover:bg-neutral-600 active:scale-95 text-neutral-200 font-semibold text-base transition-all"
        >
          ±
        </button>
        <button
          type="button"
          onClick={handlePercent}
          className="h-14 rounded-2xl bg-neutral-700/80 hover:bg-neutral-600 active:scale-95 text-neutral-200 font-semibold text-base transition-all"
        >
          %
        </button>
        <button
          type="button"
          onClick={() => handleOperator('÷')}
          className="h-14 rounded-2xl bg-amber-600/90 hover:bg-amber-500 active:scale-95 text-white font-semibold text-xl transition-all"
        >
          ÷
        </button>

        {/* Row 2 */}
        <button
          type="button"
          onClick={() => handleNumber('7')}
          className="h-14 rounded-2xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white font-medium text-lg transition-all"
        >
          7
        </button>
        <button
          type="button"
          onClick={() => handleNumber('8')}
          className="h-14 rounded-2xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white font-medium text-lg transition-all"
        >
          8
        </button>
        <button
          type="button"
          onClick={() => handleNumber('9')}
          className="h-14 rounded-2xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white font-medium text-lg transition-all"
        >
          9
        </button>
        <button
          type="button"
          onClick={() => handleOperator('×')}
          className="h-14 rounded-2xl bg-amber-600/90 hover:bg-amber-500 active:scale-95 text-white font-semibold text-xl transition-all"
        >
          ×
        </button>

        {/* Row 3 */}
        <button
          type="button"
          onClick={() => handleNumber('4')}
          className="h-14 rounded-2xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white font-medium text-lg transition-all"
        >
          4
        </button>
        <button
          type="button"
          onClick={() => handleNumber('5')}
          className="h-14 rounded-2xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white font-medium text-lg transition-all"
        >
          5
        </button>
        <button
          type="button"
          onClick={() => handleNumber('6')}
          className="h-14 rounded-2xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white font-medium text-lg transition-all"
        >
          6
        </button>
        <button
          type="button"
          onClick={() => handleOperator('−')}
          className="h-14 rounded-2xl bg-amber-600/90 hover:bg-amber-500 active:scale-95 text-white font-semibold text-xl transition-all"
        >
          −
        </button>

        {/* Row 4 */}
        <button
          type="button"
          onClick={() => handleNumber('1')}
          className="h-14 rounded-2xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white font-medium text-lg transition-all"
        >
          1
        </button>
        <button
          type="button"
          onClick={() => handleNumber('2')}
          className="h-14 rounded-2xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white font-medium text-lg transition-all"
        >
          2
        </button>
        <button
          type="button"
          onClick={() => handleNumber('3')}
          className="h-14 rounded-2xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white font-medium text-lg transition-all"
        >
          3
        </button>
        <button
          type="button"
          onClick={() => handleOperator('+')}
          className="h-14 rounded-2xl bg-amber-600/90 hover:bg-amber-500 active:scale-95 text-white font-semibold text-xl transition-all"
        >
          +
        </button>

        {/* Row 5 */}
        <button
          type="button"
          onClick={handleDelete}
          className="h-14 rounded-2xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-neutral-300 font-medium text-lg flex items-center justify-center transition-all"
        >
          <Delete className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => handleNumber('0')}
          className="h-14 rounded-2xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white font-medium text-lg transition-all"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleDecimal}
          className="h-14 rounded-2xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white font-medium text-lg transition-all"
        >
          .
        </button>
        <button
          type="button"
          onClick={handleEquals}
          className="h-14 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xl shadow-lg shadow-red-950/60 transition-all"
        >
          =
        </button>
      </div>
    </div>
  );
};
