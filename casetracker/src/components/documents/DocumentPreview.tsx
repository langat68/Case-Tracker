import React, { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useDocuments } from './DocumentContex';
import './Documents.scss';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const DocumentPreview: React.FC = () => {
    const { selectedDocument, setSelectedDocument } = useDocuments();
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [pdfError, setPdfError] = useState(false);

    if (!selectedDocument) return null;

    const isPDF = selectedDocument.type === 'pdf';
    const isImage = selectedDocument.type === 'image';

    // Handle PDF load success
    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setPageNumber(1);
        setPdfError(false);
    };

    // Handle PDF load error
    const onDocumentLoadError = (error: Error) => {
        console.error('Error loading PDF:', error);
        setPdfError(true);
    };

    // Close modal
    const handleClose = () => {
        setSelectedDocument(null);
        setPageNumber(1);
        setScale(1.0);
        setPdfError(false);
    };

    // Download document
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = selectedDocument.fileUrl;
        link.download = selectedDocument.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Zoom controls
    const handleZoomIn = () => {
        setScale(prev => Math.min(prev + 0.2, 3.0));
    };

    const handleZoomOut = () => {
        setScale(prev => Math.max(prev - 0.2, 0.5));
    };

    // Page navigation
    const goToNextPage = () => {
        if (numPages && pageNumber < numPages) {
            setPageNumber(prev => prev + 1);
        }
    };

    const goToPreviousPage = () => {
        if (pageNumber > 1) {
            setPageNumber(prev => prev - 1);
        }
    };

    // Format date
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Prevent modal close when clicking inside content
    const handleContentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div className="document-preview" onClick={handleClose}>
            <div className="document-preview__modal" onClick={handleContentClick}>
                {/* Header */}
                <div className="document-preview__header">
                    <div className="document-preview__info">
                        <h3 className="document-preview__title">{selectedDocument.name}</h3>
                        <div className="document-preview__metadata">
                            <span>Uploaded by {selectedDocument.uploader}</span>
                            <span>•</span>
                            <span>{formatDate(selectedDocument.uploadDate)}</span>
                            {selectedDocument.clientCase && (
                                <>
                                    <span>•</span>
                                    <span>{selectedDocument.clientCase}</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="document-preview__actions">
                        <button
                            onClick={handleDownload}
                            className="document-preview__btn document-preview__btn--download"
                            title="Download"
                        >
                            <Download size={20} />
                            Download
                        </button>
                        <button
                            onClick={handleClose}
                            className="document-preview__btn document-preview__btn--close"
                            title="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Controls */}
                {isPDF && !pdfError && (
                    <div className="document-preview__controls">
                        <div className="document-preview__zoom">
                            <button
                                onClick={handleZoomOut}
                                disabled={scale <= 0.5}
                                className="document-preview__control-btn"
                                title="Zoom Out"
                            >
                                <ZoomOut size={18} />
                            </button>
                            <span className="document-preview__zoom-level">
                                {Math.round(scale * 100)}%
                            </span>
                            <button
                                onClick={handleZoomIn}
                                disabled={scale >= 3.0}
                                className="document-preview__control-btn"
                                title="Zoom In"
                            >
                                <ZoomIn size={18} />
                            </button>
                        </div>

                        {numPages && numPages > 1 && (
                            <div className="document-preview__pagination">
                                <button
                                    onClick={goToPreviousPage}
                                    disabled={pageNumber <= 1}
                                    className="document-preview__control-btn"
                                    title="Previous Page"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="document-preview__page-info">
                                    Page {pageNumber} of {numPages}
                                </span>
                                <button
                                    onClick={goToNextPage}
                                    disabled={pageNumber >= numPages}
                                    className="document-preview__control-btn"
                                    title="Next Page"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="document-preview__content">
                    {isPDF && !pdfError ? (
                        <div className="document-preview__pdf-container">
                            <Document
                                file={selectedDocument.fileUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                onLoadError={onDocumentLoadError}
                                loading={
                                    <div className="document-preview__loading">
                                        Loading PDF...
                                    </div>
                                }
                            >
                                <Page
                                    pageNumber={pageNumber}
                                    scale={scale}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    loading={
                                        <div className="document-preview__loading">
                                            Loading page...
                                        </div>
                                    }
                                />
                            </Document>
                        </div>
                    ) : isPDF && pdfError ? (
                        <div className="document-preview__error">
                            <p>Unable to load PDF preview.</p>
                            <p>This is a mock document. In production, the actual PDF would be displayed here.</p>
                            <button
                                onClick={handleDownload}
                                className="document-preview__btn document-preview__btn--download"
                            >
                                <Download size={20} />
                                Download to View
                            </button>
                        </div>
                    ) : isImage ? (
                        <div className="document-preview__image-container">
                            <img
                                src={selectedDocument.fileUrl}
                                alt={selectedDocument.name}
                                className="document-preview__image"
                                style={{ transform: `scale(${scale})` }}
                            />
                        </div>
                    ) : (
                        <div className="document-preview__unsupported">
                            <p>Preview not available for this file type.</p>
                            <button
                                onClick={handleDownload}
                                className="document-preview__btn document-preview__btn--download"
                            >
                                <Download size={20} />
                                Download to View
                            </button>
                        </div>
                    )}
                </div>

                {/* Tags */}
                {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                    <div className="document-preview__footer">
                        <div className="document-preview__tags">
                            <strong>Tags:</strong>
                            {selectedDocument.tags.map((tag, index) => (
                                <span key={index} className="document-preview__tag">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentPreview;