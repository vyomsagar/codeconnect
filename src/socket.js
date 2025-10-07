import { io } from "socket.io-client";

 const initSocket = async () => {
    const option = {
        'force new connection': true,
        reconnectionAttempts: "Infinity",
        timeout: 10000,
        transports: ["websocket"]
    };
    const backendurl = import.meta.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
    console.log("Backend URL:", backendurl);
    return io(backendurl, option);

}

export { initSocket };