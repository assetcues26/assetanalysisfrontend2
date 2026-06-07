export function Badge({ children, className = '', variant = 'default' }) {
  const styles = {
    default: 'bg-blue-50 text-blue-700 border-blue-200',
    muted: 'bg-gray-100 text-gray-600 border-gray-200',
    count: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
