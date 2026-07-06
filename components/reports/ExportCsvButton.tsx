"use client";

import { Download } from "lucide-react";
import { toCSV, downloadCSV } from "@/lib/csv";

interface Props {
  filename: string;
  headers: string[];
  rows: (string | number)[][];
}

export default function ExportCsvButton({ filename, headers, rows }: Props) {
  function handleClick() {
    const csv = toCSV(headers, rows);
    downloadCSV(filename, csv);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft hover:text-accent border border-line hover:border-accent/40 rounded-lg px-3 py-1.5 transition-colors"
    >
      <Download size={12} />
      Exportar CSV
    </button>
  );
}
