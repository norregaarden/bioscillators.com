import React, { useState, useEffect } from 'react'
import theme from 'src/theme/theme'
import { makeStyles } from '@material-ui/core/styles'
import { Box, Card, TextField, Button, Grid } from '@material-ui/core'
import { FormControl, FormControlLabel, Select, InputLabel, Switch } from '@material-ui/core'
import ColorPicker from 'material-ui-color-picker'
import edgeTypes, { texPlates, getEdgeTypeFromLabel } from 'src/utils/edgeTypes'

/* bugfix: 
 * > npm run-script cpb // clean, build, publish
 * > ... failed Building static HTML for pages - 19.486s
 * > ... "window" is not available during server side rendering.
 * > ...  WebpackError: ReferenceError: window is not defined
 */
// if (typeof window === 'undefined')
	// or just 'return' if inside function
	// throw new Error("exiting network.js because window because typeof window !== 'undefined'")
// for minor window usage, wrap the code in:
// if (typeof window !== 'undefined') { code }

import katex from 'katex'
// import mhchem from 'katex/dist/contrib/mhchem.js'
import 'katex/dist/contrib/mhchem.js'
import Popper from '@material-ui/core/Popper'
import Fade from '@material-ui/core/Fade'
import Cytoscape from 'cytoscape'
import cytoscapeEdgehandles from 'cytoscape-edgehandles'
import CytoscapeComponent from 'react-cytoscapejs'
try {
	if (typeof window !== 'undefined')
		Cytoscape.use(cytoscapeEdgehandles)
} catch(e) {
	console.warn(e); console.log(e.message)
}

const red = "#930100" // https://mycolor.space/?hex=%236A1B9A&sub=1 "classy"
const green = "#60BAAF" // "spot"
const purple = "#8A6B9A" // "spot"

const col_secondary = theme.palette.secondary.main

const networkStyles = makeStyles((theme) => ({
	network: {
		'& p, & ul': {
			margin: theme.spacing(3),
		}
	},
	CCC: {
		width: '100%',
		height: 400,
		[theme.breakpoints.up('md')]: {
			height: 600
		},
		marginTop: theme.spacing(3),
		marginBottom: theme.spacing(3),
	},
	popper: {
		maxWidth: '100vw',
		/*
			TO DO
			http://www.cssarrowplease.com/
		 */
		'& .arrow': {
			position: 'absolute',
			width: 0,
			height: 0,
		},
		'&[x-placement*="bottom"] .arrow': {
			borderLeft: '18px solid transparent',
			borderRight: '18px solid transparent',
			borderBottom: '18px solid #ddd',
			borderBottomColor: theme.palette.secondary.main,
			top: '-18px',
		},
		'&[x-placement*="top"] .arrow': {
			borderLeft: '18px solid transparent',
			borderRight: '18px solid transparent',
			borderTop: '18px solid #ddd',
			borderTopColor: theme.palette.secondary.main,
			bottom: '-18px',
		}
	},
	popperCard: {
		// paddingRight: theme.spacing(3),
		borderColor: theme.palette.secondary.main,
		borderRadius: '8px',
		borderWidth: '2px',
		backgroundColor: "#fafafa"
	},
	formControl: {
		margin: theme.spacing(3),
		// marginRight: 0,
		minWidth: 123,

		// shitty small render bug, shittier bugfix
		// '& [class*="MuiInputLabel-outlined"]:not(.Mui-focused)': {
		// 	background: 'white'
		// }
	},
	formControlLabel: {
		margin: theme.spacing(3),
		marginTop: 0,
		minWidth: 123,
	},
	katexBox: {
		margin: theme.spacing(3),
		height: '33px',
		textAlign: 'center'
	},
	deleteButton: {
		margin: theme.spacing(3),
		marginTop: '8px',
		float: 'right'
	}
}))

