import {
  Box,
  Checkbox,
  Link,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import type { Client } from "archipelago.js";
import { useEffect, useRef, useState } from "react";
import { getLatestLeetcodeSubmissions } from "../lcApi";
import toast, { Toaster } from "react-hot-toast";

const getSubmissionKey = (submission: any) => {
  return `${submission.titleSlug}-${submission.timestamp}`;
};

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
  const initialized = useRef(false);
  const submissionHistory = useRef<any[]>([]);
  const isDeathlinkEnabled = useRef(true);

  const initializeLeetcode = async () => {
    const result = await getLatestLeetcodeSubmissions(username, apKey);
    const [submissions, status] = result;
    if (submissions === undefined) {
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

    submissionHistory.current = [...submissions];
    initialized.current = true;
  };

  const updateLeetcode = async () => {
    if (!initialized.current) {
      await initializeLeetcode();
      return;
    }

    // fetch
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

    const previousSubmissionKeys = submissionHistory.current.map((submission) =>
      getSubmissionKey(submission)
    );

    const previousSolvedSubmissionSlugs = submissionHistory.current
      .filter((submission) => submission.statusDisplay === "Accepted")
      .map((submission) => submission.titleSlug);

    const newSubmissions = submissions.filter(
      (submission: any) =>
        !previousSubmissionKeys.includes(getSubmissionKey(submission))
    );

    // we have new submissions - process them
    if (newSubmissions.length > 0) {
      // filter for accepted submissions for new problems
      const acceptedSubmissions = newSubmissions.filter(
        (submission: any) =>
          submission.statusDisplay === "Accepted" &&
          !previousSolvedSubmissionSlugs.includes(submission.titleSlug)
      );

      // we count any new failed submission as a failure
      const failedSubmissions = newSubmissions.filter(
        (submission: any) => submission.statusDisplay !== "Accepted"
      );

      // handle accepted submissions (hints)
      if (acceptedSubmissions.length > 0) {
        client?.messages.say(
          `Solved Leetcode problem(s): ${acceptedSubmissions
            .map((submission: any) => submission.title)
            .join(",")}`
        );
        const scrambledLocations =
          client?.room.missingLocations.sort(() => Math.random() - 0.5) ?? [];

        const hintLocations = scrambledLocations.slice(
          0,
          Math.min(acceptedSubmissions.length, scrambledLocations.length)
        );

        if (hintLocations.length > 0) {
          client?.scout(hintLocations, 1);
        }
      }

      // handle failures (only if death link is enabled)
      if (failedSubmissions.length > 0 && isDeathlinkEnabled.current) {
        const cause = failedSubmissions[0].statusDisplay;
        const failedTitle = failedSubmissions[0].title;
        client?.deathLink.sendDeathLink(
          slot,
          `Failed a Leetcode submission: ${cause}`
        );
        client?.messages.say(
          `Failed a Leetcode submission: ${failedTitle} (${cause})`
        );
      }
    }

    // update submission history
    submissionHistory.current = [
      ...submissionHistory.current,
      ...newSubmissions,
    ];
  };

  useEffect(() => {
    initializeLeetcode();
    const interval = setInterval(updateLeetcode, 15000);
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
        <Box display="flex" alignItems="center">
          <Checkbox
            defaultChecked
            onChange={(_, checked) => (isDeathlinkEnabled.current = checked)}
          />
          <Tooltip
            title={
              <Typography>
                If checked, failed submissions will trigger a death for all
                players with DeathLink enabled.
              </Typography>
            }
            arrow
          >
            <Typography>Death Link</Typography>
          </Tooltip>
        </Box>
      </Box>
    </>
  );
};
export default Console;
