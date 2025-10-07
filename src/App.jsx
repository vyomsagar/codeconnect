import { BrowserRouter, Route, Routes } from "react-router";
import "./App.css";
import Home from "./pages/Home";
import Editorpage from "./pages/Editorpage";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
    
    <div>
      <Toaster position="top-right" reverseOrder={false} toastOptions={{ duration: 3000, theme: { primary: "green", secondary: "black" } }} />
    </div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor/:roomID" element={<Editorpage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
