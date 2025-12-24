'use client';

export function CopyButton({ text }: { text: string }) {
    return (
        <button
            className="px-6 py-2 bg-neutral-900 text-white rounded-full text-sm font-semibold shadow-xl hover:scale-105 transition-transform flex items-center gap-2 cursor-copy active:bg-teal-600"
            onClick={() => {
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(text);
                    alert(`Copied "${text}" to clipboard!`);
                }
            }}
        >
            Copy Word
        </button>
    );
}
