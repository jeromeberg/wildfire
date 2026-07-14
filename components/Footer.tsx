export default function Footer() {
  return (
    <footer className="px-6 py-2.5 text-center text-xs text-neutral-500 bg-white border-t border-neutral-200 shrink-0">
      Made by{" "}
      <a
        href="https://github.com/jeromeberg/"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-neutral-700"
      >
        Jerome Berg
      </a>
      . Data from NASA FIRMS.
    </footer>
  );
}
