# deephaven_altair

This is a Python plugin to display Vega-Altair charts in Deephaven, generated from a [deephaven-plugin](https://github.com/deephaven/deephaven-plugins) template.

It is a work in progress, but works for basic charts (not compound charts).

## Building the Plugin

To build the plugin, you will need `npm` and `python` installed, as well as the `build` package for Python.
`nvm` is also strongly recommended, and an `.nvmrc` file is included in the project.
The python venv can be created and the recommended packages installed with the following commands:
```sh
cd deephaven_altair
python -m venv .venv
source .venv/bin/activate
pip install --upgrade -r requirements.txt
```

Build the JavaScript plugin from the `src/js` directory:

```sh
cd src/js
nvm use
npm install
npm run build
```

Then, build the Python plugin from the top-level directory:

```sh
cd ../..
python -m build --wheel
```

The built wheel file will be located in the `dist` directory.

## Installing the Plugin

The plugin can be installed into a Deephaven instance with `pip install <wheel file>`.
The wheel file is stored in the `dist` directory after building the plugin.
Exactly how this is done will depend on how you are running Deephaven.
If using the venv created above, the plugin and server can be created with the following commands:
```sh
pip install deephaven-server
pip install dist/deephaven_altair-0.0.1.dev0-py3-none-any.whl
deephaven server
```
See the [plug-in documentation](https://deephaven.io/core/docs/how-to-guides/use-plugins/) for more information.

## Using the Plugin

Once the Deephaven server is running, the plugin should be available to use.

