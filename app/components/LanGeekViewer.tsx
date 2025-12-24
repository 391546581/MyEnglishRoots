'use client';

import { useState, useEffect } from 'react';

interface LanGeekWord {
    id: number;
    word: string;
    definition?: string;
    photo?: string;
    pronunciation?: string;
    translation?: string;
    entry?: string;
    examples?: string[];
    category?: string;
    level?: string;
}

interface LanGeekResponse {
    results?: LanGeekWord[];
    word?: string;
    definition?: string;
    photo?: string;
    pronunciation?: string;
}

export function LanGeekViewer({ word }: { word: string }) {
    const [data, setData] = useState<LanGeekResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                // Use our API route to avoid CORS
                const response = await fetch(`/api/langeek?term=${encodeURIComponent(word)}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }

                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        if (word) {
            fetchData();
        }
    }, [word]);

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-neutral-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-neutral-600">Loading from LanGeek...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-neutral-100 p-8">
                <div className="text-center max-w-md">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h3 className="text-xl font-bold text-neutral-800 mb-2">Unable to load LanGeek data</h3>
                    <p className="text-neutral-600 mb-4">{error}</p>
                    <a
                        href={`https://dictionary.langeek.co/`}
                        target="_blank"
                        className="inline-block px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-colors"
                    >
                        Open LanGeek Manually
                    </a>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-neutral-100">
                <p className="text-neutral-600">No data available</p>
            </div>
        );
    }

    // Check if we have search results (array format)
    const results = Array.isArray(data) ? data : (data.results || []);

    // If we have multiple results, show them as a list
    if (results.length > 0) {
        return (
            <div className="w-full h-full overflow-y-auto bg-white p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-neutral-900 mb-2">Search Results for "{word}"</h1>
                    <p className="text-neutral-600 mb-8">Found {results.length} result(s)</p>

                    <div className="space-y-6">
                        {results.map((result: any, index: number) => {
                            // Safety: Extract fields from nested objects if necessary
                            const wordTitle = result.word || result.entry || word;
                            const displayPronunciation = result.pronunciation || result.translation?.pronunciation;

                            // Handle complex translation object
                            let displayTranslation = '';
                            if (typeof result.translation === 'string') {
                                displayTranslation = result.translation;
                            } else if (result.translation?.translation) {
                                displayTranslation = result.translation.translation;
                            } else if (result.translation?.text) {
                                displayTranslation = result.translation.text;
                            }

                            // Handle complex photo object
                            let displayPhoto = '';
                            if (typeof result.photo === 'string') {
                                displayPhoto = result.photo;
                            } else if (result.wordPhoto?.photo) {
                                displayPhoto = result.wordPhoto.photo;
                            } else if (result.translation?.wordPhoto?.photo) {
                                displayPhoto = result.translation.wordPhoto.photo;
                            }

                            // Handle definition/entry
                            let displayDefinition = '';
                            if (typeof result.definition === 'string') {
                                displayDefinition = result.definition;
                            } else if (typeof result.entry === 'string' && result.entry !== wordTitle) {
                                displayDefinition = result.entry;
                            }

                            return (
                                <div
                                    key={result.id || index}
                                    className="p-6 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-teal-500 transition-all font-sans"
                                >
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Photo - Larger display */}
                                        {displayPhoto && (
                                            <div className="flex-shrink-0">
                                                <img
                                                    src={displayPhoto}
                                                    alt={wordTitle}
                                                    className="w-full md:w-48 h-48 object-cover rounded-lg shadow-md bg-neutral-100"
                                                />
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            {/* Word Header */}
                                            <div className="flex items-baseline gap-3 mb-3">
                                                <h2 className="text-3xl font-bold text-neutral-900">
                                                    {wordTitle}
                                                </h2>
                                                {displayPronunciation && (
                                                    <span className="text-base text-neutral-500 font-serif italic">/{displayPronunciation}/</span>
                                                )}
                                            </div>

                                            {/* Translation */}
                                            {displayTranslation && (
                                                <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                    <span className="text-sm font-semibold text-blue-900 mr-2">译:</span>
                                                    <span className="text-blue-800 text-lg font-medium">{displayTranslation}</span>
                                                </div>
                                            )}

                                            {/* Definition/Entry */}
                                            {displayDefinition && (
                                                <div className="mb-4">
                                                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Definition</h3>
                                                    <p className="text-neutral-700 leading-relaxed font-serif">
                                                        {displayDefinition}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Examples (if available) */}
                                            {result.withExamples && result.withExamples.length > 0 && (
                                                <div className="mb-4">
                                                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Examples</h3>
                                                    <ul className="space-y-2">
                                                        {result.withExamples.slice(0, 2).map((example: any, idx: number) => (
                                                            <li key={idx} className="flex gap-2 text-sm text-neutral-600 bg-neutral-100/50 p-2 rounded">
                                                                <span className="text-teal-600 font-bold">•</span>
                                                                <span className="flex-1 italic">{typeof example === 'string' ? example : (example.text || example.sentence || JSON.stringify(example))}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Category/Level/PartOfSpeech */}
                                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                                {result.partOfSpeech && (
                                                    <span className="px-2 py-0.5 bg-neutral-200 text-neutral-700 text-[10px] font-bold rounded uppercase">
                                                        {result.partOfSpeech}
                                                    </span>
                                                )}
                                                {result.category && (
                                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded uppercase">
                                                        {result.category}
                                                    </span>
                                                )}
                                                {result.level && (
                                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">
                                                        {result.level}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Link to full entry */}
                                            <a
                                                href={`https://dictionary.langeek.co/en/word/${result.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors text-xs font-bold"
                                            >
                                                VIEW FULL ENTRY
                                                <span className="text-lg">→</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-12 pt-8 border-t border-neutral-200">
                        <a
                            href={`https://dictionary.langeek.co/`}
                            target="_blank"
                            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-500 font-medium"
                        >
                            Search more on LanGeek
                            <span className="text-lg">↗</span>
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // Single result or direct word data
    const wordData = results[0] || data;
    const wordTitle = wordData.word || wordData.entry || word;
    const displayPronunciation = wordData.pronunciation || wordData.translation?.pronunciation;

    // Handle complex translation object
    let displayTranslation = '';
    if (typeof wordData.translation === 'string') {
        displayTranslation = wordData.translation;
    } else if (wordData.translation?.translation) {
        displayTranslation = wordData.translation.translation;
    }

    // Handle complex photo object
    let displayPhoto = '';
    if (typeof wordData.photo === 'string') {
        displayPhoto = wordData.photo;
    } else if (wordData.wordPhoto?.photo) {
        displayPhoto = wordData.wordPhoto.photo;
    } else if (wordData.translation?.wordPhoto?.photo) {
        displayPhoto = wordData.translation.wordPhoto.photo;
    }

    return (
        <div className="w-full h-full overflow-y-auto bg-white p-8">
            <div className="max-w-3xl mx-auto">
                {/* Word Header */}
                <div className="mb-8">
                    <h1 className="text-5xl font-bold text-neutral-900 mb-2">{wordTitle}</h1>
                    {displayPronunciation && (
                        <p className="text-xl text-neutral-600 italic">/{displayPronunciation}/</p>
                    )}
                </div>

                {/* Translation */}
                {displayTranslation && (
                    <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-blue-900/50 mb-2">Translation</h2>
                        <p className="text-2xl font-medium text-blue-900">{displayTranslation}</p>
                    </div>
                )}

                {/* Photo */}
                {displayPhoto && (
                    <div className="mb-8 rounded-xl overflow-hidden shadow-lg border border-neutral-200">
                        <img
                            src={displayPhoto}
                            alt={wordTitle}
                            className="w-full h-auto max-h-96 object-cover"
                        />
                    </div>
                )}

                {/* Definition */}
                {(wordData.definition || (wordData.entry && wordData.entry !== wordTitle)) && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-neutral-800 mb-3 font-serif italic">Definition</h2>
                        <p className="text-lg text-neutral-700 leading-relaxed font-serif">
                            {wordData.definition || wordData.entry}
                        </p>
                    </div>
                )}

                {/* Link to full entry if we have ID */}
                {wordData.id && (
                    <div className="mb-8">
                        <a
                            href={`https://dictionary.langeek.co/en/word/${wordData.id}`}
                            target="_blank"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors font-bold shadow-lg"
                        >
                            VIEW FULL ENTRY ON LANGEEK
                            <span className="text-lg">↗</span>
                        </a>
                    </div>
                )}

                {/* Fallback link */}
                <div className="mt-12 pt-8 border-t border-neutral-200">
                    <a
                        href={`https://dictionary.langeek.co/`}
                        target="_blank"
                        className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-500 font-medium"
                    >
                        Search on LanGeek
                        <span className="text-lg">↗</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
