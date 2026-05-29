import { lazy, Suspense, useState, useEffect } from "react";

const EditorClient = lazy(() =>
  import("./RichTextEditorClient").then((m) => ({ default: m.RichTextEditorClient }))
);

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
}

const fallbackClass =
  "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none font-mono resize-none";

export function RichTextEditor({ value, onChange, placeholder, rows = 6 }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fallback = (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? "Sual mətni..."}
      rows={rows}
      className={fallbackClass}
    />
  );

  if (!mounted) return fallback;

  return (
    <Suspense fallback={fallback}>
      <EditorClient value={value} onChange={onChange} placeholder={placeholder} />
    </Suspense>
  );
}
