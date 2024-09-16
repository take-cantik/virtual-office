import { useEffect, useRef, useState } from "react";
import { socket } from "../infra/socket";

var isHost = false;
var room = 'room1';

var localStream = null;
var remoteStream = null;
var peerConnection = null;
var isStarted = false;

const config = {
  "iceServers": [
    { "urls": "stun:stun.l.google.com:19302" },
    { "urls": "stun:stun1.l.google.com:19302" },
    { "urls": "stun:stun2.l.google.com:19302" },
  ]
};

const constraints = {
  audio: true,
  video: true,
};

const offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1,
};

function VoiceChat() {
  const localVideoRef = useRef<HTMLVideoElement|null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement|null>(null);

  const [isKnocking, setIsKnocking] = useState<boolean>(false);
  const [canCalling, setCanCalling] = useState<boolean>(false);
  const [isAllowed, setIsAllowed] = useState<boolean>(false);

  socket.on('knocked response', (numClients, room) => {
    if (numClients === 0) {
      socket.emit('create', room);
    } else if (numClients === 1) {
      socket.emit('join', room);
    } else {
      console.log("room [" + room + "] is full.");
    }
  });
  socket.on('created', (room) => {
    console.log('[Server said] you created room [' + room + ']');
    isHost = true;
    if (!isStarted) {
      startConnect();
    }
  });
  socket.on('joined', (room, id) => {
    console.log('[Server said] ' + id + ' joined room [' + room + ']');
    if (isHost) {
      setIsKnocking(true);
    } else {
      if (!isStarted) {
        startConnect();
      }
    }
  });
  socket.on('allowed', () => {
    console.log('allowed!');
    setIsAllowed(true);
  });
  socket.on('offer', (description) => {
    console.log('Offer received');
    if (!isHost && !isStarted) {
      startConnect();
    }
    peerConnection.setRemoteDescription(description);
    peerConnection.createAnswer()
      .then(setLocalAndSendMessage)
      .catch(handleAnswerError);
  });
  socket.on('answer', (description) => {
    console.log('Answer received');
    if (isStarted) {
      peerConnection.setRemoteDescription(description);
    }
  });
  socket.on('candidate', (description) => {
    console.log('candidate Recieved');
    if (isStarted) {
      peerConnection.addIceCandidate(
        new RTCIceCandidate({
          sdpMLineIndex: description.label,
          candidate: description.candidate,
        })
      );
    }
  });

  const createPeerConnection = () => {
    try {
      peerConnection = new RTCPeerConnection( config );
      peerConnection.onicecandidate = handleConnection;
      peerConnection.onaddstream = handleAddStream;
      peerConnection.onremovestream = handleRemoveStream;
      console.log('PeerConnection is created');
    } catch (error) {
      console.log('[ERROR]', error);
      return;
    }
  }

  const handleConnection = (event) => {
    if (event.candidate && peerConnection.signalingState !== 'stable') {
      console.log(peerConnection.signalingState);
      socket.emit('message', {
        type: 'candidate',
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate
      });
    } else {
      console.log('End of candidates');
    }
  }

  const startConnect = () => {
    createPeerConnection();
    peerConnection.addStream(localStream);
    isStarted = true;
    if (!isHost) {
      peerConnection.createOffer(offerOptions)
        .then(setLocalAndSendMessage)
        .catch(handleOfferError);
    }
  }

  const handleAddStream = (event) => {
    console.log('add stream');
    remoteStream = event.stream;
  }

  const handleRemoveStream = (event) => {
    console.log('remove stream' + event);
  }

  const startConnection = () => {
    createPeerConnection();
    peerConnection.addStream(localStream);
    isStarted = true;
    if (!isHost) {
      peerConnection.createOffer(offerOptions)
        .then(setLocalAndSendMessage)
        .catch(handleOfferError);
    }
  }

  const setLocalAndSendMessage = (description) => {
    peerConnection.setLocalDescription(description);
    socket.emit('message', description);
  }
  const handleOfferError = (error) => {
    console.log("[ERROR]", error);
  }
  const handleAnswerError = (error) => {
    console.log("[ERROR]" + error.toString());
  }
  const allowJoin = () => {
    console.log('allow');
    socket.emit('allow');
    setIsAllowed(true);
  }
  const calling = () => {
    socket.emit('knock', room);
  }

  useEffect(() => {
    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        localStream = stream;
        console.log(localStream);
        localVideoRef.current.srcObject = stream;
        setCanCalling(true);
      })
      .catch((error) => {
        console.log("ERROR", error);
      });
  }, []);

  useEffect(() => {
    remoteVideoRef.current.srcObject = remoteStream;
  },[isAllowed]);


  return (
    <div>
      <h1>Voice Chat</h1>
      <h2>Local</h2>
      <video ref={localVideoRef} playsInline autoPlay />
      <h2>Remote</h2>
      <video ref={remoteVideoRef} playsInline autoPlay />

      <button onClick={allowJoin} disabled={!isKnocking}>Allow</button>
      <button onClick={calling} disabled={!canCalling}>Call</button>
    </div>
  );
}

export default VoiceChat;
