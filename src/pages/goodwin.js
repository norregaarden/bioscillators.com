import React from 'react'
import theme from 'src/theme/theme'
import Layout from 'src/components/layout'
import Simulator from 'src/components/simulator'

// import useComlink from 'react-use-comlink'
// import { WorkerClass } from 'src/utils/sim-worker'

export default () => {
	const timing = {
		dt: 0.01,
		tmax: 100
	}
	// const scope = {
	// 	k_u: 1,
	// 	k_d: 0.1,
	// 	Ki: 1,
	// 	n: 10
	// }
	const scope = [
		{
			label: 'k_u',
			value: 1
		},
		{
			label: 'k_d',
			value: 0.5
		},
		{
			label: 'K_A',
			value: 1
		},
		{
			label: 'n',
			value: 10
		}
	]
	const network = {
		nodes: [
			{
				id: 0,
				label: 'mRNA',
				color: theme.palette.nodes.blue,
				initial: 1,
				dot: '',
				terms: []
				// d: 'ku*((Ki^n)/(Ki^n + Z^n)) - kd*X'
			},
			{
				id: 1,
				label: 'Protein',
				initial: 1,
				dot: '',
				terms: []
				// d: 'ku*X - kd*Y'
			}, 
			{
				id: 2,
				label: 'nTF',
				color: theme.palette.nodes.cyan,
				initial: 1,
				dot: '',
				terms: []
				// d: 'ku*Y - kd*Z'
			}
		],
		edges: [
			{
				source: 2,
				target: 0,
				label: 'hill repression',
				weight: 'k_u',
				parameters: ['K_A', 'n'],
				id: 0
			},
			{
				source: 0,
				target: 0,
				label: 'linear',
				negative: true,
				weight: 'k_d',
				id: 1
			},
			{
				source: 0,
				target: 1,
				label: 'linear',
				weight: 'k_u',
				id: 2
			},
			{
				source: 1,
				target: 1,
				label: 'linear',
				negative: true,
				weight: 'k_d',
				id: 3
			},
			{
				source: 1,
				target: 2,
				label: 'linear',
				weight: 'k_u',
				id: 4
			},
			{
				source: 2,
				target: 2,
				label: 'linear',
				negative: true,
				weight: 'k_d',
				id: 5
			}
		]
	}

	// const workerInit = -666
	// const [count, setCount] = useState(workerInit)

	// const { proxy } = useComlink( // <typeof WorkerClass>
	// 	() => new Worker('src/utils/sim-worker.ts'), 
	// 	[]
	// )

	// useEffect(() => {
	// 	(async () => {
	// 		const classInstance = await new proxy(2*workerInit)

	// 		await classInstance.increment()

	// 		setCount(await classInstance.count)
	// 	})()
	// }, [proxy, workerInit])

	// useEffect(() => {
	// 	(async () => {
	// 		await classInstance.increment()
	// 		setCount(await classInstance.count)			
	// 	})
	// }, [count])

	return(
		<Layout title="Goodwin">
			{/* <Box>
				<Typography variant="h3">
					Count: {count}
				</Typography>
			</Box> */}

			<Simulator timing={timing} scope={scope} network={network} />
		</Layout>
	)
}
