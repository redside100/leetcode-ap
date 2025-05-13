import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { createTheme, ThemeProvider } from '@mui/material'
import { Toaster } from 'react-hot-toast'

const theme = createTheme({
  typography: {
    fontFamily: '"TypoRoundRegular", sans-serif'
  }
})

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={theme}>
    <Toaster />
    <App />
  </ThemeProvider>
)
