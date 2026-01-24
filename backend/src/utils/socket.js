let ioRef = null;
const activeUsers = new Map();

function setIO(io) {
  ioRef = io;
}

function getIO() {
  return ioRef;
}

function setActiveUser(userId, socketId) {
  activeUsers.set(String(userId), socketId);
}

function removeActiveUserBySocket(socketId) {
  for (const [userId, sid] of activeUsers.entries()) {
    if (sid === socketId) {
      activeUsers.delete(userId);
      break;
    }
  }
}

function getActiveSocketId(userId) {
  return activeUsers.get(String(userId));
}

function getActiveUserIds() {
  return Array.from(activeUsers.keys());
}

module.exports = { setIO, getIO, setActiveUser, removeActiveUserBySocket, getActiveSocketId, getActiveUserIds };