"use client";

import { useActionState, useState } from "react";
import FormField, { inputClass } from "@/components/ui/FormField";
import { ArrowUpCircle, ShoppingCart, Boxes } from "lucide-react";
import { registerExit, type RegisterExitState } from "@/app/(dashboard)/stock/exit/actions";
import type { FifoNextLot, Product } from "@/types/database";

interface Props {
  products: Pick<Product, "id" | "name" | "line" | "unit_weight">[];
  fifoRows: FifoNextLot[];
  today: string;
}

const initialState: RegisterExitState = {};

export default function ExitFields({ products, fifoRows, today }: Props) {
  const [state, formAction, pending] = useActionState(registerExit, initialState);
  const [productId, setProductId] = useState("");
  const [lotType, setLotType] = useState<"nova" | "recuperada">("nova");
  const [boxes, setBoxes] = useState(0);

  const product = products.find((p) => p.id === productId);
  const fifo = fifoRows.find((f) => f.product_id === productId && f.lot_type === lotType);
  const isNova = lotType === "nova";
  const computedKg = isNova && product ? boxes * Number(product.unit_weight) : 0;

  return (
    <form action={formAction} className="px-6 py-5 space-y-4">
      <FormField label="Produto / Cor">
        <select
          name="product_id"
          required
          className={inputClass()}
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        >
          <option value="">Selecione o produto...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name} — {p.line}</option>
          ))}
        </select>
      </FormField>

      <FormField
        label="Tipo"
        hint={isNova ? "Saída para uso em obra" : "Saída para venda ao cliente"}
      >
        <select
          name="lot_type"
          required
          className={inputClass()}
          value={lotType}
          onChange={(e) => setLotType(e.target.value as "nova" | "recuperada")}
        >
          <option value="nova">Tinta Nova (uso em obra)</option>
          <option value="recuperada">Tinta Recuperada (venda)</option>
        </select>
      </FormField>

      {/* FIFO info do produto+tipo selecionado */}
      {productId && (
        <div className="bg-surface-alt border border-line rounded-lg px-4 py-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Boxes size={12} className="text-ink-soft/70" />
            <p className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider">Próximo lote (FIFO)</p>
          </div>
          {fifo ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-ink flex items-center gap-1.5">
                <span className="font-mono bg-surface border border-line text-ink-soft px-1.5 py-0.5 rounded text-[11px]">
                  {fifo.lot_number}
                </span>
                <span>entrada {fifo.entry_date}</span>
              </p>
              <p className="text-sm font-bold text-ink">{Number(fifo.balance_boxes)} cx</p>
            </div>
          ) : (
            <p className="text-sm text-ink-soft/70">Sem estoque deste tipo para o produto selecionado.</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label={isNova ? "Caixas para uso em obra" : "Caixas vendidas"}>
          <input
            name="boxes"
            type="number"
            step="0.01"
            min="0"
            defaultValue="0"
            required
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
          <FormField label="Kg" optional hint="Peso variável — informe manualmente">
            <input name="kg" type="number" step="0.0001" min="0" defaultValue="0" className={inputClass()} />
          </FormField>
        )}
      </div>

      <FormField label="Data da saída">
        <input name="movement_date" type="date" required defaultValue={today} className={inputClass()} />
      </FormField>

      <FormField label={isNova ? "Obra / Destino" : "Cliente / Motivo da venda"} optional>
        <input
          name="reason"
          className={inputClass()}
          placeholder={isNova ? "Ex: Obra rua das Flores" : "Ex: Venda para João da Silva"}
        />
      </FormField>

      {state.error && (
        <p className="text-sm text-danger bg-danger-soft border border-danger/20 rounded-lg px-4 py-3">{state.error}</p>
      )}

      <div className="pt-1">
        <button
          type="submit"
          disabled={pending}
          className={`w-full text-white font-semibold rounded-lg py-3 text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
            isNova ? "bg-ochre hover:bg-ochre-hover" : "bg-accent hover:bg-accent-hover"
          }`}
        >
          {isNova ? <ArrowUpCircle size={15} /> : <ShoppingCart size={15} />}
          {pending ? "Salvando..." : isNova ? "Registrar uso em obra" : "Registrar venda"}
        </button>
      </div>
    </form>
  );
}
