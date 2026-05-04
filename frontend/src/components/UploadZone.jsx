import React, { useState, useCallback, useRef } from 'react';
import { UploadCloud, File, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const UploadZone = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (selectedFile) => {
    if (selectedFile.type !== 'application/pdf' && selectedFile.type !== 'text/plain') {
      setStatus('error');
      setErrorMessage('Only PDF and TXT files are supported.');
      return;
    }
    
    setFile(selectedFile);
    setStatus('uploading');
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    try {
      const response = await axios.post('http://127.0.0.1:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setStatus('success');
      onUploadSuccess(response.data.chunks, selectedFile.name);
      
      setTimeout(() => {
        setStatus('idle');
        setFile(null);
        // Reset input so the same file can be re-selected after a Clear DB
        if (inputRef.current) inputRef.current.value = '';
      }, 3000);
      
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.response?.data?.detail || 'An error occurred during upload.');
      // Reset input so user can retry the same file
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="bg-aero-card border border-aero-border rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-aero-accent opacity-5 rounded-full blur-3xl"></div>
      
      <h2 className="text-xl font-semibold mb-4 text-gray-100">Upload Context</h2>
      
      <div 
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragging 
            ? 'border-aero-accent bg-aero-accent bg-opacity-10' 
            : 'border-aero-border hover:border-gray-600 hover:bg-gray-800 hover:bg-opacity-30'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          ref={inputRef}
          type="file" 
          accept=".pdf,.txt" 
          onChange={handleChange} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          disabled={status === 'uploading'}
        />
        
        <div className="min-h-[140px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {status === 'idle' && (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center pointer-events-none"
              >
                <div className="p-4 bg-gray-800 rounded-full mb-4 shadow-inner">
                  <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-aero-accent transition-colors" />
                </div>
                <p className="text-sm font-medium mb-1 text-gray-200">Click or drag PDF or TXT to upload</p>
                <p className="text-xs text-gray-500">Extracts and chunks text for analysis</p>
              </motion.div>
            )}
            
            {status === 'uploading' && (
              <motion.div 
                key="uploading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center pointer-events-none"
              >
                <Loader2 className="w-10 h-10 text-aero-accent animate-spin mb-4 drop-shadow-md" />
                <p className="text-sm font-medium text-aero-accent">Processing {file?.name}...</p>
                <p className="text-xs text-gray-400 mt-2">Chunking & embedding with MiniLM</p>
              </motion.div>
            )}
            
            {status === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center pointer-events-none"
              >
                <div className="p-3 bg-green-500 bg-opacity-20 rounded-full mb-3 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
                <p className="text-sm font-medium text-green-400">Upload Complete!</p>
              </motion.div>
            )}
            
            {status === 'error' && (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
                <p className="text-sm font-medium text-red-400 mb-1">Upload Failed</p>
                <p className="text-xs text-red-400 opacity-80 text-center max-w-[200px]">{errorMessage}</p>
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setStatus('idle'); }}
                  className="mt-4 px-4 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs hover:bg-gray-700 transition-colors z-30 relative"
                >
                  Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default UploadZone;
