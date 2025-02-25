import Room from './Room.js'


class RoomService {
  constructor(redis) {
    this.redis = redis;
    this.rooms = {}      
  }

  createRoom() {
    const room = new Room(this.redis)
    this.rooms[room.id] = room
    return room;
  }

  getOrCreateRoom(roomId) {
    if(!roomId) {
      return this.createRoom()
    }

    const existingRoom = this.rooms[roomId] 
    if(existingRoom) return existingRoom

    return this.createRoom()
  }
}

const rooms = new RoomService()

export default rooms