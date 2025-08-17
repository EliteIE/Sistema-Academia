import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";

type PaymentMethod = "transfer" | "cash" | "qr";

export type PlanId = "monthly" | "quarterly" | "annual";

const PRICE_MAP: Record<PlanId, number> = {
  monthly: 25000,
  quarterly: 67500,
  annual: 240000,
};

function formatARS(v: number) {
  return v.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

export function priceFor(plan: PlanId) {
  return PRICE_MAP[plan];
}

export default function PaymentConfirmDialog({
  open,
  onOpenChange,
  plan,
  planLabel,
  onConfirm,
  loading = false,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  plan: PlanId;
  planLabel: string;
  onConfirm: (method: PaymentMethod) => void;
  loading?: boolean;
}) {
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const amount = useMemo(() => priceFor(plan), [plan]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar pagamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Plano selecionado: <span className="font-medium text-foreground">{planLabel}</span>
          </div>
          <div className="text-2xl font-semibold">{formatARS(amount)}</div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Forma de pagamento</div>
            <div className="flex gap-2">
              <Button
                variant={method === "transfer" ? "default" : "secondary"}
                onClick={() => setMethod("transfer")}
              >
                Transferência
              </Button>
              <Button
                variant={method === "cash" ? "default" : "secondary"}
                onClick={() => setMethod("cash")}
              >
                Efectivo
              </Button>
              <Button
                variant={method === "qr" ? "default" : "secondary"}
                onClick={() => setMethod("qr")}
              >
                QR
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" disabled={loading}>Cancelar</Button>
          </DialogClose>
          <Button disabled={!method || loading} onClick={() => method && onConfirm(method)}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
