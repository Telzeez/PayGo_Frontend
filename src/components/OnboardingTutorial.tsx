"use client";

import React, { useState, useEffect } from 'react';

const steps = [
  {
    title: "Welcome to PayGo!",
    description: "Your smart, decentralized solar companion. Let's take a quick tour of how you can manage your energy.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-amber-500">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      </svg>
    ),
  },
  {
    title: "Dashboard & Hardware",
    description: "Monitor your real-time kWh balance and check if your physical meter is online. Your hardware automatically syncs with the cloud.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-amber-500">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
        <line x1="3" x2="21" y1="9" y2="9"/>
        <line x1="9" x2="9" y1="21" y2="9"/>
      </svg>
    ),
  },
  {
    title: "Local Energy Marketplace",
    description: "Use the Market to find and buy cheap surplus energy from nearby sellers directly using GPS matching.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-amber-500">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
  {
    title: "Instant Offline Recharge",
    description: "Need energy while your meter has no internet? Generate a 16-digit Token from the Recharge tab and punch it directly into your physical meter keypad.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-amber-500">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2v1l2.22 4.15C21 13 20 22 11 20z"/>
        <path d="m11 16 3-3-3-3"/>
      </svg>
    ),
  }
];

export function OnboardingTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if the user has already seen the tutorial
    const hasSeen = localStorage.getItem('hasSeenPayGoTutorial');
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTutorial();
    }
  };

  const completeTutorial = () => {
    localStorage.setItem('hasSeenPayGoTutorial', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#121214] w-full max-w-sm rounded-3xl p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-300 border border-zinc-200/50 dark:border-zinc-800/50">
        
        {/* Skip button */}
        <button 
          onClick={completeTutorial}
          className="absolute top-4 right-5 text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        >
          Skip
        </button>

        {/* Icon & Content */}
        <div className="flex flex-col items-center text-center mt-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mb-6">
            {step.icon}
          </div>
          
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">
            {step.title}
          </h2>
          
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed min-h-[4rem]">
            {step.description}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-1.5 my-8">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStep ? 'w-6 bg-amber-500' : 'w-1.5 bg-zinc-200 dark:bg-zinc-800'
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleNext}
          className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold py-3.5 rounded-xl text-sm shadow-sm hover:bg-zinc-800 dark:hover:bg-white transition-all active:scale-[0.98]"
        >
          {currentStep < steps.length - 1 ? 'Next' : 'Get Started'}
        </button>
      </div>
    </div>
  );
}
