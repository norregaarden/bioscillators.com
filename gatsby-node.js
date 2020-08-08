exports.onCreateWebpackConfig = ({ getConfig, stage, loaders, actions }) => {
  const config = getConfig()
  if (stage.startsWith('develop') && config.resolve) {
    // what is this for?
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-dom': '@hot-loader/react-dom'
    }
    // Fixes npm packages that depend on `fs` module (sbml_websim)
    config.node = {
      fs: 'empty'
    }
  }

  // fix window is undefined errors on build
  if (stage === 'build-html') {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /cytoscape|cytoscape-edgehandles|react-cytoscapejs|plotly\.js|react-plotly\.js|chart\.js/,
            use: loaders.null(),
          },
        ],
      },
    })
  }
}
