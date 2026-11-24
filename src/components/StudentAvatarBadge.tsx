import React from 'react';
import { AvatarConfig } from '../types/game';
import { DEFAULT_AVATAR_CONFIG } from '../data/sejarahBab1';

interface StudentAvatarBadgeProps {
  config?: AvatarConfig;
  fallbackColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StudentAvatarBadge: React.FC<StudentAvatarBadgeProps> = ({
  config,
  fallbackColor,
  size = 'md',
}) => {
  const av = config || {
    ...DEFAULT_AVATAR_CONFIG,
    shirtColor: fallbackColor || DEFAULT_AVATAR_CONFIG.shirtColor,
  };

  const sizeClass =
    size === 'sm'
      ? 'w-9 h-9 rounded-xl'
      : size === 'lg'
        ? 'w-14 h-14 rounded-2xl'
        : 'w-11 h-11 rounded-xl';

  return (
    <div
      className={`${sizeClass} relative overflow-hidden border-2 border-white/25 bg-slate-900 shrink-0 flex items-center justify-center shadow-inner`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" className="w-full h-full">
        {/* Background gradient tint matching shirt */}
        <rect width="64" height="64" fill="#0f172a" />
        <circle cx="32" cy="32" r="28" fill={av.shirtColor} opacity="0.22" />

        {/* Shoulders / Shirt */}
        <path
          d="M12 64 C12 48, 52 48, 52 64 Z"
          fill={av.shirtColor}
        />
        {av.shirtStyle === 'jacket' && (
          <path d="M27 50 L32 64 L37 50 Z" fill="#f8fafc" opacity="0.9" />
        )}
        {av.shirtStyle === 'royal' && (
          <path d="M20 51 L32 58 L44 51" stroke="#fbbf24" strokeWidth="3" fill="none" />
        )}

        {/* Hijab back drape if hijab */}
        {av.hairStyle === 'hijab' && (
          <rect x="14" y="13" width="36" height="42" rx="14" fill={av.hairColor} />
        )}

        {/* Ponytail behind head */}
        {av.hairStyle === 'ponytail' && (
          <rect x="38" y="18" width="12" height="24" rx="5" fill={av.hairColor} />
        )}

        {/* Head */}
        <rect x="18" y="16" width="28" height="28" rx="9" fill={av.skinTone} />

        {/* Eyes & Smile */}
        <rect x="24" y="27" width="4" height="5" rx="1.5" fill="#0f172a" />
        <rect x="36" y="27" width="4" height="5" rx="1.5" fill="#0f172a" />
        <circle cx="25.2" cy="28.3" r="1" fill="#ffffff" />
        <circle cx="37.2" cy="28.3" r="1" fill="#ffffff" />
        <path
          d="M27 36 Q32 40 37 36"
          stroke="#9f1239"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Hair Styles */}
        {av.hairStyle === 'hijab' ? (
          <>
            <path d="M16 24 C16 12, 48 12, 48 24 Z" fill={av.hairColor} />
            <circle cx="32" cy="46" r="2.5" fill="#fbbf24" />
          </>
        ) : av.hairStyle === 'spiky' ? (
          <path
            d="M17 22 L20 10 L26 16 L32 8 L38 16 L44 10 L47 22 Z"
            fill={av.hairColor}
          />
        ) : av.hairStyle === 'curly' ? (
          <>
            <circle cx="22" cy="17" r="6" fill={av.hairColor} />
            <circle cx="32" cy="14" r="7" fill={av.hairColor} />
            <circle cx="42" cy="17" r="6" fill={av.hairColor} />
          </>
        ) : av.hairStyle === 'bob' ? (
          <path
            d="M15 34 L15 20 C15 11, 49 11, 49 20 L49 34 L45 34 L45 22 L19 22 L19 34 Z"
            fill={av.hairColor}
          />
        ) : (
          <path
            d="M17 23 C17 12, 47 12, 47 23 L45 22 L19 22 Z"
            fill={av.hairColor}
          />
        )}

        {/* Head Accessories */}
        {av.accessory === 'glasses' && (
          <g stroke="#1e293b" strokeWidth="1.8" fill="none">
            <circle cx="26" cy="29.5" r="4.5" />
            <circle cx="38" cy="29.5" r="4.5" />
            <line x1="30.5" y1="29.5" x2="33.5" y2="29.5" />
          </g>
        )}
        {av.accessory === 'safari-hat' && (
          <g>
            <rect x="11" y="15" width="42" height="4" rx="2" fill="#d9a05b" />
            <rect x="19" y="8" width="26" height="8" rx="3" fill="#d9a05b" />
            <rect x="19" y="13" width="26" height="2.5" fill={av.shirtColor} />
          </g>
        )}
        {av.accessory === 'crown' && (
          <path
            d="M21 15 L23 7 L28 12 L32 6 L36 12 L41 7 L43 15 Z"
            fill="#fbbf24"
          />
        )}
        {av.accessory === 'headband' && (
          <rect x="17" y="18" width="30" height="4" rx="1.5" fill="#f43f5e" />
        )}
      </svg>
    </div>
  );
};
