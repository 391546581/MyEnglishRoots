'use client';

import { useTransition } from 'react';
import { toggleFamiliarity } from '@/app/actions';

export function FamiliarityButton({ wordId, initialStatus }: { wordId: number, initialStatus: string }) {
    const [isPending, startTransition] = useTransition();

    return (
        <button
            onClick={() => startTransition(() => toggleFamiliarity(wordId, initialStatus))}
            disabled={isPending}
            className={`
        px-2 py-0.5 rounded text-xs font-bold border transition-colors
        ${initialStatus === 'NEW' ? 'border-red-900 text-red-500 hover:bg-red-900/20' : ''}
        ${initialStatus === 'LEARNING' ? 'border-yellow-900 text-yellow-500 hover:bg-yellow-900/20' : ''}
        ${initialStatus === 'MASTERED' ? 'border-green-900 text-green-500 hover:bg-green-900/20' : ''}
        ${isPending ? 'opacity-50 cursor-wait' : ''}
      `}
        >
            {initialStatus}
        </button>
    );
}
