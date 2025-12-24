'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function toggleFamiliarity(wordId: number, currentStatus: string) {
    const nextStatus =
        currentStatus === 'NEW' ? 'LEARNING' :
            currentStatus === 'LEARNING' ? 'MASTERED' : 'NEW';

    await prisma.word.update({
        where: { id: wordId },
        data: { familiarity: nextStatus }
    });

    revalidatePath('/');
    revalidatePath('/search');
    revalidatePath('/word/[text]');
}
