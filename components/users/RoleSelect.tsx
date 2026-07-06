"use client";

import { updateUserRole } from "@/app/(dashboard)/users/actions";
import type { UserRole } from "@/types/database";

export default function RoleSelect({ userId, currentRole }: { userId: string; currentRole: UserRole }) {
  const action = updateUserRole.bind(null, userId);

  return (
    <form action={action}>
      <select
        name="role"
        defaultValue={currentRole}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="text-xs font-medium rounded-md pl-2.5 pr-1.5 py-1 border border-line bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
      >
        <option value="operator">Operador</option>
        <option value="admin">Administrador</option>
      </select>
    </form>
  );
}
