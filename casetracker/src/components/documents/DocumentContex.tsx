import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
// TypeScript Interfaces
export interface Document {
    id: string;
    name: string;
    type: string; // 'pdf', 'image', 'docx', etc.
    uploadDate: string;
    uploader: string;
    tags?: string[];
    clientCase?: string;
    fileUrl: string;
    fileSize?: number;
}

interface DocumentContextType {
    documents: Document[];
    addDocument: (document: Document) => void;
    deleteDocument: (id: string) => void;
    selectedDocument: Document | null;
    setSelectedDocument: (document: Document | null) => void;
}

// Create Context
const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

// Mock Data
const mockDocuments: Document[] = [
    {
        id: '1',
        name: 'Client Agreement - Smith v. Jones',
        type: 'pdf',
        uploadDate: '2024-10-15',
        uploader: 'John Doe',
        tags: ['Contract', 'Client'],
        clientCase: 'Smith v. Jones',
        fileUrl: '/mock/agreement.pdf',
        fileSize: 245000
    },
    {
        id: '2',
        name: 'Evidence Photo - Crime Scene',
        type: 'image',
        uploadDate: '2024-10-20',
        uploader: 'Jane Smith',
        tags: ['Evidence', 'Criminal'],
        clientCase: 'State v. Brown',
        fileUrl: 'https://via.placeholder.com/800x600/4A90E2/ffffff?text=Evidence+Photo',
        fileSize: 1024000
    },
    {
        id: '3',
        name: 'Motion to Dismiss - Case #2024-456',
        type: 'pdf',
        uploadDate: '2024-10-25',
        uploader: 'John Doe',
        tags: ['Motion', 'Court Filing'],
        clientCase: 'Johnson Estate',
        fileUrl: '/mock/motion.pdf',
        fileSize: 512000
    },
    {
        id: '4',
        name: 'Witness Statement - Dr. Williams',
        type: 'pdf',
        uploadDate: '2024-10-28',
        uploader: 'Sarah Johnson',
        tags: ['Witness', 'Deposition'],
        clientCase: 'Medical Malpractice #789',
        fileUrl: '/mock/statement.pdf',
        fileSize: 328000
    }
];

// Provider Component
export const DocumentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [documents, setDocuments] = useState<Document[]>(mockDocuments);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

    const addDocument = (document: Document) => {
        setDocuments((prev) => [document, ...prev]);
    };

    const deleteDocument = (id: string) => {
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
        if (selectedDocument?.id === id) {
            setSelectedDocument(null);
        }
    };

    return (
        <DocumentContext.Provider
            value={{
                documents,
                addDocument,
                deleteDocument,
                selectedDocument,
                setSelectedDocument
            }}
        >
            {children}
        </DocumentContext.Provider>
    );
};

// Custom Hook
export const useDocuments = () => {
    const context = useContext(DocumentContext);
    if (!context) {
        throw new Error('useDocuments must be used within a DocumentProvider');
    }
    return context;
};