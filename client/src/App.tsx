import { io } from 'socket.io-client'
import './App.css'
import { useEffect, useState } from 'react';

function App() {
  const socket = io('http://localhost:3000', {
    withCredentials: true,
    path: '/socket'
  });

  const [isConnected, setConnected] = useState<boolean>(socket.connected);

  useEffect(() => {
    socket.on('connect', () => {
      setConnected(socket.connected);
    });
  }, [socket]);


  return (
    <div>
      {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  )
}

export default App
