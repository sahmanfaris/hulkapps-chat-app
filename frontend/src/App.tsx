import { useEffect, useState } from "react";
import Chat from "./Chat.js";
import Auth from "./Auth.js";
function App() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setToken(token);
    }
  }, []);

  return <>{token ? <Chat token={token} /> : <Auth setToken={setToken} />}</>;
}

export default App;
