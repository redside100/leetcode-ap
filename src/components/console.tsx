import { Box, Link, TextField, Tooltip, Typography } from "@mui/material";
import type { Client } from "archipelago.js";
import { useEffect, useRef, useState } from "react";
import { getLatestLeetcodeSubmissions } from "../lcApi";
import toast, { Toaster } from "react-hot-toast";
const Console = ({
  messageHistory,
  username,
  client,
  socketUrl,
  slot,
  apKey,
}: {
  messageHistory: string[];
  username: string;
  client: Client | null;
  socketUrl: string;
  slot: string;
  apKey: string;
}) => {
  const [message, setMessage] = useState<string>("");
  const lastRef = useRef<HTMLDivElement>(null);

  const updateLeetcode = async () => {
    const result = await getLatestLeetcodeSubmissions(username, apKey);
    const [submissions, status] = result;
    if (submissions === undefined) {
      console.log("Got a bad response from LC API, skipping this check");
      if (status === 401) {
        toast(
          "API authentication error while fetching Leetcode updates. Try disconnecting and make sure APKey is correct!",
          {
            position: "top-right",
            style: {
              fontFamily: '"TypoRoundRegular", sans-serif',
              fontSize: "14px",
            },
          }
        );
      }
      return;
    }

    const solvedProblems = JSON.parse(
      localStorage.getItem("solvedProblems") ?? "[]"
    );

    const oldSolvedCount = solvedProblems.length;

    // first time running
    if (solvedProblems.length === 0) {
      submissions.forEach((submission: any) => {
        solvedProblems.push(submission.titleSlug);
      });
      localStorage.setItem("solvedProblems", JSON.stringify(solvedProblems));
      return;
    }

    const newSolvedProblemNames: string[] = [];

    // this is an update
    submissions.forEach((submission: any) => {
      if (!solvedProblems.includes(submission.titleSlug)) {
        solvedProblems.push(submission.titleSlug);
        newSolvedProblemNames.push(submission.title);
      }
    });

    // new problems solved
    if (solvedProblems.length > oldSolvedCount) {
      client?.messages.say(
        `Solved Leetcode problem(s): ${newSolvedProblemNames.join(",")}`
      );
      const hintLocation =
        client?.room.missingLocations[
          Math.floor(
            Math.random() * (client?.room.missingLocations.length ?? 0)
          )
        ];
      if (hintLocation) {
        client?.scout([hintLocation], 1);
      }
    }

    localStorage.setItem("solvedProblems", JSON.stringify(solvedProblems));
  };

  useEffect(() => {
    const interval = setInterval(updateLeetcode, 15000);
    updateLeetcode();

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (lastRef.current) {
      lastRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  }, [messageHistory]);
  return (
    <>
      <Toaster />
      <Box
        width="100%"
        display="flex"
        flexDirection="column"
        gap={1}
        alignItems="center"
      >
        <Typography variant="h4">
          <strong>LeetcodeAP</strong>
        </Typography>
        <Typography>
          Connected to{" "}
          <Tooltip
            arrow
            title={<Typography>Slot: {slot}</Typography>}
            placement="top"
          >
            <Link>{socketUrl.replace("wss://", "")}</Link>
          </Tooltip>{" "}
          (
          <Link
            onClick={() => {
              client?.socket.disconnect();
              // reset();
            }}
            sx={{
              cursor: "pointer",
            }}
          >
            disconnect
          </Link>
          )
        </Typography>
        <Typography>
          Watching Leetcode submissions for:{" "}
          <Link href={`https://leetcode.com/u/${username}/`} target="_blank">
            {username}
          </Link>
        </Typography>
        <Box
          width={800}
          height={500}
          sx={{
            backgroundColor: "lightgray",
          }}
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          p={2}
          overflow="auto"
        >
          {messageHistory.map((text: string, idx: number) =>
            idx === messageHistory.length - 1 ? (
              <Typography
                alignSelf="flex-start"
                key={`message-${idx}`}
                whiteSpace="pre-wrap"
                ref={lastRef}
              >
                <code>{text}</code>
              </Typography>
            ) : (
              <Typography
                alignSelf="flex-start"
                key={`message-${idx}`}
                whiteSpace="pre-wrap"
              >
                <code>{text}</code>
              </Typography>
            )
          )}
        </Box>
        <TextField
          label="Message"
          variant="outlined"
          placeholder="Send a message..."
          value={message}
          sx={{
            width: 830,
          }}
          slotProps={{
            htmlInput: {
              style: {
                height: "20px",
              },
            },
          }}
          onChange={(e: any) => {
            setMessage(e.target.value);
          }}
          onKeyDown={async (e: any) => {
            if (e.key === "Enter" && message !== "") {
              const message = e.target.value;
              client?.messages?.say(message);
              setMessage("");
            }
          }}
        />
      </Box>
    </>
  );
};
export default Console;
