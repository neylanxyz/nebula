'use client';

interface GameStatusProps {
  playerCount: number;
  gameResolved: boolean | undefined;
}

const steps = [
  { label: 'Waiting', sublabel: 'for players', key: 'waiting' },
  { label: 'Full', sublabel: 'game full', key: 'full' },
  { label: 'Resolved', sublabel: 'prize sent', key: 'resolved' },
] as const;

export function GameStatus({ playerCount, gameResolved }: GameStatusProps) {
  let currentStep = 0;
  if (playerCount === 2) currentStep = 1;
  if (gameResolved) currentStep = 2;

  return (
    <div className="flex items-start justify-between gap-1">
      {steps.map((step, i) => (
        <div key={step.key} className="flex flex-1 items-start">
          <div className="flex flex-col items-center gap-1.5 min-w-0 flex-1">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                i < currentStep
                  ? 'bg-emerald-500 text-white'
                  : i === currentStep
                    ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50'
                    : 'bg-gray-800 text-gray-600'
              }`}
            >
              {i < currentStep ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <div className="text-center">
              <p className={`text-xs font-medium leading-tight ${i <= currentStep ? 'text-white' : 'text-gray-600'}`}>
                {step.label}
              </p>
              <p className={`text-[10px] leading-tight ${i <= currentStep ? 'text-gray-400' : 'text-gray-700'}`}>
                {step.sublabel}
              </p>
            </div>
          </div>
          {i < steps.length - 1 && (
            <div className="mx-1 mt-4 flex-1 shrink-0" style={{ minWidth: '12px' }}>
              <div className={`h-px w-full ${i < currentStep ? 'bg-emerald-500' : 'bg-gray-700'}`} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
