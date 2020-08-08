import React from 'react'
import { graphql } from 'gatsby'
// import Img from 'gatsby-image'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'

import Layout from 'src/components/layout'
import Link from 'src/components/link'
import Divider from 'src/components/divider'
import { Typography, Grid, Box } from '@material-ui/core'

const indexStyles = makeStyles((theme) => ({
	indexLayout: {
		padding: theme.spacing(3)
	},
	// image: {
	// 	margin: theme.spacing(3)
	// }
}))

// data means query (?)
export default ({data}) => {
	const classes = indexStyles()

	// TO DO: width shouldn't be like this for every image
	// const width = parseInt(/max-width: (.*?)px/g.exec(data.file.childImageSharp.fluid.sizes)[1])

	return (
			<Layout title="Biological Oscillators"><Box className={classes.indexLayout}>
				<Typography variant="h4">Three basic biological networks are implemented:</Typography>

				<List>
					{data.site.siteMetadata.links.map( (link, index) =>
						<ListItem key={index} style={{ margin: '16px' }}>
							<Link to={link[0]} activeClassName="active">
								<Button size='large' color='primary' variant='outlined'><Typography variant="h3" style={{ textTransform: 'none', padding: '12px' }}>{link[1]}</Typography></Button>
							</Link>
						</ListItem>
					)}
				</List>

				<Divider />

				<Grid container>
					<Grid item>
						<p><strong>Things you can try:</strong></p>
						<ul>
							<li>Click on an edge or a node to change its properties</li>
							<li>Drag the orange dot to create a new edge</li>
							<li>Right-click the background to create a new node</li>
							<li>Consider how the equations correspond to the network</li>
							<li>Scroll down to see the system develop in time (RK4)</li>
							<li>Play with the parameters in the 'conditions' tab and see the plot change</li>
						</ul>
					</Grid>
					<Grid item>
						<p>(<strike>To do:</strike>)</p>
						<ul>
							{/* <li><strike>Click on a node to change its properties including initial condition</strike></li>
							<li><strike>Right-click to create a new node</strike></li> */}
							<li><strike>Node-colors in differential equations</strike></li>
							<li><strike>Highlight editing edge in differential equations</strike></li>
							<li><strike>Phase plots for both variables and parameters</strike></li>
						</ul>
						<p>(<strike>To do but harder:</strike>)</p>
						<ul>
							<li><strike>Considerably more dynamic plots</strike></li>
							<li><strike>Entrainment to time-dependent functions (light, temperature)</strike></li>
							<li><strike>Search for limit cycles, analytically and computationally</strike></li>
							<li><strike>Units in general and optimizing parameters to experimental data</strike></li>
							<li><strike>Stochastic simulation, compartmentalized and spatial</strike></li>
							<li><strike>Runge-Kutta adaptive time step; WebWorkers og WebAssembly.</strike></li>
							<li><strike>Save sessions, state, time series etc. SBML?</strike></li>
						</ul>
					</Grid>
				</Grid>

				{/* <Img style={{ maxWidth: width }} fluid={data.file.childImageSharp.fluid} className={classes.image} /> */}
			</Box></Layout>
	)
}

export const query = graphql`
	query {
		site {
			siteMetadata {
				links
			}
		}
	}
`
