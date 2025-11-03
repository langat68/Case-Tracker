import React, { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useDocuments } from './DocumentContex';
import type { Document } from './DocumentContex';
import type { ChangeEvent, DragEvent } from 'react';
import './Documents.scss';

interface UploadFile {
    file: File;
    progress: number;
    status: 'uploading' | 'success' | 'error';
    id: string;
}

const DocumentUpload: React.FC = () => {
    const { addDocument } = useDocuments();
    const [isDragging, setIsDragging] = useState(false);
    const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
    const [metadata, setMetadata] = useState({
        uploader: 'Current User',
        tags: '',
        clientCase: ''
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle file selection
    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;

        const newFiles: UploadFile[] = Array.from(files).map(file => ({
            file,
            progress: 0,
            status: 'uploading' as const,
            id: `${Date.now()}-${Math.random()}`
        }));

        setUploadFiles(prev => [...prev, ...newFiles]);

        // Simulate upload for each file
        newFiles.forEach(uploadFile => {
            simulateUpload(uploadFile);
        });
    };

    // Simulate file upload with progress
    const simulateUpload = (uploadFile: UploadFile) => {
        const interval = setInterval(() => {
            setUploadFiles(prev =>
                prev.map(uf => {
                    if (uf.id === uploadFile.id) {
                        const newProgress = Math.min(uf.progress + 10, 100);

                        if (newProgress === 100) {
                            clearInterval(interval);

                            // Create document metadata
                            const fileType = uploadFile.file.type.includes('pdf') ? 'pdf' :
                                uploadFile.file.type.includes('image') ? 'image' : 'docx';

                            const newDocument: Document = {
                                id: uploadFile.id,
                                name: uploadFile.file.name,
                                type: fileType,
                                uploadDate: new Date().toISOString().split('T')[0],
                                uploader: metadata.uploader,
                                tags: metadata.tags ? metadata.tags.split(',').map(t => t.trim()) : [],
                                clientCase: metadata.clientCase || undefined,
                                fileUrl: URL.createObjectURL(uploadFile.file),
                                fileSize: uploadFile.file.size
                            };

                            // Add to document list
                            addDocument(newDocument);

                            return { ...uf, progress: 100, status: 'success' as const };
                        }

                        return { ...uf, progress: newProgress };
                    }
                    return uf;
                })
            );
        }, 200);
    };

    // Handle drag events
    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        handleFileSelect(files);
    };

    // Handle file input change
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        handleFileSelect(e.target.files);
    };

    // Remove file from upload list
    const removeFile = (id: string) => {
        setUploadFiles(prev => prev.filter(uf => uf.id !== id));
    };

    // Clear completed uploads
    const clearCompleted = () => {
        setUploadFiles(prev => prev.filter(uf => uf.status !== 'success'));
    };

    // Format file size
    const formatFileSize = (bytes: number): string => {
        const kb = bytes / 1024;
        const mb = kb / 1024;
        return mb >= 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
    };

    return (
        <div className="document-upload">
            <div className="document-upload__header">
                <h2 className="document-upload__title">
                    <Upload size={24} />
                    Upload Documents
                </h2>
            </div>

            {/* Metadata Form */}
            <div className="document-upload__metadata">
                <div className="document-upload__field">
                    <label htmlFor="uploader">Uploader</label>
                    <input
                        type="text"
                        id="uploader"
                        value={metadata.uploader}
                        onChange={(e) => setMetadata({ ...metadata, uploader: e.target.value })}
                        placeholder="Your name"
                    />
                </div>

                <div className="document-upload__field">
                    <label htmlFor="clientCase">Client/Case (Optional)</label>
                    <input
                        type="text"
                        id="clientCase"
                        value={metadata.clientCase}
                        onChange={(e) => setMetadata({ ...metadata, clientCase: e.target.value })}
                        placeholder="e.g., Smith v. Jones"
                    />
                </div>

                <div className="document-upload__field">
                    <label htmlFor="tags">Tags (Optional)</label>
                    <input
                        type="text"
                        id="tags"
                        value={metadata.tags}
                        onChange={(e) => setMetadata({ ...metadata, tags: e.target.value })}
                        placeholder="e.g., Contract, Evidence (comma-separated)"
                    />
                </div>
            </div>

            {/* Drop Zone */}
            <div
                className={`document-upload__dropzone ${isDragging ? 'document-upload__dropzone--active' : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <Upload size={48} className="document-upload__icon" />
                <p className="document-upload__text">
                    Drag and drop files here, or click to browse
                </p>
                <p className="document-upload__hint">
                    Supports PDF, Images, Word documents
                </p>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.docx,.doc"
                    onChange={handleInputChange}
                    style={{ display: 'none' }}
                />
            </div>

            {/* Upload Progress */}
            {uploadFiles.length > 0 && (
                <div className="document-upload__progress-container">
                    <div className="document-upload__progress-header">
                        <h3>Uploading Files</h3>
                        {uploadFiles.some(uf => uf.status === 'success') && (
                            <button
                                onClick={clearCompleted}
                                className="document-upload__clear-btn"
                            >
                                Clear Completed
                            </button>
                        )}
                    </div>

                    <div className="document-upload__progress-list">
                        {uploadFiles.map((uploadFile) => (
                            <div key={uploadFile.id} className="document-upload__progress-item">
                                <div className="document-upload__progress-info">
                                    <FileText size={20} />
                                    <div className="document-upload__progress-details">
                                        <p className="document-upload__file-name">{uploadFile.file.name}</p>
                                        <p className="document-upload__file-size">
                                            {formatFileSize(uploadFile.file.size)}
                                        </p>
                                    </div>
                                </div>

                                <div className="document-upload__progress-status">
                                    {uploadFile.status === 'uploading' && (
                                        <>
                                            <div className="document-upload__progress-bar">
                                                <div
                                                    className="document-upload__progress-fill"
                                                    style={{ width: `${uploadFile.progress}%` }}
                                                />
                                            </div>
                                            <span className="document-upload__progress-percent">
                                                {uploadFile.progress}%
                                            </span>
                                        </>
                                    )}

                                    {uploadFile.status === 'success' && (
                                        <div className="document-upload__status-icon document-upload__status-icon--success">
                                            <CheckCircle size={20} />
                                            <span>Complete</span>
                                        </div>
                                    )}

                                    {uploadFile.status === 'error' && (
                                        <div className="document-upload__status-icon document-upload__status-icon--error">
                                            <AlertCircle size={20} />
                                            <span>Failed</span>
                                        </div>
                                    )}
                                </div>

                                {uploadFile.status !== 'uploading' && (
                                    <button
                                        onClick={() => removeFile(uploadFile.id)}
                                        className="document-upload__remove-btn"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentUpload;