import React, { useEffect, useRef, useState } from 'react';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import { ACTION } from '../../Actions';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const Editorpage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const reactNavigate = useNavigate();
  const { roomID } = useParams();
  const location = useLocation(); // ✅ Call once here, not inside emit

  const [clients, setClients] = useState([]);

  useEffect(() => {
     let isMounted = false;

  const init = async () => {
    if (isMounted) return; // 👈 Prevent duplicate init
    isMounted = true;
      socketRef.current = await initSocket();

      const handleErrors = (err) => {
        console.error('Socket error:', err);
        toast.error('Socket connection failed, try again later.');
        reactNavigate('/');
      };

      socketRef.current.on('connect_error', handleErrors);
      socketRef.current.on('connect_failed', handleErrors);

      // ✅ Emit JOIN with real data
      socketRef.current.emit(ACTION.JOIN, {
        roomID,
        username: location.state?.username,
      });

      // ✅ Listen for JOINED event
     socketRef.current.on(ACTION.JOINED, ({ clients, username, socketID }) => {
  setClients(clients);

  if (username !== location.state?.username) {
    toast.success(`${username} joined the room.`);
    // Send your current code to the new user
    if (codeRef.current) {
      socketRef.current.emit(ACTION.SYNC_CODE, {
        socketID,
        code: codeRef.current,
      });
    }
  }
});




      socketRef.current.on(ACTION.DISCONNECTED, ({ socketID, username }) => {
        toast.success(`${username} left the room.`);
        console.log(`${username} left the room.`);
        setClients((prev) => prev.filter((client) => client.socketID !== socketID));
      });
    };

    init();

    // Cleanup
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      socketRef.current.off(ACTION.JOINED);
      socketRef.current.off(ACTION.DISCONNECTED);
      isMounted = false; // 👈 Reset for future mounts
    };
  }, [roomID, location.state, reactNavigate]);

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomID);
      toast.success('Room ID has been copied to your clipboard');
    } catch {
      toast.error('Failed to copy Room ID');
    }
  }

  function leaveRoom() {
    reactNavigate('/');
  }

  if (!location.state) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen flex-col bg-gray-800 text-white md:flex-row">
      <div className="w-[30%] h-[100%] bg-gray-900 flex flex-col justify-between p-4">
        <div>
          <div className="w-[70%] m-auto">
            <img src="/codeconnect.png" alt="logo" />
          </div>
          <div className="w-[90%] h-[2px] bg-gray-200 m-auto mb-6"></div>
          <h3>Connected</h3>
          <div className="flex gap-4 m-4 flex-wrap">
            {clients.map((client) => (
              <Client key={client.socketID} username={client.username} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <button onClick={copyRoomId} className="bg-green-700 text-xl font-bold p-4 rounded-xl hover:bg-green-800">
            Copy RoomID
          </button>
          <button onClick={leaveRoom} className="text-xl p-2 font-bold rounded-xl hover:bg-gray-800">
            Leave
          </button>
        </div>
      </div>
      <div>
       {socketRef.current && <Editor socketRef={socketRef} roomID={roomID} oncodeChange={(code) => {codeRef.current = code}}/>}


      </div>
    </div>
  );
};

export default Editorpage;
