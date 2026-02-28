import uuid
from typing import Dict, List
from fastapi import WebSocket
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from models.message import Message
from models.match import Match

class ChatService:
    def __init__(self, db: AsyncSession = None):
        self.db = db

    async def save_message(self, match_id: uuid.UUID, sender_id: uuid.UUID, content: str) -> Message:
        msg = Message(
            match_id=match_id,
            sender_id=sender_id,
            content=content
        )
        self.db.add(msg)
        await self.db.commit()
        await self.db.refresh(msg)
        return msg

    async def get_messages(self, match_id: uuid.UUID, limit: int = 50, offset: int = 0):
        qry = select(Message).where(Message.match_id == match_id).order_by(Message.created_at.desc()).offset(offset).limit(limit)
        result = await self.db.execute(qry)
        return result.scalars().all()

# In-memory WebSocket manager (can be substituted with Redis Pub/Sub for distributed)
class ConnectionManager:
    def __init__(self):
        # map user_id to list of active websockets
        self.active_connections: Dict[uuid.UUID, List[WebSocket]] = {}

    async def connect(self, user_id: uuid.UUID, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, user_id: uuid.UUID, websocket: WebSocket):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: uuid.UUID):
        connections = self.active_connections.get(user_id, [])
        for connection in connections:
            await connection.send_json(message)

manager = ConnectionManager()
