import React from 'react'
import theme from 'src/theme/theme'
import Layout from 'src/components/layout'
import Simulator from 'src/components/simulator'

export default ({location}) => {
	const timing = {
		dt: 0.0001,
		tmax: 33
	}
	const scope = [
		{
			label: 'I',
			value: 1
		}
	]
	const network = {
		nodes: [
			{
				id: 0,
				label: 'x',
				// label: '🐇',
				color: theme.palette.nodes.cyan,
				initial: 1,
				dot: '',
				terms: []
			},
			{
				id: 1,
				label: 'v',
				// label: '🦊',
				color: theme.palette.nodes.orangeDark,
				initial: 0,
				dot: '',
				terms: []
			}
		],
		edges: [
			{
				source: 0,
				target: 1,
				label: 'linear',
				weight: 'I',
				negative: true,
				id: 0
			},
			{
				source: 1,
				target: 0,
				label: 'linear',
				weight: 'I',
				id: 1,
			}
		]
	}
	return(
		<Layout title="Harmonic Oscillator" location={location}>
			<Simulator timing={timing} scope={scope} network={network} />
		</Layout>
	)
}
