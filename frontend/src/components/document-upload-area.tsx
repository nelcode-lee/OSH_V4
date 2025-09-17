"use client";

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Eye,
  Trash2,
  Plus,
  File,
  Image,
  FileImage,
  FileVideo,
  Loader2,
  Sparkles
} from 'lucide-react';
import { api, getAuthHeaders } from '@/lib/api';

interface Document {
  id: number;
  title: string;
  description: string;
  file_name: string;
  file_size: number;
  file_type: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress: number;
  created_at: string;
  course_id?: number;
}

interface DocumentUploadAreaProps {
  courseId?: number;
  onDocumentUploaded?: (document: Document) => void;
  onDocumentProcessed?: (document: Document) => void;
}

export default function DocumentUploadArea({ 
  courseId, 
  onDocumentUploaded, 
  onDocumentProcessed 
}: DocumentUploadAreaProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [newDocument, setNewDocument] = useState({
    title: '',
    description: '',
    file: null as File | null
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFileTypes = {
    'application/pdf': { icon: FileText, color: 'text-red-600', bg: 'bg-red-50' },
    'image/jpeg': { icon: Image, color: 'text-green-600', bg: 'bg-green-50' },
    'image/png': { icon: Image, color: 'text-green-600', bg: 'bg-green-50' },
    'image/gif': { icon: Image, color: 'text-green-600', bg: 'bg-green-50' },
    'text/plain': { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    'application/msword': { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' }
  };

  const getFileIcon = (fileType: string) => {
    const typeInfo = acceptedFileTypes[fileType as keyof typeof acceptedFileTypes];
    return typeInfo || { icon: File, color: 'text-gray-600', bg: 'bg-gray-50' };
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (isValidFileType(file)) {
        setNewDocument(prev => ({ ...prev, file }));
      } else {
        alert('Please select a valid file type (PDF, DOC, DOCX, TXT, or images)');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isValidFileType(file)) {
        setNewDocument(prev => ({ ...prev, file }));
      } else {
        alert('Please select a valid file type (PDF, DOC, DOCX, TXT, or images)');
      }
    }
  };

  const isValidFileType = (file: File) => {
    const validTypes = Object.keys(acceptedFileTypes);
    return validTypes.includes(file.type);
  };

  const handleUpload = async () => {
    if (!newDocument.file || !newDocument.title.trim()) {
      alert('Please select a file and enter a title');
      return;
    }

    setUploading(true);
    
    // Create a temporary document entry
    const tempDocument: Document = {
      id: Date.now(), // Temporary ID
      title: newDocument.title,
      description: newDocument.description,
      file_name: newDocument.file.name,
      file_size: newDocument.file.size,
      file_type: newDocument.file.type,
      status: 'uploading',
      progress: 0,
      created_at: new Date().toISOString(),
      course_id: courseId
    };

    setDocuments(prev => [tempDocument, ...prev]);

    try {
      const formData = new FormData();
      formData.append('file', newDocument.file);
      formData.append('title', newDocument.title);
      formData.append('description', newDocument.description);
      if (courseId) formData.append('course_id', courseId.toString());

      const response = await fetch(`${api.baseUrl}/api/instructor-ai/upload-document`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update document with server response
        setDocuments(prev => prev.map(doc => 
          doc.id === tempDocument.id 
            ? { ...doc, ...result, status: 'ready', progress: 100 }
            : doc
        ));

        // Process document for RAG
        if (result.document_id) {
          await processDocument(result.document_id);
        }

        onDocumentUploaded?.(result);
        
        // Reset form
        setNewDocument({ title: '', description: '', file: null });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setDocuments(prev => prev.map(doc => 
        doc.id === tempDocument.id 
          ? { ...doc, status: 'error', progress: 0 }
          : doc
      ));
      alert('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const processDocument = async (documentId: number) => {
    try {
      const response = await fetch(`${api.baseUrl}/api/content/documents/${documentId}/process`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const result = await response.json();
        setDocuments(prev => prev.map(doc => 
          doc.id === documentId 
            ? { ...doc, status: 'ready', progress: 100 }
            : doc
        ));
        onDocumentProcessed?.(result);
      }
    } catch (error) {
      console.error('Processing error:', error);
    }
  };

  const handleRemoveDocument = (documentId: number) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const handleViewDocument = (document: Document) => {
    // In a real app, this would open the document viewer
    window.open(`/api/documents/${document.id}/view`, '_blank');
  };

  const handleDownloadDocument = (document: Document) => {
    // In a real app, this would download the document
    const link = document.createElement('a');
    link.href = `/api/documents/${document.id}/download`;
    link.download = document.file_name;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Upload className="h-5 w-5 mr-2 text-blue-600" />
            Upload Company Documents
          </CardTitle>
          <p className="text-sm text-gray-600">
            Upload PDFs, documents, and images to help build comprehensive courses with RAG-powered content generation.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Drag & Drop Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {dragActive ? 'Drop files here' : 'Drag & drop files here'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  or click to browse files
                </p>
              </div>
              
              <div className="text-xs text-gray-400">
                Supports: PDF, DOC, DOCX, TXT, JPG, PNG, GIF (Max 10MB)
              </div>
            </div>
          </div>

          {/* File Details Form */}
          {newDocument.file && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getFileIcon(newDocument.file.type).bg}`}>
                  {React.createElement(getFileIcon(newDocument.file.type).icon, {
                    className: `h-5 w-5 ${getFileIcon(newDocument.file.type).color}`
                  })}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{newDocument.file.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(newDocument.file.size)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewDocument(prev => ({ ...prev, file: null }))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Document Title *</Label>
                  <Input
                    id="title"
                    value={newDocument.title}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Forward Tipping Dumper Manual"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newDocument.description}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the document content"
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-gray-600">
                    This document will be processed for AI content generation
                  </span>
                </div>
                <Button 
                  onClick={handleUpload} 
                  disabled={uploading || !newDocument.title.trim()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Documents List */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-green-600" />
                Uploaded Documents ({documents.length})
              </span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Ready for RAG
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((document) => {
                const fileIcon = getFileIcon(document.file_type);
                return (
                  <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${fileIcon.bg}`}>
                        {React.createElement(fileIcon.icon, {
                          className: `h-6 w-6 ${fileIcon.color}`
                        })}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{document.title}</h4>
                          {document.status === 'ready' && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                          {document.status === 'error' && (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                          {document.status === 'uploading' && (
                            <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">{document.description}</p>
                        
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{document.file_name}</span>
                          <span>•</span>
                          <span>{formatFileSize(document.file_size)}</span>
                          <span>•</span>
                          <span>{new Date(document.created_at).toLocaleDateString()}</span>
                        </div>

                        {document.status === 'uploading' && (
                          <div className="mt-2">
                            <Progress value={document.progress} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">Uploading... {document.progress}%</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDocument(document)}
                        disabled={document.status !== 'ready'}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadDocument(document)}
                        disabled={document.status !== 'ready'}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDocument(document.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* RAG Information */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 mb-2">RAG-Powered Content Generation</h3>
              <p className="text-sm text-purple-700 mb-3">
                Uploaded documents are automatically processed and indexed for AI content generation. 
                When creating course content, the AI will reference these documents to generate 
                contextually relevant and accurate materials.
              </p>
              <div className="flex items-center space-x-4 text-xs text-purple-600">
                <span className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Automatic text extraction
                </span>
                <span className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Vector embedding
                </span>
                <span className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Semantic search
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
