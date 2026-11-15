import React from 'react';
import { ExternalLink, RotateCcw } from 'lucide-react';
import { UI_TEXT, getFinalCards } from '../game/i18n';
import { Language } from '../game/tts';
import { LanguageToggle } from './LanguageToggle';

interface FinalScreenProps {
  lang: Language;
  onChangeLang: (lang: Language) => void;
  onPlayAgain: () => void;
}

export const FinalScreen: React.FC<FinalScreenProps> = ({
  lang,
  onChangeLang,
  onPlayAgain,
}) => {
  const ui = UI_TEXT[lang];
  const cards = getFinalCards(lang);

  return (
    <div className="fixed inset-0 z-30 flex items-start md:items-center justify-center bg-[#040318]/92 p-3 sm:p-4 md:p-8 overflow-y-auto pointer-events-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="final-screen-title"
        className="w-full max-w-4xl bg-[#0b1120] border-2 border-slate-500 p-4 sm:p-6 md:p-8 shadow-[0_8px_0_#040318] space-y-5 sm:space-y-6 my-auto"
      >
        <div className="flex justify-end">
          <LanguageToggle lang={lang} onChange={onChangeLang} />
        </div>

        <div className="text-center space-y-2">
          <div className="text-[11px] sm:text-xs font-pixel text-emerald-300 tracking-wider">
            {ui.finalBadge}
          </div>
          <h1
            id="final-screen-title"
            className="font-pixel text-base sm:text-lg md:text-2xl text-amber-300 leading-snug max-w-3xl mx-auto"
          >
            {ui.finalTitle}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {cards.map((card) => {
            const imgSrc =
              card.id === 'surveyor3' ? '/surveyor3.png' : '/rtg.png';
            return (
              <article
                key={card.id}
                className="bg-[#070b16] border-2 border-slate-700 p-4 sm:p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3.5 sm:gap-4">
                    <img
                      src={imgSrc}
                      alt={card.title}
                      style={{ background: 'transparent', mixBlendMode: 'normal' }}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain pixelated shrink-0 bg-slate-900/70 p-1.5 border border-slate-700"
                    />
                    <h2 className="font-pixel text-sm md:text-base text-white leading-snug">
                      {card.title}
                    </h2>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {card.summary}
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                  {card.links.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-between gap-2 min-h-[44px] px-3 py-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-cyan-200 transition-colors"
                    >
                      <span>{link.label}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </article>
            );
          })}
        </div>

        <div className="flex justify-center pt-1 sm:pt-2">
          <button
            type="button"
            data-start="true"
            onClick={onPlayAgain}
            className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-2 font-pixel text-xs md:text-sm bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-7 py-3.5 border-2 border-slate-950 shadow-[0_4px_0_#040318] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>{ui.playAgainBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
