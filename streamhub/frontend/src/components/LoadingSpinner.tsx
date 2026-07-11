export function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <div
      className="animate-spin rounded-full border-2 border-surface-700 border-t-signal-500"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}
