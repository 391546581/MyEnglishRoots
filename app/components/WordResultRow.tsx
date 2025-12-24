'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FamiliarityButton } from './FamiliarityButton';

interface WordResultRowProps {
    word: any;
}

export function WordResultRow({ word }: WordResultRowProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [langeekData, setLangeekData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleExpand = async () => {
        if (!isExpanded && !langeekData) {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/langeek?term=${encodeURIComponent(word.text)}`);
                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();
                setLangeekData(data);
            } catch (err) {
                setError('Error loading data');
            } finally {
                setLoading(false);
            }
        }
        setIsExpanded(!isExpanded);
    };

    const results = Array.isArray(langeekData) ? langeekData : (langeekData?.results || []);

    return (
        <div className="flex flex-col mb-1 overflow-hidden">
            <div className="flex items-center gap-4 p-3 bg-neutral-800/40 hover:bg-neutral-800 rounded-lg border border-transparent hover:border-neutral-700 group transition-all">
                {/* Expand Toggle */}
                <button
                    onClick={toggleExpand}
                    className={`w-6 h-6 flex items-center justify-center rounded bg-neutral-900 group-hover:bg-neutral-700 transition-colors ${isExpanded ? 'text-teal-400' : 'text-neutral-500'}`}
                    title={isExpanded ? "Collapse" : "Quick View"}
                >
                    {isExpanded ? '−' : '+'}
                </button>

                {/* Word & Link */}
                <Link href={`/word/${word.text}`} className="flex-1 min-w-0 flex items-baseline gap-3">
                    <span className="font-bold text-lg text-neutral-100 group-hover:text-blue-400">{word.text}</span>
                    <span className="text-xs text-neutral-500 font-mono border border-neutral-700 px-1 rounded">{word.level || 'N/A'}</span>
                    <span className="text-neutral-400 text-sm line-clamp-1 flex-1">{word.definition || ''}</span>
                </Link>

                {/* Metadata & Actions */}
                <div className="flex items-center gap-4">
                    {/* Roots Tags */}
                    <div className="hidden sm:flex gap-1">
                        {word.roots?.map((r: any) => (
                            <Link key={r.id} href={`/search?q=${r.text}`} className="text-[10px] px-1.5 py-0.5 bg-neutral-900 text-teal-500/70 border border-neutral-800 rounded hover:text-teal-400">
                                {r.text}
                            </Link>
                        ))}
                    </div>

                    {/* Status Button */}
                    <div className="shrink-0">
                        <FamiliarityButton wordId={word.id} initialStatus={word.familiarity} />
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="mx-10 mt-1 mb-4 p-4 bg-neutral-800/80 rounded-b-lg border-x border-b border-neutral-700 animate-in slide-in-from-top-2 duration-200">
                    {loading && (
                        <div className="flex items-center gap-3 py-4 text-neutral-400">
                            <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm">Fetching LanGeek data...</span>
                        </div>
                    )}

                    {error && (
                        <div className="py-2 text-red-400 text-sm">{error}</div>
                    )}

                    {langeekData && (
                        <div className="space-y-6">
                            {results.length === 0 ? (
                                <p className="text-neutral-500 text-sm italic">No entries found on LanGeek for "{word.text}"</p>
                            ) : (
                                results.slice(0, 3).map((item: any, idx: number) => {
                                    const title = item.word || item.entry || word.text;
                                    const pron = item.pronunciation || item.translation?.pronunciation;

                                    let trans = '';
                                    if (typeof item.translation === 'string') trans = item.translation;
                                    else if (item.translation?.translation) trans = item.translation.translation;
                                    else if (item.translation?.text) trans = item.translation.text;

                                    let photo = '';
                                    if (typeof item.photo === 'string') photo = item.photo;
                                    else if (item.wordPhoto?.photo) photo = item.wordPhoto.photo;
                                    else if (item.translation?.wordPhoto?.photo) photo = item.translation.wordPhoto.photo;

                                    let def = '';
                                    if (typeof item.definition === 'string') def = item.definition;
                                    else if (typeof item.entry === 'string' && item.entry !== title) def = item.entry;

                                    return (
                                        <div key={item.id || idx} className="flex gap-4 pb-4 border-b border-neutral-700/50 last:border-0 last:pb-2">
                                            {photo && (
                                                <img src={photo} alt={title} className="w-20 h-20 object-cover rounded bg-neutral-900 border border-neutral-700" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <span className="font-bold text-teal-400">{title}</span>
                                                    {pron && <span className="text-xs text-neutral-500 italic">/{pron}/</span>}
                                                </div>
                                                {trans && (
                                                    <div className="text-sm font-medium text-blue-300 mb-1">{trans}</div>
                                                )}
                                                {def && (
                                                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">{def}</p>
                                                )}
                                                {item.withExamples && item.withExamples.length > 0 && (
                                                    <div className="mt-2 pl-2 border-l-2 border-teal-900/50 text-[11px] text-neutral-500 italic">
                                                        "{typeof item.withExamples[0] === 'string' ? item.withExamples[0] : (item.withExamples[0].text || item.withExamples[0].sentence)}"
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            {results.length > 3 && (
                                <Link href={`/word/${word.text}`} className="block text-center py-1 text-xs text-teal-500 hover:text-teal-400 hover:underline">
                                    Show all {results.length} results in detail view →
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
