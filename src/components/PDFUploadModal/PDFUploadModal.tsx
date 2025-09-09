import React, { useState, useRef } from 'react';
import Button from '@/components/Button/Button';
import Card from '@/components/Card/Card';

interface PDFUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  candidateName?: string;
}

export const PDFUploadModal: React.FC<PDFUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  candidateName
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Проверяем тип файла
      if (selectedFile.type !== 'application/pdf') {
        setError('Пожалуйста, выберите PDF файл');
        return;
      }

      // Проверяем размер файла (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('Размер файла не должен превышать 10MB');
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Пожалуйста, выберите файл');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      await onUpload(file);
      setFile(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки файла');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            Загрузка CV для {candidateName || 'кандидата'}
          </h2>

          <div className="mb-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {file ? (
                <div>
                  <div className="text-green-600 mb-2">
                    ✅ Файл выбран: {file.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    Размер: {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-gray-500 mb-2">
                    📄 Перетащите PDF файл сюда или
                  </div>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    Выберите файл
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-medium text-blue-800 mb-2">Требования к файлу:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Формат: PDF</li>
              <li>• Максимальный размер: 10MB</li>
              <li>• Файл должен содержать резюме кандидата</li>
            </ul>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="flex-1"
            >
              {isUploading ? 'Загрузка...' : 'Загрузить CV'}
            </Button>
            <Button
              onClick={handleClose}
              variant="outline"
              disabled={isUploading}
            >
              Отмена
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};