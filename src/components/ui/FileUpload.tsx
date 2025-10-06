'use client';

import { useState, useRef } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase/config';

interface FileUploadProps {
  onUploadComplete: (url: string, fileName: string) => void;
  onUploadError: (error: string) => void;
  accept?: string;
  maxSize?: number; // en MB
  className?: string;
}

export default function FileUpload({ 
  onUploadComplete, 
  onUploadError, 
  accept = '.pdf',
  maxSize = 2,
  className = ''
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Vérifier la taille
    if (file.size > maxSize * 1024 * 1024) {
      onUploadError(`Le fichier est trop volumineux. Taille maximale : ${maxSize}MB`);
      return;
    }

    // Vérifier le type
    if (accept && !file.name.toLowerCase().match(accept.replace('*', '.*'))) {
      onUploadError(`Type de fichier non autorisé. Types acceptés : ${accept}`);
      return;
    }

    setUploading(true);
    
    try {
      // Générer un nom unique pour le fichier
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `tps-files/${fileName}`);
      
      // Upload du fichier
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setUploadedFile({ name: file.name, url: downloadURL });
      onUploadComplete(downloadURL, file.name);
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      onUploadError('Erreur lors de l\'upload du fichier');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {uploadedFile ? (
        <Card className="p-4 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Fichier uploadé avec succès
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {uploadedFile.name}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveFile}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ) : (
        <Card 
          className={`p-8 text-center border-2 border-dashed transition-colors cursor-pointer ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-primary/5'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <div className="space-y-4">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload en cours...
                </p>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Glissez-déposez votre fichier ici
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    ou cliquez pour sélectionner un fichier
                  </p>
                  <Button variant="outline">
                    <File className="h-4 w-4 mr-2" />
                    Sélectionner un fichier
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Types acceptés : {accept} • Taille max : {maxSize}MB
                </p>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
