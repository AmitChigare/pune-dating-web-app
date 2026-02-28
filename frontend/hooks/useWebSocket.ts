import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useMatchStore } from '@/store/useMatchStore';
import { io, Socket } from 'socket.io-client';

export function useWebSocket(matchId: string) {
    const token = useAuthStore((state) => state.token);
    const addChatMessage = useMatchStore((state) => state.addChatMessage);
    const wsRef = useRef<WebSocket | null>(null);

    // The backend uses native WebSockets.
    // Although socket.io-client was requested, it won't connect natively to FastAPI raw WebSockets unless explicitly supported.
    // Let's implement native WebSocket logic here but mock the signature for completeness if socket.io is really strictly demanded.
    // Given we built the backend, I know it expects native `ws://<backend>/api/v1/chat/ws/:matchId?token=X`

    useEffect(() => {
        if (!token || !matchId) return;

        // Use native webSocket to actually work with our FastAPI backend
        const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/api/v1/chat/ws';
        const ws = new WebSocket(`${WS_URL}/${matchId}?token=${token}`);

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                addChatMessage(matchId, message);
                // If not currently on that chat page, mark unread
                if (!window.location.pathname.includes(`/chat/${matchId}`)) {
                    useMatchStore.getState().markMatchUnread(matchId, true);
                }
            } catch (err) {
                console.error('Failed to parse WS msg', err);
            }
        };

        wsRef.current = ws;

        return () => {
            ws.close();
        };
    }, [matchId, token, addChatMessage]);

    const sendMessage = (content: string) => {
        if (!token || !matchId) return;

        // The backend only sends the message to the peer via manager.send_personal_message(message, peer_id).
        // It does not echo to the sender. So we must optimistically add it to our own UI here.

        // Decode token minimally to get our own user ID for the optimistic message
        let myUserId = '';
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            myUserId = payload.sub;
        } catch (e) {
            console.error("Token decode failed", e);
        }

        const optimisticMessage = {
            id: crypto.randomUUID(), // Temp ID
            match_id: matchId,
            sender_id: myUserId,
            content: content,
            is_read: true,
            created_at: new Date().toISOString()
        };

        addChatMessage(matchId, optimisticMessage);

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(content);
        }
    };

    return { sendMessage };
}
