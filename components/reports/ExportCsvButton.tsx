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
      className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-indigo-600 border border-zinc-200 hover:border-indigo-300 rounded-lg px-3 py-1.5 transition-colors"
    >
      <Download size={12} />
      Exportar CSV
    </button>
  );
}
