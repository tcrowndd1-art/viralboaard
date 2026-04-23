import { useEffect } from 'react';

interface VideoModalProps {
  videoId: string;
  isShorts: boolean;
  onClose: () => void;
}

export function VideoModal({ videoId, isShorts, onClose }: VideoModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  const aspectClass = isShorts ? 'aspect-[9/16] max-w-sm' : 'aspect-video max-w-4xl';

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${aspectClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white text-2xl cursor-pointer"
          aria-label="Close"
        >✕</button>
        <iframe
          src={embedUrl}
          className="w-full h-full rounded-lg"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>
    </div>
  );
}
