import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation"; // ✅ Import useRouter

export default function SecretPage3() {
  const [friendRequests, setFriendRequests] = useState<any[]>([]); // Declare friend requests state
  const [friendEmail, setFriendEmail] = useState("");
  const [user, setUser] = useState<any>(null);
  const router = useRouter(); // ✅ Initialize router

  // Fetch logged-in user
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error.message);
      } else {
        setUser(data.user);
      }
    };

    getUser();
  }, []);

  // Fetch pending friend requests (Only requests where logged-in user is the recipient)
  useEffect(() => {
    const fetchFriendRequests = async () => {
      if (!user?.id) return;

      console.log("Fetching friend requests for:", user.id);

      // Debugging: Fetch everything first (to see if data is inserted)
      const { data: allData, error: allError } = await supabase
        .from("friends")
        .select("*");
      console.log("All friend requests in DB:", allData);

      // Now filter specifically for the logged-in user as recipient
      const { data, error } = await supabase
        .from("friends")
        .select("*")
        .eq("friend_id", user.id) // ✅ Ensure filtering correctly
        .eq("status", "pending");

      if (error) {
        console.error("Error fetching friend requests:", error.message);
      } else {
        console.log("Fetched friend requests:", data);
        setFriendRequests(data); // ✅ Update state
      }
    };

    if (user) fetchFriendRequests();
  }, [user]);

  // Accept friend request
  const acceptFriendRequest = async (requestId: string) => {
    console.log("Accepting friend request with ID:", requestId); // Debugging log

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
      .update({ status: "accepted" }) // Mark as accepted
      .eq("id", requestId) // Match the request by ID
      .eq("friend_id", user.id); // Ensure that the request is for the logged-in user

    if (error) {
      console.error("Error accepting friend request:", error.message);
      alert("Error accepting friend request: " + error.message);
    } else {
      alert("Friend request accepted!");
      setFriendRequests((prev) => prev.filter((req) => req.id !== requestId)); // Remove from state/UI
    }
  };

  // Send friend request
  const sendFriendRequest = async () => {
    if (!user) return alert("User not logged in.");

    console.log("Fetching users...");
    const response = await fetch("/api/fetch-users");
    const usersData = await response.json();

    if (!response.ok) {
      console.error("Error fetching users:", usersData.error);
      alert("Error fetching users: " + usersData.error);
      return;
    }

    console.log("Users fetched:", usersData.users); // ✅ Check if users are fetched correctly

    const friendData = usersData.users.find(
      (u: { id: string; email: string }) => u.email === friendEmail
    );

    if (!friendData) {
      alert("User not found.");
      console.error("Friend not found for email:", friendEmail);
      return;
    }

    console.log(`Sending friend request from ${user.id} to ${friendData.id}`); // ✅ Debug log

    // Insert into Supabase
    const { data, error } = await supabase
      .from("friends")
      .insert([
        {
          user_id: user.id, // ✅ The sender
          friend_id: friendData.id, // ✅ The recipient
          status: "pending", // ✅ Mark as pending
        },
      ])
      .select(); // ✅ Retrieve inserted data for debugging

    if (error) {
      console.error("Error sending friend request:", error.message);
      alert(error.message);
    } else {
      console.log("Friend request inserted:", data); // ✅ Log the inserted data
      alert("Friend request sent!");
      setFriendEmail(""); // Reset input
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
          onClick={() => router.push("/dashboard")} // ✅ Navigate back
          className="bg-gray-500 text-white p-2  rounded"
        >
          Back
        </button>
      </div>

      <h2 className="mt-4">Pending Friend Requests</h2>
      <ul>
        {friendRequests.length === 0 && <p>No pending requests.</p>}
        {friendRequests.map((request) => {
          console.log("Rendering request:", request); // Debugging log
          return (
            <li key={request.id}>
              Friend request from {request.user_id}{" "}
              {/* Ensure this displays correctly */}
              <button
                onClick={() => acceptFriendRequest(request.id)}
                className="ml-2 bg-blue-500 text-white p-1"
              >
                Accept
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
