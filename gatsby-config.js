/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

module.exports = {
  siteMetadata: {
    title: `Bioscillators`,
    description: `Exploring biophysical dynamical systems in javascript`,
    author: `@norregaarden`,
    siteUrl: `https://bioscillators.com`,
    url: `https://bioscillators.com`,
    links: [
      ['/goodwin', 'Goodwin Model'],
      // ['/ultrasensitivity', 'Ultrasensitivity'],
      ['/lotka-volterra', 'Lotka-Volterra'],
      ['/harmonic-oscillator', 'Harmonic Oscillator'],
      ['/SIR', 'Epidemiology: SIR']
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
      resolve: 'gatsby-plugin-exclude',
      options: { paths: ['/legacy/**'] }, // , '!/app/demo/*'   // all paths prefixed by /app/ will be excluded, except for app/demo/
      // '/offline-plugin-app-shell-fallback/**', '!/offline-plugin-app-shell-fallback/index.html'
      // , 
    },
    {
      resolve: `gatsby-theme-material-ui`,
      // options: {
      //   stylesConfig: {
      //     disableAutoprefixing: true,
      //     disableMinification: false
      //   },
      // },
    },
    'gatsby-plugin-root-import',
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Bioscillators`,
        short_name: `bioscillators`,
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
    'gatsby-plugin-sitemap',
    'gatsby-plugin-htaccess',
  ],
}
