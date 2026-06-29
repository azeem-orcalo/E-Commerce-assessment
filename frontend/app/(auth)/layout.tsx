export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-50 flex">
      {/* Decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-900 flex-col justify-between p-16">
        <span className="text-white text-xl font-light tracking-[0.2em] uppercase">DRAPE</span>
        <div>
          <p className="text-brand-300 text-xs tracking-[0.3em] uppercase mb-4">
            2025 Collection
          </p>
          <h2 className="text-white text-4xl font-light leading-tight">
            Wear what
            <br />
            <em className="not-italic font-extralight">matters.</em>
          </h2>
        </div>
        <p className="text-brand-500 text-xs">© 2025 DRAPE. All rights reserved.</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
