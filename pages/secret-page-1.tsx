"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type UserType = {
  id: string;
  email?: string;
};

type FriendType = {
  user_id: string;
  friend_id: string;
  status: string;
};

export default function SecretPage1() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [isFriend, setIsFriend] = useState(false);
  const ownerId = "OWNER_USER_ID"; // Replace with actual owner ID

  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts

    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push("/login"); // Redirect if not logged in
        return;
      }

      if (isMounted) setUser({ id: data.user.id, email: data.user.email });

      // Fetch friends list
      const { data: friends, error: friendError } = await supabase
        .from("friends")
        .select("*")
        .or(`user_id.eq.${data.user.id},friend_id.eq.${data.user.id}`)
        .eq("status", "accepted");

      if (friendError) {
        console.error("Error fetching friends:", friendError.message);
        return;
      }

      // Check if the logged-in user is friends with the owner
      const isFriend = (friends as FriendType[]).some(
        (f) =>
          (f.user_id === data.user.id && f.friend_id === ownerId) ||
          (f.friend_id === data.user.id && f.user_id === ownerId)
      );

      if (isMounted) setIsFriend(isFriend);
    };

    fetchUser();

    return () => {
      isMounted = false; // Cleanup function
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (user === null) return <p>Loading...</p>;

  if (!isFriend) {
    return (
      <div className="flex flex-col items-center p-6">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p className="text-lg mt-2 text-red-500">❌ You are not allowed to view this message.</p>
        <button onClick={handleLogout} className="bg-red-500 text-white p-2 mt-4">Logout</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold">Secret Page 1</h1>
      <p className="text-lg mt-2">🔒 This is a secret message!</p>
      <button onClick={handleLogout} className="bg-red-500 text-white p-2 mt-4">Logout</button>
      <button
        onClick={() => router.push("/dashboard")}
        className="bg-gray-500 text-white p-2 mt-4 rounded"
      >
        Back
      </button>
    </div>
  );
}
