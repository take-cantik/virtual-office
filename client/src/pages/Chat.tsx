import { useEffect, useState } from 'react';
import { socket } from '../infra/socket';
import { useForm } from 'react-hook-form';

type MessageReq = {
  message: string;
}

function Chat() {
  const [isConnected, setConnected] = useState<boolean>(socket.connected);
  const [messageList, setMessageList] = useState<string[]>([]);
  const { register, getValues, handleSubmit, reset } = useForm<MessageReq>({
    defaultValues: {
      message: '',
    },
  });

  const submit = () => {
    console.log(getValues('message'));
    socket.emit('sendMessage', getValues('message'));
    reset();
  };

  useEffect(() => {
    socket.on('connect', () => {
      setConnected(socket.connected);
    });
    socket.on('chat', (message: string) => {
      setMessageList((prev) => [...prev, message]);
    });
  }, []);

  return (
    <div>
      {isConnected ? 'Connected' : 'Disconnected'}
      <form onSubmit={handleSubmit(submit)}>
        <label>
          メッセージ
          <input {...register('message', { required: '必須項目です。' })} placeholder="メッセージを入力" />
        </label>
        <button type="submit">送信</button>
      </form>
      <ul>
        {messageList.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  )
}

export default Chat;
