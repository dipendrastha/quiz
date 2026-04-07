import React, { useState, useEffect, useRef } from 'react';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Note: For real music, add the audio files to the public folder
  // e.g., public/background-music.mp3

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        // JSDOM doesn't implement play()
        try {
          if (typeof audioRef.current.play === 'function') {
            audioRef.current.play().catch(e => {
              console.log("Audio playback failed:", e);
              setIsPlaying(false);
            });
          }
        } catch (e) {
          // Ignore errors in environments without full HTML5 media support
        }
      } else {
        // JSDOM doesn't implement pause()
        try {
          if (typeof audioRef.current.pause === 'function') {
            audioRef.current.pause();
          }
        } catch (e) {
          // Ignore errors in environments without full HTML5 media support
        }
      }
    }
  }, [isPlaying]);

  const toggleMusic = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="music-control" onClick={toggleMusic}>
      <span>{isPlaying ? '🔊' : '🔇'}</span>
      <audio
        ref={audioRef}
        loop
        src="/background-music.mp3" // Placeholder for actual music asset
      />
    </div>
  );
};

export default MusicPlayer;
