import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <span className="text-xs tracking-[0.3em] uppercase text-brand-400 mb-4">
        New Collection
      </span>
      <h1 className="text-5xl font-light tracking-tight text-brand-900 mb-3">DRAPE</h1>
      <p className="text-brand-500 text-sm mb-10">Minimalist fashion for the modern wardrobe.</p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-8 py-3 border border-brand-900 text-sm font-medium tracking-wide hover:bg-brand-900 hover:text-white transition-colors duration-200"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="px-8 py-3 bg-brand-900 text-white text-sm font-medium tracking-wide hover:bg-brand-700 transition-colors duration-200"
        >
          Create Account
        </Link>
      </div>
    </main>
  );
}
