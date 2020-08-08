import React from 'react'
import { makeStyles, ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import Container from '@material-ui/core/Container'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'

import '../theme/theme.css'
import theme from 'src/theme/theme'
import SEO from 'src/components/seo'
import Header from 'src/components/header'

const useStyles = makeStyles((theme) => ({
	root: {
	  flexGrow: 1,
	},
	container: {
		paddingTop: theme.spacing(3),
		paddingBottom: theme.spacing(3),
		paddingLeft: theme.spacing(5),
		paddingRight: theme.spacing(5)
	}
}));

export default (props) => {
	const classes = useStyles()

	return (
		<ThemeProvider theme={theme}>
			<div className={classes.root}>
				<CssBaseline />
				<SEO title={props.title}></SEO>
				<Header></Header>
				<Container maxWidth="xl" className={classes.container}>
					<Box py={3}>
						<Box my={2}>
							<Typography variant="h1" gutterBottom>{props.title}</Typography>
						</Box>
						<Paper elevation={0}>
							<Box p={3}>
								{props.children}
							</Box>
						</Paper>
					</Box>
				</Container>
			</div>
		</ThemeProvider>
	)
}
