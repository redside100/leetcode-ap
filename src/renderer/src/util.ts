import toast from 'react-hot-toast'

export const displayToast = (message: string, color: string = '#E23F44') => {
  toast(message, {
    position: 'top-right',
    style: {
      fontFamily: '"TypoRoundRegular", sans-serif',
      fontSize: '14px',
      color
    }
  })
}
