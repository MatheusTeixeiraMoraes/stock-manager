"use client";

import { useActionState, useState } from "react";
import FormField, { inputClass } from "@/components/ui/FormField";
import { ArrowDownCircle } from "lucide-react";
import { registerEntry, type RegisterEntryState } from "@/app/(dashboard)/stock/entry/actions";

interface LotOption {
  id: string;
  lot_number: string;
  product_name: string;
  lot_type: "nova" | "recuperada";
  unit_weight: number;
}

interface Props {
  lots: LotOption[];
  today: string;
}

const initialState: RegisterEntryState = {};

export default function EntryFields({ lots, today }: Props) {
  const [state, formAction, pending] = useActionState(registerEntry, initialState);
  const [lotId, setLotId] = useState("");
  const [boxes, setBoxes] = useState(0);

  const lot = lots.find((l) => l.id === lotId);
  const isNova = lot?.lot_type === "nova";
  const computedKg = lot ? boxes * Number(lot.unit_weight) : 0;

  return (
    <form action={formAction} className="px-6 py-5 space-y-4">
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

      <FormField label="Data da entrada">
        <input name="movement_date" type="date" required defaultValue={today} className={inputClass()} />
      </FormField>

      <FormField label="Motivo / Observação" optional>
        <input name="reason" className={inputClass()} placeholder="Ex: Reposição de estoque" />
      </FormField>

      {state.error && (
        <p className="text-sm text-danger bg-danger-soft border border-danger/20 rounded-lg px-4 py-3">{state.error}</p>
      )}

      <div className="pt-1">
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-moss hover:bg-moss-hover disabled:opacity-50 text-white font-semibold rounded-lg py-3 text-sm transition-colors flex items-center justify-center gap-2"
        >
          <ArrowDownCircle size={15} />
          {pending ? "Salvando..." : "Registrar entrada"}
        </button>
      </div>
    </form>
  );
}
