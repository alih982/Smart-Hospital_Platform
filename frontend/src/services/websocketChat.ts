'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export type MessageType =
  | 'private_message'
  | 'ai_chat'
  | 'send_prescription'
  | 'finish_session'
  | 'clinical_analysis'
  | 'start_consultation';

export interface ChatMessage {
  type: 'chat_message' | 'ai_response_chunk' | 'ai_response_complete' | 'ai_sources' | 'ai_decision' | 'prescription' | 'system_message' | 'error';
  content: string;
  sources?: Array<{ content: string; similarity: number }>;
  message_id?: number;
  sender_id: number | string;
  sender_name: string;
  metadata?: {
    type?: string;
    prescription_id?: string;
    pdf_url?: string;
    checkout_url?: string;
    appointment_id?: string;
    conversation_id?: string;
  };
  full_content?: string;
  analysis?: string;
}

interface UseWebSocketOptions {
  onMessage?: (message: ChatMessage) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
}

export function useWebSocketChat(options: UseWebSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);
  const mountedRef = useRef(true);
  const reconnectCountRef = useRef(0);

  const buildWsUrl = useCallback((): string => {
    try {
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

      // Next.js rewrites /ws/* to backend, so use /ws/chat/ (with trailing slash)
      const finalUrl = `${wsBaseUrl}/ws/chat/`;

      console.log('WebSocket: Built URL:', finalUrl);
      return finalUrl;
    } catch (error) {
      console.warn('WebSocket: Error building URL:', error);
      // Fallback to localhost
      return 'ws://localhost:8000/ws/chat';
    }
  }, []);

  const connect = useCallback(() => {
    // Prevent multiple simultaneous connections
    if (isConnectingRef.current || wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket: Already connected or connecting, skipping...');
      return;
    }

    if (!mountedRef.current) return;

    isConnectingRef.current = true;
    setConnectionError(null);

    // Cleanup existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const wsUrl = buildWsUrl();

    // Get token from localStorage or auth store
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    console.log('WebSocket: Connecting to', wsUrl);

    try {
      // Create WebSocket with auth token in query string
      const authWsUrl = token ? `${wsUrl}?token=${encodeURIComponent(token)}` : wsUrl;
      const socket = new WebSocket(authWsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        if (!mountedRef.current) {
          socket.close();
          return;
        }
        console.log('WebSocket: Connection established');
        isConnectingRef.current = false;
        setIsConnected(true);
        setConnectionError(null);
        reconnectCountRef.current = 0;

        try {
          options.onConnected?.();
        } catch (callbackError) {
          console.warn('WebSocket: Error in onConnected callback:', callbackError);
        }
      };

      socket.onmessage = (event) => {
        if (!mountedRef.current) return;

        try {
          const data = JSON.parse(event.data);
          const message: ChatMessage = {
            type: data.type || 'chat_message',
            content: data.content || '',
            message_id: data.message_id,
            sender_id: data.sender_id,
            sender_name: data.sender_name,
            metadata: data.metadata,
            full_content: data.full_content,
            analysis: data.analysis,
          };

          // Don't add duplicate messages that we just sent
          setMessages(prev => {
            // Check if this is a message we just sent
            const isDuplicate = prev.some(m =>
              m.message_id === message.message_id &&
              message.message_id !== undefined
            );
            if (isDuplicate) {
              return prev;
            }
            return [...prev, message];
          });

          try {
            options.onMessage?.(message);
          } catch (callbackError) {
            console.warn('WebSocket: Error in onMessage callback:', callbackError);
          }
        } catch (e) {
          console.warn('WebSocket: Error parsing message:', e);
        }
      };

      socket.onclose = (event) => {
        if (!mountedRef.current) return;

        console.log('WebSocket: Closed', event.code, event.reason);
        isConnectingRef.current = false;
        setIsConnected(false);
        wsRef.current = null;

        try {
          options.onDisconnected?.();
        } catch (callbackError) {
          console.warn('WebSocket: Error in onDisconnected callback:', callbackError);
        }

        // Auto-reconnect if not explicitly closed and user is still logged in
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token && event.code !== 1000 && reconnectCountRef.current < 5) {
          const delay = Math.min(3000 * Math.pow(2, reconnectCountRef.current), 30000);
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
        console.warn('WebSocket: Connection error occurred');

        try {
          setConnectionError('WebSocket connection failed. Please check if the server is running.');
        } catch (stateError) {
          console.warn('WebSocket: Error setting connection error state:', stateError);
        }

        try {
          options.onError?.(new Error('WebSocket connection failed. Server may be unreachable.'));
        } catch (callbackError) {
          console.warn('WebSocket: Error in onError callback:', callbackError);
        }
        // Let onclose handle the actual cleanup
      };
    } catch (error) {
      console.warn('WebSocket: Failed to initiate connection:', error);
      isConnectingRef.current = false;
      setConnectionError('Failed to establish WebSocket connection');

      try {
        options.onError?.(error instanceof Error ? error : new Error(String(error)));
      } catch (callbackError) {
        console.warn('WebSocket: Error in onError callback:', callbackError);
      }
    }
  }, [buildWsUrl, options]);

  // Initial connection - delay to not block page load
  useEffect(() => {
    mountedRef.current = true;

    // Delay connection by 2 seconds to not block initial page load
    const connectionTimeout = setTimeout(() => {
      connect();
    }, 2000);

    return () => {
      mountedRef.current = false;
      clearTimeout(connectionTimeout);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.onclose = () => { };
        wsRef.current.close(1000);
        wsRef.current = null;
      }
    };
  }, []);

  // Reconnect when token changes
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && !isConnected && !isConnectingRef.current) {
      console.log('WebSocket: Token detected, connecting...');
      connect();
    }
  }, [isConnected, connect]);

  const sendMessage = useCallback((
    type: MessageType,
    content: string,
    additionalData: Record<string, any> = {}
  ): boolean => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type,
        message: content,
        content,
        ...additionalData,
      }));
      return true;
    }
    console.warn('WebSocket: Not connected, cannot send message');
    return false;
  }, []);

  const sendPrivateMessage = useCallback((recipientId: number, content: string) => {
    return sendMessage('private_message', content, { recipient_id: recipientId });
  }, [sendMessage]);

  const sendPrescription = useCallback((
    patientId: number,
    medications: Array<{ name: string; dosage: string; frequency: string }>,
    diagnosis: string
  ) => {
    return sendMessage('send_prescription', '', {
      patient_id: patientId,
      medications,
      diagnosis,
    });
  }, [sendMessage]);

  const finishSession = useCallback((patientId: number) => {
    return sendMessage('finish_session', '', { patient_id: patientId });
  }, [sendMessage]);

  const startConsultation = useCallback((appointmentId: number) => {
    return sendMessage('start_consultation', '', { appointment_id: appointmentId });
  }, [sendMessage]);

  const sendAIChat = useCallback((content: string, enableRag: boolean = false) => {
    return sendMessage('ai_chat', content, { enable_rag: enableRag });
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
    reconnectCountRef.current = 0;
    if (wsRef.current) {
      wsRef.current.close(1000);
    }
    connect();
  }, [connect]);

  return {
    isConnected,
    connectionError,
    messages,
    sendMessage,
    sendPrivateMessage,
    sendPrescription,
    finishSession,
    startConsultation,
    sendAIChat,
    disconnect,
    reconnect,
    clearMessages: () => setMessages([]),
  };
}

export default useWebSocketChat;

