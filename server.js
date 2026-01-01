import { WebSocketServer } from "ws";

const PORT = process.env.PORT || 3000;

const wss = new WebSocketServer({ port: PORT });

let clients = new Map();

wss.on("connection", (ws) => {
  let username = null;

  ws.on("message", (data) => {
    const msg = JSON.parse(data);

    if (msg.type === "join") {
      username = msg.username;
      clients.set(username, ws);
      broadcastUsers();
    }

    if (msg.type === "signal") {
      const target = clients.get(msg.to);
      if (target) {
        target.send(JSON.stringify(msg));
      }
    }
  });

  ws.on("close", () => {
    if (username) {
      clients.delete(username);
      broadcastUsers();
    }
  });

  function broadcastUsers() {
    const users = Array.from(clients.keys());
    for (let client of clients.values()) {
      client.send(JSON.stringify({
        type: "users",
        users
      }));
    }
  }
});

console.log("🟢 WebRTC signaling server running on port", PORT);
