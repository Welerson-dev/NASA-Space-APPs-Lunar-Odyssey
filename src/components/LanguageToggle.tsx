import React from 'react';
import { Language } from '../game/tts';

interface LanguageToggleProps {
  lang: Language;
  onChange: (lang: Language) => void;
  className?: string;
}

const BrazilFlagIcon: React.FC = () => (
  <svg
    viewBox="0 0 18 12"
    className="w-[18px] h-[12px] shrink-0 border border-slate-950/80"
    aria-hidden="true"
  >
    <rect width="18" height="12" fill="#009c3b" />
    <polygon points="9,1.4 16.2,6 9,10.6 1.8,6" fill="#ffdf00" />
    <circle cx="9" cy="6" r="2.7" fill="#002776" />
    <path
      d="M6.5,5.5 Q9,4.7 11.5,6.2"
      fill="none"
      stroke="#ffffff"
      strokeWidth="0.65"
    />
  </svg>
);

const UsaFlagIcon: React.FC = () => (
  <svg
    viewBox="0 0 18 12"
    className="w-[18px] h-[12px] shrink-0 border border-slate-950/80"
    aria-hidden="true"
  >
    <rect width="18" height="12" fill="#b22234" />
    <rect y="1.71" width="18" height="1.71" fill="#ffffff" />
    <rect y="5.14" width="18" height="1.71" fill="#ffffff" />
    <rect y="8.57" width="18" height="1.71" fill="#ffffff" />
    <rect width="8" height="6.85" fill="#3c3b6e" />
    <circle cx="2" cy="1.8" r="0.55" fill="#ffffff" />
    <circle cx="4.5" cy="1.8" r="0.55" fill="#ffffff" />
    <circle cx="6.5" cy="1.8" r="0.55" fill="#ffffff" />
    <circle cx="3.2" cy="3.5" r="0.55" fill="#ffffff" />
    <circle cx="5.6" cy="3.5" r="0.55" fill="#ffffff" />
    <circle cx="2" cy="5.2" r="0.55" fill="#ffffff" />
    <circle cx="4.5" cy="5.2" r="0.55" fill="#ffffff" />
    <circle cx="6.5" cy="5.2" r="0.55" fill="#ffffff" />
  </svg>
);

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  lang,
  onChange,
  className = '',
}) => {
  return (
    <div
      role="group"
      aria-label={lang === 'pt' ? 'Selecionar idioma' : 'Select language'}
      className={`inline-flex items-center bg-[#0b1120]/95 border-2 border-slate-600 shadow-[0_4px_0_#040318] p-0.5 gap-0.5 ${className}`}
    >
      <button
        type="button"
        data-testid="lang-pt"
        aria-pressed={lang === 'pt'}
        aria-label="Português (Brasil)"
        onClick={() => onChange('pt')}
        className={`flex items-center gap-1.5 px-2 py-1.5 font-pixel text-[10px] md:text-[11px] transition-colors cursor-pointer ${
          lang === 'pt'
            ? 'bg-amber-400 text-slate-950 font-bold'
            : 'bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <BrazilFlagIcon />
        <span>PT</span>
      </button>

      <button
        type="button"
        data-testid="lang-en"
        aria-pressed={lang === 'en'}
        aria-label="English (US)"
        onClick={() => onChange('en')}
        className={`flex items-center gap-1.5 px-2 py-1.5 font-pixel text-[10px] md:text-[11px] transition-colors cursor-pointer ${
          lang === 'en'
            ? 'bg-amber-400 text-slate-950 font-bold'
            : 'bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <UsaFlagIcon />
        <span>EN</span>
      </button>
    </div>
  );
};
