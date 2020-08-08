import React from 'react'
import Divider from '@material-ui/core/Divider'

const divider = (props) => <Divider {...props} style={{ margin: 24 }}></Divider>

divider.defaultProps = {
	variant: 'middle'
}

export default divider
