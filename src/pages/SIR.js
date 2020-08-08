import React from 'react'
import theme from 'src/theme/theme'
import Layout from 'src/components/layout'
import Simulator from 'src/components/simulator'

export default () => {
	const timing = {
		dt: 0.001,
		tmax: 100
	}
	// const scope = {
	// 	r: 1,
	// 	a: 0.1,
	// }
	const scope = [
		{
			label: 'infection',
			value: 1
		},
		{
			label: 'recovery',
			value: 0.1
		}
	]
	const network = {
		nodes: [
			{
				id: 0,
				label: 'S',
				labelFun: '🙂',
				color: theme.palette.nodes.green,
				initial: 0.999,
				dot: '',
				terms: []
			},
			{
				id: 1,
				label: 'I',
				labelFun: '😷',
				color: theme.palette.nodes.red,
				initial: 0.001,
				dot: '',
				terms: []
			}, 
			{
				id: 2,
				label: 'R',
				labelFun: '🙃',
				color: theme.palette.nodes.yellow,
				initial: 0,
				dot: '',
				terms: []
			}
		],
		edges: [
			{
				source: 0,
				target: 1,
				label: 'meet',
				weight: 'infection',
				id: 0,
				conserved: true
			},
			{
				source: 1,
				target: 2,
				label: 'linear',
				weight: 'recovery',
				id: 1,
				conserved: true
			}
		]
	}
	return(
		<Layout title="SIR">
			<Simulator timing={timing} scope={scope} network={network} />
		</Layout>
	)
}
