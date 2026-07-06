"use client";

import { useState } from "react";
import FormField, { inputClass } from "@/components/ui/FormField";

interface LotOption {
  id: string;
  lot_number: string;
  product_name: string;
  lot_type: "nova" | "recuperada";
  unit_weight: number;
}

export default function EntryFields({ lots }: { lots: LotOption[] }) {
  const [lotId, setLotId] = useState("");
  const [boxes, setBoxes] = useState(0);

  const lot = lots.find((l) => l.id === lotId);
  const isNova = lot?.lot_type === "nova";
  const computedKg = lot ? boxes * Number(lot.unit_weight) : 0;

  return (
    <>
      <FormField label="Lote">
        <select
          name="lot_id"
          required
          className={inputClass()}
          value={lotId}
          onChange={(e) => setLotId(e.target.value)}
        >
          <option value="">Selecione o lote...</option>
          {lots.map((l) => (
            <option key={l.id} value={l.id}>
              {l.product_name} — Lote {l.lot_number} ({l.lot_type === "nova" ? "Nova" : "Recuperada"})
            </option>
          ))}
        </select>
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Caixas" hint="Quantidade de caixas recebidas">
          <input
            name="boxes"
            type="number"
            step="0.01"
            min="0"
            defaultValue="0"
            className={inputClass()}
            onChange={(e) => setBoxes(parseFloat(e.target.value) || 0)}
          />
        </FormField>

        {isNova ? (
          <div className="space-y-1.5">
            <span className="block text-sm font-medium text-ink">Kg (calculado)</span>
            <div className={`${inputClass()} bg-surface-alt text-ink-soft flex items-center`}>
              {computedKg.toFixed(4)}
            </div>
            <p className="text-xs text-ink-soft/70">Automático: caixas × peso fixo do produto</p>
          </div>
        ) : (
          <FormField label="Kg" hint="Peso variável — informe manualmente">
            <input name="kg" type="number" step="0.0001" min="0" defaultValue="0" className={inputClass()} />
          </FormField>
        )}
      </div>
    </>
  );
}
