import React, { use } from 'react'
import { useAuthStore } from '../store/useAuthStore';

function ChatPage() {
  const {logout} = useAuthStore();
  return (
    <div>ChatPage
      <button onClick={logout}>logout</button>
    </div>
  )
}

export default ChatPage