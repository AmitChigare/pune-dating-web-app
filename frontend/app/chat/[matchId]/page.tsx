"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { chatService } from '@/services/chat';
import { matchService } from '@/services/matches';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useMatchStore } from '@/store/useMatchStore';
import { getImageUrl } from '@/utils/imageUrl';
import Link from 'next/link';
import { ChatBubble } from '@/components/ChatBubble';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

export default function ChatPage({ params }: { params: { matchId: string } }) {
    const { user } = useAuth(true);
    const router = useRouter();
    const [inputText, setInputText] = useState('');

    const { matches, chatMessages, setChatMessages, markMatchUnread } = useMatchStore();
    const { sendMessage } = useWebSocket(params.matchId);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const match = matches.find((m) => m.id === params.matchId);
    const peerName = match?.peer_profile?.first_name || 'Match User';
    const activePhoto = match?.peer_profile?.photos?.find(p => p.is_primary) || match?.peer_profile?.photos?.[0];
    const photo = getImageUrl(activePhoto?.url);
    const peerId = match?.user1_id === user?.id ? match?.user2_id : match?.user1_id;

    const messages = chatMessages[params.matchId] || [];

    const handleBlock = async () => {
        if (!peerId) return;
        if (confirm(`Are you sure you want to block ${peerName}? This will permanently remove them from your matches and block all future messages.`)) {
            try {
                await matchService.blockUser(peerId);
                router.push('/discover');
            } catch (err) {
                console.error("Failed to block user", err);
                alert("Could not block the user. Please try again later.");
            }
        }
    };

    useEffect(() => {
        // Clear unread status
        markMatchUnread(params.matchId, false);

        // Initial fetch of message history
        const fetchHistory = async () => {
            try {
                const history = await chatService.getMessages(params.matchId, 0, 100);
                // Backend typically returns desc (newest first). Let's store them that way
                setChatMessages(params.matchId, history);
            } catch (err) {
                console.error("Failed to load history", err);
            }
        };
        fetchHistory();
    }, [params.matchId, setChatMessages]);

    useEffect(() => {
        // Scroll to bottom when messages update
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;
        sendMessage(inputText.trim());
        setInputText('');
    };

    return (
        <div className="h-[100dvh] flex flex-col bg-white max-w-md mx-auto relative md:border-x md:border-border shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-white sticky top-0 z-10">
                <div className="flex items-center">
                    <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
                        <ArrowLeft size={24} className="text-accent" />
                    </button>
                    {peerId ? (
                        <Link href={`/profile/${peerId}`} className="ml-2 flex items-center group cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden ml-2">
                                <img src={photo} alt={peerName} className="w-full h-full object-cover group-hover:opacity-90 transition" />
                            </div>
                            <h2 className="ml-3 font-semibold text-lg group-hover:underline text-gray-800">{peerName}</h2>
                        </Link>
                    ) : (
                        <div className="ml-2 flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden ml-2">
                                <img src={photo} alt={peerName} className="w-full h-full object-cover" />
                            </div>
                            <h2 className="ml-3 font-semibold text-lg">{peerName}</h2>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleBlock}
                    className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition text-sm font-medium border border-transparent hover:border-red-200"
                    title="Block User"
                >
                    Block
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse bg-gray-50/30">
                <div ref={messagesEndRef} />
                {/* Render ascending since array is descending (newest at index 0) */}
                {messages.map((msg) => (
                    <ChatBubble key={msg.id} message={msg} isMe={msg.sender_id === user?.id} />
                ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-border mt-auto">
                <form onSubmit={handleSend} className="flex space-x-2">
                    <Input
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Send a message..."
                        className="flex-1 border-2 border-border rounded-full px-4 h-12 focus-visible:border-accent"
                    />
                    <Button type="submit" className="rounded-full w-12 h-12 p-0 flex items-center justify-center shrink-0">
                        <Send size={18} className="translate-x-[1px]" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
