import {useEffect, useRef} from "react"

export default function useInterval(callback, delay) {
	// based on https://overreacted.io/making-setinterval-declarative-with-react-hooks/
	const savedCallback = useRef();
	
	// Remember the latest callback.
	useEffect(() => {
		savedCallback.current = callback;
	}, [callback]);
	
	// Set up the interval.
	useEffect(() => {
		function tick() {
			savedCallback.current();
		}

		if (delay == null) {
			console.error("DELAY %s  TICK %s  CALLBACK %s  useEffect()= %s  useRef() %s", 
				String(delay), String(tick), String(callback), String(useEffect), String(useRef));
			return false
		}

		if (delay !== null) {
			let id = setInterval(tick, delay);
			return () => clearInterval(id);
		}
	}, [delay]);
}