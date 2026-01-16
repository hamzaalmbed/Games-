
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, Target } from '../types';
import { ParticleSystem } from './ParticleSystem';

interface NerveGameProps {
  onGameOver: (score: number) => void;
  gameState: GameState;
}

interface EnhancedTarget extends Target {
  angle: number;
  rotation: number;
}

const NerveGame: React.FC<NerveGameProps> = ({ onGameOver, gameState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  
  // Gameplay Refs
  const targetRef = useRef<EnhancedTarget>({
    x: 100, y: 100, size: 80, dx: 4, dy: 4, color: '#00FF00', angle: 0, rotation: 0
  });
  const particlesRef = useRef(new ParticleSystem());
  const animationFrameRef = useRef<number | undefined>(undefined);
  const shakeRef = useRef(0);
  const frameCountRef = useRef(0);

  // Timer logic - Updated to 15 seconds (15000ms)
  const maxTimeRef = useRef(15000); 
  const timeLeftRef = useRef(15000);
  const lastTimeRef = useRef(performance.now());

  const initTarget = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const initialSpeed = 4;
    const angle = Math.random() * Math.PI * 2;
    targetRef.current = {
      x: canvas.width / 2 - 40,
      y: canvas.height / 2 - 40,
      size: 80,
      dx: Math.cos(angle) * initialSpeed,
      dy: Math.sin(angle) * initialSpeed,
      color: '#00FF00',
      angle: angle,
      rotation: 0
    };
    setScore(0);
    maxTimeRef.current = 15000;
    timeLeftRef.current = 15000;
    lastTimeRef.current = performance.now();
  }, []);

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      initTarget();
    }
  }, [gameState, initTarget]);

  const handleInput = (clientX: number, clientY: number) => {
    if (gameState !== GameState.PLAYING) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const target = targetRef.current;
    const isHit = 
      x >= target.x && 
      x <= target.x + target.size && 
      y >= target.y && 
      y <= target.y + target.size;

    if (isHit) {
      const nextScore = score + 1;
      setScore(nextScore);
      particlesRef.current.emit(x, y, target.color, 15);
      
      // Level up target size
      target.size = Math.max(15, target.size - 4);
      
      // Reset Timer - Slower scaling as requested
      // Starts at 15s, decreases by 300ms per score, floor at 2s
      maxTimeRef.current = Math.max(2000, 15000 - (nextScore * 300));
      timeLeftRef.current = maxTimeRef.current;

      // Calculate new speed - Faster as it gets smaller and score goes up
      const sizeBonus = (80 / target.size);
      const baseSpeed = 4 + (nextScore * 0.4) + sizeBonus;
      const newAngle = Math.random() * Math.PI * 2;
      
      target.dx = Math.cos(newAngle) * baseSpeed;
      target.dy = Math.sin(newAngle) * baseSpeed;

      const hues = [120, 180, 240, 300, 0];
      target.color = `hsl(${hues[Math.floor(Math.random() * hues.length)]}, 100%, 50%)`;
      
      if (target.size <= 15) {
        onGameOver(nextScore);
      }
    } else {
      shakeRef.current = 20;
      onGameOver(score);
    }
  };

  const update = (now: number) => {
    const canvas = canvasRef.current;
    if (!canvas || gameState !== GameState.PLAYING) return;

    const deltaTime = now - lastTimeRef.current;
    lastTimeRef.current = now;

    // Timer Update
    timeLeftRef.current -= deltaTime;
    if (timeLeftRef.current <= 0) {
      shakeRef.current = 20;
      onGameOver(score);
      return;
    }

    frameCountRef.current++;
    const target = targetRef.current;
    
    // Steering & Wandering Force
    const wanderStrength = 0.3 + (score * 0.08);
    target.dx += (Math.random() - 0.5) * wanderStrength;
    target.dy += (Math.random() - 0.5) * wanderStrength;

    // Speed Constraints
    const currentSpeed = Math.sqrt(target.dx * target.dx + target.dy * target.dy);
    const sizeBonus = (80 / target.size);
    const minSpeed = 3 + (score * 0.3) + sizeBonus;
    const maxSpeed = 10 + (score * 0.6) + sizeBonus;
    
    if (currentSpeed > maxSpeed) {
      target.dx = (target.dx / currentSpeed) * maxSpeed;
      target.dy = (target.dy / currentSpeed) * maxSpeed;
    } else if (currentSpeed < minSpeed) {
      target.dx = (target.dx / currentSpeed) * minSpeed;
      target.dy = (target.dy / currentSpeed) * minSpeed;
    }

    // Wall Bouncing
    if (target.x <= 0) {
      target.dx = Math.abs(target.dx) * (1.1);
      target.x = 0;
    } else if (target.x + target.size >= canvas.width) {
      target.dx = -Math.abs(target.dx) * (1.1);
      target.x = canvas.width - target.size;
    }

    if (target.y <= 0) {
      target.dy = Math.abs(target.dy) * (1.1);
      target.y = 0;
    } else if (target.y + target.size >= canvas.height) {
      target.dy = -Math.abs(target.dy) * (1.1);
      target.y = canvas.height - target.size;
    }

    target.x += target.dx;
    target.y += target.dy;
    target.rotation = Math.atan2(target.dy, target.dx);

    particlesRef.current.update();
    if (shakeRef.current > 0) shakeRef.current -= 1;

    draw();
    animationFrameRef.current = requestAnimationFrame(update);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (shakeRef.current > 0) {
      ctx.save();
      ctx.translate((Math.random() - 0.5) * shakeRef.current, (Math.random() - 0.5) * shakeRef.current);
    }

    // Background Grid
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 40) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }

    // Timer Bar
    const timerWidth = (timeLeftRef.current / maxTimeRef.current) * canvas.width;
    ctx.fillStyle = timeLeftRef.current < 2000 ? '#ff4444' : '#22c55e';
    ctx.fillRect(0, 0, timerWidth, 8);
    ctx.shadowBlur = 10;
    ctx.shadowColor = ctx.fillStyle;
    ctx.fillRect(0, 0, timerWidth, 2);
    ctx.shadowBlur = 0;

    // Numerical Countdown Display
    const secondsLeft = Math.ceil(timeLeftRef.current / 1000);
    ctx.fillStyle = timeLeftRef.current < 2000 ? '#ff4444' : 'rgba(255, 255, 255, 0.7)';
    ctx.font = 'bold 20px Cairo';
    ctx.textAlign = 'left';
    ctx.fillText(`${secondsLeft}s`, 10, 30);

    // Draw Target
    const target = targetRef.current;
    ctx.save();
    const cx = target.x + target.size / 2;
    const cy = target.y + target.size / 2;
    ctx.translate(cx, cy);
    ctx.rotate(target.rotation);
    
    ctx.shadowBlur = 20;
    ctx.shadowColor = target.color;
    ctx.fillStyle = target.color;
    ctx.fillRect(-target.size / 2, -target.size / 2, target.size, target.size);
    
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(-target.size / 2 + 5, -target.size / 2 + 5, target.size - 10, target.size - 10);
    
    // Direction indicator
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(target.size / 2, 0);
    ctx.lineTo(target.size / 2 - 8, -4);
    ctx.lineTo(target.size / 2 - 8, 4);
    ctx.fill();
    ctx.restore();

    particlesRef.current.draw(ctx);

    if (shakeRef.current > 0) ctx.restore();

    // Score HUD
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 28px Cairo';
    ctx.textAlign = 'right';
    ctx.fillText(`${score}`, canvas.width - 20, 45);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    if (gameState === GameState.PLAYING) {
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(update);
    }

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState]);

  return (
    <canvas 
      ref={canvasRef}
      onMouseDown={(e) => handleInput(e.clientX, e.clientY)}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        handleInput(touch.clientX, touch.clientY);
      }}
      className="block w-full h-full cursor-crosshair"
    />
  );
};

export default NerveGame;
