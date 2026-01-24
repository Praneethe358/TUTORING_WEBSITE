import React from 'react';

// Social sharing utilities

export const shareTutorProfile = (tutor, tutorId) => {
  const url = `${window.location.origin}/tutors/${tutorId}`;
  const text = `Check out ${tutor.name}, an experienced tutor specializing in ${tutor.subjects?.join(', ')}!`;
  
  return {
    url,
    text,
    title: `${tutor.name} - Tutor Profile`
  };
};

// Share on Twitter/X
export const shareOnTwitter = (url, text) => {
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  window.open(twitterUrl, '_blank', 'width=600,height=400');
};

// Share on Facebook
export const shareOnFacebook = (url) => {
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(facebookUrl, '_blank', 'width=600,height=400');
};

// Share on LinkedIn
export const shareOnLinkedIn = (url, title, summary) => {
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  window.open(linkedInUrl, '_blank', 'width=600,height=400');
};

// Share on WhatsApp
export const shareOnWhatsApp = (url, text) => {
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
  window.open(whatsappUrl, '_blank', 'width=600,height=400');
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

// Native share API (if available)
export const nativeShare = async (data) => {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
      return false;
    }
  }
  return false;
};

// ShareButton component
export const ShareButton = ({ tutor, tutorId, className = '' }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleShare = async (platform) => {
    const { url, text, title } = shareTutorProfile(tutor, tutorId);

    if (platform === 'twitter') {
      shareOnTwitter(url, text);
    } else if (platform === 'facebook') {
      shareOnFacebook(url);
    } else if (platform === 'linkedin') {
      shareOnLinkedIn(url, tutor.name, text);
    } else if (platform === 'whatsapp') {
      shareOnWhatsApp(url, text);
    } else if (platform === 'copy') {
      const copied = await copyToClipboard(url);
      if (copied) {
        alert('Link copied to clipboard!');
      }
    } else if (platform === 'native') {
      await nativeShare({
        title: title,
        text: text,
        url: url
      });
    }

    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
        title="Share"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <button
            onClick={() => handleShare('twitter')}
            className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
          >
            Share on Twitter
          </button>
          <button
            onClick={() => handleShare('facebook')}
            className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
          >
            Share on Facebook
          </button>
          <button
            onClick={() => handleShare('linkedin')}
            className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
          >
            Share on LinkedIn
          </button>
          <button
            onClick={() => handleShare('whatsapp')}
            className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
          >
            Share on WhatsApp
          </button>
          <button
            onClick={() => handleShare('copy')}
            className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-t border-gray-100"
          >
            Copy Link
          </button>
          {navigator.share && (
            <button
              onClick={() => handleShare('native')}
              className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-t border-gray-100"
            >
              More Options
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ShareButton;
