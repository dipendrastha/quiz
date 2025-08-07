import React, { useState, useRef, useEffect } from 'react';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Create audio context for KBC-style background music
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const playKBCMusic = () => {
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      // Create oscillators for KBC-style dramatic music
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // KBC-style dramatic frequencies
      oscillator1.frequency.setValueAtTime(220, audioContext.currentTime);
      oscillator2.frequency.setValueAtTime(330, audioContext.currentTime);
      
      oscillator1.type = 'sine';
      oscillator2.type = 'triangle';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      
      if (isPlaying) {
        oscillator1.start();
        oscillator2.start();
        
        // Create dramatic build-up effect
        setInterval(() => {
          if (isPlaying) {
            oscillator1.frequency.exponentialRampToValueAtTime(
              220 + Math.random() * 100, 
              audioContext.currentTime + 2
            );
            oscillator2.frequency.exponentialRampToValueAtTime(
              330 + Math.random() * 150, 
              audioContext.currentTime + 2
            );
          }
        }, 2000);
      }
    };

    if (isPlaying) {
      playKBCMusic();
    }

    return () => {
      if (audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [isPlaying]);

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