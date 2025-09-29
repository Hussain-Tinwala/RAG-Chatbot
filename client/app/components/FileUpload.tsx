'use client'
import { Gem, CheckCircle, LoaderCircle } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'

type UploadStatus = "idle" | "uploading" | "success" | "error";

const FileUpload = () => {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadStatus("uploading");
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      await fetch('http://localhost:3001/upload/pdf', {
        method: 'POST',
        body: formData,
      });
      setUploadStatus("success");
    } catch (error) {
      console.error(error);
      setUploadStatus("error");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    disabled: uploadStatus !== 'idle',
  });

  const renderContent = () => {
    switch (uploadStatus) {
      case 'uploading':
        return (
          <div className="flex flex-col items-center text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            >
              <LoaderCircle className="h-16 w-16 text-gold" />
            </motion.div>
            <p className="mt-4 text-sm text-slate-300">The bot is absorbing knowledge...</p>
          </div>
        );
      case 'success':
        return (
          <div className="flex flex-col items-center text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
              <CheckCircle className="h-16 w-16 text-green-400" />
            </motion.div>
            <p className="mt-4 text-sm font-semibold text-slate-100">Knowledge Absorbed</p>
            <p className="text-xs text-slate-400 mt-1">You may now begin the seance.</p>
          </div>
        );
      case 'error':
        // A button to reset would be a good addition here
        return <p className="text-sm text-red-500">An error occurred. Please refresh.</p>;
      case 'idle':
      default:
        return (
          <div className="flex flex-col items-center text-center">
            <motion.div
              animate={{ rotate: 360, scale: isDragActive ? 1.2 : 1 }}
              transition={{ 
                rotate: { duration: 30, repeat: Infinity, ease: "linear" },
                scale: { type: 'spring', stiffness: 300, damping: 10 }
              }}
              className={`transition-shadow duration-300 ${isDragActive ? 'shadow-2xl shadow-gold/50' : ''}`}
            >
              <Gem className="h-16 w-16 text-gold" />
            </motion.div>
            <p className="mt-4 text-sm text-slate-300">
              {isDragActive ? "The bot is ready..." : "Offer a document to the bot."}
            </p>
          </div>
        );
    }
  };

  return (
    <div
      {...getRootProps()}
      className={`border-dashed border-2 rounded-xl w-full h-full flex justify-center items-center flex-col
                  transition-all duration-300
                  ${uploadStatus !== 'idle' ? 'cursor-default border-gold/30' : 'cursor-pointer border-gold/20 hover:border-gold/50'}
                  ${isDragActive ? 'border-gold/80 bg-gold/10' : ''}`}
    >
      <input {...getInputProps()} />
      {renderContent()}
    </div>
  );
};

export default FileUpload