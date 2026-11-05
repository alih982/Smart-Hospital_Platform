/**
 * AI Chat Service - Frontend WebSocket client for AI conversations
 * Optimized for production and development environments
 */
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface AIMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
    sources?: Array<{ content: string; similarity: number }>;
}

interface UseAIChatOptions {
    onMessage?: (message: AIMessage) => void;
    onConnected?: () => void;
    onDisconnected?: () => void;
    onError?: (error: Error) => void;
    enableRAG?: boolean;
}

export function useAIChat(options: UseAIChatOptions = {}) {
    const wsRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [messages, setMessages] = useState<AIMessage[]>([]);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isConnectingRef = useRef(false);
    const mountedRef = useRef(true);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    const buildWsUrl = useCallback((): string => {
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const hostname = window.location.hostname;
            const port = window.location.port ? `:${window.location.port}` : '';
            
            // Priority: env variable > derived from current location
            // In Docker/production, use API Gateway or direct AI service
            let wsBaseUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL;
            
            // If no env variable, try to derive from current location
            if (!wsBaseUrl) {
                // Try API gateway first
                wsBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws')?.replace('/v1', '');

                // If that doesn't work, use current host (same-origin)
                if (!wsBaseUrl) {
                    wsBaseUrl = `${protocol}//${hostname}${port}`;
                }
            }

            // Production fallback: if we're on maggicaihub.com frontend,
            // AI service is on a different Runflare domain
            if (hostname === 'maggicaihub.com' && !process.env.NEXT_PUBLIC_AI_SERVICE_URL) {
                wsBaseUrl = 'wss://magggicai-magicai.runflare.run';
            }
            
            wsBaseUrl = wsBaseUrl.replace(/\/$/, '');
            
            // Primary: Connect to API Gateway WebSocket (recommended for production)
            // Fallback: Direct AI service connection
            const gatewayWsUrl = `${wsBaseUrl}/ws/ai-chat`;
            const directWsUrl = `${protocol}//${hostname}:8001/ws/ai-chat`;
            
            console.log('AI Chat WebSocket URLs:', { gateway: gatewayWsUrl, direct: directWsUrl });
            
            // Use gateway URL - it's the most reliable in production
            return gatewayWsUrl;
        } catch (error) {
            console.warn('AI Chat WebSocket: Error building URL:', error);
            return 'ws://localhost:8001/ws/ai-chat';
        }
    }, []);

    const connect = useCallback(() => {
        if (isConnectingRef.current || wsRef.current?.readyState === WebSocket.OPEN) {
            console.log('AI Chat WebSocket: Already connected or connecting');
            return;
        }

        if (!mountedRef.current) return;

        // Check reconnect attempts
        if (reconnectAttempts.current >= maxReconnectAttempts) {
            setConnectionError('Maximum reconnection attempts reached. Please refresh the page.');
            return;
        }

        isConnectingRef.current = true;
        setConnectionError(null);

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        const wsUrl = buildWsUrl();
        console.log('AI Chat WebSocket: Connecting to', wsUrl);

        try {
            const socket = new WebSocket(wsUrl);
            wsRef.current = socket;

            socket.onopen = () => {
                if (!mountedRef.current) {
                    socket.close();
                    return;
                }
                console.log('AI Chat WebSocket: Connected');
                isConnectingRef.current = false;
                setIsConnected(true);
                setConnectionError(null);
                reconnectAttempts.current = 0;
                options.onConnected?.();
            };

            socket.onmessage = (event) => {
                if (!mountedRef.current) return;

                try {
                    const data = JSON.parse(event.data);
                    
                    if (data.type === 'chunk') {
                        setIsTyping(true);
                        setMessages(prev => {
                            const newMsgs = [...prev];
                            const lastMsg = newMsgs[newMsgs.length - 1];
                            if (lastMsg && lastMsg.role === 'assistant') {
                                lastMsg.content += data.content;
                            }
                            return newMsgs;
                        });
                    } else if (data.type === 'complete') {
                        setIsTyping(false);
                        setMessages(prev => {
                            const newMsgs = [...prev];
                            const lastMsg = newMsgs[newMsgs.length - 1];
                            if (lastMsg && lastMsg.role === 'assistant') {
                                lastMsg.content = data.full_content || lastMsg.content;
                            }
                            return newMsgs;
                        });
                        options.onMessage?.({
                            role: 'assistant',
                            content: data.full_content || '',
                        });
                    } else if (data.type === 'system') {
                        console.log('AI Chat System:', data.content);
                    } else if (data.type === 'error') {
                        setIsTyping(false);
                        setConnectionError(data.content);
                        options.onError?.(new Error(data.content));
                    } else if (data.type === 'pong') {
                        // Heartbeat response
                    }
                } catch (e) {
                    console.warn('AI Chat WebSocket: Error parsing message:', e);
                }
            };

            socket.onclose = (event) => {
                if (!mountedRef.current) return;
                
                console.log('AI Chat WebSocket: Closed', event.code, event.reason);
                isConnectingRef.current = false;
                setIsConnected(false);
                wsRef.current = null;
                options.onDisconnected?.();

                // Auto-reconnect on unexpected close
                if (event.code !== 1000) {
                    reconnectAttempts.current++;
                    const delay = Math.min(3000 * Math.pow(1.5, reconnectAttempts.current), 30000);
                    console.log(`AI Chat WebSocket: Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`);
                    
                    reconnectTimeoutRef.current = setTimeout(() => {
                        if (mountedRef.current) {
                            connect();
                        }
                    }, delay);
                }
            };

            socket.onerror = (event) => {
                console.warn('AI Chat WebSocket: Error', event);
                setConnectionError('AI Chat connection failed');
                options.onError?.(new Error('Connection failed'));
            };
        } catch (error) {
            console.warn('AI Chat WebSocket: Failed to initiate:', error);
            isConnectingRef.current = false;
            setConnectionError('Failed to establish connection');
        }
    }, [buildWsUrl, options]);

    // Initial connection
    useEffect(() => {
        mountedRef.current = true;
        
        const connectionTimeout = setTimeout(() => {
            connect();
        }, 1000);

        return () => {
            mountedRef.current = false;
            clearTimeout(connectionTimeout);
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close(1000);
                wsRef.current = null;
            }
        };
    }, []);

    const sendMessage = useCallback((content: string, enableRAG: boolean = false): boolean => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'chat',
                message: content,
                enable_rag: enableRAG || options.enableRAG || false,
            }));
            return true;
        }
        console.warn('AI Chat WebSocket: Not connected');
        return false;
    }, [options.enableRAG]);

    const sendChatMessage = useCallback((content: string) => {
        const userMessage: AIMessage = { 
            role: 'user', 
            content,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        
        // Add empty assistant message for streaming
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
        
        return sendMessage(content);
    }, [sendMessage]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        if (wsRef.current) {
            wsRef.current.close(1000);
            wsRef.current = null;
        }
    }, []);

    const reconnect = useCallback(() => {
        reconnectAttempts.current = 0;
        if (wsRef.current) {
            wsRef.current.close(1000);
        }
        connect();
    }, [connect]);

    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    return {
        isConnected,
        isTyping,
        connectionError,
        messages,
        sendMessage: sendChatMessage,
        disconnect,
        reconnect,
        clearMessages,
    };
}

export default useAIChat;
