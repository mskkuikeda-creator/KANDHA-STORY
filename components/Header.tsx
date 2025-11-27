
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-brand-secondary/50 backdrop-blur-sm shadow-lg w-full sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 text-center">
        <h1 className="text-2xl md:text-4xl font-bold font-oriya text-brand-accent tracking-wide">
          ଓଡ଼ିଶାର କନ୍ଧଜାତିଙ୍କ ପାଇଁ କାହାଣୀ ସୃଷ୍ଟିକର୍ତ୍ତା
        </h1>
        <p className="text-sm md:text-base text-brand-muted mt-1">
          Generate Viral Stories for Odisha's Kandha Tribe
        </p>
      </div>
    </header>
  );
};
