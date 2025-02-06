"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleAuth = async (type: "login" | "register") => {
    const { error } =
      type === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (!error) router.push("/dashboard");
    else alert(error.message);
  };

  return (
    <div className="flex flex-col items-center p-6 h-screen bg-[#f2f4f7]">
      <div className="border shadow-md p-8 bg-white">
        <h1 className="text-2xl font-bold mb-4 text-black">
          Login / Register
        </h1>
        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="border p-2 w-80 rounded-md"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-2 mt-2 rounded-md"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={() => handleAuth("login")}
            className="bg-blue-500 text-white p-2 mt-2 hover:bg-blue-400 rounded-md"
          >
            Login
          </button>
          <button
            onClick={() => handleAuth("register")}
            className="bg-green-500 text-white p-2 mt-2 rounded-md "
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
