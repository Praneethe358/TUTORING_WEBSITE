import React, { useState } from 'react';

export const FilePreview = ({ file, fileName, fileUrl, onClose }) => {
  const [loading, setLoading] = useState(true);
  
  // Determine file type
  const isPDF = fileName?.toLowerCase().endsWith('.pdf') || file?.type === 'application/pdf';
  const isImage = fileName?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|svg)$/) || file?.type?.startsWith('image/');
  const isVideo = fileName?.toLowerCase().match(/\.(mp4|webm|ogg)$/) || file?.type?.startsWith('video/');
  const isAudio = fileName?.toLowerCase().match(/\.(mp3|wav|ogg|m4a)$/) || file?.type?.startsWith('audio/');
  
  const previewUrl = fileUrl || (file ? URL.createObjectURL(file) : null);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-5xl w-full max-h-[90vh] flex flex-col border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-white font-semibold truncate flex-1">{fileName || 'Preview'}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-900">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {isPDF && (
            <iframe
              src={previewUrl}
              className="w-full h-full min-h-[600px] rounded-lg"
              onLoad={() => setLoading(false)}
              title={fileName}
            />
          )}

          {isImage && (
            <img
              src={previewUrl}
              alt={fileName}
              className="max-w-full max-h-full object-contain rounded-lg"
              onLoad={() => setLoading(false)}
            />
          )}

          {isVideo && (
            <video
              src={previewUrl}
              controls
              className="max-w-full max-h-full rounded-lg"
              onLoadedData={() => setLoading(false)}
            >
              Your browser does not support video playback.
            </video>
          )}

          {isAudio && (
            <div className="w-full max-w-md">
              <audio
                src={previewUrl}
                controls
                className="w-full"
                onLoadedData={() => setLoading(false)}
              >
                Your browser does not support audio playback.
              </audio>
            </div>
          )}

          {!isPDF && !isImage && !isVideo && !isAudio && (
            <div className="text-center space-y-4">
              <svg className="w-16 h-16 text-slate-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-slate-400">Preview not available for this file type</p>
              <p className="text-sm text-slate-500">{fileName}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 flex justify-end gap-2">
          {fileUrl && (
            <a
              href={fileUrl}
              download={fileName}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition"
            >
              Download
            </a>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilePreview;
