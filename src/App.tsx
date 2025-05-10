import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import Connect from "./components/connect";
import { Box, CircularProgress, Typography } from "@mui/material";
import Console from "./components/console";
import { Client } from "archipelago.js";

function App() {
  const [socketUrl, setSocketUrl] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [password, setPassword] = useState<string | undefined>(undefined);
  const [apKey, setApKey] = useState<string | null>(null);

  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const client = useRef<Client | null>(null);

  const reset = useCallback(() => {
    setSocketUrl(null);
    setUsername(null);
    setSlot(null);
    setPassword(undefined);
    setApKey(null);
    setMessageHistory([]);
    setErrorMessage(null);
    localStorage.clear();
  }, []);

  useEffect(() => {
    client.current = new Client();
    client.current.messages.on("message", (content) => {
      let message = content;
      if (content.includes("[Hint]")) {
        message = message
          .split(",")
          .join("")
          .replace("(unspecified)", "")
          .replace(/,/gi, "");
      }
      setMessageHistory((prev) => [...prev, message]);
    });
    client.current.socket.on("disconnected", () => reset());
  }, []);

  useEffect(() => {
    if (
      localStorage.getItem("socketUrl") != null &&
      localStorage.getItem("username") != null &&
      localStorage.getItem("slot") != null &&
      localStorage.getItem("apKey") != null &&
      localStorage.getItem("exp") != null
    ) {
      if (Number(localStorage.getItem("exp")) > Date.now()) {
        setSocketUrl(localStorage.getItem("socketUrl"));
        setUsername(localStorage.getItem("username"));
        setSlot(localStorage.getItem("slot"));
        setPassword(localStorage.getItem("password") ?? undefined);
        setApKey(localStorage.getItem("apKey"));
      } else {
        localStorage.clear();
      }
    }
  }, []);

  useEffect(() => {
    if (socketUrl && slot && username && apKey) {
      setLoading(true);
      const options = password
        ? { password, tags: ["HintGame", "DeathLink"] }
        : { tags: ["HintGame", "DeathLink"] };
      client.current
        ?.login(socketUrl, slot, undefined, options)
        .then(() => {
          setLoading(false);
          localStorage.setItem("socketUrl", socketUrl);
          localStorage.setItem("username", username);
          localStorage.setItem("slot", slot);
          localStorage.setItem("apKey", apKey);
          if (password !== undefined) {
            localStorage.setItem("password", password);
          }

          localStorage.setItem(
            "exp",
            (Date.now() + 1000 * 60 * 60 * 1).toString()
          );
        })
        .catch((err) => {
          setErrorMessage(err.message);
          console.error(err);
          setLoading(false);
          localStorage.clear();
        });
    }
  }, [socketUrl, slot, username, password]);

  if (!socketUrl || errorMessage) {
    return (
      <Connect
        callback={(host, port, slot, password, username, apKey) => {
          if (host !== "" && port !== "" && username !== "" && apKey !== "") {
            setErrorMessage(null);
            setSocketUrl(`wss://${host}:${port}`);
            setUsername(username);
            setSlot(slot);
            setApKey(apKey);
            if (password !== "") {
              setPassword(password);
            }
          } else {
            setErrorMessage("Please enter all required fields!");
          }
        }}
        errorMessage={errorMessage}
      />
    );
  }

  if (loading) {
    return (
      <Box
        display="flex"
        height="100%"
        width="100%"
        justifyContent="center"
        alignItems="center"
      >
        <Box display="flex" gap={1} alignItems="center">
          <CircularProgress />
          <Typography variant="h4">Connecting...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Console
      messageHistory={messageHistory}
      username={username ?? ""}
      client={client.current}
      socketUrl={socketUrl ?? ""}
      slot={slot ?? ""}
      apKey={apKey ?? ""}
    />
  );
}

export default App;
