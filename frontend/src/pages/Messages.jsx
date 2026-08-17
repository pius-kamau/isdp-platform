import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Send, Search, ArrowLeft, MoreVertical, 
  Phone, Image, Loader2, MessageCircle,
  Users, CheckCheck, Clock, User, Bell, 
  BellOff, Trash2, AlertCircle, Flag,
  X, Volume2, VolumeX
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSocket, useSocketConnection } from '../context/SocketContext';

export default function Messages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const socket = useSocket();
  const isConnected = useSocketConnection();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [userId, setUserId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const menuRef = useRef(null);

  const API_URL = 'https://isdp-backend.onrender.com/api';

  console.log('🔌 Socket connected?', isConnected);
  console.log('📡 Socket instance:', socket);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Socket event listeners - WITH DEBUGGING
  useEffect(() => {
    if (!socket) {
      console.log('⚠️ Socket not available - skipping event listeners');
      return;
    }

    console.log('📡 Setting up socket event listeners...');

    // Listen for ALL messages (debug)
    socket.onAny((event, ...args) => {
      console.log('🔊 Socket event received:', event, args);
    });

    // Listen for new messages
    socket.on('receive_message', (data) => {
      console.log('📩 New message received via socket:', data);
      
      if (data.senderId !== userId) {
        toast.success(`📨 New message from ${data.senderName || 'Someone'}`);
      }
      
      // Update messages if in current chat
      if (selectedUser && data.senderId === selectedUser.id) {
        const newMsg = {
          id: data.messageId || Date.now(),
          messageText: data.content,
          senderId: data.senderId,
          receiverId: data.receiverId,
          createdAt: new Date().toISOString(),
          isOwn: false,
          status: 'delivered'
        };
        setMessages(prev => [...prev, newMsg]);
        
        // Send read receipt
        setTimeout(() => {
          if (socket) {
            socket.emit('message_read', {
              messageId: data.messageId,
              senderId: data.senderId
            });
            console.log('📤 Sent read receipt for message:', data.messageId);
          }
        }, 1000);
      }
      
      // Refresh conversations
      const token = localStorage.getItem('accessToken');
      fetchConversations(token);
    });

    // Listen for message status
    socket.on('message_status', (data) => {
      console.log('📊 Message status update:', data);
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId ? { ...msg, status: data.status } : msg
      ));
    });

    // Listen for read receipts
    socket.on('message_read', (data) => {
      console.log('👁️ Message read receipt received:', data);
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId ? { ...msg, status: 'read' } : msg
      ));
    });

    // Listen for online users
    socket.on('online_users', (users) => {
      console.log('👥 Online users update:', users);
      setOnlineUsers(users || []);
    });

    // Listen for typing status
    socket.on('user_typing', (data) => {
      console.log('⌨️ Typing status:', data);
      setTypingUsers(prev => ({
        ...prev,
        [data.userId]: data.isTyping
      }));
    });

    // Listen for connection events
    socket.on('connect', () => {
      console.log('✅ Socket connected (inside listener)');
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected (inside listener)');
    });

    return () => {
      console.log('🧹 Cleaning up socket listeners');
      socket.offAny();
      socket.off('receive_message');
      socket.off('message_status');
      socket.off('message_read');
      socket.off('online_users');
      socket.off('user_typing');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [socket, userId, selectedUser]);

  // Get user info on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    
    console.log('🔑 Token exists?', !!token);
    
    if (!token || !userStr) {
      console.log('❌ No token - redirecting to login');
      navigate('/login');
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      setUserId(user.id);
      setCurrentUser(user);
      console.log('✅ User ID set:', user.id);
      console.log('✅ Current user:', user.fullName);
      setIsLoading(false);
      
      fetchConversations(token);
      
      const userIdParam = searchParams.get('userId');
      if (userIdParam) {
        fetchUserDetails(userIdParam, token);
      }
    } catch (e) {
      console.error('Error parsing user:', e);
      navigate('/login');
    }
  }, []);

  const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No token');
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
    
    if (response.status === 401) {
      console.log('⚠️ 401 Unauthorized');
      if (window.location.pathname !== '/login') {
        navigate('/login');
      }
      throw new Error('Unauthorized');
    }
    
    return response;
  };

  const fetchConversations = async (token) => {
    try {
      setLoading(true);
      console.log('📡 Fetching conversations...');
      const response = await fetchWithAuth(`${API_URL}/messages/conversations`);
      const data = await response.json();
      console.log('📡 Conversations:', data);
      setConversations(data.data || []);
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
      if (error.message !== 'Unauthorized') {
        toast.error('Failed to load conversations');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId, token) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/users/${userId}`);
      const data = await response.json();
      setSelectedUser(data.data);
      fetchMessages(userId, token);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const fetchMessages = async (userId, token) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/messages/${userId}`);
      const data = await response.json();
      const messagesWithStatus = (data.data || []).map(msg => ({
        ...msg,
        status: msg.isRead ? 'read' : 'delivered'
      }));
      setMessages(messagesWithStatus);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const selectConversation = (user) => {
    setSelectedUser(user);
    const token = localStorage.getItem('accessToken');
    fetchMessages(user.id, token);
    setShowMenu(false);
    
    if (socket && user.id) {
      socket.emit('mark_read', { userId: user.id });
      console.log('📤 Marked messages as read for user:', user.id);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || sending) return;

    const messageContent = newMessage.trim();
    setSending(true);
    
    const tempId = Date.now();
    const tempMessage = {
      id: tempId,
      messageText: messageContent,
      senderId: userId,
      receiverId: selectedUser.id,
      createdAt: new Date().toISOString(),
      isOwn: true,
      status: 'sending'
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    
    setConversations(prev => {
      const updated = [...prev];
      const convIndex = updated.findIndex(c => 
        c.participants?.some(p => p.id === selectedUser.id)
      );
      if (convIndex !== -1) {
        const conv = updated[convIndex];
        if (!conv.messages) conv.messages = [];
        conv.messages.push({
          id: tempId,
          messageText: messageContent,
          senderId: userId,
          receiverId: selectedUser.id,
          createdAt: new Date().toISOString()
        });
        conv.lastMessage = messageContent;
        conv.lastMessageTime = new Date().toISOString();
        updated.splice(convIndex, 1);
        updated.unshift(conv);
      } else {
        updated.unshift({
          id: Date.now(),
          participants: [currentUser, selectedUser],
          messages: [{
            id: tempId,
            messageText: messageContent,
            senderId: userId,
            receiverId: selectedUser.id,
            createdAt: new Date().toISOString()
          }],
          lastMessage: messageContent,
          lastMessageTime: new Date().toISOString()
        });
      }
      return updated;
    });

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetchWithAuth(`${API_URL}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          receiverId: selectedUser.id,
          messageText: messageContent
        }),
      });
      const data = await response.json();

      const sentMessage = data.data;
      const realId = sentMessage.id || tempId;
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { 
          ...sentMessage, 
          id: realId,
          isOwn: true,
          status: 'sent' 
        } : msg
      ));
      
      // Send via WebSocket
      if (socket) {
        console.log('📤 Sending message via socket to:', selectedUser.id);
        socket.emit('send_message', {
          receiverId: selectedUser.id,
          content: messageContent,
          messageId: realId,
          senderName: currentUser?.fullName
        });
      } else {
        console.log('⚠️ Socket not available, message sent via REST only');
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, status: 'error' } : msg
      ));
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (socket && selectedUser) {
      socket.emit('typing', { 
        receiverId: selectedUser.id, 
        isTyping: true 
      });
      console.log('⌨️ Sent typing event to:', selectedUser.id);
      
      if (window.typingTimeout) {
        clearTimeout(window.typingTimeout);
      }
      
      window.typingTimeout = setTimeout(() => {
        if (socket && selectedUser) {
          socket.emit('typing', { 
            receiverId: selectedUser.id, 
            isTyping: false 
          });
        }
      }, 2000);
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  // ============ 3-DOT MENU ACTIONS ============

  const handleViewProfile = () => {
    if (selectedUser) {
      navigate(`/profile/${selectedUser.id}`);
      setShowMenu(false);
    }
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    toast.success(isMuted ? 'Notifications unmuted' : 'Notifications muted');
    setShowMenu(false);
  };

  const handleClearChat = () => {
    setShowClearConfirm(true);
    setShowMenu(false);
  };

  const confirmClearChat = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetchWithAuth(`${API_URL}/messages/clear/${selectedUser.id}`, {
        method: 'DELETE',
        body: JSON.stringify({ userId: userId })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Chat cleared from your side');
        setMessages([]);
        setShowClearConfirm(false);
        await fetchConversations(token);
      } else {
        toast.error(data.message || 'Failed to clear chat');
      }
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast.error('Failed to clear chat');
    }
  };

  const handleBlockUser = () => {
    toast.success('User blocked successfully');
    setShowMenu(false);
  };

  const handleReportUser = () => {
    toast.success('User reported. We will review this shortly.');
    setShowMenu(false);
  };

  // ============ UI HELPERS ============

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  // ============ AVATAR HELPER ============
  const renderAvatar = (user, size = 'md') => {
    const sizeClasses = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-lg',
    };
    const sizeClass = sizeClasses[size] || sizeClasses.md;
    
    if (user?.profilePhoto) {
      return (
        <img 
          src={user.profilePhoto} 
          alt={user.fullName || 'User'}
          className={`${sizeClass} rounded-full object-cover`}
        />
      );
    }
    
    return (
      <div className={`${sizeClass} rounded-full bg-gradient-to-br from-[#00B330] to-[#008A26] flex items-center justify-center text-white font-bold flex-shrink-0`}>
        {getInitials(user?.fullName)}
      </div>
    );
  };

  const renderMessageStatus = (message) => {
    if (!message.isOwn) return null;
    
    switch (message.status) {
      case 'sending':
        return <Clock className="w-3.5 h-3.5 text-gray-400" />;
      case 'sent':
        return <CheckCheck className="w-3.5 h-3.5 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3.5 h-3.5 text-[#00B330]" />;
      case 'read':
        return <CheckCheck className="w-3.5 h-3.5 text-[#00B330]" />;
      case 'error':
        return <XCircle className="w-3.5 h-3.5 text-red-500" />;
      default:
        return <CheckCheck className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.participants?.find(p => p.id !== userId);
    return otherUser?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // ============ RENDER ============

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#00B330] mx-auto" />
            <p className="mt-4 text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      <div className="flex-1">
        <div className="h-screen flex flex-col md:flex-row">
          {/* Conversations List */}
          <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#00B330]" />
                Messages
              </h1>
              <div className="flex items-center gap-2">
                {isConnected && (
                  <span className="text-xs text-green-500 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Live
                  </span>
                )}
                <span className="text-sm text-gray-400">{conversations.length}</span>
              </div>
            </div>

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
                  const isOnline = isUserOnline(otherUser.id);
                  const isTyping = typingUsers[otherUser.id];
                  
                  return (
                    <div
                      key={conv.id}
                      onClick={() => selectConversation(otherUser)}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 ${
                        selectedUser?.id === otherUser.id ? 'bg-[#00B330]/5' : ''
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        {renderAvatar(otherUser, 'lg')}
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 truncate">
                            {otherUser.fullName}
                            {isTyping && (
                              <span className="ml-2 text-xs text-[#00B330] animate-pulse">typing...</span>
                            )}
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
                <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between relative">
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
                      {renderAvatar(selectedUser, 'md')}
                      <div>
                        <h3 className="font-medium text-gray-900">{selectedUser.fullName}</h3>
                        <p className="text-xs flex items-center gap-1">
                          {isUserOnline(selectedUser.id) ? (
                            <span className="text-green-500 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                              Online
                            </span>
                          ) : (
                            <span className="text-gray-400">Offline</span>
                          )}
                          {typingUsers[selectedUser.id] && (
                            <span className="text-[#00B330] ml-1 animate-pulse">• typing...</span>
                          )}
                        </p>
                      </div>
                    </div>
                    {isMuted && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <VolumeX className="w-3 h-3" />
                        Muted
                      </span>
                    )}
                  </div>

                  {/* 3-Dot Menu */}
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {showMenu && (
                      <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 overflow-hidden">
                        <button
                          onClick={handleViewProfile}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-gray-400" />
                          View Profile
                        </button>

                        <button
                          onClick={handleToggleMute}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {isMuted ? (
                            <>
                              <Bell className="w-4 h-4 text-gray-400" />
                              Unmute Notifications
                            </>
                          ) : (
                            <>
                              <BellOff className="w-4 h-4 text-gray-400" />
                              Mute Notifications
                            </>
                          )}
                        </button>

                        <div className="border-t border-gray-100 my-1"></div>

                        <button
                          onClick={handleClearChat}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                          Clear Chat (My Side)
                        </button>

                        <button
                          onClick={handleBlockUser}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          Block User
                        </button>

                        <button
                          onClick={handleReportUser}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50 transition-colors"
                        >
                          <Flag className="w-4 h-4 text-orange-400" />
                          Report User
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Clear Chat Confirmation */}
                {showClearConfirm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Clear Chat?</h3>
                        <button
                          onClick={() => setShowClearConfirm(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-6">
                        This will clear messages from <strong>your side only</strong>. The other person will still see their messages.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowClearConfirm(false)}
                          className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={confirmClearChat}
                          className="flex-1 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Clear My Side
                        </button>
                      </div>
                    </div>
                  </div>
                )}

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
                                <div className="flex-shrink-0 mr-2">
                                  {renderAvatar(selectedUser, 'sm')}
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
                                    <span className="text-xs">
                                      {renderMessageStatus(msg)}
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
                      onChange={handleTyping}
                      placeholder={isMuted ? "Chat is muted" : "Type a message..."}
                      disabled={isMuted}
                      className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B330] disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending || isMuted}
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

    </div>
  );
}
