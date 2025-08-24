import React, { useState, useRef } from "react";
import { X, Upload, Image, FileText, File } from "lucide-react";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  isUploading,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await onUpload(selectedFile);
      handleClose();
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setDragActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <Image size={24} className="text-blue-500" />;
    } else if (file.type.includes("text") || file.type.includes("document")) {
      return <FileText size={24} className="text-green-500" />;
    } else {
      return <File size={24} className="text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="p-4 border-b border-base-300 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Upload File</h3>
          <button
            className="btn btn-ghost btn-circle btn-sm"
            onClick={handleClose}
            disabled={isUploading}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {!selectedFile ? (
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${dragActive 
                  ? "border-primary bg-primary/10" 
                  : "border-base-300 hover:border-primary/50"
                }
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload size={48} className="mx-auto mb-4 text-base-content/50" />
              <p className="text-base-content/70 mb-2">
                Drag and drop a file here, or click to select
              </p>
              <p className="text-sm text-base-content/50 mb-4">
                Maximum file size: 10MB
              </p>
              <button
                className="btn btn-outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileInputChange}
                accept="image/*,text/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Preview */}
              <div className="flex items-center space-x-3 p-3 bg-base-200 rounded-lg">
                {getFileIcon(selectedFile)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedFile.name}</p>
                  <p className="text-sm text-base-content/70">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <button
                  className="btn btn-ghost btn-circle btn-sm"
                  onClick={() => setSelectedFile(null)}
                  disabled={isUploading}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Image Preview */}
              {selectedFile.type.startsWith("image/") && (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-base-300 flex space-x-3">
          <button
            className="btn btn-outline flex-1"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary flex-1"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
