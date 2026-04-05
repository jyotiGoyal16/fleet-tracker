interface LoadingProps {
  label?: string;
  className?: string;
};

const defaultPageClass = 'min-h-[min(50vh,360px)]';

const Loading = (props: LoadingProps) => {
  const { label = 'Loading…', className } = props;

  return (
    <div
      className={`flex w-full flex-col items-center justify-center gap-4 px-4 ${className ?? defaultPageClass}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="inline-block h-8 w-8 shrink-0 animate-spin rounded-full border-2 border-solid border-violet-600 border-r-transparent dark:border-violet-400 dark:border-r-transparent"
        aria-hidden
      />
      <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
    </div>
  );
};

export default Loading;