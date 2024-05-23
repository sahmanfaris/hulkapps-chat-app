import { useState } from "react";
import axios from "axios";
import axiosConfig from "./axiosConfig";

interface AuthProps {
  setToken: (token: string) => void;
}

const Auth = ({ setToken }: AuthProps) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    try {
      await axiosConfig.post("/api/auth/register", {
        username,
        password,
      });
      alert("User registered successfully");
    } catch (error) {
      console.error("Error registering user:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Registration failed";
        setErrorMessage(errorMessage);
      } else {
        setErrorMessage("An unexpected error occurred during registration");
      }
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axiosConfig.post("/api/auth/login", {
        username,
        password,
      });
      setToken(response.data.token);
      localStorage.setItem("token", response.data.token);
    } catch (error) {
      console.error("Error logging in:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || "Login failed";
        setErrorMessage(errorMessage);
      } else {
        setErrorMessage("An unexpected error occurred during login");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isRegister) {
      await handleRegister();
      setIsRegister(false);
    } else {
      await handleLogin();
    }
  };

  return (
    <div className="w-full max-w-xs m-auto mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Chat App</h1>
      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        onSubmit={handleSubmit}
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="username"
          >
            Username
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            placeholder="******************"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errorMessage && (
            <p className="text-red-500 text-xs italic">{errorMessage}</p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            {isRegister ? "Register" : "Sign In"}
          </button>
          <button
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            type="button"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "Already have an account?" : "Don't have an account?"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Auth;
