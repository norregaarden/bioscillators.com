import React, { useState } from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MenuIcon from '@material-ui/icons/Menu'
import Box from '@material-ui/core/Box'

// https://material-ui.com/components/app-bar/
// https://material-ui.com/components/menus/

import Link from 'src/components/link'

const headerStyles = makeStyles((theme) => ({
	menuButton: {
		marginRight: theme.spacing(2),
	},
	title: {
		flexGrow: 1,
		margin: theme.spacing(2)
	},
	menuItem: {
		padding: 0,
		fontSize: "1.25rem",

		'& a': {
			width: '100%'
		}
	}
}))

export default () => {
	const classes = headerStyles()
	const [menuButton, setMenuButton] = useState(null)
	const menuOpen = (event) => {
		setMenuButton(event.target)
	}
	const menuClose = () => {
		setMenuButton(null)
	}
	const data = useStaticQuery(graphql`
		query {
			site {
				siteMetadata {
					title
					links
				}
			}
		}
	`)

	return (
		<AppBar position="static" elevation={0}>
			<Toolbar color="primary">
				<IconButton aria-controls="main-menu" aria-haspopup="true" onClick={menuOpen} color="inherit">
					<MenuIcon></MenuIcon>
				</IconButton>
				{/* // TO DO: https://material-ui.com/components/lists/ nested list */}
				<Menu id="main-menu"
					elevation={0}
					anchorEl={menuButton}
					keepMounted
					open={Boolean(menuButton)}
					onClose={menuClose}>
					{data.site.siteMetadata.links.map( (link, index) => 
						<MenuItem key={index} className={classes.menuItem}>
							<Link to={link[0]} activeClassName="active">
								<Box py={2} px={3}>{link[1]}</Box>
							</Link>
						</MenuItem>
					)}
				</Menu>

				<Link to="/">
					<Typography variant="h6" className={classes.title}>
						{data.site.siteMetadata.title}
					</Typography>
				</Link>
			</Toolbar>
		</AppBar>
	)
}
