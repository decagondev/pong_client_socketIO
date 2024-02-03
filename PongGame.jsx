import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const PongGame = () => {
  const [socket, setSocket] = useState(null);
  const [playerPaddleY, setPlayerPaddleY] = useState(0);
  const [opponentPaddleY, setOpponentPaddleY] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);

  useEffect(() => {
    const newSocket = io('http://localhost:5000/game');
    setSocket(newSocket);

    newSocket.on('connected', () => {
      console.log('Connected to the server.');
    });

    newSocket.on('update_paddle', (data) => {
      setOpponentPaddleY(data.y);
    });

    newSocket.on('update_score', (data) => {
      setPlayerScore(data.player_score);
      setOpponentScore(data.opponent_score);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleKeyDown = (event) => {
    if (socket && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      const direction = event.key === 'ArrowUp' ? -1 : 1;
      const newPaddleY = playerPaddleY + direction * 10;

      if (newPaddleY >= 0 && newPaddleY <= 340) {
        setPlayerPaddleY(newPaddleY);
        socket.emit('update_paddle', { y: newPaddleY });
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [playerPaddleY, socket]);

  const canvasRef = React.createRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player paddle
    ctx.fillStyle = 'white';
    ctx.fillRect(50, playerPaddleY, 10, 60);

    // Draw opponent paddle
    ctx.fillRect(540, opponentPaddleY, 10, 60);

    // Draw ball
    ctx.beginPath();
    ctx.arc(300, 200, 10, 0, 2 * Math.PI);
    ctx.fill();

    // Display scores
    ctx.font = '20px Arial';
    ctx.fillText(`Your Score: ${playerScore}`, 20, 20);
    ctx.fillText(`Opponent Score: ${opponentScore}`, 400, 20);
  }, [playerPaddleY, opponentPaddleY, playerScore, opponentScore]);

  return (
    <div>
      <canvas ref={canvasRef} width={600} height={400} style={{ border: '1px solid black' }}></canvas>
    </div>
  );
};

export default PongGame;
