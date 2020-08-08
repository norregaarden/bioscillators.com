import React, { useState, useEffect } from 'react'
import Snackbar from '@material-ui/core/snackbar'

// TO DO: typescript
// import MuiAlert, { AlertProps } from '@material-ui/lab/Alert'
// function Alert(props: AlertProps) {

import MuiAlert from '@material-ui/lab/Alert'
import { AlertTitle } from '@material-ui/lab'
function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default ({error, timeoutHandler}) => {
    const [errorState, setErrorState] = useState(error)

    useEffect(() => {
        if (error)
            console.warn(error)
        setErrorState(error)
    }, [error])

    return (error && 
        <Snackbar open={Boolean(errorState)} autoHideDuration={66666} onClose={timeoutHandler}>
            <Alert severity="error">
                <AlertTitle>Error</AlertTitle>
                <pre style={{margin: 0, display: 'inline', fontSize: '1.23456789rem'}}>{errorState.message || errorState}</pre> 
                <br /><small>See console</small>
            </Alert>
        </Snackbar>)
}