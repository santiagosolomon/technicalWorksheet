"use client";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const deleteAccount = async () => {
    setLoading(true);

    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      console.error("Error fetching user:", error?.message);
      setLoading(false);
      return;
    }
    

    const response = await fetch("/api/deleteUser", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: data.user.id }),
    });

    const result = await response.json();

    if (response.ok) {
      alert("Account deleted successfully.");
      await supabase.auth.signOut();
      window.location.href = "/";
    } else {
      alert(`Error: ${result.error}`);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="mt-4">
        <Link href="/secret-page-1" className="text-blue-500">
          Go to Secret Page 1
        </Link>
      </div>
      <div className="mt-4">
        <Link href="/secret-page-2" className="text-blue-500">
          Go to Secret Page 2
        </Link>
      </div>
      <div className="mt-4">
        <Link href="/secret-page-3" className="text-blue-500">
          Go to Secret Page 3
        </Link>
      </div>

      <div className="flex gap-4 text-sm mt-4">
        <button onClick={handleLogout} className="bg-black text-white p-2">
          Logout
        </button>
        <button
          onClick={deleteAccount}
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          {loading ? "Deleting..." : "Delete My Account"}
        </button>
      </div>
    </div>
  );
}
