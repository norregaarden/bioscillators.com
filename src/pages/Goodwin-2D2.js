import React from 'react'
import theme from 'src/theme/theme'
import Layout from 'src/components/layout'
import Simulator from 'src/components/simulator'

export default ({location}) => {
	const timing = {
		dt: 0.001,
		tmax: 100
	}
	const scope = {
		a: 72,
		A: 36,
		b: 2,
		B: 1,
		n: 10,
		Ki_2: 1,
		n_2: 1
	}
	const network = {
		nodes: [
			{
				id: 0,
				label: 'X',
				color: theme.palette.nodes.cyan,
				initial: 0.5,
				dot: '',
				terms: []
			},
			{
				id: 1,
				label: 'Y',
				color: theme.palette.nodes.orangeDark,
				initial: 1.5,
				dot: '',
				terms: []
			}
		],
		edges: [
			{
				source: 0,
				target: 0,
				label: 'hill activation',
				negative: true,
				weight: 'a',
				parameters: ['Ki', 'n'],
				id: 0
			},
			{
				source: 1,
				target: 1,
				label: 'hill activation',
				negative: true,
				weight: 'b',
				parameters: ['Ki', 'n'],
				id: 1,
			},
			{
				source: 1,
				target: 0,
				label: 'hill repression',
				weight: 'c',
				parameters: ['Ki', 'n'],
				id: 2,
			},
			{
				source: 0,
				target: 1,
				label: 'hill activation',
				weight: 'c',
				parameters: ['Ki_2', 'n_2'],
				id: 3,
			}
		]
	}
	return(
		<Layout title="Lotka-Volterra" location={location}>
			{false && <Simulator timing={timing} scope={scope} network={network} />}
		</Layout>
	)
}
