import uuid
from typing import Any
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self) -> None:
        self.active_rooms: dict[uuid.UUID, dict[WebSocket, str]] = {}

    def _normalize_id(self, connection_id: uuid.UUID | str) -> uuid.UUID:
        return uuid.UUID(str(connection_id)) if not isinstance(connection_id, uuid.UUID) else connection_id

    async def connect(
        self,
        connection_id: uuid.UUID | str,
        websocket: WebSocket,
        role: str = "customer",
    ) -> None:
        await websocket.accept()
        conn_id = self._normalize_id(connection_id)
        if conn_id not in self.active_rooms:
            self.active_rooms[conn_id] = {}
        self.active_rooms[conn_id][websocket] = role

    def disconnect(self, connection_id: uuid.UUID | str, websocket: WebSocket) -> None:
        conn_id = self._normalize_id(connection_id)
        if conn_id in self.active_rooms:
            self.active_rooms[conn_id].pop(websocket, None)
            if not self.active_rooms[conn_id]:
                del self.active_rooms[conn_id]

    def is_merchant_online(self, connection_id: uuid.UUID | str) -> bool:
        conn_id = self._normalize_id(connection_id)
        room = self.active_rooms.get(conn_id, {})
        return any(role == "merchant" for role in room.values())

    def is_customer_online(self, connection_id: uuid.UUID | str) -> bool:
        conn_id = self._normalize_id(connection_id)
        room = self.active_rooms.get(conn_id, {})
        return any(role == "customer" for role in room.values())

    def get_room_participants(self, connection_id: uuid.UUID | str) -> dict[str, int]:
        conn_id = self._normalize_id(connection_id)
        room = self.active_rooms.get(conn_id, {})
        return {
            "merchants": sum(1 for role in room.values() if role == "merchant"),
            "customers": sum(1 for role in room.values() if role == "customer"),
            "total": len(room),
        }

    async def broadcast(
        self,
        connection_id: uuid.UUID | str,
        message: dict[str, Any],
        exclude: WebSocket | None = None,
    ) -> None:
        conn_id = self._normalize_id(connection_id)
        if conn_id not in self.active_rooms:
            return
        dead_connections: list[WebSocket] = []
        for ws in list(self.active_rooms[conn_id].keys()):
            if exclude is not None and ws is exclude:
                continue
            try:
                await ws.send_json(message)
            except Exception:
                dead_connections.append(ws)

        for ws in dead_connections:
            self.disconnect(conn_id, ws)

manager = ConnectionManager()
