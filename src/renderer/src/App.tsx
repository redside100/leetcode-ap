import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import Connect from './components/connect'
import { Box, CircularProgress, Typography } from '@mui/material'
import Console from './components/console'
import { Client } from 'archipelago.js'
import { displayToast } from './util'

function App() {
  const [socketUrl, setSocketUrl] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [slot, setSlot] = useState<string | null>(null)
  const [password, setPassword] = useState<string | undefined>(undefined)
  const [hasError, setHasError] = useState(false)
  const [messageHistory, setMessageHistory] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const client = useRef<Client | null>(null)

  const reset = useCallback(() => {
    setSocketUrl(null)
    setUsername(null)
    setSlot(null)
    setPassword(undefined)
    setMessageHistory([])
  }, [])

  useEffect(() => {
    client.current = new Client()
    client.current.messages.on('message', (content) => {
      let message = content
      if (content.includes('[Hint]')) {
        message = message.split(',').join('').replace('(unspecified)', '').replace(/,/gi, '')
      }
      setMessageHistory((prev) => [...prev, message])
    })
    client.current.socket.on('disconnected', () => reset())
  }, [])

  useEffect(() => {
    if (socketUrl && slot && username) {
      setLoading(true)
      setHasError(false)
      const options = password
        ? { password, tags: ['HintGame', 'DeathLink'] }
        : { tags: ['HintGame', 'DeathLink'] }
      client.current
        ?.login(socketUrl, slot, undefined, options)
        .then(() => {
          setLoading(false)
          setHasError(false)
          displayToast('Connected to Archipelago server!', '#4CAF50')
        })
        .catch((err) => {
          displayToast(err.message)
          setHasError(true)
          console.error(err)
          setLoading(false)
        })
    }
  }, [socketUrl, slot, username, password])

  if (!socketUrl || hasError) {
    return (
      <Connect
        callback={(host, port, slot, password, username) => {
          if (host !== '' && port !== '' && username !== '') {
            setSocketUrl(`wss://${host}:${port}`)
            setUsername(username)
            setSlot(slot)
            if (password !== '') {
              setPassword(password)
            }
          } else {
            displayToast('Please enter all required fields!')
          }
        }}
      />
    )
  }

  if (loading) {
    return (
      <Box display="flex" height="100%" width="100%" justifyContent="center" alignItems="center">
        <Box display="flex" gap={2} alignItems="center">
          <CircularProgress />
          <Typography variant="h4">
            <strong>Connecting...</strong>
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Console
      messageHistory={messageHistory}
      username={username ?? ''}
      client={client.current}
      socketUrl={socketUrl ?? ''}
      slot={slot ?? ''}
    />
  )
}

export default App
