/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

module.exports = {
  siteMetadata: {
    title: `Chronobiology`,
    description: `Exploring biophysical ordinary differential equations in javascript`,
    author: `@norregaarden`,
    links: [
      ['/goodwin', 'Goodwin'],
      // ['/ultrasensitivity', 'Ultrasensitivity'],
      ['/lotka-volterra', 'Lotka-Volterra'],
      ['/SIR', 'SIR']
      // ['/legacy/goodwin_legacy', 'Legacy | Goodwin'],
      // ['/legacy/ultrasensitivity_legacy', 'Legacy | Ultrasensitivity']
    ]
  },
  plugins: [
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: "UA-167285836-1",
        head: true,
      },
    },
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `src`,
        path: `${__dirname}/src/`,
      },
    },
    {
      resolve: `gatsby-theme-material-ui`,
      options: {
        stylesConfig: {
          disableAutoprefixing: true,
          // disableMinification: true
        },
      },
    },
    'gatsby-plugin-root-import',
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Chronobiology`,
        short_name: `chrono`,
        start_url: `/`,
        background_color: `#000`,
        theme_color: `#fff`,
        display: `minimal-ui`,
        icon: `src/images/cycle-icon.png`, // This path is relative to the root of the site.
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    `gatsby-plugin-offline`,
    {
      resolve: `gatsby-plugin-nprogress`,
      options: {
        // Setting a color is optional.
        color: `tomato`,
        // Disable the loading spinner.
        showSpinner: false,
      },
    },
  ],
}
