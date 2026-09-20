"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  useEffect(() => {
    router.push("/admin/he-thong");
  }, [router]);
  return null;
}
