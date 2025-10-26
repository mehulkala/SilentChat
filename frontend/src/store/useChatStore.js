import { react } from "react";
import {create} from "zustand";
import {axiosInstance} from "../lib/axios.js";
import { toast } from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    allContacts: [],
    chats: [],
    messages:[],
    activeTab: "chats",
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isSoundEnabled: localStorage.getItem("isSoundEnabled") === "true",

    toggleSound: () => {
    const next = !get().isSoundEnabled;
    localStorage.setItem("isSoundEnabled", JSON.stringify(next));
    set({ isSoundEnabled: next });
    },

    setActiveTab: (tab) => set({activeTab: tab}),
    setSelectedUser: (selectedUser) => set({selectedUser}),

    getAllContacts: async () =>{
        set({isUsersLoading: true});
        try {
            const res = await axiosInstance.get("/messages/contacts");
            set({allContacts: res.data})
        } catch (error) {
            toast.error(error.response.data.message);
        } finally{
            set({isUsersLoading: false});
        }
    },
    getMyChatPartners: async () =>{
        set({isUsersLoading: true});
        try {
            const res = await axiosInstance.get("/messages/chats");
            set({chats: res.data})
        } catch (error) {
            toast.error(error.response.data.message);
        } finally{
            set({isUsersLoading: false});
        }
    },
    getMessagesByUserId: async (userId) =>{
        set({isMessagesLoading: true});
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({messages: res.data})
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to load messages");
        } finally{
            set({isMessagesLoading: false});
        }
    },
    sendMessage: async (messageData) =>{
        const { messages, selectedUser } = get();
        const {authUser} = useAuthStore.getState()
        const tempId = `temp-${Date.now()}`;

        //optimistic UI update
        const optimisticMessage = {
            _id: tempId,
            senderId: authUser._id,
            receiverId: selectedUser._id,
            text: messageData.text,
            image: messageData.image,
            createdAt: new Date().toISOString(),
            isOptimistic: true,
        }
        set({messages: [...messages, optimisticMessage]});

        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({messages: [...messages, res.data]});
        } catch (error) {
            set({messages: messages}) //removing optimistic message on failure
            toast.error(error.response?.data?.message || "Failed to send message");
        }
    },
}));