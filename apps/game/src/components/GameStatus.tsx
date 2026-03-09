'use client';

interface GameStatusProps {
  playerCount: number;
  gameResolved: boolean | undefined;
}

const steps = [
  { label: 'Aguardando jogadores', key: 'waiting' },
  { label: 'Jogo lotado', key: 'full' },
  { label: 'Jogo resolvido', key: 'resolved' },
] as const;

export function GameStatus({ playerCount, gameResolved }: GameStatusProps) {
  let currentStep = 0;
  if (playerCount === 2) currentStep = 1;
  if (gameResolved) currentStep = 2;

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
              i <= currentStep
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-700 text-gray-400'
            }`}
          >
            {i + 1}
          </div>
          <span
            className={`text-sm ${
              i <= currentStep ? 'text-white' : 'text-gray-500'
            }`}
          >
            {step.label}
          </span>
          {i < steps.length - 1 && (
            <div
              className={`h-px w-8 ${
                i < currentStep ? 'bg-emerald-500' : 'bg-gray-700'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
