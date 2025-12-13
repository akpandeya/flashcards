import React, { useState, useEffect } from 'react';

export function Flashcard({ card, isFlipped, onFlip }) {
    // We use this local state to trigger the CSS flip class
    // But the parent controls the logic state 'isFlipped'

    if (!card) return null;

    return (
        <div
            className="relative w-full max-w-md aspect-[3/4] md:aspect-[4/3] cursor-pointer"
            style={{ perspective: '1000px' }}
            onClick={onFlip}
        >
            <div
                className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''
                    }`}
                style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
            >
                {/* FRONT */}
                <div
                    className="absolute inset-0 w-full h-full backface-hidden bg-slate-800 border-2 border-slate-700 rounded-3xl flex flex-col items-center justify-center p-8 shadow-2xl"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <div className="text-6xl mb-6">{card.emoji || '✨'}</div>
                    <div className="text-4xl font-bold text-white mb-4 text-center">{card.word}</div>
                    <div className="text-slate-400 font-mono text-lg">{card.phonetics}</div>
                    <div className="mt-8 px-3 py-1 bg-slate-700 rounded-full text-xs font-bold text-teal-400 uppercase tracking-wide">
                        {card.pos || 'Word'}
                    </div>

                    <div className="absolute bottom-6 text-slate-500 text-sm animate-pulse">Tap to flip</div>
                </div>

                {/* BACK */}
                <div
                    className="absolute inset-0 w-full h-full backface-hidden bg-slate-800 border-2 border-slate-600 rounded-3xl flex flex-col items-center justify-center p-8 shadow-2xl rotate-y-180"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    <div className="text-3xl font-bold text-white mb-6 text-center leading-relaxed">
                        {card.translation || card.def || "No definition"}
                    </div>

                    {/* Examples or other rich content can go here */}
                    {card.example && (
                        <div className="bg-slate-900/50 p-4 rounded-xl text-center">
                            <p className="text-teal-200 italic">"{card.example}"</p>
                            {card.example_en && <p className="text-slate-500 text-sm mt-2">{card.example_en}</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
