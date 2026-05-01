import { useEffect, useState } from "react";

export function useLiveBalance(initial: number, active: boolean) {
  const [value, setValue] = useState(initial);

  useEffect(() => {
    setValue(initial);
  }, [initial]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!active) return;

      setValue((prev) => {
        const change = prev * (Math.random() * 0.0012 - 0.00025);
        return prev + change;
      });
    }, 9000);

    return () => clearInterval(interval);
  }, [active]);

  return value;
}
