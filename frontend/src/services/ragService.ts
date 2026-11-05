import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8001';

export const ragService = {
    async ingestDocument(file: File) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(`${API_URL}/api/v1/rag/ingest`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    async queryRAG(question: string) {
        const response = await axios.post(`${API_URL}/api/v1/rag/query`, {
            question,
        });
        return response.data;
    }
};
