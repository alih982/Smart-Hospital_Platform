import apiClient from './apiClient';
import { appointmentService } from './appointmentService';

export interface Message {
    id: number;
    conversation: number;
    sender: number | null;
    sender_name: string;
    content: string;
    is_ai: boolean;
    timestamp: string;
    is_read: boolean;
}

export interface Conversation {
    id: number;
    conv_type: 'patient_doctor' | 'patient_ai' | 'patient_support';
    participants: number[];
    other_participant: {
        id: number;
        username: string;
        full_name: string;
    } | null;
    messages: Message[];
    created_at: string;
    updated_at: string;
}

export interface AppointmentDoctor {
    id: string;
    doctor_id: number;
    user_id: number | null;
    full_name: string;
    specialty: string;
    appointment_date: string;
    appointment_time: string;
    appointment_id: string;
    conversation_id: string | null;
    status: string;
}

// Check if user is authenticated (not demo mode)
const isAuthenticated = () => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('token');
    return !!token && !token.startsWith('mock-token');
};

// Local storage key for persisting chat messages
const CHAT_STORAGE_KEY = 'hospital_chat_messages';

// Save messages to localStorage for persistence
const saveMessagesToStorage = (conversationId: number, messages: Message[]) => {
    try {
        const key = `${CHAT_STORAGE_KEY}_${conversationId}`;
        localStorage.setItem(key, JSON.stringify(messages));
    } catch (e) {
        console.warn('Failed to save messages to storage:', e);
    }
};

// Load messages from localStorage
const loadMessagesFromStorage = (conversationId: number): Message[] => {
    try {
        const key = `${CHAT_STORAGE_KEY}_${conversationId}`;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.warn('Failed to load messages from storage:', e);
        return [];
    }
};

// Save conversations list to localStorage
const saveConversationsToStorage = (conversations: Conversation[]) => {
    try {
        localStorage.setItem(`${CHAT_STORAGE_KEY}_list`, JSON.stringify(conversations));
    } catch (e) {
        console.warn('Failed to save conversations to storage:', e);
    }
};

// Load conversations from localStorage
const loadConversationsFromStorage = (): Conversation[] => {
    try {
        const stored = localStorage.getItem(`${CHAT_STORAGE_KEY}_list`);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.warn('Failed to load conversations from storage:', e);
        return [];
    }
};

export const chatService = {
    /**
     * Get all conversations for the current user
     * First tries backend, then falls back to local storage
     */
    getConversations: async (): Promise<Conversation[]> => {
        if (isAuthenticated()) {
            try {
                const response = await apiClient.get('/chat/conversations/');
                const data = response.data;
                const conversations = data.results || data || [];
                
                if (conversations.length > 0) {
                    saveConversationsToStorage(conversations);
                }
                
                return conversations;
            } catch (error) {
                console.warn('Chat: Failed to get conversations from backend:', error);
                const stored = loadConversationsFromStorage();
                if (stored.length > 0) {
                    return stored;
                }
            }
        }

        return loadConversationsFromStorage();
    },

    /**
     * Get messages for a specific conversation
     * First tries backend, then falls back to local storage
     */
    getMessages: async (conversationId: number): Promise<Message[]> => {
        if (isAuthenticated()) {
            try {
                const response = await apiClient.get(`/chat/messages/?conversation_id=${conversationId}`);
                const data = response.data;
                const messages = data.results || data || [];
                
                if (messages.length > 0) {
                    saveMessagesToStorage(conversationId, messages);
                }
                
                return messages;
            } catch (error) {
                console.warn('Chat: Failed to get messages from backend:', error);
                const stored = loadMessagesFromStorage(conversationId);
                if (stored.length > 0) {
                    return stored;
                }
            }
        }

        return loadMessagesFromStorage(conversationId);
    },

    /**
     * Save a message to local storage (for real-time updates)
     */
    saveMessage: (conversationId: number, message: Message) => {
        const messages = loadMessagesFromStorage(conversationId);
        messages.push(message);
        saveMessagesToStorage(conversationId, messages);
    },

    /**
     * Get doctors from confirmed/pending appointments
     */
    getAppointmentDoctors: async (): Promise<AppointmentDoctor[]> => {
        if (!isAuthenticated()) {
            return [];
        }

        try {
            const response = await apiClient.get('/chat/conversations/appointment-doctors/');
            if (response.data.success && response.data.data.length > 0) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.warn('Chat: Failed to get appointment doctors:', error);
            return [];
        }
    },

    /**
     * Create or get a conversation with a doctor
     */
    createOrGetConversation: async (doctorId: number): Promise<Conversation | null> => {
        if (!isAuthenticated()) {
            return null;
        }

        try {
            const response = await apiClient.post('/chat/conversations/create/', { doctor_id: doctorId });
            
            const conversations = loadConversationsFromStorage();
            const newConv = response.data;
            const existingIndex = conversations.findIndex(c => c.id === newConv.id);
            
            if (existingIndex >= 0) {
                conversations[existingIndex] = newConv;
            } else {
                conversations.unshift(newConv);
            }
            
            saveConversationsToStorage(conversations);
            
            return response.data;
        } catch (error) {
            console.warn('Chat: Failed to create conversation:', error);
            return null;
        }
    },

    /**
     * Send a message and save it to backend and local storage
     */
    sendMessage: async (conversationId: number, content: string): Promise<Message | null> => {
        if (!isAuthenticated()) {
            const localMessage: Message = {
                id: Date.now(),
                conversation: conversationId,
                sender: 1,
                sender_name: 'You',
                content,
                is_ai: false,
                timestamp: new Date().toISOString(),
                is_read: false,
            };
            chatService.saveMessage(conversationId, localMessage);
            return localMessage;
        }

        try {
            const response = await apiClient.post(`/chat/messages/`, {
                conversation_id: conversationId,
                content,
            });
            
            const message = response.data;
            chatService.saveMessage(conversationId, message);
            
            return message;
        } catch (error) {
            console.warn('Chat: Failed to send message:', error);
            const localMessage: Message = {
                id: Date.now(),
                conversation: conversationId,
                sender: 1,
                sender_name: 'You',
                content,
                is_ai: false,
                timestamp: new Date().toISOString(),
                is_read: false,
            };
            chatService.saveMessage(conversationId, localMessage);
            return localMessage;
        }
    },

    /**
     * Clear all chat data from local storage
     */
    clearChatData: () => {
        try {
            const keys = Object.keys(localStorage).filter(k => k.startsWith(CHAT_STORAGE_KEY));
            keys.forEach(k => localStorage.removeItem(k));
            console.log('Chat: Cleared all local chat data');
        } catch (e) {
            console.warn('Failed to clear chat data:', e);
        }
    },
};
