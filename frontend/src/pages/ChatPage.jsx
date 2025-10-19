import React, { use } from 'react'
import { useChatStore } from '../store/useChatStore.js';
import ProfileHeader from '../components/ProfileHeader.jsx';
import ActiveTabSwitch from '../components/ActiveTabSwitch.jsx';
import ChatsList from '../components/ChatsList.jsx';
import ContactList from '../components/ContactList.jsx';
import ChatContainer from '../components/ChatContainer.jsx';
import NoConversation from '../components/NoConversation.jsx';

function ChatPage() {
  const {activeTab, selectedUser} = useChatStore();

  return (
    <div className='relative w-full max-w-6xl h-[800px]'>
      {/* LEFT SIDE */}
      <div className="w-80 bg-slate-800/50 backdrop-blur-sm flex flex-col">
        <ProfileHeader />
        <ActiveTabSwitch />

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          { activeTab === "chats" ? <ChatsList /> : <ContactList /> }
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm">
        { selectedUser ? <ChatContainer /> : <NoConversation /> }
      </div>
    </div>
  )
}

export default ChatPage