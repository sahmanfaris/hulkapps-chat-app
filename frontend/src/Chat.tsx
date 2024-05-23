import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

type Message = {
  user: {
    userId: string;
    username: string;
  };
  message: string;
  timestamp: Date;
};

type Room = {
  name: string;
};

const Chat = ({ token }: { token: string }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [rateLimited, setRateLimited] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [joinedRooms, setJoinedRooms] = useState<string[]>([]);

  useEffect(() => {
    const newSocket = io("https://hulkapps-chat-app.vercel.app", {
      query: { token },
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("Connected to chat server");
      newSocket.emit("getRooms");
    });

    newSocket.on("roomsList", (roomsList: Room[]) => {
      console.log("Rooms list:", roomsList);
      setRooms(roomsList);
    });

    newSocket.on("previousMessages", (messages: Message[]) => {
      setMessages(messages);
    });

    newSocket.on("message", (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    newSocket.on("errorMessage", (message: string) => {
      setRateLimited(true);
      setErrorMessage(message);
      setTimeout(() => {
        setRateLimited(false);
        setErrorMessage("");
      }, 60000);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  const handleSendMessage = () => {
    if (message.trim() && socket && !rateLimited) {
      socket.emit("message", { room: selectedRoom, message });
      setMessage("");
    }
  };

  const handleJoinRoom = (roomName: string) => {
    if (socket && !joinedRooms.includes(roomName)) {
      socket.emit("joinRoom", roomName);
      setJoinedRooms((prevRooms) => [...prevRooms, roomName]);
      setSelectedRoom(roomName);
      // Fetch messages for the newly joined room
      socket.emit("getMessages", roomName);
    }
  };

  const handleLeaveRoom = (roomName: string) => {
    if (socket && joinedRooms.includes(roomName)) {
      socket.emit("leaveRoom", roomName);
      setJoinedRooms((prevRooms) =>
        prevRooms.filter((room) => room !== roomName)
      );
      if (selectedRoom === roomName) {
        setSelectedRoom("");
        setMessages([]);
      }
    }
  };

  const handleRoomSelection = (roomName: string) => {
    setSelectedRoom(roomName);
    if (joinedRooms.includes(roomName)) {
      socket?.emit("getMessages", roomName);
    } else {
      setMessages([]);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="w-full md:w-1/4 bg-gray-200 p-4">
        <h2 className="text-lg font-bold mb-4">Available Chats</h2>
        <ul>
          {rooms.map((room) => (
            <li
              key={room.name}
              className={`p-2 cursor-pointer flex justify-between ${
                room.name === selectedRoom
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-300"
              }`}
              onClick={() => handleRoomSelection(room.name)}
            >
              <span>{room.name}</span>
              {joinedRooms.includes(room.name) ? (
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLeaveRoom(room.name);
                  }}
                >
                  LEAVE
                </button>
              ) : (
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinRoom(room.name);
                  }}
                >
                  JOIN
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between bg-blue-600 p-4">
          <h2 className="text-2xl font-bold text-white">
            Chat Room: {selectedRoom}
          </h2>
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.reload();
            }}
          >
            Log out
          </button>
        </div>

        {errorMessage && (
          <div className="bg-red-500 text-white text-center p-2">
            {errorMessage}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4" id="messages">
          {messages.map((msg, index) => (
            <div key={index} className="mb-2">
              <span className="font-bold">{msg.user.username}</span>:{" "}
              {msg.message}
            </div>
          ))}
        </div>

        <div className="flex p-4 bg-gray-200">
          <input
            className="flex-1 p-2 border border-gray-400 rounded mr-2"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            onClick={handleSendMessage}
            disabled={rateLimited}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
