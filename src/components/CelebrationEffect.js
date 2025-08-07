import React, { useEffect, useState } from 'react';

const CelebrationEffect = ({ show, onComplete }) => {
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    if (show) {
      const newConfetti = [];
      for (let i = 0; i < 50; i++) {
        newConfetti.push({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 2,
          duration: 3 + Math.random() * 2
        });
      }
      setConfetti(newConfetti);

      const timer = setTimeout(() => {
        setConfetti([]);
        if (onComplete) onComplete();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="celebration">
      {confetti.map(item => (
        <div
          key={item.id}
          className="confetti"
          style={{
            left: `${item.left}%`,
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`
          }}
        />
      ))}
    </div>
  );
};

export default CelebrationEffect;