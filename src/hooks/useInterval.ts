import { useRef, useEffect } from "react";

// Very generic helper-hook that can be used in many different projects, requires an input callback to call to update, and a delay in which how often to run
export function useInterval(callBack: () => void, delay: number | null): void {
	const callbackRef = useRef(callBack); // Store callback using reference object
	
	// Update and store the callback in the ref
	useEffect(() => {
		callbackRef.current = callBack;
	}, [callBack]);
	
	// When delay is changed, create a new interval to call the callback ref after delay
	// If delay is null, do nothing
	// Clear the interval 'on clean up'
	useEffect(() => {
		if (delay == null) return;
		
		const intervalID = setInterval(() => callbackRef.current(), delay);
		return () => clearInterval(intervalID);
	}, [delay]);
}