from __future__ import annotations

import io
from typing import Any
from deephaven.plugin.object_type import MessageStream, BidirectionalObjectType
from altair import SchemaBase
from altair.vegalite.v5 import VConcatChart, HConcatChart, ConcatChart, FacetChart, RepeatChart
from altair.utils.schemapi import SchemaValidationError


class DeephavenAltairMessageStream(MessageStream):
    """
    A custom MessageStream

    Attributes:
        _client_connection: MessageStream: The connection to the client
    """

    def __init__(self, obj: Any, client_connection: MessageStream):
        super().__init__()
        self._client_connection = client_connection

        # Start the message stream.
        # All we do is send a blank message to start.
        # Client will respond with the initial state.
        self._client_connection.on_data(b"", [])

        self._client_connection.on_data(obj.to_json().encode(), [])


    def send_message(self, message: str) -> None:
        """
        Send a message to the client

        Args:
            message: The message to send
        """
        self._client_connection.on_data(message.encode(), [])

    def on_data(self, payload: bytes, references: list[Any]) -> None:
        """
        Handle a payload from the client.

        Args:
            payload: Payload to execute
            references: References to objects on the server

        Returns:
            The payload to send to the client and the references to send to the client
        """
        pass

    def on_close(self) -> None:
        """
        Close the connection
        """
        pass


def is_compound_chart(obj: Any) -> bool:
    """
    Check if the object is a compound chart

    Args:
        obj: The object to check

    Returns:
        True if the object is a compound chart, False otherwise
    """
    return isinstance(obj, (VConcatChart, HConcatChart, ConcatChart, FacetChart, RepeatChart))


# The object type that will be registered with the plugin system.
# The object is bidirectional, meaning it can send messages to and from the client.
# A MessageStream is created for each object that is created. This needs to be saved and tied to the object.
# The value returned by name() should match supportedTypes in DeephavenAltairPlugin.ts
class DeephavenAltairType(BidirectionalObjectType):
    """
    Defines the Element type for the Deephaven plugin system.
    """

    @property
    def name(self) -> str:
        return "DeephavenAltair"

    def is_type(self, obj: Any) -> bool:
        if isinstance(obj, SchemaBase):
            try:
                obj.to_json()
            except SchemaValidationError:
                # this figure can be ignored as it may not be ready yet
                return False
        # currently, we don't support compound charts (besides layering)
        return isinstance(obj, SchemaBase) and not is_compound_chart(obj)

    def create_client_connection(
        self, obj: object, connection: MessageStream
    ) -> MessageStream:
        message_stream = DeephavenAltairMessageStream(obj, connection)
        return message_stream
