"""
WebSocket Broadcaster — fans out events to all connected frontend clients.
Uses asyncio queues (Redis pub/sub optional enhancement).
"""
import asyncio
import json
import logging
from typing import Set
from fastapi import WebSocket

log = logging.getLogger("broadcaster")


class ConnectionManager:
    """Manages all active WebSocket connections."""

    def __init__(self):
        self._connections: Set[WebSocket] = set()
        self._queue: asyncio.Queue = asyncio.Queue(maxsize=1000)

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self._connections.add(ws)
        log.info(f"WebSocket connected. Total: {len(self._connections)}")

    def disconnect(self, ws: WebSocket):
        self._connections.discard(ws)
        log.info(f"WebSocket disconnected. Total: {len(self._connections)}")

    async def broadcast(self, event_type: str, data: dict):
        """Broadcasts an event to all connected clients."""
        message = json.dumps({"type": event_type, "data": data})
        dead = set()
        for ws in self._connections:
            try:
                await ws.send_text(message)
            except Exception:
                dead.add(ws)
        for ws in dead:
            self._connections.discard(ws)

    async def send_to(self, ws: WebSocket, event_type: str, data: dict):
        """Send to a single client."""
        try:
            await ws.send_text(json.dumps({"type": event_type, "data": data}))
        except Exception:
            self._connections.discard(ws)

    @property
    def count(self) -> int:
        return len(self._connections)


# Global singleton
manager = ConnectionManager()