const cytoscapeStyles = [
	{
		selector: 'node',
		style: {
			'shape': 'ellipse',
			'text-valign': 'center',
			'text-halign': 'center',
			'compound-sizing-wrt-labels': 'include',
			'width': '16px',
			'height': '16px',
			'background-color': '#ddd',
			'padding': '16px'
		}
	},
	{
		selector: 'node[label]',
		style: {
			'label': 'data(label)',
		}
	},
	{
		selector: 'node[labelFun]',
		style: {
			'label': 'data(labelFun)',
		}
	},
	{
		selector: 'node[color]',
		style: {
			'background-color': 'data(color)'
		}
	},
	{
		selector: 'edge',
		style: {
			'target-distance-from-node': 6,
			'curve-style': 'bezier',
			'line-color': '#aaa',
			'source-arrow-color': '#aaa',
			'target-arrow-color': green,
			// for negative==false
			// 'target-arrow-color': green,
			'target-arrow-shape': 'triangle',
			'arrow-scale': 2,
			'loop-direction': '-15deg',
			'loop-sweep': '45deg'
		}
	},
	{
		selector: 'edge[label^="hill"], edge[label^="meet"]',
		style: {
			'label': 'data(label)',
			'edge-text-rotation': 'autorotate',
			'line-color': '#ccc',
			'source-arrow-color': '#ccc',
			// 'target-arrow-color': purple,
			'target-arrow-shape': 'triangle',
			'arrow-scale': 2
		}
	},
	{
		selector: 'edge[?negative]',
		style: {
			'target-arrow-color': red,
			'target-arrow-shape': 'tee',
			'arrow-scale': 2,
		}
	},
	{
		selector: 'edge[?conserved][!negative]',
		style: {
			'source-arrow-color': '#ccc',
			'source-arrow-shape': 'tee',
		}
	},
	{
		selector: 'edge[?conserved][?negative]',
		style: {
			// 'source-arrow-color': '#aaa',
			'source-arrow-shape': 'triangle',
		}
	},
	// TO DO
	// handle selector: 'edge[conserved][negative]', ?
	// https://cytoscape.org/cytoscape.js-edgehandles/demo-snap.html
    // some style for the extension
	{
		selector: '.eh-handle',
		style: {
			'background-color': col_secondary,
			'width': 1,
			'height': 2,
			'shape': 'ellipse',
			'overlay-opacity': 0,
			'border-width': 4, // makes the handle easier to hit
			'border-opacity': 0
		}
	},
	{
		selector: '.eh-hover',
		style: {
			'background-color': col_secondary,
			'width': 1,
			'height': 1,
		}
	},
	{
		selector: '.eh-source',
		style: {
			'border-width': 2,
			'border-color': col_secondary
		}
	},
	{
		selector: '.eh-target',
		style: {
			'border-width': 2,
			'border-color': col_secondary
		}
	},
	{
		selector: '.eh-preview, .eh-ghost-edge',
		style: {
			'background-color': col_secondary,
			'line-color': col_secondary,
			'target-arrow-color': col_secondary,
			'source-arrow-color': col_secondary
		}
	},
	{
		selector: '.eh-ghost-edge.eh-preview-active',
		style: {
			'opacity': 0
		}
	}
]

