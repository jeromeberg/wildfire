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
      className={`px-3.5 py-1.5 text-sm font-medium rounded-full border shadow-lg backdrop-blur-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-500 ${
        pressed
          ? "bg-ember-500 border-ember-500 text-white hover:bg-ember-600"
          : "bg-white/90 border-neutral-200 text-neutral-700 hover:border-ember-500 hover:text-ember-600"
      }`}
    >
      {children}
    </button>
  );
}
