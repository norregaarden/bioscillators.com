import React, { useState, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import TextField from '@material-ui/core/TextField'
import Slider from '@material-ui/core/Slider'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'

import Layout from 'src/components/layout'
import Divider from 'src/components/divider'

import { create, all } from 'mathjs'
import Chart from 'chart.js'

const math = create(all)

function ndsolve(f, x0, dt, tmax) {
	const n = f.size()[0]  // Number of variables
	const x = x0.clone()   // Current values of variables
	const dxdt = []        // Temporary variable to hold time-derivatives
	const result = []      // Contains entire solution

    // let haslogged = false

	const nsteps = math.divide(tmax, dt)   // Number of time steps
	for(let i=0; i<nsteps; i++) {
        // Euler method to compute next time step
		for(let j=0; j<n; j++) {
			dxdt[j] = f.get([j]).apply(null, x.toArray())
        }
		for(let j=0; j<n; j++) {
			x.set([j], math.add(x.get([j]), math.multiply(dxdt[j], dt)))
        }
        
        /* Runge Kutta 
        if (!haslogged && i>10) {
            console.log(dxdt)
            console.log(x)
            console.log(x.toArray())
            haslogged = true
        }

        let k1 = []
        let k2 = []
        let k3 = []
        let k4 = []

        // Runge-Kutta 4th order
		for(let j=0; j<n; j++) {
            k1[j] = f.get([j]).apply(null, x.toArray())
        }
		for(let j=0; j<n; j++) {
            k2[j] = f.get([j]).apply(null, x.toArray().map(x => dt*k1[j]/2))
        }
		for(let j=0; j<n; j++) {
            k3[j] = f.get([j]).apply(null, x.toArray().map(x => dt*k2[j]/2))
        }
		for(let j=0; j<n; j++) {
            k4[j] = f.get([j]).apply(null, x.toArray().map(x => dt*k3[j]))
        }
		for(let j=0; j<n; j++) {
            dxdt[j] = math.multiply( math.multiply((1/6), dt), math.add( math.add(k1[j], k2[j]), math.add(k3[j], k4[j]) ) )
			x.set([j], math.add(x.get([j]), math.multiply(dxdt[j], dt)))
        }
        */      

		result.push(x.clone())
	}

	return math.matrix(result)
}

// Import the numerical ODE solver
math.import({ndsolve:ndsolve})

const useStyles = makeStyles((theme) => ({
    prettyForm: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        '& div[class*=MuiTextField-root], & div[class*=MuiFormControlLabel-root], & pre': {
            margin: theme.spacing(3),
            width: '25ch',
        },
        '& div[class*=MuiButton-root]': {
            margin: theme.spacing(3)
        }
    },
    evalForm: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3),
        '& div[class*=MuiTextField-root]': {
            width: '50ch'
        }
    },
    sliderBox: {
        padding: theme.spacing(3)
    },
    tabs: {
        margin: theme.spacing(3),
    },
    simulation: {
        '& canvas': {
            margin: theme.spacing(3),
            display: 'inline-block !important',
            width: '100%',
            height: 200,
            [theme.breakpoints.up('md')]: {
                height: 400
            }
        }
    }
}));

const vars = [
    {
        l: 'X',
        c: 'red',
        i: 1,
        d: 'dXdt 	= k1*((Ki^n)/(Ki^n + Z^n)) - k2*X '
    },
    {
        l: 'Y',
        c: 'orange',
        i: 1,
        d: 'dYdt 	= k3*X - k4*Y '
    }, 
    {
        l: 'Z',
        c: 'green',
        i: 1,
        d: 'dZdt 	= k5*Y - k6*Z '
    }
]

const sim = math.parser()
sim.scope.dt = 0.01
sim.scope.tmax = 1000
sim.evaluate('k1 = k3 = k5 = 1')
sim.evaluate('k2 = k4 = k6 = 0.1')
sim.evaluate('Ki = 1')
sim.evaluate('n = 10')

// const texOptions = {
//     parenthesis: 'auto'
// }

const arglSt = vars.map(e => e.l).toString() 				// "X,Y,..."
const dervSt = vars.map(e => 'd' + e.l + 'dt').toString() 	// "dXdt,dYdt,..."
const initSt = vars.map(e => e.l + '_').toString()			// "X_,Y_"

vars.forEach(e => {
    // console.log(e.l)
    // console.log(e.l + '_ = ' + e.i)
    // console.log(e.d.replace('dt', 'dt(' + arglSt + ')'))
    // evaluate init value
    sim.evaluate(e.l + '_ = ' + e.i)
    // evaluate derivate
    sim.evaluate(e.d.replace('dt', 'dt(' + arglSt + ')'))
    // tex print
    // dce = document.createElement('div')
    // dce.className = "tex " + e.l
    // document.querySelector('.tex-wrapper').appendChild(dce)
    // katex.render(math.parse(e.d).toTex(texOptions).replace('dt', '/dt'), dce)
})

