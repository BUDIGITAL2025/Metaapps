"use client";

type Platform = "ALL" | "META" | "GOOGLE";

export function PlatformFilter({
  selected,
  onChange,
}: {
  selected: Platform;
  onChange: (p: Platform) => void;
}) {
  const options: { value: Platform; label: string }[] = [
    { value: "ALL", label: "Todas" },
    { value: "META", label: "Meta Ads" },
    { value: "GOOGLE", label: "Google Ads" },
  ];

  return (
    <div className="flex gap-2 mb-6">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            selected === opt.value
              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