export default ({network, scope, networkEditHandler, errorHandler}) => {
	// console.log("NETWORK RENDER")
	const [rendered, setRendered] = useState(false)
	const [elements, setElements] = useState(null)

	const classes = networkStyles()
	// const elements = network.nodes.concat(network.edges.map(edge => {return {...edge, id: 'e'+edge.id}})).map(element => {return {data: element}})

	const layout = {
		name: 'circle',
		radius: 149
		// condense: true,
		// avoidOverlapPadding: 210
	}

	/*
		Popper
	 */
	const [popperEdgeOpen, setPopperEdgeOpen] = useState(false)
	const [anchorElEdge, setAnchorElEdge] = useState(null)
	const [popperArrowEdge, setPopperArrowEdge] = useState(null)
	const [anchorPosEdge, setAnchorPosEdge] = useState([0,0])
	const [popperEdgeId, setPopperEdgeId] = useState(0)
	const [popperEdgeData, setPopperEdgeData] = useState(null)
	const [popperEdgeType, setPopperEdgeType] = useState(null)

	const [popperNodeOpen, setPopperNodeOpen] = useState(false)
	const [anchorElNode, setAnchorElNode] = useState(null)
	const [popperArrowNode, setPopperArrowNode] = useState(null)
	const [anchorPosNode, setAnchorPosNode] = useState([0,0])
	const [popperNodeId, setPopperNodeId] = useState(0)
	const [popperNodeData, setPopperNodeData] = useState(null)

	useEffect(() => {
		setElements(network.nodes.filter(n => !n.deleted).concat(network.edges.filter(e => !e.deleted).map(edge => {return {...edge, id: 'e'+edge.id}})).map(element => {return {data: element, position: element.position}}))
	}, [network])

	useEffect(() => {
		setPopperEdgeData(network.edges[popperEdgeId])
	}, [popperEdgeId, network.edges])

	useEffect(() => {
		// TO DO not updating on network.nodes
		console.log('network.nodes', network.nodes)
		setPopperNodeData(network.nodes[popperNodeId])
	}, [popperNodeId, network.nodes])

	const [texStrings, setTexStrings] = useState({
		nullaryReaction: '',
		primaryReaction: '',
		term: ''
	})

	function kaTextit(str) {
		return '\\text{' + str.replace('_', '}_{\\text{') + (str.includes('_') ? '}' : '') + '}'
	}

	useEffect(() => {
		console.log('popperEdgeOpen', popperEdgeOpen, 'popperEdgeId', popperEdgeId, 'popperEdgeData', popperEdgeData)
		if (!popperEdgeOpen)
			return
		// def: tp=texPlates, et=edgeType
		const tp = texPlates
		const et = getEdgeTypeFromLabel(popperEdgeData.label)
		setPopperEdgeType(et)
		// set: target, source, weight, sign=!nsign, conserved, (parameters)
		let prmtrs = {}
		if (et.parameters) {
			et.parameters.forEach((p,i) => {
				prmtrs[p.name] = kaTextit(popperEdgeData.parameters[i])
			})
		}
		const sbts = { // substitutions
			target: '\\mathit{' + (network.nodes[popperEdgeData.target].labelFun || network.nodes[popperEdgeData.target].label) + '}', 
			source: '\\mathit{' + (network.nodes[popperEdgeData.source].labelFun || network.nodes[popperEdgeData.source].label) + '}',
			weight: kaTextit(popperEdgeData.weight),
			sign: popperEdgeData.negative ? '-' : '',
			nsign: popperEdgeData.negative ? '+' : '-',
			...prmtrs
		}
		const sign = popperEdgeData.negative ? '-' : '+'
		const conserved = !!popperEdgeData.conserved
		console.log(sbts, conserved)
		let nullaryReaction = et.nullaryReaction? et.nullaryReaction(sbts) : undefined
		// term = tp.preTerm + (conserved ? tp.preTermConserved : '') + tp.termStarter + et.termMain
		let term = tp.preTerm(sbts) + (conserved ? tp.preTermConserved(sbts) : '') + tp.termStarter(sbts) + et.termMain(sbts)
		// clean up postreaction... shit solution to a shit problem
		let pReaction = et.preReaction(sbts) + tp.postReaction({...sbts, sign: sign}) + (conserved ? tp.postReactionConserved(sbts) : '')
		console.log(pReaction)
		pReaction = pReaction.replace(sbts.source + ' - ' + sbts.source, '')
		pReaction = pReaction.replace(' + ' + sbts.target + ' - ' + sbts.target, '')
		pReaction = pReaction.replace(sbts.target + ' + ' + sbts.target, '2' + sbts.target)
		pReaction = pReaction.replace(sbts.source + ' + ' + sbts.source, '2' + sbts.source)
		if (pReaction.indexOf(sbts.source) === 0 && pReaction.indexOf(' - ' + sbts.source) !== -1)
			pReaction = pReaction.replace(' - ' + sbts.source, '').replace(sbts.source + ' + ', '')
		console.log(pReaction)
		// reaction: \\ce{ et.preReaction + tp.reaction + et.preReaction + sign + tp.postReaction + (conserved? tp.postReactionConserved : '') }
		let primaryReaction = '\\ce{' + et.preReaction(sbts) + tp.reaction(sbts) + pReaction  + '}'
		console.log()
		setTexStrings({
			nullaryReaction: nullaryReaction,
			primaryReaction: primaryReaction,
			term: term
		})
		console.log({
			nullaryReaction: nullaryReaction,
			primaryReaction: primaryReaction,
			term: term
		})
	}, [popperEdgeOpen, popperEdgeId, popperEdgeData, network])

    return (
        <Box className={classes.network}>

			{elements && <CytoscapeComponent elements={elements} layout={layout} className={classes.CCC} 
				userPanningEnabled={true} userZoomingEnabled={false} stylesheet={cytoscapeStyles}
				// TODO: zzom buttons, 
				cy = { (cy) => { 
					if (typeof window === 'undefined')
						return
					cy.removeListener('click')
					cy.removeListener('cxttapstart')

					if (!rendered) {
						cy.minZoom(1/Math.E)
						cy.maxZoom(Math.E)
						cy.edgehandles({
							snap: true,
							loopAllowed: (node) => {return true},
							complete: (sourceNode, targetNode, addedEles) => {
								addedEles.remove()
								networkEditHandler({
									type: 'edgeCreate',
									source: Number(sourceNode.id()),
									target: Number(targetNode.id())
								})
							}
						})
						window.addEventListener('resize', function() {
							console.log('WINDOW RESIZE gr')
							cy.resize()
							// cy.fit()
							// cy.layout() make button for this !
						})
					}
					setRendered(true)

					window.updateCurrentNode = function() {
						console.log('hi this is the window function calling')
						cy.$id(popperNodeId).attr('color', popperNodeData.color)
						cy.$id(popperNodeId).attr('label', popperNodeData.label)
						cy.$id(popperNodeId).attr('labelFun', popperNodeData.labelFun)
					}

					cy.on('click', function(evt){
						window.updateCurrentNode()
						setPopperEdgeOpen(false)
						setPopperNodeOpen(false)
					});

					cy.on('cxttapstart', function(evt){
						console.log("CXTTAP")
						console.log(evt)
						const isBackgroundClick = !evt.target.length
						console.log("bool isBackgroundClick", isBackgroundClick)
						console.log(evt.position)
						if (isBackgroundClick) {
							networkEditHandler({
								type: 'nodeCreate',
								position: evt.position
							}) 
						}
					});

					cy.on('click', 'node', function(evt){
						console.log('cxttapstart', 'node')
						let node = evt.target
						console.log(node.id(), node)
						if (String(Number(node.id())) !== node.id()) {
							console.log('fake node')
							return
						}
						setPopperEdgeOpen(false)
						let contRect = cy.container().getBoundingClientRect()
						if (typeof window !== `undefined`) {
							var scrollTop = (document.documentElement || document.body.parentNode || document.body).scrollTop // || window.pageYOffset
						}
						console.log(
							node.renderedPosition().x + contRect.left, 
							node.renderedPosition().y + contRect.top + scrollTop
						)

						setAnchorPosNode([
							node.renderedPosition().x + contRect.left, 
							node.renderedPosition().y + contRect.top + scrollTop
						])

						// setPopperEdge(edge)
						setPopperNodeOpen(true)
						setPopperNodeId(Number(node.id()))
					})

					cy.on('click', 'edge', function(evt){
						console.log('cxttapstart', 'edge')
						let edge = evt.target
						setPopperNodeOpen(false)
						let contRect = cy.container().getBoundingClientRect()
						if (typeof window !== `undefined`) {
							var scrollTop = (document.documentElement || document.body.parentNode || document.body).scrollTop // || window.pageYOffset
						}
						console.log(
							edge.renderedMidpoint().x + contRect.left, 
							edge.renderedMidpoint().y + contRect.top + scrollTop
						)

						setAnchorPosEdge([
							edge.renderedMidpoint().x + contRect.left,
							edge.renderedMidpoint().y + contRect.top + scrollTop
						])

						// setPopperEdge(edge)
						setPopperEdgeOpen(true)
						setPopperEdgeId(Number(edge.id().slice(1,9999)))
					})
				} } 
			/>}

{/* 
	popperEdge
*/}

			<div className={classes.anchorElEdge} ref={setAnchorElEdge} style={{
				position: 'absolute',
				left: (anchorPosEdge[0] - 30) + 'px',
				top: (anchorPosEdge[1] - 30) + 'px',
				width: '60px',
				height: '60px',
				backgroundColor: purple,
				zIndex: '-999'
			}}></div>

			<Popper
				anchorEl={anchorElEdge}
				open={popperEdgeOpen}
				placement="bottom"
				disablePortal={false}
				className={classes.popper}
				modifiers={{
					flip: {
						enabled: true,
					},
					preventOverflow: {
						enabled: true,
						boundariesElement: 'scrollParent',
					},
					arrow: {
						enabled: true,
						element: popperArrowEdge,
					},
				}}
				transition
			>{({ TransitionProps }) => (<Fade {...TransitionProps} timeout={210}><div>

				<span className="arrow" ref={setPopperArrowEdge}></span>

				{anchorElEdge && <Card className={classes.popperCard} variant="outlined">
				<Grid container direction="column">

					<Grid item style={{marginBottom: '-16px'}}>
					{/* 
						Tex 
					*/}

						{texStrings.nullaryReaction && <Box id="tex_reaction_nullary" 
							dangerouslySetInnerHTML={{__html: katex.renderToString(texStrings.nullaryReaction, {strict: false, throwOnError: false})}}
							className={classes.katexBox}></Box>}
						{texStrings.primaryReaction && <Box id="tex_reaction_primary"
							dangerouslySetInnerHTML={{__html: katex.renderToString(texStrings.primaryReaction, {strict: false, throwOnError: false})}}
							className={classes.katexBox}></Box>}
						{texStrings.term && <Box id="tex_term" 
							dangerouslySetInnerHTML={{__html: katex.renderToString(texStrings.term, {strict: false, throwOnError: false})}}
							className={classes.katexBox}></Box>}
					</Grid>

					<Grid item> {/* dropdowns */}
						<FormControl className={classes.formControl} color="secondary">
							<InputLabel htmlFor="popper_type">Type</InputLabel>
							{popperEdgeData && <Select native
								value={popperEdgeData['label']}
								onChange={(e) => {
									networkEditHandler({
										type: 'edgeChange',
										id: Number(popperEdgeData.id),
										key: 'label',
										value: e.target.value
									})
								}}
								inputProps={{
									name: 'popper_type',
									id: 'popper_type',
								}}
								style={{ width: '20ch' }}
							>
								{edgeTypes.map((et, i) => { 
									return <option value={et.name} key={et.name}>{et.name}</option>
								})}
							</Select>}
						</FormControl>
						<FormControl className={classes.formControl} color="secondary">
							<InputLabel htmlFor="popper_weight">Weight</InputLabel>
							{popperEdgeData && <Select native
								value={popperEdgeData['weight']}
								onChange={(e) => {
									networkEditHandler({
										type: 'edgeChange',
										id: Number(popperEdgeData.id),
										key: 'weight',
										value: e.target.value
									})
								}}
								inputProps={{
									name: 'popper_weight',
									id: 'popper_weight',
								}}
								style={{ width: '20ch' }}
							>
								{scope.map((s, i) => {
									return <option value={s.label} key={i}>{s.label + ' = ' + s.value.toFixed(2)}</option>
								})}
							</Select>}
						</FormControl>
					</Grid>

					{popperEdgeData && popperEdgeType && popperEdgeData.parameters && popperEdgeType.parameters && <Grid item>
						{popperEdgeData.parameters.map((p,i) => <FormControl key={i} className={classes.formControl} 
							style={{ marginTop: '-8px' }} color="secondary">
							<InputLabel htmlFor={"popper_param_"+i}>{popperEdgeType.parameters[i].label}</InputLabel>
							{popperEdgeData && <Select native
								value={p}
								onChange={(e) => {
									networkEditHandler({
										type: 'edgeChange',
										id: Number(popperEdgeData.id),
										key: 'parameter',
										prmIndex: i,
										value: e.target.value
									})
								}}
								inputProps={{
									name: 'popper_param_'+i,
									id: 'popper_param_'+i,
								}}
								style={{ width: '20ch' }}
							>
								{scope.map((s, i) => {
									return <option value={s.label} key={i}>{s.label + ' = ' + s.value.toFixed(2)}</option>
								})}
							</Select>}
						</FormControl>)}						
					</Grid>}

					<Grid item> {/* switches */}
						{popperEdgeData && <FormControlLabel className={classes.formControlLabel} 
							label="Conserved" disabled={(popperEdgeData.source === popperEdgeData.target)}
							control={
								<Switch
									checked={popperEdgeData['conserved'] || false}
									onChange={(e) => {
										networkEditHandler({
											type: 'edgeChange',
											id: Number(popperEdgeData.id),
											key: 'conserved',
											value: (!popperEdgeData.conserved)
										})
									}}
									name="popper_conserved"
									color="secondary"
							/>}
							style={{ width: '25ch' }}
						/>}
						{popperEdgeData && <FormControlLabel className={classes.formControlLabel} 
							label="Negative"
							control={
								<Switch
									checked={popperEdgeData['negative'] || false}
									onChange={(e) => {
										networkEditHandler({
											type: 'edgeChange',
											id: Number(popperEdgeData.id),
											key: 'negative',
											value: (!popperEdgeData.negative)
										})
									}}
									name="popper_negative"
									color="secondary"
							/>}
							style={{ width: '15ch' }}
						/>}
					</Grid>
					<Grid item>
						{popperEdgeData && <Button variant="outlined"
							color="secondary" className={classes.deleteButton}
							onClick={() => {
								networkEditHandler({
									type: 'edgeDelete',
									id: Number(popperEdgeData.id)
								})
								setPopperEdgeOpen(false)
							}}>Delete
						</Button>}
					</Grid>
				</Grid>
				</Card>}
			</div></Fade>)}</Popper>

{/* 
	popperNode
*/}

<div className={classes.anchorElNode} ref={setAnchorElNode} style={{
				position: 'absolute',
				left: (anchorPosNode[0] - 30) + 'px',
				top: (anchorPosNode[1] - 30) + 'px',
				width: '60px',
				height: '60px',
				backgroundColor: purple,
				zIndex: '-999'
			}}></div>

			<Popper
				anchorEl={anchorElNode}
				open={popperNodeOpen}
				placement="bottom"
				disablePortal={false}
				className={classes.popper}
				modifiers={{
					flip: {
						enabled: true,
					},
					preventOverflow: {
						enabled: true,
						boundariesElement: 'scrollParent',
					},
					arrow: {
						enabled: true,
						element: popperArrowNode,
					},
				}}
				transition
			>{({ TransitionProps }) => (<Fade {...TransitionProps} timeout={210}><div>

				<span className="arrow" ref={setPopperArrowNode}></span>

				{anchorElNode && <Card className={classes.popperCard} variant="outlined">
				<Grid container direction="column">
					<Grid item>
						<FormControl className={classes.formControl} 
							color="secondary" style={{verticalAlign: 'bottom'}}>
							{/* <InputLabel htmlFor="popper_label">Color</InputLabel> */}
							{popperNodeData && <ColorPicker
								name='color'
								defaultValue={popperNodeData['color']} 
								value={popperNodeData['color']}
								onChange={color => {
									networkEditHandler({
										type: 'nodeChange',
										id: Number(popperNodeData.id),
										key: 'color',
										value: color
									})
									if (typeof window !== 'undefined') window.updateCurrentNode()
								}}
								style={{ width: '15ch' }}
							/>}
						</FormControl>
					{/* </Grid>
					<Grid item style={{ marginTop: '-16px' }}> */}
						<FormControl className={classes.formControl} color="secondary">
							{/* <InputLabel htmlFor="popper_label">Label</InputLabel> */}
							{popperNodeData && <TextField 
								value={popperNodeData['initial']} 
								label="Initial value"
								inputProps={{
									name: 'popper_initial',
									id: 'popper_initial',
								}}
								type="number"
								onChange={(e) => {
									networkEditHandler({
										type: 'nodeChange',
										id: Number(popperNodeData.id),
										key: 'initial',
										value: Number(e.target.value)
									})
								}}
								style={{ width: '15ch' }}
							/>}
						</FormControl>
					</Grid>	
					<Grid item style={{ marginTop: '-8px' }}>
						<FormControl className={classes.formControl} color="secondary">
							{popperNodeData && <TextField 
								value={popperNodeData['label']} 
								label="Variable name"
								inputProps={{
									name: 'popper_label',
									id: 'popper_label',
								}}
								onChange={(e) => {
									networkEditHandler({
										type: 'nodeChange',
										id: Number(popperNodeData.id),
										key: 'label',
										value: e.target.value
									})
									if (typeof window !== 'undefined') window.updateCurrentNode()
								}}
								style={{ width: '15ch' }}
							/>}
						</FormControl>
					{/* </Grid>
					<Grid item style={{ marginTop: '-16px' }}> */}
						<FormControl className={classes.formControl} color="secondary">
							{popperNodeData && <TextField 
								value={popperNodeData['labelFun'] || ''} 
								label="Label"
								inputProps={{
									name: 'popper_labelFun',
									id: 'popper_labelFun',
								}}
								onChange={(e) => {
									networkEditHandler({
										type: 'nodeChange',
										id: Number(popperNodeData.id),
										key: 'labelFun',
										value: e.target.value
									})
									if (typeof window !== 'undefined') window.updateCurrentNode()
								}}
								style={{ width: '15ch' }}
							/>}
						</FormControl>
					</Grid>
					<Grid item>
						{popperNodeData && <Button variant="outlined"
							color="secondary" className={classes.deleteButton}
							onClick={() => {
								network.edges.forEach((e,i) => {
									let nid = Number(popperNodeData.id)
									console.log(nid, e, i)
									if (nid === e.source || nid === e.target) {
										networkEditHandler({
											type: 'edgeDelete',
											id: i
										})
									}
								})
								networkEditHandler({
									type: 'nodeDelete',
									id: Number(popperNodeData.id)
								})
								setPopperNodeOpen(false)
							}}>Delete
						</Button>}
					</Grid>
				</Grid>
				</Card>}
			</div></Fade>)}</Popper>

        </Box>
    )
}