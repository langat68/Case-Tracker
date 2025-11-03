import React, { useState, useMemo } from 'react';
import { Search, Filter, Trash2, Eye, FileText } from 'lucide-react';
import { useDocuments } from './DocumentContex';
import type { Document } from "./DocumentContex"
import './Documents.scss';

const DocumentList: React.FC = () => {
    const { documents, deleteDocument, setSelectedDocument } = useDocuments();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'uploader'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filterType, setFilterType] = useState<string>('all');

    // Format file size
    const formatFileSize = (bytes?: number): string => {
        if (!bytes) return 'N/A';
        const kb = bytes / 1024;
        const mb = kb / 1024;
        return mb >= 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
    };

    // Format date
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get unique document types
    const documentTypes = useMemo(() => {
        const types = new Set(documents.map(doc => doc.type));
        return ['all', ...Array.from(types)];
    }, [documents]);

    // Filter and sort documents
    const filteredDocuments = useMemo(() => {
        let filtered = documents.filter(doc => {
            const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.uploader.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.clientCase?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'all' || doc.type === filterType;
            return matchesSearch && matchesType;
        });

        // Sort documents
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'date':
                    comparison = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
                    break;
                case 'uploader':
                    comparison = a.uploader.localeCompare(b.uploader);
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [documents, searchTerm, sortBy, sortOrder, filterType]);

    // Handle preview
    const handlePreview = (doc: Document) => {
        setSelectedDocument(doc);
    };

    // Handle delete
    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            deleteDocument(id);
        }
    };

    // Toggle sort order
    const handleSort = (field: 'name' | 'date' | 'uploader') => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    return (
        <div className="document-list">
            {/* Header */}
            <div className="document-list__header">
                <h2 className="document-list__title">
                    <FileText size={24} />
                    Documents
                </h2>
                <div className="document-list__stats">
                    {filteredDocuments.length} of {documents.length} documents
                </div>
            </div>

            {/* Controls */}
            <div className="document-list__controls">
                <div className="document-list__search">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search documents, cases, or uploaders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="document-list__search-input"
                    />
                </div>

                <div className="document-list__filters">
                    <div className="document-list__filter-group">
                        <Filter size={18} />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="document-list__filter-select"
                        >
                            {documentTypes.map(type => (
                                <option key={type} value={type}>
                                    {type === 'all' ? 'All Types' : type.toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="document-list__table-container">
                <table className="document-list__table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('name')} className="sortable">
                                Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th>Type</th>
                            <th>Case/Client</th>
                            <th onClick={() => handleSort('uploader')} className="sortable">
                                Uploader {sortBy === 'uploader' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('date')} className="sortable">
                                Upload Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th>Size</th>
                            <th>Tags</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDocuments.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="document-list__empty">
                                    No documents found
                                </td>
                            </tr>
                        ) : (
                            filteredDocuments.map((doc) => (
                                <tr key={doc.id}>
                                    <td className="document-list__name">{doc.name}</td>
                                    <td>
                                        <span className={`document-list__type document-list__type--${doc.type}`}>
                                            {doc.type.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>{doc.clientCase || '—'}</td>
                                    <td>{doc.uploader}</td>
                                    <td>{formatDate(doc.uploadDate)}</td>
                                    <td>{formatFileSize(doc.fileSize)}</td>
                                    <td>
                                        <div className="document-list__tags">
                                            {doc.tags?.map((tag, index) => (
                                                <span key={index} className="document-list__tag">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="document-list__actions">
                                            <button
                                                onClick={() => handlePreview(doc)}
                                                className="document-list__action-btn document-list__action-btn--preview"
                                                title="Preview"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(doc.id, doc.name)}
                                                className="document-list__action-btn document-list__action-btn--delete"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DocumentList;