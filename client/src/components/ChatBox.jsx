import {useState, useEffect, useRef} from "react";
import { useDispatch, useSelector } from "react-redux";
import {Loader2Icon, Send, X} from "lucide-react";
import { dummyChats } from "../assets/assets.jsx";
import { clearChat } from "../app/features/chatSlice.js";
import {format} from "date-fns";

const ChatBox = () => {
    const dispatch = useDispatch();

    
    const { listing, isOpen, chatId } = useSelector((state) => state.chat);

    const user = { id: "user_2" };
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [chat, setChat] = useState(null);

    const fetchChat = async () => {
        const dummy = dummyChats[0];
        setChat(dummy);
        setMessages(dummy.messages);
        setIsLoading(false);
    };

    useEffect(() => {
        if (listing) {
            fetchChat();
        }
    }, [listing]);

    useEffect(() => {
        if (!isOpen) {
            setChat(null);
            setMessages([]);
            setIsLoading(true);
            setNewMessage("");
            setIsSending(false);
        }
    }, [isOpen]);

    const messagesEndRef =  useRef(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    },[messages.length])

    const handleSendMessage = async (e) => {
        e.preventDefault();

        // Prevent sending if message is empty OR already sending
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);

        // Add the message optimistically
        setMessages(prev => [
            ...prev,
            {
                id: Date.now(),
                chatId,
                sender_id: user.id,
                message: newMessage,
                createdAt: new Date(),
            }
        ]);

        setNewMessage("");

        // Simulate API call (replace with your real request)
        try {
            // await api.sendMessage(...)
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen || !listing) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-[100] flex items-center justify-center sm:p-4">
            <div className="bg-white sm:rounded-lg shadow-2xl w-full max-w-2xl h-screen sm:h-[600px] flex flex-col">

                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 text-white p-4 sm:rounded-t-lg flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-indigo-100 truncate">
                            {listing?.title}

                            <p className="text-sm text-indigo-100 truncate">
                                {user.id === listing?.ownerId
                                    ? `Chatting with buyer (${chat?.chatUser?.name || "loading..."})`
                                    : `Chatting with seller (${chat?.ownerUser?.name || "loading..."})`}
                            </p>
                        </h3>
                    </div>

                    <button
                        onClick={() => dispatch(clearChat())}
                        className="ml-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2Icon className="size-6 animate-spin text-indigo-600" />
                        </div>
                    ) : messages.length > 0 ? (
                        messages.map((message) => {
                            const isSender = message.sender_id === user.id;

                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`
                      max-w-[70%] rounded-lg p-3 pb-1
                      ${
                                            isSender
                                                ? "bg-indigo-600 text-white"
                                                : "bg-white border border-gray-200 text-gray-800"
                                        }
                    `}
                                    >
                                        <p className="text-sm break-words whitespace-pre-wrap">
                                            {message.message}
                                        </p>

                                        <p
                                            className={`
                        mt-1 text-xs
                        ${isSender ? "text-indigo-200" : "text-gray-500"}
                      `}
                                        >
                                            {format(new Date(message.createdAt),"MMM dd 'at' h:mm a")}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <p className="text-gray-500 mb-2">No messages yet</p>
                                <p className="text-sm text-gray-400">Start the conversation!</p>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef}/>
                </div>
                {/*chats*/}
                {
                    chat?.listing?.status === "active" ? (
                        <form onSubmit={handleSendMessage} className='p-4 bg-white border-t border-gray-200 rounded-b-lg'>

                        <div className='flex items-end space-x-2'>
        <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
                if(e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e)
                }
            }}
            placeholder='Type your message...'
            className='flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-indigo-500 max-h-32'
            rows={1}
        />
                                <button
                                    disabled={!newMessage.trim() || isSending}
                                    type='submit'
                                    className='bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-lg disabled:opacity-50 transition-colors'
                                >
                                    {isSending ? (
                                        <Loader2Icon className='w-5 h-5 animate-spin' />
                                    ) : (
                                        <Send className='w-5 h-5' />
                                    )}
                                </button>

                            </div>
                        </form>
                    ) : (
                        <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
                            <p>
                                {chat
                                    ? `Listing is ${chat.listing?.status}`
                                    : "Loading chat..."}
                            </p>
                        </div>
                    )
                }


            </div>
        </div>
    );
};

export default ChatBox;
