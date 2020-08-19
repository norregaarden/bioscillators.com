import React, { useState, useEffect } from 'react'
import Plot from 'react-plotly.js'

export default ({vars, series, timing, errorHandler}) => {
	const [plotState, setPlotState] = useState({
		layout: {
			autosize: true,
			automargin: true,
			xaxis: {
				title: {
					text: 'time',
				},
				// rangeselector: selectorOptions,
				// rangeslider: {}
			},
			yaxis: {
				fixedrange: false
			},
			legend: {
				font: {
					size: 20
				}
			},
			margin: {
				l: 64,
				r: 64,
				b: 64,
				t: 64,
				pad: 8
			}, title: false
		},
		useResizeHandler: true,
		responsive: true,
		frames: [],
		config: {
			toImageButtonOptions: {
				format: 'png',
				filename: 'bioscillators',
				height: 300,
				width: 900,
				scale: 1.23
			  }
		}
	})

	const [plotData, setPlotData] = useState([])

	useEffect(() => {
		setPlotData(series)
	}, [series])

	return (
		<Plot
			data={plotData}
			layout={plotState.layout}
			useResizeHandler={plotState.useResizeHandler}
			responsive={plotState.responsive}
			frames={plotState.frames}
			config={plotState.config}
			style={{width: "100%", height: "50vh"}}
			onInitialized={(figure) => setPlotState(figure)}
			onUpdate={(figure) => setPlotState(figure)}
		/>
	)
}