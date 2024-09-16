import { useContext } from "react";
import { SocketContext } from "../context/SocketContext";
import { useForm } from "react-hook-form";


const VoiceChat = () => {
  const {
    name,
    setName,
    call,
    stream,
    callAccepted,
    callEnded,
    me,
    callUser,
    answerCall,
    leaveCall,
    localVideoRef,
    remoteVideoRef,
    myPosition,
    anotherUserPosition,
  } = useContext(SocketContext);
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
      <h2>{me && `(your ID: ${me})`}</h2>
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
          <div style={{
            position: 'absolute',
            left: myPosition.x,
            top: myPosition.y,
            width: '200px',
            height: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <video ref={localVideoRef} playsInline autoPlay muted width={200} />
            <p>{name || "匿名"}</p>
          </div>
          <div style={{
            position: 'absolute',
            left: anotherUserPosition[call.from]?.x || anotherUserPosition[callForm.watch('id')]?.x || 0,
            top: anotherUserPosition[call.from]?.y || anotherUserPosition[callForm.watch('id')]?.y || 0,
            width: '200px',
            height: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <video ref={remoteVideoRef} playsInline autoPlay width={200} />
            <p>{call.name || "匿名"}</p>
          </div>
        </div>
    </div>
  );
}

export default VoiceChat;
