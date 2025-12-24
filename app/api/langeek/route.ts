import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const term = searchParams.get('term');

    if (!term) {
        return NextResponse.json({ error: 'Term is required' }, { status: 400 });
    }

    try {
        const response = await fetch(
            `https://api.langeek.co/v1/cs/en/word/?term=${encodeURIComponent(term)}&filter=,inCategory,photo,withExamples`,
            {
                headers: {
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`LanGeek API returned ${response.status}`);
        }

        const data = await response.json();

        // Debug: log the response structure
        const first = Array.isArray(data) ? data[0] : (data.results ? data.results[0] : null);
        console.log('LanGeek API response for term:', term);
        console.log('First result keys:', first ? Object.keys(first) : 'none');
        if (first && first.translation) {
            console.log('First result translation type:', typeof first.translation);
            console.log('First result translation value:', JSON.stringify(first.translation).substring(0, 100));
        }

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        console.error('LanGeek API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch from LanGeek API' },
            { status: 500 }
        );
    }
}
