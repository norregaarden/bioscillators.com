import React from 'react'
import { Link } from 'gatsby'
import { makeStyles } from '@material-ui/core/styles'

const linkStyle = makeStyles((theme) => ({
    link: {
        textDecoration: 'inherit',
        color: 'inherit',
    
        '&.active': {
            color: theme.palette.primary.main
        }
    },
}))

export default (props) => {
    const classes = linkStyle()

    // props.children are also passed
    return <Link {...props} className={classes.link}>{props.children}</Link>
}