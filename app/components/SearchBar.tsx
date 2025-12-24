import { searchAction } from '@/app/actions/index';

interface SearchBarProps {
    defaultValue?: string;
    placeholder?: string;
    className?: string;
}

export default function SearchBar({ defaultValue = '', placeholder = 'Search root or word...', className = '' }: SearchBarProps) {
    return (
        <form action={searchAction} className={`relative max-w-xl ${className}`}>
            <div className="relative group">
                <input
                    name="query"
                    type="text"
                    defaultValue={defaultValue}
                    placeholder={placeholder}
                    className="w-full px-6 py-4 pl-12 rounded-full bg-neutral-800 border border-neutral-700/50 focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-neutral-100 placeholder:text-neutral-600 shadow-xl transition-all group-hover:border-neutral-600"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-teal-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                    </svg>
                </div>
                <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold rounded-full transition-all opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
                >
                    Search
                </button>
            </div>
        </form>
    );
}
