function texplate(strings, ...keys) { // *template: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
    return (function(...values) {
        let dict = values[values.length - 1] || {};
        let result = [strings[0]];
        keys.forEach(function(key, i) {
            let value = Number.isInteger(key) ? values[key] : dict[key];
            result.push(value, strings[i + 1]);
        });
        return result.join('');
    });
}

/*
    def: tp=texPlates, et=edgeType
    set: target, source, weight, sign=!nsign, conserved, (parameters[name])
    term(latex) = tp.preTerm + (conserved ? tp.preTermConserved : '') + tp.termStarter et.termMain
    reaction(mhchem) = et.preReaction + tp.reaction + et.preReaction + tp.postReaction + (conserved? tp.postReactionConserved : '')
    
    this file is imported in src/components/simulator.js and src/components/network.js
    there (X+X)->(2X) and (X-X)->()
*/

const texPlates = {
    preTerm: texplate`\\frac{\\text{d} ${'target'}}{\\text{dt}} = `,
    preTermConserved: texplate`- \\frac{\\text{d} ${'source'}}{\\text{dt}} = `, // \\stackrel{+}{=} // \\tilde ${'nsign'}
    termStarter: texplate` ${'sign'} ${'weight'} \\cdot `,
    reaction: texplate` ->[${'weight'}] `,
    postReaction: texplate` ${'sign'} ${'target'}`,
    postReactionConserved: texplate` ${'nsign'} ${'source'}`
}

const hillParameters = [{
    name: 'half',
    default: 'K_A',
    label: 'Half occupation'
}, {
    name: 'hill',
    default: 'n',
    label: 'Hill coefficient'
}]

// `` vs '' are important
const edgeTypes = [
	{
        // network:     (X)->(Y)
        // reaction:    X => X + Y
        // dynamics:    dY/dt ∝ X
		name: 'linear', 
        termMain: texplate`${'source'}`,    // dY/dt ∝ |X|      change of Y is proportional to X
        preReaction: texplate`${'source'}`, // |X| => X + Y     left side of chemical reaction
	},
	{
        // network:     (X)->(Y)
        // reaction:    X + Y => X + 2Y
        // dynamics:    dY/dt ∝ X * Y
		name: 'meet',
        termMain: texplate`${'source'} \\cdot ${'target'}`,
        preReaction: texplate`${'source'} + ${'target'}`
    },
	{
		name: 'hill activation',
        parameters: hillParameters,
        termMain: texplate`\\frac{ ${'source'} }{ ${'half'} + ${'source'} }`,
        nullaryReaction: texplate`\\ce{ E + ${'hill'} ${'source'} <=>[][{${'half'}}^{${'hill'}}] E ${'source'}_{${'hill'}} }`,
        preReaction: texplate`E ${'source'}_{${'hill'}}` // 'E' because an enzyme is imagined (constant concentration)
	},
	{
		name: 'hill repression',
        parameters: hillParameters,
        termMain: texplate`\\frac{ ${'half'} }{ ${'half'} + ${'source'} }`,
        nullaryReaction: texplate`\\ce{ D ${'source'}_{${'hill'}} <=>[{${'half'}}^{${'hill'}}][] D + ${'hill'} ${'source'} }`,
        preReaction: texplate`D ${'source'}_{${'hill'}}` // 'D' because DNA is imagined (constant concentration)
	},
]

function getEdgeTypeFromLabel(label) {
    return edgeTypes.filter((e) => e.name === label)[0]
}

export default edgeTypes
export { texPlates, getEdgeTypeFromLabel }