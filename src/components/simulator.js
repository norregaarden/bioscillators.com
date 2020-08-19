import React, { useState, useReducer, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
import Switch from '@material-ui/core/Switch'
import TextField from '@material-ui/core/TextField'
import Slider from '@material-ui/core/Slider'
import Button from '@material-ui/core/Button'
import Select from '@material-ui/core/Select'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'
import Hidden from '@material-ui/core/Hidden'

import { create, all } from 'mathjs'
import RungeKutta4 from 'runge-kutta-4'
import 'katex/dist/katex.min.css'
// import { BlockMath } from 'react-katex'
import katex from 'katex'

// import edgeTypes, { texPlates, getEdgeTypeFromLabel } from 'src/utils/edgeTypes'
import { getEdgeTypeFromLabel } from 'src/utils/edgeTypes'
import Error from 'src/utils/error'
import Divider from 'src/components/divider'
import Network from 'src/components/network'
import Plot from 'src/components/plot'

const math = create(all, {
	number: 'BigNumber'
})
// const math = create(all) \\ faster ?

// remove stupid units for formatting without \mathrm{u}
// console.log(math.Unit.UNITS)
var mathUnitKeys = Object.keys(math.Unit.UNITS)
for(var i=0; i<mathUnitKeys.length; i++) {
	let unitKey = mathUnitKeys[i]
	delete math.Unit.UNITS[unitKey]
}
// console.log(math.Unit.UNITS)

/*eslint no-extend-native: ["error", { "exceptions": ["String"] }]*/
String.prototype.replaceAll = function(replaceThis, withThis) {
	return this.replace(new RegExp(replaceThis,"g"), withThis);
};
String.prototype.replaceMap = function(map) {
	/* argument example: map = {'X': 'X[0]', 'Y': 'X[1]'} */
	let str = this
	Object.entries(map).forEach( m => {
		let [replaceThis, withThis] = m
		str = str.replaceAll(replaceThis, withThis)
	})
	return str
};

const useStyles = makeStyles((theme) => ({
	prettyForm: {
		paddingTop: theme.spacing(1),
		paddingBottom: theme.spacing(1),
		'& div[class*=MuiFormControl], & div[class*=MuiFormControlLabel]': {
			margin: theme.spacing(3),
			width: '25ch',
			maxWidth: '600px'
		},
		'& div[class*=MuiButton]': {
			margin: theme.spacing(3)
		},
		'& .katex-display': {
			margin: theme.spacing(3),

			'&>.katex': {
				textAlign: 'left'
			}
		}
	},
	katexDanger: {
		margin: theme.spacing(3),
		fontSize: "1.23rem"
	},
	texForm: {
		marginBottom: theme.spacing(3),

		'& div[class*=MuiFormControl]': {
			width: '87.654321%',

			[theme.breakpoints.down('md')]: {
				marginTop: -theme.spacing(1)
			}
		}        
	},
	texInput: {
		'& .katex-display': {
			margin: 0,
			fontSize: '80%',
			opacity: 0.8
		}        
	},
	timeForm: {
		maxWidth: '987px',
		margin: '0 auto',
		marginTop: theme.spacing(4),
		'& div[class*=MuiFormControl]': {
			maxWidth: '80%'
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
		background: "#fafafa"
	},
	numberGridItem: {
		textAlign: 'center'
	},
	plot: {
		padding: theme.spacing(3),
	},
	debug: {
		'& div[class*=MuiGrid-item]': {
			'&:not(:nth-child(1)):not(:nth-child(2))': {
				borderTop: "0.5px solid rgba(6,6,6,0.0666)"
			},
			'&:nth-child(2n + 1)': {
				borderRight: "0.5px solid rgba(6,6,6,0.0666)"
			},
			'&:nth-child(2n)': {
				borderLeft: "0.5px solid rgba(6,6,6,0.0666)"
			},
			'&:not(:nth-last-child(2)):not(:nth-last-child(1))': {
				borderBottom: "0.5px solid rgba(6,6,6,0.0666)"
			},
			'& pre': {
				margin: theme.spacing(3),
				width: '25ch',
				maxWidth: '600px'
			}
		}
	}
}));

function networkReducer(network, action) {
	console.log('networkReducer', action)

	function signString(sign, reverse) {
		if (reverse)
			sign = (sign === '+') ? '-' : '+'
		return ' ' + sign + ' '
	}

	function termFromEdge(edge) {
		let w = edge.weight
		let sl = network.nodes[edge.source].label
		let tl = network.nodes[edge.target].label
		let [Ki, n] = edge.parameters || ['Ki', 'n'] // TO DO - only valid for hill ??
		let term = ''
		let sign = '+'
		if (edge.negative) 
			sign = '-'

		switch (edge.label) {
			case 'linear':
				term = `${w} * ${sl}` // ex. k*X
				break
			case 'meet':
				term = `${w} * ${sl} * ${tl}` // ex. r*I*S
				break
			case 'hill repression':
				term = `${w}/(1 + (${sl}/${Ki})^${n})` // ex. k/(1 + (Z/Ki)^n)
				break
			case 'hill activation':
				term = `${w}/(1 + (${Ki}/${sl})^${n})` // ex. k/(1 + (Ki/Z)^n)
				break
			default:
				console.error('unrecognized edge label')
		}

		if (edge.conserved)
			network.nodes[edge.source].terms[edge.id] = signString(sign, true) + term
		else
			network.nodes[edge.source].terms[edge.id] = ''
		network.nodes[edge.target].terms[edge.id] = signString(sign, false) + term
	}

	function dotFromTerms(node) {
		let dot = ''
		node.terms.forEach( term => {
			dot += term
		})
		if (dot[1] === "+") dot = dot.slice(2, dot.length)
		return dot
	}

	let edge;
	switch (action.type) {
		case 'init':
			network.edges.forEach( edge => { termFromEdge(edge) })
			network.nodes.forEach( node => { node.dot = dotFromTerms(node) })
			break
		// case 'edgeClick':
		// 	var edge = network.edges[action.id]
		// 	var oldLabel = edgeLabels.indexOf(edge.label)
		// 	var newLabel = edgeLabels[ ((oldLabel + 1) % edgeLabels.length) ]
		// 	edge.label = newLabel
		// 	network.edges[action.id] = edge
		// 	termFromEdge(edge)
		// 	network.nodes[edge.target].dot = dotFromTerms(network.nodes[edge.target])
		// 	break
		case 'edgeChange':
			edge = network.edges[action.id]
			if (action.key === 'label' && getEdgeTypeFromLabel(action.value).parameters) {
				edge.parameters = getEdgeTypeFromLabel(action.value).parameters.map(p => p.default)
			}
			if (action.key === 'parameter') {
				edge.parameters[action.prmIndex] = action.value
			} else {
				edge[action.key] = action.value
			}
			console.log(edge)
			network.edges[action.id] = edge
			termFromEdge(edge)
			network.nodes[edge.source].dot = dotFromTerms(network.nodes[edge.source])
			network.nodes[edge.target].dot = dotFromTerms(network.nodes[edge.target])
			break
		case 'edgeCreate':
			edge = {
				source: action.source,
				target: action.target,
				label: 'linear',
				weight: 'k',
				id: network.edges.length
			}
			network.edges.push(edge)
			termFromEdge(edge)
			network.nodes[action.target].dot = dotFromTerms(network.nodes[action.target])
			break
		case 'edgeDelete':
			edge = network.edges[action.id]
			network.nodes[edge.source].terms[edge.id] = ''
			network.nodes[edge.target].terms[edge.id] = ''
			network.nodes[edge.source].dot = dotFromTerms(network.nodes[edge.source])
			network.nodes[edge.target].dot = dotFromTerms(network.nodes[edge.target])
			// dont pop because id matches 
			network.edges[action.id] = {deleted: true}
			break
		case 'nodeCreate':
			// https://stackoverflow.com/questions/4020796/finding-the-max-value-of-an-attribute-in-an-array-of-objects
			var newID = 1 + Math.max.apply(Math, network.nodes.map(function(n) { return n.id; }))
			const lbls = ['A', 'B', 'C', 'G', 'H', 'I', 'J', 'K', 'L', 'O', 'P', 'Q', 'U', 'V', 'W']
			const clrs = ['#577590', '#43AA8B', '#90BE6D', '#F9C74F']
			network.nodes.push({
				id: newID,
				position: action.position,
				color: clrs[newID % clrs.length],
				label: lbls[newID % lbls.length],
				initial: 1,
				dot: '',
				terms: new Array(network.edges.length)
			})
			break
		case 'nodeChange':
			network.nodes[action.id][action.key] = action.value
			network.edges.forEach( edge => { termFromEdge(edge) })
			network.nodes.forEach( node => { node.dot = dotFromTerms(node) })
			break
		case 'nodeDelete':
			network.nodes[action.id] = {deleted: true}
			break
		default:
			console.warn('networkReducer - unrecognized action.type', action.type)
	}

	return {...network}
}

export default function Simulator(props) {
	const classes = useStyles()
	// const [debug, setDebug] = useState(false)
	const [error, setError] = useState(() => {return false})

	console.log('simulator.js RENDER')

	const [timing, setTiming] = useState(props.timing)
	const [scope, setScope] = useState(props.scope)
	const [selDelScope, setSelDelScope] = useState(scope[0].label)
	const [network, networkDispatch] = useReducer(networkReducer, props.network)
	
	useEffect( () => {
		networkDispatch({type: 'init'})
	}, [])

	function networkDispatchHandler(edit) { // done here because of access to scope
		console.log('networkDispatchHandler', edit)
		// edges can only be created linear
		if (edit.type === 'edgeCreate' && !!scope.filter(s => s.label === 'k')) {
			setScope([...scope, { label: 'k', value: 1 }])
		}
		// edges can be changed to one with parameters besides weight 
		if (edit.type === 'edgeChange' && edit.key === 'label') {
			const et = getEdgeTypeFromLabel(edit.value)
			if (et.parameters) {
				console.log(et.parameters)
				let toAdd = []
				et.parameters.forEach(p => {
					console.log(p, !!scope.filter(s => s.label === p.default))
					if (!!scope.filter(s => s.label === p.default))
						toAdd.push({ label: p.default, value: 1 })
				})
				setScope([...scope, ...toAdd])
			}
		}
		networkDispatch(edit)
	}

	// useEffect( () => {
	// 	let vsfn = varsFromNetwork(props.vars, props.network)
	// 	console.log(vsfn)
	// 	setVars({...vsfn})
	// }, []) // eslint-disable-line react-hooks/exhaustive-deps

	// useEffect(() => {
	// 	setVars(varsFromNetwork(vars, network))
	// }, [network]) // eslint-disable-line react-hooks/exhaustive-deps

	function updateTiming(time, val) {
		setTiming({...timing, [time]: val})
	}
	// function updateScope(key, value) {
	// 	setScope({...scope, [key]: value})
	// }
	function updateScope(index, value) {
		setScope([ ...scope.slice(0, index), 
			{ 
				label: scope[index].label,
				value: value
			}, 
			...scope.slice(index + 1)])
		// setScope([...scope, ])
	}

	// TO DO
	function updateScopeLabel(index, label) {
		if (label === '') {
			setError('Variable names cannot be empty')
			return
		}

		if (label.replace(' ', '') !== label) {
			setError('Spaces in variable names are not allowed')
			label = label.replaceAll(' ', '')
		}

		network.edges.forEach((e,i) => {
			if (e.weight === scope[index].label) {
				networkDispatch({
					type: 'edgeChange',
					id: e.id,
					key: 'weight',
					value: label
				})
			}
		})

		setScope([ ...scope.slice(0, index), 
			{ 
				label: label,
				value: scope[index].value
			}, 
			...scope.slice(index + 1)])
	}

	const [sliders, setSliders] = useState(true)
	const [tab, setTab] = useState(1)
	
	// const [seriesSaved, setSeriesSaved] = useState([])
	const [seriesMetadata, setSeriesMetadata] = useState(null)
	const [seriesData, setSeriesData] = useState([])
	const [funcString, setFuncString] = useState(null)
	console.log(funcString)

	const decimalPrintPrecision = 3

	function playHandler() {
		if (timing.tmax / timing.dt > 10**7) {
			setError('I refuse to calculate more than 10^7 steps at once.')
			return
		}

		// setTab(1)
		let vars = network.nodes.filter(n => !n.deleted)

		// X -> x[0] ; Y -> x[1] ; ...
		let varmap = {}
		vars.forEach( (v,i) => {
			varmap['{{' + v.label + '}}'] = 'x[' + i + ']'
		})

		let scopemap = {}
		scope.forEach((s,i) => {
			scopemap['{{' + s.label + '}}'] = s.value
		})

		// TO DO: IT SHOULD BE POSSIBLE TO DO THIS without evaluating a funcstring \\ eslint-disable no-new-func
		let funcstring = `
			const xdot = [];`

		vars.forEach((v,i) => {
			let der = v.dot
			if (der === "") {
				funcstring += `
					xdot[` + i + `] = 0`
			} else {
				// if (v.dot == undefined) {
				// 	console.log(i, 'v.dot is undefined')
				// 	return;
				// }
				let node = math.parse(der)
				let transformed = node.transform((n) => {
					if (n.isSymbolNode) {
						n.name = '{{' + n.name + '}}'
					}
					return n
				})
				der = transformed.toString()
				der = der.replaceAll('\\^', '**')
				der = der.replaceMap(varmap)
				der = der.replaceMap(scopemap)
	
				funcstring += `
					xdot[` + i + `] = ` + der
			}
		})

		funcstring += `
			return xdot`

		setFuncString(funcstring)

		try {
			/* eslint-disable no-new-func */
			console.log(funcstring)
			const derivatives = new Function('t, x', funcstring)

			let begTime = performance.now()
			sim(derivatives)
			let endTime = performance.now()
			console.log('TIME', endTime - begTime)
			setSeriesMetadata({
				...seriesMetadata,
				time: endTime - begTime,
				points: timing.tmax/timing.dt
			})

		} catch(e) {
			setError(e)
		}
	}

	function sim(derivatives) {
		let vars = network.nodes.filter(n => !n.deleted)
		// let series = []
		let data = []
		let inits = []
		for(let n=0; n<vars.length; n++) {
			// series[n] = []
			data[n] = {
				x: [], 
				y:[],
				mode: 'lines',
				line: {color: vars[n].color},
				name: vars[n].labelFun || vars[n].label
			}
			inits[n] = vars[n].initial
		}
		let sample = timing.tmax/(2**11)
		// TO DO: web worker
		let integrator = new RungeKutta4(derivatives, 0, inits, timing.dt)
		for (let i=0; i<timing.tmax/sample; i+=1) {
			let inte = integrator.end(i*sample)

			// TO DO: put in plot component
			for(let n=0; n<vars.length; n++) {
				if (!inte[n] && inte[n] !== 0) { // if NaN
					setError('diverging. Perhaps dt is too large.')
				}
				if (inte[n] < 0) {
					setError('Unrealistic biomodel: Negative variabel value')
				}
				data[n].x.push(i*sample)
				data[n].y.push(inte[n])
				// what chartjs likes
				// series[n][i] = { x: i*sample, y: data[n] }
			}
		}
		console.log('LOOK HERE', timing.tmax/sample, timing.tmax/timing.dt, {
			...seriesMetadata,
			samples: timing.tmax/sample,
			points: timing.tmax/timing.dt
		})
		setSeriesMetadata({
			...seriesMetadata,
			samples: timing.tmax/sample,
			points: timing.tmax/timing.dt
		})
		setSeriesData(data)
		// setSeriesSaved(series)
	}

	useEffect(() => {
		if (typeof window !== 'undefined') {
			console.log('! autoPLAY')
			console.log('because network or scope changed')
			playHandler()
		}
		// or it complains about missing playHandler 
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [scope, network])

	return(
		<Box className={classes.prettyForm}>

			{/* 
				ERROR FORM 
			*/}
			<Error error={error} timeoutHandler={() => setError(false)}></Error>

	<Grid container>
		<Grid item xs={12}> {/* xl={6} */}
			{/* {(typeof window !== 'undefined') && <Network network={network} scope={scope}
				networkEditHandler={(edit) => networkDispatchHandler(edit)} 
				errorHandler={(e) => setError(e)}>
			</Network>} */}
			<Network network={network} scope={scope}
				networkEditHandler={(edit) => networkDispatchHandler(edit)} 
				errorHandler={(e) => setError(e)}>
			</Network>
		</Grid>

		<Grid item xs={12}> {/* xl={6} */}
			<Tabs value={tab} onChange={(e, t) => setTab(t)}
				indicatorColor={tab ? 'secondary' : 'primary'}
				textColor={tab ? 'secondary' : 'primary'}
				variant="fullWidth"
				className={classes.tabs}
			>
				{/* <Tab label="Network" id="tab-selector-network" aria-controls="tab-network" /> */}
				<Tab label="Equations" id="tab-selector-equations" aria-controls="tab-equations" />
				<Tab label="Conditions" id="tab-selector-conditions" aria-controls="tab-conditions" />
				{/* <Tab label="Plot" id="tab-selector-plot" aria-controls="tab-plot" /> */}
			</Tabs>

			{/* 
				NETWORK 
			*/}
			{/* <div role="tabpanel"
				id="tab-network" aria-labelledby="tab-selector-network"
				hidden={tab !== 0}>

				<Network network={network} errorHandler={(e) => setError(e)}></Network>
			</div> */}

			{/* 
				EQUATIONS 
			*/}
			<div role="tabpanel"
				id="tab-equations" aria-labelledby="tab-selector-equations"
				hidden={tab !== 0}>

				{/* 
					TEX FORM 
				*/}
				<Box className={classes.texForm}>
					{network.nodes.filter(n => !n.deleted).map( (v,i) => {
						// if (typeof window === 'undefined')
						// 	return ''
						let tdot = '\\dot{' + v.label + '} = '
						let mparse
						try {
							mparse = math.parse(v.dot).toTex()
						} 
						catch (e) {
							console.error(e)
							console.log('i, node=v', i, v)
							console.log('v.dot', v.dot)
						}
						let texString = tdot + mparse
						texString = texString.replace(/\\_/g, '_')
						console.log(v.dot, texString)

						return <Grid container key={i}>
							<Grid item xs={12} lg={12}>
								<Box className={classes.katexDanger}
									dangerouslySetInnerHTML={{__html: katex.renderToString(texString, { strict: false, throwOnError: false })}}>
								</Box>
								{/* <BlockMath math={String.raw`\int_{-\infty}^\infty \,e^{2 \pi i \xi x} \,d🐍`} settings={{unicodeTextInMathMode: true, strict: false}}></BlockMath> */}
							</Grid>
						</Grid>
					})}
				</Box>
			</div>

			{/* 
				CONDITIONS 
			*/}
			<div role="tabpanel"
				id="tab-conditions" aria-labelledby="tab-selector-conditions"
				hidden={tab !== 1}>

				<Box style={{ float: 'right', marginRight: '66.6px', textAlign: 'right' }}>
					<FormControlLabel 
						label="Sliders"
						control={
							<Switch
								checked={sliders}
								onChange={() => setSliders(!sliders)}
								name="checked_sliders"
								color="secondary"
						/>}
					/>
					<br/>
					<FormHelperText>
						{sliders ? 'Click for more options' : ''}
					</FormHelperText>
				</Box>

				{/* 
					NUMBER INPUTS 
				*/}
				{(!sliders) && <form noValidate autoComplete="off"><Grid container>
					{console.log(scope)}
					{scope.map((s, i) => {
						let val = Number(s.value)
						return <Grid item key={i} xs={12} md={4} lg={3}
								className={classes.numberGridItem}>
							<TextField
								value={s.label}
								label="Name"
								onChange={(e) => updateScopeLabel(i, e.target.value)}
								color="secondary"
								style={{ maxWidth: '20ch' }}
								InputLabelProps={{shrink: true,}}
							/>
							<div style={{marginTop: '-24px', marginBottom: '-24px'}}></div>
							<TextField
								value={val}
								label="Value"
								inputProps={{
									step: 10 ** Math.floor(Math.log10(val))
								}}
								onChange={(e) => updateScope(i, Number(e.target.value))}
								type="number"
								color="secondary"
								style={{ maxWidth: '20ch' }}
								InputLabelProps={{shrink: true,}}
							/>
						</Grid>
					})}
				</Grid>
				<Grid container justify='flex-end'>
					{/* New constant */}
					<Grid item xs={12} md={4} lg={3}>
						<Grid container style={{height: '100%', paddingTop: '32px'}}
							alignContent='flex-end' justify='center'>
							<Button variant="outlined" color="secondary"
							onClick={() => {
								const alphabet = "abcdefghijklmnopqrstuvwxyzæøåABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ"
								setScope([ ...scope, {
									label: alphabet[Math.floor(Math.random()*alphabet.length)] + '_' + alphabet[Math.floor(Math.random()*alphabet.length)],
									value: 1
								}])}}>
								New constant
							</Button>
						</Grid>
					</Grid>
					{/* Delete constant */}
					{(scope.length > 1) && <Grid item xs={12} md={4} lg={3}>
						<Grid container style={{height: '100%'}}
							alignContent='flex-end' justify='center'>
							<FormControl className={classes.formControl} color="secondary">
								{<Select native
									value={selDelScope}
									onChange={(e) => {
										setSelDelScope(e.target.value)
									}}
								>
									{scope.map((s, i) => {
										return <option value={s.label} key={i}>{s.label + ' = ' + s.value.toFixed(2)}</option>
									})}
								</Select>}
							</FormControl>
							<Button variant="outlined" color="secondary"
							onClick={() => {
								console.log(selDelScope, scope, scope.filter(s => s.label !== selDelScope))
								let rrr = false
								network.edges.forEach((e) => {
									if (e.weight === selDelScope) {
										rrr = e.label
									}
									if (e.parameters) {
										if (e.parameters.includes(selDelScope)) {
											rrr = e.label
										}
									}
								})
								if (rrr) {
									setError("Cannot delete constant " + selDelScope + ", used by edge type " + rrr)
									return
								}
								let scp = scope.filter(s => s.label !== selDelScope)
								if (scope[0].label === selDelScope)
									setSelDelScope(scope[1].label)
								else
									setSelDelScope(scope[0].label)
								console.log(scp === scope, scp, scope)
								setScope([...scp])
							}}>
								Delete
							</Button>
						</Grid>
					</Grid>}
				</Grid>
				</form>}

				{/* 
					NUMBER SLIDERS
				*/}
				{sliders && <form noValidate autoComplete="off">
					<Grid container >
						{scope.map((s, i) => {
							let val = Number(Math.log10(s.value))
							let valLabel = Number((10 ** val).toPrecision(decimalPrintPrecision))
							return <Grid item lg={3} md={4} sm={6} xs={12} className={classes.sliderBox} key={i}>
									<Typography gutterBottom color="textSecondary" id={"non-linear-slider-"+s.label}>
										{s.label + " = " + valLabel}
									</Typography>
									<Slider
										value={val}
										min={-6}
										step={0.25}
										max={6}
										scale={x => 10 ** x}
										onChange={(e, v) => {
											let valNew = Number((10 ** v).toPrecision(decimalPrintPrecision))
											console.log('slider val', valLabel, valNew, (valLabel !== valNew))
											if (valLabel !== valNew)
												updateScope(i, valNew)
										}}
										aria-labelledby={"non-linear-slider-"+s.label}
										color="secondary"
							/></Grid>
						})}
					</Grid>
				</form>}

				<Divider></Divider>

			</div>
		</Grid>
	</Grid>

	{(typeof window !== 'undefined') && <Plot series={seriesData} vars={network.nodes.filter(n => !n.deleted)} timing={timing} errorHandler={(e) => setError(e)}></Plot>}

			<Box style={{marginLeft: '64px', fontSize: '1.5em'}}>
				<FormHelperText>Edit initial values by clicking the nodes in the network</FormHelperText>
				{/* <FormHelperText>More helpertext...</FormHelperText>
				<FormHelperText>Also add helpertext in top</FormHelperText>
				<FormHelperText>Fix the font...</FormHelperText>
				<FormHelperText>Remove rangeslider?</FormHelperText>
				<FormHelperText>x-label to right?</FormHelperText>
				<FormHelperText>Save data to compare?</FormHelperText>
				<FormHelperText>Click instead of right-click?</FormHelperText>
				<FormHelperText>Download scope+network!</FormHelperText> */}
			</Box>

			{/* 
				TIMING FORM 
			*/}
			<form noValidate autoComplete="off">
				<Grid container alignItems="center" justify="center" className={classes.timeForm}>
					{Object.entries(timing).map( ti => {
						let [key, val] = ti
						val = Number(val)
						let IP = {min: 10**-8, max: 10**8, step: 1}
						return <Grid item xs={12} sm={6} md={3} key={key}>
							<TextField key={key} label={key} value={val} 
								onChange={(e) => {updateTiming(key, Number(e.target.value))}}
								inputProps={IP} type="number" InputLabelProps={{shrink: true}} variant="outlined" />
						</Grid>
					})}
					<Grid item xs={12} sm={6} md={3}>
						<FormControl>
							<Button color="primary" variant="contained" size="large" onClick={playHandler}>Play</Button>
						</FormControl>
					</Grid>
				</Grid>
				<FormHelperText style={{textAlign: 'center'}}>
					{seriesMetadata ? `Sampled ${(2**11)} time points out of ${Math.floor(seriesMetadata.points)} calculated in ${Math.ceil(seriesMetadata.time)}ms` : ''}
				</FormHelperText>
			</form>

			<Divider></Divider>

			{/* 
				DEBUG FORM 
			*/}
			{/* <FormControlLabel label="Debug" control={
				<Switch
					checked={debug}
					onChange={() => setDebug(!debug)}
					name="checked_debug"
					color="secondary"
			/>}/>
			{debug && <Grid container className={classes.debug}>
				<Grid item md={6}><pre>timing = {JSON.stringify(timing, null, 4)}</pre></Grid>
				<Grid item md={6}><pre>scope = {JSON.stringify(scope, null, 4)}</pre></Grid>
				<Grid item md={6}><pre>network.nodes = {JSON.stringify(network.nodes, null, 4)}</pre></Grid>
				<Grid item md={6}><pre>network.edges = {JSON.stringify(network.edges, null, 4)}</pre></Grid>
				<Grid item md={6}><pre>
					MISC                                            <br />
																	<br />
					debug           = "{String(debug)}"             <br />
					error           = "{String(error)}"             <br />
					sliders         = "{String(sliders)}"           <br />
					tab             = "{String(tab)}"               <br />
					funcString      = "{String(funcString)}"        <br />
				</pre></Grid>
			</Grid>} */}
		</Box>
	)
}
