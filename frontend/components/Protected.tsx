"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { useAuthStore } from "../lib/auth-store";

type Props = {
  children: ReactNode;
  requireRole?: "Player" | "Admin";
};

export function Protected({ children, requireRole }: Props) {
  const router = useRouter();
  const { token, role } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (requireRole && role !== requireRole) {
      router.replace("/unauthorized");
    }
  }, [mounted, token, role, requireRole, router]);

  if (!mounted) return null;
  if (!token) return null;
  if (requireRole && role !== requireRole) return null;

  return <>{children}</>;
}