const chartOptions = {
	responsive: true,
	maintainAspectRatio: true,
	scales: {
		xAxes: [{
			type: 'linear',
			position: 'bottom'
		}]
	}
}

export default () => {
    const precision = 3
    const classes = useStyles()

    const [scope, setScope] = useState(sim.scope)
    const [debug, setDebug] = useState(false)
    const [error, setError] = useState(false)
    const [sliders, setSliders] = useState(true)
    const [tab, setTab] = useState(0)
    const timing = ['dt', 'tmax']
    const evalRef = useRef(null)
    const canvas1 = useRef(null)
    const canvas2 = useRef(null)

    /* 
        separat component? util? 
        hænger sammen med errorhandling i utils/useInterval
    */
    // const [errorString, addErrorString] = useState("default errorString")
    // const setErrorString = newErrorString => {
    //     console.error("'errorString': %s  'newErrorString' %s  'addErrorString' %s", String(errorString), String(newErrorString), String(addErrorString))
    //     return addErrorString(errorString + newErrorString)
    // }
    /* denne errorhandling ikke brugt endnu */

    function simulate() {
        // do the deed
        console.log("result = ndsolve([" + dervSt + "], [" + initSt + "], dt, tmax)")
        sim.evaluate("result = ndsolve([" + dervSt + "], [" + initSt + "], dt, tmax)")

        // only keep every k result for graphing performance
        let keep = parseInt(sim.evaluate("tmax/dt/1000"))
        const times = []
        for(let i=0; i<sim.scope.tmax/sim.scope.dt/keep; i++) {
            times[i] = i*sim.scope.dt*keep
        }
        console.log(keep, times)

        // get results
        try {
            vars.forEach((e,i) => {
                let v_arr = sim.evaluate("transpose(result[:," + (i+1) + "])").toArray()[0]
                if (e.l === "X") console.log(scope.dt, scope.tmax, 'v_arr', v_arr)
                e.arr = v_arr.filter(
                        function(v, i) {
                            return i % keep === 0
                        }
                    ).map(
                    // data format chartjs likes
                        function(v, i) {
                            if (isNaN(v)) setError(true) //console.log(e.l + "; " + i + ";" + v)
                            return {
                                x: times[i],
                                y: v
                            }
                        }
                    )
                // split into two plots - 1/3 and 2/3
                e.arr_start = e.arr.splice(0, math.floor(sim.scope.tmax/sim.scope.dt/3/keep))
                console.log(e.arr_start[10], e.arr[10])
            })
        }
        catch(error) { console.log('try catch'); console.log(error) }

        console.log(vars)
    }

    function plot() {
        new Chart(canvas1.current, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: "X",
                        data: vars[vars.findIndex(e => (e.l === 'X'))].arr_start,
                        fill: false,
                        borderColor: vars[vars.findIndex(e => (e.l === 'X'))].c,
                        pointRadius: 0
                    },
                    {
                        label: "Y",
                        data: vars[vars.findIndex(e => (e.l === 'Y'))].arr_start,
                        fill: false,
                        borderColor: vars[vars.findIndex(e => (e.l === 'Y'))].c,
                        pointRadius: 0
                    },
                    {
                        label: "Z",
                        data: vars[vars.findIndex(e => (e.l === 'Z'))].arr_start,
                        fill: false,
                        borderColor: vars[vars.findIndex(e => (e.l === 'Z'))].c,
                        pointRadius: 0
                    }                    
                ]
            },
            options: chartOptions
        })
        
        new Chart(canvas2.current, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: "X",
                        data: vars[vars.findIndex(e => (e.l === 'X'))].arr,
                        fill: false,
                        borderColor: vars[vars.findIndex(e => (e.l === 'X'))].c,
                        pointRadius: 0
                    },
                    {
                        label: "Y",
                        data: vars[vars.findIndex(e => (e.l === 'Y'))].arr,
                        fill: false,
                        borderColor: vars[vars.findIndex(e => (e.l === 'Y'))].c,
                        pointRadius: 0
                    },
                    {
                        label: "Z",
                        data: vars[vars.findIndex(e => (e.l === 'Z'))].arr,
                        fill: false,
                        borderColor: vars[vars.findIndex(e => (e.l === 'Z'))].c,
                        pointRadius: 0
                    }  
                ]
            },
            options: chartOptions
        })
    }

    function updateScope(key, value) {
        console.log(key, value)
        let scopeTemp = scope
        scopeTemp[key] = value
        setScope({...scopeTemp})
        sim.scope = scopeTemp

        simulate()
        plot()
    }

    function evalScope(evalString) {
        let scopeTemp = scope
        try { math.evaluate(evalString, scopeTemp) } catch(error) {console.log(error)}
        setScope({...scopeTemp})
    }

    function handleEvaluate() {
        let evalString = evalRef.current.value
        evalScope(evalString)
        evalRef.current.value = ''
    }

    return(
        <Layout title="Ultrasensitivity"><Box className={classes.prettyForm}>
            {error && <Button color="secondary" variant="contained" disableElevation size="large">Error</Button>}

            <form noValidate autoComplete="off">
                {timing.map((tim) => (
                    <TextField key={tim} label={tim} value={Number(scope[tim])} onChange={(e) => updateScope(tim, Number(e.target.value))}
                        type="number" InputLabelProps={{shrink: true}} variant="outlined" />
                ))}
            </form>

            <Tabs value={tab} onChange={(e, t) => setTab(t)}
                indicatorColor={tab ? 'secondary' : 'primary'}
                textColor={tab ? 'secondary' : 'primary'}
                variant="fullWidth"
                className={classes.tabs}
            >
                <Tab label="Conditions" id="tab-selector-conditions" aria-controls="tab-conditions" />
                <Tab label="Simulation" id="tab-selector-simulation" aria-controls="tab-simulation" />
            </Tabs>

            <div role="tabpanel"
                id="tab-conditions" aria-labelledby="tab-selector-conditions"
                hidden={tab !== 0}>

                <FormControlLabel label="Sliders" control={
                    <Switch
                        checked={sliders}
                        onChange={() => setSliders(!sliders)}
                        name="checked_sliders"
                        color="primary"
                />}/>

                {(!sliders) && <form noValidate autoComplete="off">
                    {Object.keys(scope).map((key, i) => {
                        let val = Number(scope[key])
                        return ((!timing.includes(key) && scope[key] === Number(scope[key])) && 
                        <TextField
                            key={i}
                            label={key}
                            value={val}
                            inputProps={{
                                step: "0.1"
                            }}
                            onChange={(e) => updateScope(key, Number(e.target.value))}
                            type="number"
                            color="primary"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />)
                    })}
                </form>}

                {sliders && <form noValidate autoComplete="off">
                    <Grid container >
                        {Object.keys(scope).map((key, i) => {
                            let val = Number(Math.log10(scope[key]))
                            return ((!timing.includes(key) && scope[key] === Number(scope[key])) && 
                                <Grid item lg={3} md={4} sm={6} xs={12} className={classes.sliderBox} key={key}>
                                    <Typography gutterBottom color="textSecondary" id={"non-linear-slider-"+key}>
                                        {key + " = " + (10 ** val).toPrecision(precision)}
                                    </Typography>
                                    <Slider
                                        value={val}
                                        min={-6}
                                        step={0.25}
                                        max={6}
                                        scale={x => 10 ** x}
                                        onChange={(e, v) => updateScope(key, Number((10 ** v).toPrecision(precision)))}
                                        aria-labelledby={"non-linear-slider-"+key}
                            /></Grid>)
                        })}
                    </Grid>
                </form>}

                <Divider></Divider>

                <form noValidate autoComplete="off" className={classes.evalForm}>
                    <Grid container direction="row" justify="flex-start" alignItems="center">
                        <TextField key="evaluator" label="Evaluator" placeholder='try "k_new = 123"' inputRef={evalRef}
                            InputLabelProps={{shrink: true}} variant="filled" onKeyPress={(e) => {if (e.key === 'Enter') {e.preventDefault(); handleEvaluate()}}} />
                        <Button onClick={handleEvaluate} variant="contained" disableElevation>Evaluate</Button>
                    </Grid>
                </form>

            </div>

            <div role="tabpanel" className={classes.simulation}
                id="tab-simulation" aria-labelledby="tab-selector-simulation"
                hidden={tab !== 1}>
                
                <div data-role="canvas-container"><canvas ref={canvas1} aria-label="canvas1"></canvas></div>
                <div data-role="canvas-container"><canvas ref={canvas2} aria-label="canvas2"></canvas></div>

            </div>

            <Divider></Divider>

            <FormControlLabel label="Debug" control={
                <Switch
                    checked={debug}
                    onChange={() => setDebug(!debug)}
                    name="checked_debug"
                    color="secondary"
            />}/>
            {debug && <Box>
                <pre>scope: {JSON.stringify(scope, null, 4)}</pre>
                {/* <pre>vars: {JSON.stringify(vars, null, 4)}</pre> */}
            </Box>}
        </Box></Layout>
    )
}