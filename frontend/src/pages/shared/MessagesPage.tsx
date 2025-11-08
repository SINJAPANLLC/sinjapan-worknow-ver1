import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { messagesAPI } from '../../lib/api';
import type { Conversation, Message } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { Send, ArrowLeft, User, MessageCircle, Sparkles, Zap, Flame, UserCircle } from 'lucide-react';
import { BottomNav } from '../../components/layout/BottomNav';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function MessagesPage() {
  const { user } = useAuthStore();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const queryClient = useQueryClient();

  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: messagesAPI.getConversations,
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: () => messagesAPI.getConversationMessages(selectedConversation!.id),
    enabled: !!selectedConversation,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data: { receiver_id: string; content: string }) =>
      messagesAPI.sendMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation?.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setMessageText('');
    },
  });

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    const receiverId = selectedConversation.other_user_id || 
                       (selectedConversation.participant_1_id === user?.id 
                         ? selectedConversation.participant_2_id 
                         : selectedConversation.participant_1_id);

    sendMessageMutation.mutate({
      receiver_id: receiverId,
      content: messageText.trim(),
    });
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ja });
    } catch {
      return '';
    }
  };

  if (selectedConversation) {
    return (
      <div className="flex flex-col h-screen bg-white pt-16 pb-24">
        <div className="bg-gradient-to-r from-[#00CED1] to-[#009999] text-white px-4 py-4 shadow-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedConversation(null)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h2 className="font-bold text-lg">{selectedConversation.other_user_name || '名前未設定'}</h2>
              <p className="text-xs text-white/80">オンライン</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
          {messagesLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00CED1]" />
            </div>
          ) : (
            <div className="space-y-3">
              {messages?.map((message: Message) => {
                const isSender = message.sender_id === user?.id;
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] ${isSender ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          isSender
                            ? 'bg-gradient-to-r from-[#00CED1] to-[#009999] text-white'
                            : 'bg-white text-gray-900 shadow-sm border border-gray-100'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 px-2">
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="メッセージを入力..."
              className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00CED1] focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
              className="w-12 h-12 bg-gradient-to-r from-[#00CED1] to-[#009999] text-white rounded-full flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        <BottomNav
          items={[
            { label: 'さがす', path: '/jobs', icon: Sparkles },
            { label: 'はたらく', path: '/applications', icon: Zap },
            { label: 'Now', path: '/dashboard', icon: Flame },
            { label: 'メッセージ', path: '/messages', icon: MessageCircle },
            { label: 'マイページ', path: '/profile', icon: UserCircle },
          ]}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 pt-16">
      <div className="bg-gradient-to-r from-[#00CED1] to-[#009999] text-white px-6 py-6 shadow-lg">
        <h1 className="text-2xl font-bold">メッセージ</h1>
        <p className="text-sm text-white/80 mt-1">チャットで連絡を取りましょう</p>
      </div>

      <div className="px-4 py-4">
        {conversationsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00CED1]" />
          </div>
        ) : conversations && conversations.length > 0 ? (
          <div className="space-y-2">
            {conversations.map((conversation: Conversation) => (
              <motion.div
                key={conversation.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedConversation(conversation)}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00CED1] to-[#009999] rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-gray-900 truncate">
                        {conversation.other_user_name || '名前未設定'}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatTime(conversation.last_message_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.last_message || 'メッセージがありません'}
                    </p>
                  </div>
                  {conversation.unread_count && conversation.unread_count > 0 && (
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-white font-bold">
                        {conversation.unread_count}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-[#00CED1]/20 to-[#009999]/20 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-[#00CED1]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">メッセージはまだありません</h3>
            <p className="text-sm text-gray-600 text-center">
              仕事に応募すると、企業とメッセージができます
            </p>
          </div>
        )}
      </div>

      <BottomNav
        items={[
          { label: 'さがす', path: '/jobs', icon: Sparkles },
          { label: 'はたらく', path: '/applications', icon: Zap },
          { label: 'Now', path: '/dashboard', icon: Flame },
          { label: 'メッセージ', path: '/messages', icon: MessageCircle },
          { label: 'マイページ', path: '/profile', icon: UserCircle },
        ]}
      />
    </div>
  );
}
