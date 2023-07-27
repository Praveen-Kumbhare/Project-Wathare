import express, { Express, Request, Response } from 'express';
import http from 'http';
import dataRouter from './src/controllers/DataController';
import cors from 'cors';
require('./src/config/dbConnect')
import { Server, Socket } from 'socket.io';
import Data from './src/models/DataModel'; 
const app: Express = express();
const server: http.Server = http.createServer(app);
const io: Server = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket: Socket) => {
  console.log('A user connected');

  setInterval(async () => {
    try {
      const data = await Data.find().sort('timestamp').limit(50);
      socket.emit('dataUpdate', data);
    } catch (error) {
      console.error('Error sending data update:', error);
    }
  }, 2000);

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

app.use(express.json());
app.use(cors());

app.use('/api', dataRouter);

const port: number = parseInt(process.env.PORT || '5000', 10);
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
