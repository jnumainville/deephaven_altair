from deephaven.plugin import Registration, Callback
from deephaven.plugin.utilities import create_js_plugin

from .js_plugin import DeephavenAltairJsPlugin
from .deephaven_altair_type import DeephavenAltairType

# The namespace that the Python plugin will be registered under.
PACKAGE_NAMESPACE = "deephaven_altair"
# Where the Javascript plugin is. This is set in setup.py.
JS_NAME = "_js"
# The JsPlugin class that will be created and registered.
PLUGIN_CLASS = DeephavenAltairJsPlugin


class DeephavenAltairRegistration(Registration):
    @classmethod
    def register_into(cls, callback: Callback) -> None:

        # Register the Python plugin
        callback.register(DeephavenAltairType)

        # The JavaScript plugin requires a special registration process, which is handled here
        js_plugin = create_js_plugin(
            PACKAGE_NAMESPACE,
            JS_NAME,
            PLUGIN_CLASS,
        )

        callback.register(js_plugin)
