import React, { CSSProperties, useEffect, useState, useMemo, useCallback } from 'react';
import { useApi } from '@deephaven/jsapi-bootstrap';
import Log from '@deephaven/log';
import { ThemeProvider, useTheme } from "@deephaven/components";
import { WidgetComponentProps } from '@deephaven/plugin';
import type { Widget } from '@deephaven/jsapi-types';
import { VegaLite } from 'react-vega'
import { defaultChartTheme, useChartTheme } from '@deephaven/chart';

const log = Log.module('deephaven-altair.DeephavenAltairView');

// Create a custom style for the component
export const DeephavenAltairViewStyle: CSSProperties = {
  fontSize: "x-large",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
  width: "100%",
  flexDirection: "column"
};

function assignConfig(newSpec, configKey, newConfig) {
    if (newSpec.config[configKey]) {
        newSpec.config[configKey] = { ...newConfig, ...newSpec.config[configKey] };
    } else {
        newSpec.config[configKey] = newConfig;
    }
}

export function DeephavenAltairView(props: WidgetComponentProps): JSX.Element {
  const { fetch } = props;
  const [spec, setSpec] = useState<string>(null);
  const [themedSpec, setThemedSpec] = useState<string>(null);
  const [specLoaded, setSpecLoaded] = useState<boolean>(false);
  const dh = useApi();
  const { activeThemes } = useTheme();

  const chartTheme = useMemo(defaultChartTheme, [activeThemes]);

  const handleRedraw = useCallback(
    () => {
      // replace the spec with the new width, height, and theme
      if (specLoaded) {
          const newSpec = JSON.parse(JSON.stringify(spec));
          // size props are always set to ensure the chart fits the container
          newSpec.width = props.glContainer.width - 50;
          newSpec.height = props.glContainer.height - 40;
          newSpec.autosize = {
              type: 'fit',
              contains: 'padding',
              resize: true,
          };

          // most props are only set if not already set in the spec
          if (!newSpec.background) {
              newSpec.background = chartTheme.paper_bgcolor;
          }

          const newTitle = {
              color: chartTheme.title_color,
          }

          if (newSpec.config.title) {
              // title can be a string or an object
              if (typeof newSpec.config.title === 'string') {
                  newSpec.config.title = { text: newSpec.title, ...newTitle };
              } else {
                  newSpec.config.title = { ...newTitle, ...newSpec.config.title };
              }
          } else {
              newSpec.config.title = newTitle;
          }

          if (!newSpec.config) {
              newSpec.config = {};
          }

          const newLegend = {
              titleColor: chartTheme.legend_color,
              labelColor: chartTheme.legend_color,
          }

          assignConfig(newSpec, 'legend', newLegend);

          const newAxis = {
              domainColor: chartTheme.linecolor,
              gridColor: chartTheme.gridcolor,
              tickColor: chartTheme.paper_bgcolor,
              labelColor: chartTheme.title_color,
              titleColor: chartTheme.title_color,
          }

          assignConfig(newSpec, 'axis', newAxis);

          const newView = {
              stroke: chartTheme.linecolor,
          }

          assignConfig(newSpec, 'view', newView);

          // split colorway on space and convert to array
          const colorway = chartTheme.colorway.split(' ');

          const newRange = {
              category: colorway,
          }

          assignConfig(newSpec, 'range', newRange);

          const newMark = {
              color: colorway[0],
          }

          assignConfig(newSpec, 'mark', newMark);

          const newGeoshape = {
              fill: chartTheme.land_color,
              stroke: chartTheme.coastline_color,
          }

          assignConfig(newSpec, 'geoshape', newGeoshape);

          setThemedSpec(newSpec);
      }
    }, [specLoaded, chartTheme]);

  useEffect(() => {
    const { glContainer } = props;

    handleRedraw();
    glContainer.on('resize', handleRedraw);

    return () => {
        glContainer.off('resize', handleRedraw);
    };
  }, [props, handleRedraw]);


  useEffect(() => {
    async function init() {
       // Fetch the widget from the server
      const widget = await fetch() as Widget;

      // Add an event listener to the widget to listen for messages from the server
      widget.addEventListener<Widget>(
          dh.Widget.EVENT_MESSAGE,
          ({ detail }) => {
            const spec = JSON.parse(detail.getDataAsString());
            setSpec(spec);
            setSpecLoaded(true);
          }
      );
    }

    init();
  }, [dh, fetch]);


  return (

    <div style={DeephavenAltairViewStyle}>
      {themedSpec ? <VegaLite spec={themedSpec} /> : <div>Loading...</div>}
    </div>
  );
}
export default DeephavenAltairView;
