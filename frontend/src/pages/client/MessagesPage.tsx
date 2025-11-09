import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { slideUp, fadeIn } from '../../utils/animations';
import {
  MessageCircle,
  Send,
  Search,
  User,
  ArrowLeft,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: number;
  conversation_id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
}

interface Conversation {
  id: number;
  participant_1_id: string;
  participant_2_id: string;
  other_user_name?: string;
  other_user_id?: string;
  last_message?: string;
  last_message_at: string;
  unread_count?: number;
}

export default function MessagesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await fetch('/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch conversations');
      return response.json();
    },
    refetchInterval: 5000,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedConversationId],
    queryFn: async () => {
      if (!selectedConversationId) return [];
      const response = await fetch(`/api/messages/conversations/${selectedConversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    enabled: !!selectedConversationId,
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: async (data: { receiver_id: string; content: string }) => {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversationId] });
      setMessageInput('');
    },
  });

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversationId) return;
    
    const selectedConversation = conversations.find((c: Conversation) => c.id === selectedConversationId);
    if (!selectedConversation) return;

    sendMutation.mutate({
      receiver_id: selectedConversation.other_user_id!,
      content: messageInput,
    });
  };

  const filteredConversations = conversations.filter((conv: Conversation) =>
    conv.other_user_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConversation = conversations.find((c: Conversation) => c.id === selectedConversationId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00CED1] via-[#00B4B4] to-[#009999] pb-24 pt-28">
      <div className="container mx-auto px-4 max-w-7xl h-[calc(100vh-8rem)]">
        {/* Header */}
        <motion.div {...fadeIn} className="mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-4xl font-bold text-white">メッセージ</h1>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 h-[calc(100%-6rem)]">
          {/* Conversations List */}
          <motion.div {...slideUp} className="md:col-span-1">
            <Card className="h-full flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="会話を検索..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {conversationsLoading ? (
                  <div className="p-4 text-center text-gray-500">読み込み中...</div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>会話がありません</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation: Conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversationId(conversation.id)}
                      className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        selectedConversationId === conversation.id ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white flex-shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {conversation.other_user_name || '不明なユーザー'}
                            </h3>
                            {conversation.unread_count! > 0 && (
                              <Badge variant="danger" size="sm">
                                {conversation.unread_count}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.last_message || 'メッセージがありません'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(conversation.last_message_at).toLocaleString('ja-JP')}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </Card>
          </motion.div>

          {/* Messages View */}
          <motion.div {...slideUp} transition={{ delay: 0.1 }} className="md:col-span-2">
            <Card className="h-full flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedConversation.other_user_name || '不明なユーザー'}
                        </h3>
                        <p className="text-xs text-gray-500">クライアント</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message: Message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === selectedConversation.other_user_id
                            ? 'justify-start'
                            : 'justify-end'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            message.sender_id === selectedConversation.other_user_id
                              ? 'bg-gray-100 text-gray-900'
                              : 'bg-gradient-to-r from-primary to-primary-dark text-white'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 opacity-70" />
                            <p className="text-xs opacity-70">
                              {new Date(message.created_at).toLocaleTimeString('ja-JP', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="メッセージを入力..."
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || sendMutation.isPending}
                        className="px-6"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4" />
                    <p>会話を選択してください</p>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
