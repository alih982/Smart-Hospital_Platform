/**
 * AI Vision WebSocket Service
 * Handles real-time image analysis for skin care
 */

export interface VisionProduct {
    name: string;
    name_fa: string;
    category: string;
    description: string;
    confidence: number;
}

export interface VisionResult {
    success: boolean;
    skin_type: string;
    skin_type_fa: string;
    concerns: string[];
    products: VisionProduct[];
    message?: string;
}

export type VisionMessageType = 
    | 'connected'
    | 'status'
    | 'result'
    | 'error'
    | 'ping'
    | 'pong';

export interface VisionMessage {
    type: VisionMessageType;
    message?: string;
    skin_type?: string;
    skin_type_fa?: string;
    concerns?: string[];
    products?: VisionProduct[];
    success?: boolean;
    client_id?: string;
    [key: string]: unknown;
}

class VisionWebSocketService {
    private ws: WebSocket | null = null;
    private url: string;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 3;
    private messageHandlers: ((message: VisionMessage) => void)[] = [];
    private isConnecting = false;
    private shouldReconnect = true;
    private connectionPromise: Promise<void> | null = null;
    private pendingResolvers: ((value: void) => void)[] = [];

    constructor() {
        // Build WebSocket URL - connect to AI service directly or via gateway
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        
        // Try to get AI service URL from env, fallback to Runflare AI service
        const aiServiceUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://magggicai-magicai.runflare.run';
        
        // If URL already has protocol, use it as is
        if (aiServiceUrl.startsWith('http')) {
            const url = new URL(aiServiceUrl);
            this.url = `${url.protocol === 'https:' ? 'wss:' : 'ws:'}//${url.host}/api/v1/vision/ws`;
        } else {
            this.url = `${wsProtocol}//${aiServiceUrl}/api/v1/vision/ws`;
        }
        
        console.log('Vision WebSocket URL:', this.url);
    }

    connect(): Promise<void> {
        // If already connected, resolve immediately
        if (this.ws?.readyState === WebSocket.OPEN) {
            return Promise.resolve();
        }

        // If there's already a pending connection, return that promise
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        // If already connecting but no promise yet, create one and wait
        if (this.isConnecting) {
            return new Promise((resolve) => {
                this.pendingResolvers.push(resolve);
            });
        }

        if (!this.shouldReconnect) {
            return Promise.reject(new Error('Reconnection disabled'));
        }

        this.isConnecting = true;

        // Create the connection promise
        this.connectionPromise = new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.url);

                this.ws.onopen = () => {
                    this.isConnecting = false;
                    this.reconnectAttempts = 0;
                    // Resolve all pending resolvers
                    this.pendingResolvers.forEach(r => r());
                    this.pendingResolvers = [];
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data) as VisionMessage;
                        this.messageHandlers.forEach(handler => handler(message));
                    } catch {
                        // Silent fail for parse errors
                    }
                };

                // Empty handler - errors will be handled by onclose
                this.ws.onerror = null;

                this.ws.onclose = (event) => {
                    this.isConnecting = false;
                    this.connectionPromise = null;
                    
                    // Only attempt reconnect if not intentionally closed
                    if (this.shouldReconnect && event.code !== 1000) {
                        this.attemptReconnect();
                    }
                };

            } catch (error) {
                this.isConnecting = false;
                this.connectionPromise = null;
                reject(error);
            }
        });

        return this.connectionPromise;
    }

    private attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts && this.shouldReconnect) {
            this.reconnectAttempts++;
            const delay = Math.min(2000 * Math.pow(2, this.reconnectAttempts - 1), 10000);
            
            setTimeout(() => {
                this.connect().catch(() => {
                    // Silently fail reconnection
                });
            }, delay);
        }
    }

    disconnect() {
        this.shouldReconnect = false;
        if (this.ws) {
            this.ws.close(1000, 'Client disconnect');
            this.ws = null;
        }
    }

    onMessage(handler: (message: VisionMessage) => void) {
        this.messageHandlers.push(handler);
        return () => {
            this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
        };
    }

    sendImage(imageData: string) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            // Remove data URL prefix if present
            let cleanData = imageData;
            if (imageData.includes(',')) {
                cleanData = imageData.split(',')[1];
            }
            
            this.ws.send(JSON.stringify({
                type: 'image',
                data: cleanData
            }));
            console.log('Image sent for analysis');
        } else {
            console.error('WebSocket not connected, cannot send image');
            throw new Error('WebSocket not connected');
        }
    }

    sendPing() {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'ping' }));
        }
    }

    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}

// Singleton instance
export const visionService = new VisionWebSocketService();

