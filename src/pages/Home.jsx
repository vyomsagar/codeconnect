import React, { useState } from 'react'
import toast from 'react-hot-toast';
import {v4 as uuidv4} from 'uuid';
import { useNavigate } from 'react-router-dom';

const Home = () => {

    const navigate = useNavigate();

    const [roomID, setRoomID] = useState("");
    const [username, setUsername] = useState("");

    const handleRoomId = (e) => {
        e.preventDefault();
        const newID = uuidv4();
        setRoomID(newID);
        toast.success("Created a new room");
    }

    const joinRoom = () => {
        if(!roomID || !username){
            toast.error("ROOM ID & username is required");
            return;
        }

        //redirect
        navigate(`/editor/${roomID}`, {
            state: {
                username,
            }
        })
    }

    const handleEnter = (e) => {
        if(e.code === "Enter"){
            joinRoom();
        }
    }

  return (
    <>
      <div className='w-full h-screen bg-gray-200 flex items-center justify-center flex-col'> 
        <div className='bg-blue-200 p-4 pb-0 '>
          <div className='w-[30%] h-[30%] mb-6 '>
            <img src="/codeconnect.png" alt="sorry server slow" className='w-full h-full object-cover'/>
          </div>
          <div className='flex flex-col gap-4'>
            <p>Paste invitation ROOM ID</p>
            <input type="text" onChange={(e) => setRoomID(e.target.value)} value={roomID} onKeyUp={handleEnter} placeholder='ROOM ID'  className='border border-gray-400 p-2 rounded-md w-120' />
            <input type="text" onChange={(e) => setUsername(e.target.value)} value={username} onKeyUp={handleEnter} placeholder='USERNAME' className='border border-gray-400 p-2 rounded-md w-120' />
            <button className='bg-green-400 w-30 ml-auto text-white p-2 rounded-md' onClick={joinRoom}>Join</button>
            <p className='text-center'>if you don't have an invite then create <span onClick={handleRoomId} className='text-green-700 underline underline-offset-2 hover:text-green-900 cursor-pointer'>New Room</span></p>
          </div>
        </div>
        <p className='mb-4 fixed bottom-4'>Built with ❤️ by <span className='text-green-700 underline underline-offset-2 hover:text-green-900 cursor-pointer'>Vyom Sagar</span></p>
       </div>
    </>
  )
}

export default Home
