const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 10000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
  console.log('✅ Nowe połączenie');

  socket.on('send_question', (data) => socket.broadcast.emit('receive_question', data));
  socket.on('show_answer', (data) => socket.broadcast.emit('show_answer', data));
  socket.on('wrong_answer', (data) => io.emit('wrong_answer', data));
  socket.on('update_scores', (data) => io.emit('update_scores', data));
  socket.on('current_team', (data) => io.emit('current_team', data));
  socket.on('reveal_all', () => io.emit('reveal_all'));
  socket.on('switch_team', (data) => io.emit('switch_team', data));
  socket.on('team_names', (data) => io.emit('team_names', data));
  socket.on('round_end', () => io.emit('round_end'));
  socket.on('disconnect', () => console.log('❌ Rozłączenie'));
});

server.listen(PORT, () => {
  console.log(`🚀 Serwer działa na porcie ${PORT}`);
});
