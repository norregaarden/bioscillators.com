import React, { useEffect, useRef } from 'react'
import Box from '@material-ui/core/box'
import { makeStyles } from '@material-ui/core'
import Chart from 'chart.js'

const chartOptions = {
	responsive: true, //true by default:
	maintainAspectRatio: false, //true by default:
	scales: {
		xAxes: [{
			type: 'linear',
			position: 'bottom'
		}]
	}
}

const plotStyles = makeStyles((theme) => ({
	plot: {
		'& > div': {
			position: 'relative'
		},
		'& canvas': {
			marginTop: theme.spacing(3),
			marginBottom: theme.spacing(3),
			display: 'block !important',
			width: '100%',
			height: 200,
			[theme.breakpoints.up('md')]: {
				maxWidth: '1234px',
				margin: '64px auto',
				height: 400
			}
		}
	}
}))

export default ({vars, series, timing, errorHandler}) => {
	const classes = plotStyles()
	const canvasContainer1 = useRef(null)
	const canvasContainer2 = useRef(null)

	const previousSeries = useRef(series)

	// const [timingPlot, setTimingPlot] = useState(timing)

	useEffect(() => {
		if (previousSeries.current === series)
			return
		previousSeries.current = series

		function plot() {
			console.log('PLOT')

			let canvas1 = document.createElement('canvas')
			canvas1.setAttribute('name', 'canvas1')
			let canvas2 = document.createElement('canvas')
			canvas2.setAttribute('name', 'canvas2')
			canvasContainer1.current.appendChild(canvas1)
			canvasContainer2.current.appendChild(canvas2)

			let datasets1 = []
			let datasets2 = []

			vars.forEach((v,i) => {
				if (!series[i]) {
					errorHandler(v.label + ' series ' + i + ' has a problem')
					return
				}
				if (!v.color) {
					console.log('not plotting var', v.label, '; missing color')
					return
				}
				let data1 = series[i].slice(0, Math.floor(series[i].length/3))
				datasets1.push({
					label: v.labelFun || v.label,
					data: data1,
					fill: false,
					borderColor: v.color,
					pointRadius: 0
				})
				let data2 = series[i].slice(Math.floor(series[i].length/3), series[i].length)
				datasets2.push({
					label: v.labelFun || v.label,
					data: data2,
					fill: false,
					borderColor: v.color,
					pointRadius: 0
				})
			})

			// TO DO: d3.js or three.js
			let chart1 = new Chart(canvas1, {
				type: 'line',
				data: {
					datasets: datasets1
				},
				options: chartOptions
			})
	
			chart1.update()
			
			// TO DO: not fucking repeat code
			let chart2 = new Chart(canvas2, {
				type: 'line',
				data: {
					datasets: datasets2
				},
				options: chartOptions
			})
	
			chart2.update()
		}

		try {
			canvasContainer1.current.removeChild(document.body.querySelector('[name=canvas1]'))
			canvasContainer2.current.removeChild(document.body.querySelector('[name=canvas2]'))

			plot()

		} catch (e) {
			errorHandler(e)
		}
	}, [vars, series, errorHandler])

	return (
		<Box className={classes.plot}>
			<div data-role="canvas-container" ref={canvasContainer1}><canvas aria-label="canvas1" name="canvas1"></canvas></div>
			<div data-role="canvas-container" ref={canvasContainer2}><canvas aria-label="canvas2" name="canvas2"></canvas></div>
		</Box>
	)
}
