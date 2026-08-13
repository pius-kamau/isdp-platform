import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Send, Search, User, ArrowLeft, MoreVertical, 
  Phone, Video, Image, Smile, Paperclip,
  CheckCheck, Clock, Loader2, MessageCircle,
  Users, Star, MapPin, ChevronRight
} from 'lucide-react';
import apiClient from '../services/auth.service';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import toast from 'react-hot-toast';

export default function Messages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);

  const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id;

  useEffect(() => {
    fetchCurrentUser();
    fetchConversations();
    
    // Check if there's a userId in URL params (from profile page)
    const userIdParam = searchParams.get('userId');
    if (userIdParam) {
      fetchUserDetails(userIdParam);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const response = await apiClient.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await apiClient.get('/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setConversations(response.data.data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiClient.get(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedUser(response.data.data);
      fetchMessages(userId);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('User not found');
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiClient.get(`/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const selectConversation = (user) => {
    setSelectedUser(user);
    fetchMessages(user.id);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || sending) return;

    setSending(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await apiClient.post('/messages', {
        receiverId: selectedUser.id,
        messageText: newMessage.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Add message to the list
      setMessages(prev => [...prev, response.data.data]);
      setNewMessage('');
      inputRef.current?.focus();
      
      // Update conversation list
      await fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 86400000) { // Today
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 172800000) { // Yesterday
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getLastMessage = (conversation) => {
    if (conversation.messages && conversation.messages.length > 0) {
      return conversation.messages[conversation.messages.length - 1];
    }
    return null;
  };

  const isOwnMessage = (message) => {
    return message.senderId === userId;
  };

  const getInitials = (name) => {
    return name?.charAt(0) || 'U';
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.participants?.find(p => p.id !== userId);
    return otherUser?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
        <Sidebar />
        <div className="flex-1 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#00B330] mx-auto" />
            <p className="mt-4 text-gray-500">Loading conversations...</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        <div className="h-screen flex flex-col md:flex-row">
          {/* Conversations List */}
          <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#00B330]" />
                Messages
              </h1>
              <span className="text-sm text-gray-400">{conversations.length}</span>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B330]"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <MessageCircle className="w-16 h-16 text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900">No messages yet</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Start a conversation by connecting with someone
                  </p>
                  <button
                    onClick={() => navigate('/discover')}
                    className="mt-4 px-6 py-2 bg-[#00B330] text-white rounded-xl text-sm font-medium hover:bg-[#009f2b] transition-colors"
                  >
                    Find People
                  </button>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const otherUser = conv.participants?.find(p => p.id !== userId);
                  if (!otherUser) return null;
                  
                  const lastMsg = getLastMessage(conv);
                  
                  return (
                    <div
                      key={conv.id}
                      onClick={() => selectConversation(otherUser)}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 ${
                        selectedUser?.id === otherUser.id ? 'bg-[#00B330]/5' : ''
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        {otherUser.profilePhoto ? (
                          <img 
                            src={otherUser.profilePhoto} 
                            alt={otherUser.fullName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00B330] to-[#008A26] flex items-center justify-center text-white font-bold text-lg">
                            {getInitials(otherUser.fullName)}
                          </div>
                        )}
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 truncate">
                            {otherUser.fullName}
                          </h4>
                          {lastMsg && (
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {formatTime(lastMsg.createdAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500 truncate">
                            {lastMsg ? (
                              isOwnMessage(lastMsg) ? (
                                <span className="text-gray-400">You: {lastMsg.messageText}</span>
                              ) : (
                                lastMsg.messageText
                              )
                            ) : (
                              'No messages yet'
                            )}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="flex-shrink-0 w-5 h-5 bg-[#00B330] text-white text-xs rounded-full flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className={`flex-1 flex flex-col bg-gray-50 ${selectedUser ? 'flex' : 'hidden md:flex'}`}>
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="md:hidden p-1 hover:bg-gray-100 rounded-lg"
                    >
                      <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div 
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => navigate(`/profile/${selectedUser.id}`)}
                    >
                      {selectedUser.profilePhoto ? (
                        <img 
                          src={selectedUser.profilePhoto} 
                          alt={selectedUser.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00B330] to-[#008A26] flex items-center justify-center text-white font-bold text-sm">
                          {getInitials(selectedUser.fullName)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900">{selectedUser.fullName}</h3>
                        <p className="text-xs text-green-500 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          Online
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageCircle className="w-16 h-16 text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900">No messages yet</h3>
                      <p className="text-sm text-gray-500">Start the conversation</p>
                    </div>
                  ) : (
                    <>
                      {/* Date divider for first message */}
                      {messages.length > 0 && (
                        <div className="text-center">
                          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                            {formatDate(messages[0]?.createdAt)}
                          </span>
                        </div>
                      )}
                      
                      {messages.map((msg, index) => {
                        const isOwn = isOwnMessage(msg);
                        const showDate = index > 0 && 
                          new Date(msg.createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString();
                        
                        return (
                          <div key={msg.id}>
                            {showDate && (
                              <div className="text-center my-4">
                                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                  {formatDate(msg.createdAt)}
                                </span>
                              </div>
                            )}
                            <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                              {!isOwn && (
                                <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 mr-2">
                                  {selectedUser.profilePhoto ? (
                                    <img 
                                      src={selectedUser.profilePhoto} 
                                      alt={selectedUser.fullName}
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00B330] to-[#008A26] flex items-center justify-center text-white font-bold text-xs">
                                      {getInitials(selectedUser.fullName)}
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className={`max-w-[70%] ${isOwn ? 'order-1' : ''}`}>
                                <div className={`px-4 py-2.5 rounded-2xl ${
                                  isOwn 
                                    ? 'bg-[#00B330] text-white rounded-br-none' 
                                    : 'bg-white text-gray-900 rounded-bl-none shadow-sm'
                                }`}>
                                  <p className="text-sm leading-relaxed break-words">{msg.messageText}</p>
                                </div>
                                <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                  <span className="text-xs text-gray-400">
                                    {formatTime(msg.createdAt)}
                                  </span>
                                  {isOwn && (
                                    <span className="text-xs text-[#00B330]">
                                      <CheckCheck className="w-3.5 h-3.5" />
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Message Input */}
                <div className="bg-white border-t border-gray-200 p-3">
                  <form onSubmit={sendMessage} className="flex items-center gap-2">
                    <button
                      type="button"
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <Image className="w-5 h-5" />
                    </button>
                    <input
                      ref={inputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B330]"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="p-2.5 bg-[#00B330] text-white rounded-xl hover:bg-[#009f2b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 bg-[#00B330]/10 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-12 h-12 text-[#00B330]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Your Messages</h3>
                <p className="text-gray-500 mt-1 max-w-sm">
                  Select a conversation from the sidebar to start chatting
                </p>
                <button
                  onClick={() => navigate('/discover')}
                  className="mt-4 px-6 py-2 bg-[#00B330] text-white rounded-xl text-sm font-medium hover:bg-[#009f2b] transition-colors flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Find People to Chat With
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
