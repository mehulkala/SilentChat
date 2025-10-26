import {create} from "zustand";
import {axiosInstance} from "../lib/axios.js"
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create((set, get)=>({
    authUser: null,
    isCheckingAuth: true,
    isSigningup: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    socket: null,
    onlineUsers: [],

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({authUser: res.data});
            get().connectSocket();
        }catch(error){
            console.log("Error in authCheck: ", error);
            set({authUser: null});
        } finally{
            set({isCheckingAuth: false});
        }
    },

    signup: async(data)=>{
        set({isSigningup: true})
        try {
            const res = await axiosInstance.post("/auth/signup", data)
            set({authUser: res.data})

            toast.success("Signup successful!")

            get().connectSocket()
        } catch (error) {
            toast.error(error.response.data.message || "Signup failed. Please try again.")
        } finally{
            set({isSigningup: false})
        }
    },

    login: async(data)=>{
        set({isLoggingIn: true})
        try {
            const res = await axiosInstance.post("/auth/login", data)
            set({authUser: res.data})

            toast.success("Logged in successfully")
            get().connectSocket()
        } catch (error) {
            toast.error(error.response.data.message)
        } finally{
            set({isLoggingIn: false})
        }
    },

    logout: async()=>{
        try {
            await axiosInstance.post("/auth/logout")
            set({authUser: null})
            toast.success("Logged out successfully")
            get().disconnectSocket();
        } catch (error) {
            toast.error(error.response.data.message)
        }
    },

    updateProfile: async(data)=>{
        set({isUpdatingProfile: true})
        try {
            const res = await axiosInstance.put("/auth/update-profile", data)
            set({authUser: res.data})
            toast.success("Profile updated successfully")
        }catch (error) {
            console.log("Error updating profile: ", error)
            toast.error(error.response.data.message)
        } finally{
            set({isUpdatingProfile: false})
        }
    },

    connectSocket: () => {
        const {authUser} = get()
        if(!authUser || get().socket?.connected) return

        const socket = io(BASE_URL, {
            withCredentials:true
        })

        socket.connect()

        set({socket})

        // listen for online users events
        socket.on("getOnlineUsers", (userIds)=>{
            set({onlineUsers: userIds});
        });
    },

    disconnectSocket: () =>{
        if(get().socket?.connected) get().socket.disconnect()
    }
}))