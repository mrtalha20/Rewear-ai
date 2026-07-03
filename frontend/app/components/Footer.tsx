export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white mt-auto">
      <div className="max-w-2xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-gray-400">
          Built with Groq + Llama 4 Vision · Powered by FastAPI + Next.js
        </p>
        <p className="text-xs text-gray-400">
          Every repair saves ~2.1 kg CO₂ from entering the atmosphere
        </p>
      </div>
    </footer>
  );
}
