import React from 'react'
import { Routes, Route } from 'react-router';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const {authUser,isLoggedIn, login} = useAuthStore();
  console.log("auth user: ", authUser);
  console.log("isloading: ", isLoggedIn);
  return (
    <div className="min-h-screen bg-slate-900 relative flex items-center justify-center overflow-hidden">
      <button onClick={login} className='z-10'>Login</button>
    <Routes>
      <Route path="/" element={<ChatPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
    </Routes>
    </div>
  )
}

export default App