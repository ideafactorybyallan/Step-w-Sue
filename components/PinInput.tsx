'use client';
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
        <p className="font-body text-sm font-semibold text-navy text-center mb-3">{label}</p>
      )}

      {/* Dots display */}
      <div className="flex justify-center gap-3 mb-6">
        {Array.from({ length: maxLength }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              'w-3 h-3 rounded-full border-2 transition-all',
              i < value.length
                ? 'bg-sw-pink border-sw-pink scale-110'
                : 'bg-transparent border-navy/30'
            )}
          />
        ))}
      </div>

      {error && (
        <p className="font-body text-sm text-sw-pink text-center mb-3">{error}</p>
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
                'h-14 rounded-2xl font-body font-semibold text-xl transition-all active:scale-95',
                key === 'del'
                  ? 'bg-gray-100 text-navy/60 active:bg-gray-200'
                  : 'bg-white text-navy shadow-sm border border-gray-100 active:bg-gray-50'
              )}
            >
              {key === 'del' ? <Delete size={20} className="mx-auto" /> : key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
