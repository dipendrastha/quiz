import React, { useState } from 'react';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleMusic = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="music-control" onClick={toggleMusic}>
      <span>{isPlaying ? '🔊' : '🔇'}</span>
    </div>
  );
};

export default MusicPlayer;