import { Box, Button, TextField, Typography } from '@mui/material'
import { useState } from 'react'
const Connect = ({
  callback
}: {
  callback: (host: string, port: string, slot: string, password: string, username: string) => void
}) => {
  const [host, setHost] = useState('')
  const [port, setPort] = useState('')
  const [username, setUsername] = useState('')
  const [slot, setSlot] = useState('')
  const [password, setPassword] = useState('')
  return (
    <Box
      height="100%"
      width="100%"
      display="flex"
      flexDirection="column"
      alignItems="center"
      mt={1}
      gap={1}
    >
      <Typography variant="h4" mb={2}>
        <strong>LeetcodeAP</strong>
      </Typography>
      <Box display="flex" gap={1}>
        <TextField
          label="Server Host"
          value={host}
          onChange={(e: any) => setHost(e.target.value)}
          placeholder="archipelago.gg"
        />
        <TextField
          label="Server Port"
          type="number"
          value={port}
          onChange={(e: any) => setPort(e.target.value)}
          placeholder="12345"
        />
      </Box>
      <Box display="flex" gap={1}>
        <TextField
          label="Hint Slot"
          value={slot}
          onChange={(e: any) => setSlot(e.target.value)}
          placeholder="Slot"
        />
        <TextField
          label="Server Password (optional)"
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
          placeholder="Password"
        />
      </Box>
      <Box display="flex" gap={1} mb={1}>
        <TextField
          label="Leetcode Username"
          value={username}
          onChange={(e: any) => setUsername(e.target.value)}
          placeholder="Username"
        />
      </Box>
      <Button variant="contained" onClick={() => callback(host, port, slot, password, username)}>
        Connect
      </Button>
    </Box>
  )
}

export default Connect
