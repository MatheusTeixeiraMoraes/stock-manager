"use client";

import { useState } from "react";
import FormField, { inputClass } from "@/components/ui/FormField";

interface ProductOption {
  id: string;
  name: string;
  line: string;
  unit_weight: number;
}

export default function LotFormFields({ products }: { products: ProductOption[] }) {
  const [productId, setProductId] = useState("");
  const [lotType, setLotType] = useState<"nova" | "recuperada">("nova");
  const [boxes, setBoxes] = useState(0);

  const product = products.find((p) => p.id === productId);
  const computedKg = product ? boxes * Number(product.unit_weight) : 0;

  return (
    <>
      <FormField label="Produto / Cor">
        <select
          name="product_id"
          required
          className={inputClass()}
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        >
          <option value="">Selecione...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name} — {p.line}</option>
          ))}
        </select>
      </FormField>

      <FormField
        label="Tipo de lote"
        hint={
          lotType === "nova"
            ? "Reservada para obras futuras — peso calculado automaticamente"
            : "Sobra que voltou de obra — peso variável, informado manualmente"
        }
      >
        <select
          name="lot_type"
          required
          className={inputClass()}
          value={lotType}
          onChange={(e) => setLotType(e.target.value as "nova" | "recuperada")}
        >
          <option value="nova">Nova</option>
          <option value="recuperada">Recuperada</option>
        </select>
      </FormField>

      <div className="border-t border-line pt-4">
        <p className="text-xs font-semibold text-ink-soft uppercase tracking-wider mb-4">Quantidade inicial</p>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Caixas" hint="Deixe 0 para registrar depois">
            <input
              name="initial_boxes"
              type="number"
              step="0.01"
              min="0"
              defaultValue="0"
              className={inputClass()}
              onChange={(e) => setBoxes(parseFloat(e.target.value) || 0)}
            />
          </FormField>

          {lotType === "nova" ? (
            <div className="space-y-1.5">
              <span className="block text-sm font-medium text-ink">Kg (calculado)</span>
              <div className={`${inputClass()} bg-surface-alt text-ink-soft flex items-center`}>
                {computedKg.toFixed(4)}
              </div>
              <p className="text-xs text-ink-soft/70">Automático: caixas × peso fixo do produto</p>
            </div>
          ) : (
            <FormField label="Kg" hint="Peso variável — informe manualmente">
              <input name="initial_kg" type="number" step="0.0001" min="0" defaultValue="0" className={inputClass()} />
            </FormField>
          )}
        </div>
      </div>
    </>
  );
}
