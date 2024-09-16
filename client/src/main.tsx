import { createRoot } from 'react-dom/client'
import './index.css'
import Root from './Root'
import { ContextProvider } from './context/SocketContext'

createRoot(document.getElementById('root')!).render(
  <ContextProvider>
    <Root />
  </ContextProvider>
)
