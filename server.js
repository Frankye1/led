import express from 'express';
import mqtt from 'mqtt';
import http from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const mqttClient = mqtt.connect('mqtt://localhost:1883');
const MQTT_TOPIC = 'esp8266/led';

mqttClient.on('connect', () => {
  console.log('MQTT verbunden');
  mqttClient.subscribe(MQTT_TOPIC);
});

mqttClient.on('message', (topic, message) => {
  if (topic === MQTT_TOPIC) {
    io.emit('led-status', message.toString());
  }
});

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
  console.log('Browser verbunden');

  socket.on('toggle-led', (status) => {
    mqttClient.publish(MQTT_TOPIC, status);
  });
});

server.listen(3000, () => {
  console.log('Webserver läuft auf http://localhost:3000');
});
