import { createContext, useEffect, useRef, useState } from "react";
import { socket } from "../infra/socket";
import Peer from "simple-peer";

const SocketContext = createContext();

const ContextProvider = ({ children }) => {
  const [stream, setStream] = useState<MediaStream>();
  const [me, setMe] = useState<string>('');
  const [call, setCall] = useState({});
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState('');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef();

  useEffect(() => {
    // ブラウザのメディアデバイスを取得
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);

        // ローカルビデオを表示
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = currentStream;
          localVideoRef.current.muted = true;
        }
      });

    // サーバーに接続
    socket.on('me', (id) => {
      // console.info('me', id);
      setMe(id)
    });

    socket.on('calluser', ({ from, name: callerName, signal }) => {
      // console.info('calluser', from, callerName, signal);
      setCall({ isReceivedCall: true, from, name: callerName, signal });
    });

    return () => {
      socket.off('me');
      socket.off('calluser');
    };
  }, []);

  const answerCall = () => {
    setCallAccepted(true);

    console.info('answerCall', call);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream
    })

    peer.on('signal', (data) => {
      socket.emit('answercall', { signal: data, to: call.from });
    });

    peer.on('stream', (currentStream) => {
      console.info('stream', currentStream);
      remoteVideoRef.current.srcObject = currentStream;
    });

    peer.signal(call.signal);

    connectionRef.current = peer;
  }

  const callUser = (id) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", (data) => {
      // console.info('calluser', id, data, me, name);
      socket.emit("calluser", {
        userToCall: id,
        signalData: data,
        from: me,
        name,
      });
    });

    peer.on("stream", (currentStream) => {
      remoteVideoRef.current.srcObject = currentStream;
    });

    socket.on("callaccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();

    window.location.reload();
  };

  return (
    <SocketContext.Provider value={{
      call,
      callAccepted,
      localVideoRef,
      remoteVideoRef,
      stream,
      name,
      setName,
      callEnded,
      me,
      callUser,
      leaveCall,
      answerCall,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export { SocketContext, ContextProvider };
