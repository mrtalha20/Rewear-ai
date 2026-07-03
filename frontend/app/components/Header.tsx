export default function Header() {
  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 leading-tight">ReWear AI</h1>
            <p className="text-xs text-gray-400">Repair · Restyle · Sustain</p>
          </div>
        </div>

        <span className="text-xs bg-brand-50 text-brand-700 px-3 py-1 rounded-full font-medium border border-brand-100">
          🌱 Free to use
        </span>
      </div>
    </header>
  );
}
