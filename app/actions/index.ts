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

import { redirect } from 'next/navigation';

export async function searchAction(formData: FormData) {
    const query = formData.get('query')?.toString();
    if (query) {
        redirect(`/search?q=${encodeURIComponent(query)}`);
    }
}
