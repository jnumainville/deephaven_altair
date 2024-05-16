import { type WidgetPlugin, PluginType } from '@deephaven/plugin';
import { vsGraph } from '@deephaven/icons';
import { DeephavenAltairView } from './DeephavenAltairView';

// Register the plugin with Deephaven
export const DeephavenAltairPlugin: WidgetPlugin = {
  // The name of the plugin
  name: 'deephaven-altair',
  // The type of plugin - this will generally be WIDGET_PLUGIN
  type: PluginType.WIDGET_PLUGIN,
  // The supported types for the plugin. This should match the value returned by `name`
  // in DeephavenAltairType in deephaven_altair_type.py
  supportedTypes: 'DeephavenAltair',
  // The component to render for the plugin
  component: DeephavenAltairView,
  // The icon to display for the plugin
  icon: vsGraph,
};

export default DeephavenAltairPlugin;
