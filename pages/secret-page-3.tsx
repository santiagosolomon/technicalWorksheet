import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface FriendRequest {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
}

interface User {
  id: string;
  email?: string;  // Making email optional to match Supabase's User type
}

export default function SecretPage3() {
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friendEmail, setFriendEmail] = useState<string>("");

  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error.message);
      } else {
        setUser(data.user);  // Setting user with Supabase user type
      }
    };

    getUser();
  }, []);

  useEffect(() => {
    const fetchFriendRequests = async () => {
      if (!user?.id) return;

      console.log("Fetching friend requests for:", user.id);

      const { error } = await supabase
        .from("friends")
        .select("*")
        .eq("friend_id", user.id)
        .eq("status", "pending");

      if (error) {
        console.error("Error fetching friend requests:", error.message);
      } else {
        console.log("Fetched friend requests.");
        
      }
    };

    if (user) fetchFriendRequests();
  }, [user]);

  const acceptFriendRequest = async (requestId: string) => {
    if (!requestId) {
      alert("Invalid request ID");
      return;
    }

    if (!user?.id) {
      alert("User not logged in.");
      return;
    }

    const { error } = await supabase
      .from("friends")
      .update({ status: "accepted" })
      .eq("id", requestId)
      .eq("friend_id", user.id);

    if (error) {
      console.error("Error accepting friend request:", error.message);
      alert("Error accepting friend request: " + error.message);
    } else {
      alert("Friend request accepted!");
      setFriendRequests((prev) => prev.filter((req) => req.id !== requestId));
    }
  };

  const sendFriendRequest = async () => {
    if (!user) return alert("User not logged in.");

    const response = await fetch("/api/fetch-users");
    const usersData = await response.json();

    if (!response.ok) {
      console.error("Error fetching users:", usersData.error);
      alert("Error fetching users: " + usersData.error);
      return;
    }

    const friendData = usersData.users.find(
      (u: User) => u.email === friendEmail
    );

    if (!friendData) {
      alert("User not found.");
      return;
    }

    const { error } = await supabase
      .from("friends")
      .insert([{
        user_id: user.id,
        friend_id: friendData.id,
        status: "pending",
      }])
      .select();

    if (error) {
      console.error("Error sending friend request:", error.message);
      alert(error.message);
    } else {
      alert("Friend request sent!");
      setFriendEmail("");
    }
  };

  return (
    <div className="flex flex-col items-center p-6 gap-4">
      <h1 className="text-2xl font-bold">Secret Page 3</h1>
      <input
        type="text"
        placeholder="Friend's Email"
        className="border p-2"
        onChange={(e) => setFriendEmail(e.target.value)}
      />
      <div className="flex gap-2 ">
        <button
          onClick={sendFriendRequest}
          className="bg-green-500 text-white p-2 "
        >
          Send Friend Request
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-gray-500 text-white p-2  rounded"
        >
          Back
        </button>
      </div>

      <h2 className="mt-4">Pending Friend Requests</h2>
      <ul>
        {friendRequests.length === 0 && <p>No pending requests.</p>}
        {friendRequests.map((request) => (
          <li key={request.id}>
            Friend request from {request.user_id}
            <button
              onClick={() => acceptFriendRequest(request.id)}
              className="ml-2 bg-blue-500 text-white p-1"
            >
              Accept
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
