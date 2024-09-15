import './App.css'
import { useEffect, useState } from 'react';
import { socket } from './infra/socket';

function App() {
  const [isConnected, setConnected] = useState<boolean>(socket.connected);

  useEffect(() => {
    socket.on('connect', () => {
      setConnected(socket.connected);
    });
  }, []);


  return (
    <div>
      {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  )
}

export default App
