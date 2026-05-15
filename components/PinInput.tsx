'use client';
import { useEffect, useRef, useState } from 'react';
import { Delete } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
  value: string;
  onChange: (val: string) => void;
  maxLength?: number;
  label?: string;
  error?: string;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

export function PinInput({ value, onChange, maxLength = 4, label = 'Enter PIN', error }: Props) {
  const [shake, setShake] = useState(false);
  const prevError = useRef('');

  useEffect(() => {
    if (error && error !== prevError.current) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 600);
      prevError.current = error;
      return () => clearTimeout(t);
    }
    if (!error) prevError.current = '';
  }, [error]);

  const handleKey = (key: string) => {
    if (key === 'del') {
      onChange(value.slice(0, -1));
    } else if (value.length < maxLength) {
      onChange(value + key);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <p className="font-body text-sm font-semibold text-navy text-center mb-4">{label}</p>
      )}

      {/* Dots display */}
      <div className={clsx('flex justify-center gap-4 mb-5', shake && 'animate-shake')}>
        {Array.from({ length: maxLength }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              'w-4 h-4 rounded-full border-2 transition-all duration-150',
              i < value.length
                ? 'bg-sw-pink border-sw-pink scale-110'
                : 'bg-transparent border-navy/25'
            )}
          />
        ))}
      </div>

      {error && (
        <p className="font-body text-sm text-sw-pink text-center mb-4 animate-fade-up">{error}</p>
      )}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
        {KEYS.map((key, i) => {
          if (key === '') return <div key={i} />;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleKey(key)}
              className={clsx(
                'h-16 rounded-2xl font-body font-semibold text-2xl transition-all duration-100 active:scale-95',
                key === 'del'
                  ? 'bg-navy/8 text-navy/50 active:bg-navy/15'
                  : 'bg-white text-navy shadow-card hover:shadow-card-hover active:shadow-none active:bg-gray-50 border border-gray-100'
              )}
            >
              {key === 'del' ? <Delete size={22} className="mx-auto" /> : key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
