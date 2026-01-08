export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-semibold text-slate-50">404</h1>
      <p className="mt-2 text-sm text-slate-400">
        The page you&apos;re looking for could not be found.
      </p>
      <a
        href="/"
        className="mt-4 rounded-full bg-emerald-500 px-5 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400"
      >
        Back to Home
      </a>
    </div>
  );
}

