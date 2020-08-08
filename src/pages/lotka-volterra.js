import React from 'react'
import theme from 'src/theme/theme'
import Layout from 'src/components/layout'
import Simulator from 'src/components/simulator'

export default () => {
	const timing = {
		dt: 0.0001,
		tmax: 33
	}
	const scope = [
		{
			label: 'b',
			value: 1
		},
		{
			label: 'p',
			value: 1
		},
		{
			label: 'd',
			value: 1
		},
		{
			label: 'r',
			value: 1
		}
	]
	const network = {
		nodes: [
			{
				id: 0,
				labelFun: '🐇',
				label: 'R',
				// label: '🐇',
				color: theme.palette.nodes.cyan,
				initial: 1.5,
				dot: '',
				terms: []
			},
			{
				id: 1,
				labelFun: '🦊',
				label: 'F',
				// label: '🦊',
				color: theme.palette.nodes.orangeDark,
				initial: 0.5,
				dot: '',
				terms: []
			}
		],
		edges: [
			{
				source: 0,
				target: 0,
				label: 'linear',
				weight: 'b',
				id: 0
			},
			{
				source: 1,
				target: 0,
				label: 'meet',
				negative: true,
				weight: 'p',
				id: 1,
			},
			{
				source: 1,
				target: 1,
				label: 'linear',
				negative: true,
				weight: 'd',
				id: 2,
			},
			{
				source: 0,
				target: 1,
				label: 'meet',
				weight: 'r',
				id: 3,
			}
		]
	}
	return(
		<Layout title="Lotka-Volterra">
			<Simulator timing={timing} scope={scope} network={network} />
		</Layout>
	)
}
