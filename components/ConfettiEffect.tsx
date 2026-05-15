'use client';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface Props {
  trigger: boolean;
}

export function ConfettiEffect({ trigger }: Props) {
  useEffect(() => {
    return () => { confetti.reset(); };
  }, []);

  useEffect(() => {
    if (!trigger) return;

    const colors = ['#E8234A', '#2BB8AA', '#F5C518', '#1B2F5E', '#FFFFFF'];

    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors, ticks: 200 });

    const t1 = setTimeout(() => {
      confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 }, colors });
    }, 200);

    const t2 = setTimeout(() => {
      confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 }, colors });
    }, 400);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [trigger]);

  return null;
}
