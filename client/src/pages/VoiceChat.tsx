import { useContext } from "react";
import { SocketContext } from "../context/SocketContext";
import { useForm } from "react-hook-form";


const VoiceChat = () => {
  const { name, setName, call, stream, callAccepted, callEnded, me, callUser, answerCall, leaveCall, localVideoRef, remoteVideoRef } = useContext(SocketContext);
  const nameForm = useForm<{ name: string }>({
    defaultValues: {
      name: '',
    },
  });

  const callForm = useForm<{ id: string }>({
    defaultValues: {
      id: '',
    },
  });

  const onNameSubmit = nameForm.handleSubmit(() => {
    setName(nameForm.getValues('name'));
    nameForm.reset();
  });

  const onCall = () => {
    // console.info('onCall');
    const id = callForm.getValues('id');
    callUser(id);
  }

  return (
    <div>
      <h1>Voice Chat</h1>
      <form onSubmit={onNameSubmit}>
        <label>
          name:
          <input type="text" placeholder="匿名" {...nameForm.register('name')} />
        </label>
        <button type="submit">Submit</button>
      </form>
      <form>
        <label>
          ID to call:
          <input type="text" placeholder="ID" {...callForm.register('id')} />
        </label>
        {callAccepted && !callEnded ? (
          <button type="button" onClick={leaveCall}>leave</button>
        ) : (
          <button type="button" onClick={onCall}>Call</button>
        )}
      </form>
        {call.isReceivedCall && !callAccepted && (
          <div>
            <h3>{call.name || "匿名"} is calling:</h3>
            <button type="button" onClick={answerCall}>Answer</button>
          </div>
        )}
        <div>
          <h2>{name || "匿名"} {me && `(your ID: ${me})`}</h2>
          <video ref={localVideoRef} playsInline autoPlay muted />
        </div>
        <div>
          <h2>{call.name || "匿名"}</h2>
          <video ref={remoteVideoRef} playsInline autoPlay />
        </div>
    </div>
  );
}

export default VoiceChat;
