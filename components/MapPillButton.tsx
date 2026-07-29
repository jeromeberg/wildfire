interface MapPillButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  pressed?: boolean;
}

export default function MapPillButton({ onClick, children, pressed }: MapPillButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3.5 py-1.5 text-sm font-medium rounded-full bg-white/90 backdrop-blur-md border border-neutral-200 shadow-lg text-neutral-700 hover:border-ember-500 hover:text-ember-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-500"
    >
      {children}
    </button>
  );
}
