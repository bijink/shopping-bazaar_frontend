export default function PageLoadingIndicator() {
  return (
    <div className="h-screen">
      <div className="flex h-1/6 items-center justify-center space-x-2">
        <span className="sr-only">Loading...</span>
        <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-600 [animation-delay:-0.5s] dark:invert"></div>
        <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-600 [animation-delay:-0.45s] dark:invert"></div>
        <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-600 [animation-delay:-0.3s] dark:invert"></div>
        <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-600 [animation-delay:-0.15s] dark:invert"></div>
        <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-600 dark:invert"></div>
      </div>
    </div>
  );
}
