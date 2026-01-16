
import React, { useState, useEffect } from 'react';
import NerveGame from './components/NerveGame';
import { GameState, AIAnalysis } from './types';
import { localPerformanceAnalysis } from './services/aiService';
import { Target, Zap, Trophy, RefreshCcw, Activity, MousePointer2, AlertCircle, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('nerve-highscore')) || 0);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysis | null>(null);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('nerve-highscore', score.toString());
    }
  }, [score, highScore]);

  const handleGameOver = (finalScore: number) => {
    setScore(finalScore);
    const result = localPerformanceAnalysis(finalScore);
    setAnalysisResult(result);
    setGameState(GameState.GAMEOVER);
  };

  const showInstructions = () => {
    setGameState(GameState.INSTRUCTIONS);
  };

  const startGame = () => {
    setAnalysisResult(null);
    setScore(0);
    setGameState(GameState.PLAYING);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col font-['Cairo']">
      {/* Game Layer */}
      <NerveGame gameState={gameState} onGameOver={handleGameOver} />

      {/* Start UI (Main Menu) */}
      {gameState === GameState.START && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
          <div className="bg-green-500/10 p-6 rounded-full mb-6 border border-green-500/30 animate-pulse">
            <Zap size={64} className="text-green-500" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter">تحدي الأعصاب</h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-md mb-8">
            اختبر ردود فعلك. اضغط على المربع المتغير. 
            كلما ضغطت، أصبح أصغر وأسرع!
          </p>
          <button 
            onClick={showInstructions}
            className="group relative px-12 py-4 bg-green-600 hover:bg-green-500 text-white text-2xl font-bold rounded-xl transition-all hover:scale-105 active:scale-95 overflow-hidden shadow-[0_0_30px_rgba(34,197,94,0.4)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              ابدأ التحدي <Target size={28} />
            </span>
          </button>
          
          <div className="mt-12 flex items-center gap-4 text-gray-500">
            <Trophy size={20} />
            <span className="text-xl font-bold">أعلى نتيجة: {highScore}</span>
          </div>
        </div>
      )}

      {/* Instructions UI (Tips Page) */}
      {gameState === GameState.INSTRUCTIONS && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-300">
          <div className="max-w-md w-full bg-zinc-900/50 border border-zinc-800 rounded-3xl p-10 shadow-2xl space-y-8">
            <div className="flex justify-center">
              <div className="p-4 bg-indigo-500/20 rounded-2xl border border-indigo-500/40">
                <AlertCircle size={48} className="text-indigo-400" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-white">نصيحة للمحترفين</h2>
              <p className="text-2xl font-bold text-indigo-300 leading-relaxed">
                "لا تضغط بسرعة كبيرة، ركز أولاً، ثم اضغط."
              </p>
              <p className="text-gray-500 text-sm">
                (Don't click too quickly, focus first, then click.)
              </p>
            </div>

            <button 
              onClick={startGame}
              className="w-full py-5 bg-white text-black text-xl font-black rounded-2xl hover:bg-indigo-50 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
            >
              فهمت، لنبدأ! <MousePointer2 size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Game Over UI */}
      {gameState === GameState.GAMEOVER && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-lg flex flex-col items-center justify-center p-6 animate-in slide-in-from-bottom duration-500">
          <div className="w-full max-w-2xl bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 md:p-12 shadow-2xl">
            <h2 className="text-4xl font-black text-red-500 mb-2 text-center">انتهت المحاولة!</h2>
            <div className="flex justify-center gap-8 my-8">
              <div className="text-center">
                <p className="text-gray-500 text-sm uppercase tracking-widest">النتيجة</p>
                <p className="text-5xl font-black text-white">{score}</p>
              </div>
              <div className="w-px h-16 bg-zinc-800 self-center"></div>
              <div className="text-center">
                <p className="text-gray-500 text-sm uppercase tracking-widest">أعلى نتيجة</p>
                <p className="text-5xl font-black text-green-500">{highScore}</p>
              </div>
            </div>

            {/* Local Performance Analysis */}
            <div className="bg-zinc-800/50 rounded-2xl p-6 border border-zinc-700/50 mb-8 min-h-[160px] flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-indigo-400">
                <Activity size={24} />
                <span className="font-bold text-sm uppercase tracking-wider">تحليل الأداء</span>
              </div>
              
              {analysisResult ? (
                <div className="animate-in fade-in slide-in-from-top-4 duration-700 text-right">
                  <div className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded-md mb-3 border border-indigo-500/30">
                    الرتبة: {analysisResult.rank}
                  </div>
                  <p className="text-white text-lg font-bold leading-relaxed mb-3">"{analysisResult.commentary}"</p>
                  <p className="text-gray-400 text-sm italic">{analysisResult.advice}</p>
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">جاري حساب الرتبة...</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={startGame}
                className="flex-1 flex items-center justify-center gap-2 bg-white text-black font-black py-4 rounded-xl hover:bg-gray-200 transition-colors"
              >
                إعادة المحاولة <RefreshCcw size={20} />
              </button>
              <button 
                onClick={() => setGameState(GameState.START)}
                className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 text-white font-bold py-4 rounded-xl hover:bg-zinc-700 transition-colors border border-zinc-700"
              >
                القائمة الرئيسية
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info (Hidden while playing) */}
      {(gameState === GameState.START || gameState === GameState.GAMEOVER) && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 text-zinc-600 text-xs uppercase tracking-widest font-bold">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} />
            <span>نسخة آمنة - بدون تبعيات خارجية</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
