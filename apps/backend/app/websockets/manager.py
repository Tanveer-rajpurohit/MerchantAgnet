import uuid
from typing import Any
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self) -> None:
        self.active_rooms: dict[uuid.UUID, dict[WebSocket, str]] = {}

    async def connect(
        self,
        connection_id: uuid.UUID,
        websocket: WebSocket,
        role: str = "customer",
    ) -> None:
        await websocket.accept()
        if connection_id not in self.active_rooms:
            self.active_rooms[connection_id] = {}
        self.active_rooms[connection_id][websocket] = role

    def disconnect(self, connection_id: uuid.UUID, websocket: WebSocket) -> None:
        if connection_id in self.active_rooms:
            self.active_rooms[connection_id].pop(websocket, None)
            if not self.active_rooms[connection_id]:
                del self.active_rooms[connection_id]

    def is_merchant_online(self, connection_id: uuid.UUID) -> bool:
        room = self.active_rooms.get(connection_id, {})
        return any(role == "merchant" for role in room.values())

    def is_customer_online(self, connection_id: uuid.UUID) -> bool:
        room = self.active_rooms.get(connection_id, {})
        return any(role == "customer" for role in room.values())

    def get_room_participants(self, connection_id: uuid.UUID) -> dict[str, int]:
        room = self.active_rooms.get(connection_id, {})
        return {
            "merchants": sum(1 for role in room.values() if role == "merchant"),
            "customers": sum(1 for role in room.values() if role == "customer"),
            "total": len(room),
        }

    async def broadcast(
        self,
        connection_id: uuid.UUID,
        message: dict[str, Any],
        exclude: WebSocket | None = None,
    ) -> None:
        if connection_id not in self.active_rooms:
            return
        dead_connections: list[WebSocket] = []
        for ws in list(self.active_rooms[connection_id].keys()):
            if exclude is not None and ws is exclude:
                continue
            try:
                await ws.send_json(message)
            except Exception:
                dead_connections.append(ws)

        for ws in dead_connections:
            self.disconnect(connection_id, ws)

manager = ConnectionManager()
