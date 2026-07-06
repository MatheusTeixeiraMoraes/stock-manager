import Badge from "@/components/ui/Badge";
import type { LotType } from "@/types/database";

export default function LotTypeBadge({ type }: { type: LotType }) {
  return (
    <Badge variant={type === "nova" ? "default" : "teal"}>
      {type === "nova" ? "Nova" : "Recuperada"}
    </Badge>
  );
}
