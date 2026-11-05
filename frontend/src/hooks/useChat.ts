'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export interface ChatMessage {
    type: 'chat_message' | 'ai_response' | 'ai_decision' | 'ai_response_chunk' | 'ai_partial';
    content: string;
    sender_id?: number | string;
    sender_name?: string;
    metadata?: any;
    analysis?: any;
}

export const useChat = (recipientId?: string | number) => {
    const accessTokenFromStore = useAuthStore((state) => state.accessToken);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectCountRef = useRef(0);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isConnectingRef = useRef(false);
    const mountedRef = useRef(true);

    const accessToken = accessTokenFromStore || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

    const buildWsUrl = useCallback((token: string | null): string => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const hostname = window.location.hostname;
        const port = window.location.port ? `:${window.location.port}` : '';

        // Use env var or derive from current location
        let wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL;

        if (!wsBaseUrl) {
            wsBaseUrl = `${protocol}//${hostname}${port}`;
        }

        // Remove trailing slash
        wsBaseUrl = wsBaseUrl.replace(/\/$/, '');

        // Next.js rewrites /ws/* to backend, so just use /chat/ (with trailing slash)
        return token
            ? `${wsBaseUrl}/ws/chat/?token=${encodeURIComponent(token)}`
            : `${wsBaseUrl}/ws/chat/`;
    }, []);

    const connect = useCallback(() => {
        // Prevent multiple simultaneous connections
        if (isConnectingRef.current || socketRef.current?.readyState === WebSocket.OPEN) {
            console.log('WebSocket: Already connected or connecting, skipping...');
            return;
        }

        if (!mountedRef.current) return;

        isConnectingRef.current = true;
        setConnectionError(null);

        try {
            const wsUrl = buildWsUrl(accessToken);
            console.log('WebSocket: Connecting to', wsUrl);

            const socket = new WebSocket(wsUrl);
            socketRef.current = socket;

            socket.onopen = () => {
                if (!mountedRef.current) {
                    socket.close();
                    return;
                }
                console.log('WebSocket: Connected successfully');
                isConnectingRef.current = false;
                setIsConnected(true);
                setConnectionError(null);
                reconnectCountRef.current = 0;
            };

            socket.onmessage = (event) => {
                if (!mountedRef.current) return;

                try {
                    const data = JSON.parse(event.data);

                    if (data.type === 'ai_response_chunk') {
                        setMessages((prev) => {
                            const lastMessage = prev[prev.length - 1];
                            if (lastMessage && (lastMessage.type === 'ai_response_chunk' || lastMessage.type === 'ai_partial')) {
                                return [...prev.slice(0, -1), {
                                    ...lastMessage,
                                    content: lastMessage.content + data.content,
                                    type: 'ai_partial' as any
                                }];
                            }
                            return [...prev, { ...data, type: 'ai_partial' as any }];
                        });
                    } else if (data.type === 'ai_response_complete') {
                        setMessages((prev) => {
                            const filtered = prev.filter(m => m.type !== 'ai_partial');
                            return [...filtered, {
                                type: 'ai_response' as any,
                                content: data.full_content,
                                sender_name: 'AI'
                            }];
                        });
                    } else {
                        setMessages((prev) => [...prev, data]);
                    }
                } catch (e) {
                    console.warn('WebSocket: Error parsing message', e);
                }
            };

            socket.onclose = (event) => {
                if (!mountedRef.current) return;

                console.log('WebSocket: Disconnected', event.code, event.reason);
                isConnectingRef.current = false;
                setIsConnected(false);
                socketRef.current = null;

                // Only reconnect if not a clean close and we haven't exceeded max retries
                if (event.code !== 1000 && reconnectCountRef.current < 5) {
                    const delay = Math.min(1000 * Math.pow(2, reconnectCountRef.current), 10000);
                    console.log(`WebSocket: Reconnecting in ${delay}ms (attempt ${reconnectCountRef.current + 1})`);

                    reconnectTimeoutRef.current = setTimeout(() => {
                        if (mountedRef.current) {
                            reconnectCountRef.current++;
                            connect();
                        }
                    }, delay);
                } else if (reconnectCountRef.current >= 5) {
                    setConnectionError('Maximum reconnection attempts reached. Please refresh the page.');
                }
            };

            socket.onerror = (event) => {
                console.warn('WebSocket: Connection error - server may be unreachable');
                // Don't set error for mock tokens - they're expected to fail
                // Only show error if we were previously connected
                if (accessToken && !accessToken.startsWith('mock-') && isConnected) {
                    setConnectionError('WebSocket connection failed. Please check your network.');
                }
                // Let onclose handle the actual cleanup
            };

        } catch (error) {
            console.warn('WebSocket: Failed to create connection', error);
            isConnectingRef.current = false;
            setConnectionError('Failed to establish WebSocket connection');
        }
    }, [accessToken, buildWsUrl]);

    // Initial connection
    useEffect(() => {
        mountedRef.current = true;

        if (accessToken) {
            connect();
        }

        return () => {
            mountedRef.current = false;
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (socketRef.current) {
                socketRef.current.onclose = () => { };
                socketRef.current.close(1000);
                socketRef.current = null;
            }
        };
    }, []);

    // Reconnect when token changes
    useEffect(() => {
        if (accessToken && !isConnected && !isConnectingRef.current) {
            console.log('WebSocket: Token changed, reconnecting...');
            connect();
        }
    }, [accessToken, isConnected, connect]);

    const sendMessage = useCallback((content: string, type: string = 'private_message') => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type,
                content,
                message: content,
                recipient_id: recipientId
            }));
            return true;
        }
        console.warn('WebSocket: Not connected, cannot send message');
        return false;
    }, [recipientId]);

    const sendPrescription = useCallback((data: { medications: any[], diagnosis: string }) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: 'send_prescription',
                patient_id: recipientId,
                medications: data.medications,
                diagnosis: data.diagnosis
            }));
            return true;
        }
        return false;
    }, [recipientId]);

    const triggerAnalysis = useCallback((conversationId: number) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: 'clinical_analysis',
                conversation_id: conversationId
            }));
            return true;
        }
        return false;
    }, []);

    const startConsultation = useCallback((appointmentId: number) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: 'start_consultation',
                appointment_id: appointmentId
            }));
            return true;
        }
        return false;
    }, []);

    const reconnect = useCallback(() => {
        reconnectCountRef.current = 0;
        if (socketRef.current) {
            socketRef.current.close(1000);
        }
        connect();
    }, [connect]);

    return {
        messages,
        isConnected,
        connectionError,
        sendMessage,
        sendPrescription,
        triggerAnalysis,
        startConsultation,
        setMessages,
        reconnect
    };
};
