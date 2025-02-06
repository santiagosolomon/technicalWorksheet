"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SecretPage2() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const saveMessage = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      alert("User not found.");
      setLoading(false);
      return;
    }

    await supabase.from("messages").upsert({ user_id: data.user.id, content: message });
    setLoading(false);
  };


  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold">Secret Page 2</h1>
      <textarea className="border p-2 w-72 mt-2" onChange={(e) => setMessage(e.target.value)} />
      <button onClick={saveMessage} className="bg-blue-500 text-white p-2 mt-2">
        {loading ? "Saving..." : "Save Message"}
      </button>
      <button onClick={handleLogout} className="bg-red-500 text-white p-2 mt-4">Logout</button>
      <button
        onClick={() => router.push("/dashboard")} // ✅ Navigate back
        className="bg-gray-500 text-white p-2 mt-4 rounded"
      >
        Back 
      </button>
    </div>
  );
}
