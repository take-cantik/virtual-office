import { useEffect, useRef } from "react";

function VoiceChat() {
  const localVideoRef = useRef<HTMLVideoElement|null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement|null>(null);

  const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1,
  };

  var localPeerConnection = null;
  var remotePeerConnection = null;
  var localStream = null;

  const getRemoteStream = (event: any) => {
    if (!remoteVideoRef.current) {
      return;
    }
    remoteVideoRef.current.srcObject = event.stream;
  };

  const handleConnection = (event) => {
    const peerConnection = event.target;
    const iceCandidate = event.candidate;

    if (iceCandidate) {
      const newIceCandidate = new RTCIceCandidate(iceCandidate);
      const otherPeer = peerConnection === localPeerConnection ? remotePeerConnection : localPeerConnection;

      otherPeer.addIceCandidate(newIceCandidate)
        .then(() => {
          console.log('addIceCandidate success');
        }).catch((error) => {
          console.error('failed to add ICE Candidate', error);
        });
    }
  }

  const handleConnectionChange = (event) => {
    console.log('ICE state change event: ', event);
  }

  const createdOffer = (description) => {
    localPeerConnection.setLocalDescription(description)
      .then(() => {
        console.log("LocalPeerConnection success");
      })
      .catch(() => {
        console.log("LocalPeerConnection Failure");
      })
    remotePeerConnection.setRemoteDescription(description)
      .then(() => {
        console.log("RemotePeerConnection Success");
      })
      .catch(() => {
        console.log("RemotePeerConnection Failure");
      })
    remotePeerConnection.createAnswer()
      .then(createdAnswer)
      .catch(() => {
        console.log("RemoteCreateAnswer Failure");
      })
  }

  const createdAnswer = (description) => {
    remotePeerConnection.setLocalDescription(description)
      .then(() => {
        console.log('remotePeerConnection setLocalDescription success');
      }).catch((error) => {
        console.error('remotePeerConnection failed to set session description', error);
      });

    localPeerConnection.setRemoteDescription(description)
      .then(() => {
        console.log('localPeerConnection setRemoteDescription success');
      }).catch((error) => {
        console.error('localPeerConnection failed to set session description', error);
      });
  }

  const calling = () => {
    localPeerConnection = new RTCPeerConnection(null);
    localPeerConnection.addEventListener('icecandidate', handleConnection);
    localPeerConnection.addEventListener('iceconnectionstatechange', handleConnectionChange)

    remotePeerConnection = new RTCPeerConnection(null);
    remotePeerConnection.addEventListener('icecandidate', handleConnection);
    remotePeerConnection.addEventListener('iceconnectionstatechange', handleConnectionChange);
    remotePeerConnection.addEventListener('addstream', getRemoteStream);

    localPeerConnection.addStream(localStream);

    localPeerConnection.createOffer(offerOptions)
      .then(createdOffer)
      .catch((error) => {
        console.log('createOffer Error', error);
      })
  }

  useEffect(() => {
    const constraints = {
      audio: true,
      video: true,
    };
    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        localStream = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div>
      <h1>Voice Chat</h1>
      <h2>Local</h2>
      <video ref={localVideoRef} autoPlay />
      <h2>Remote</h2>
      <video ref={remoteVideoRef} autoPlay />

      <button onClick={calling}>Call</button>
    </div>
  );
}

export default VoiceChat;
