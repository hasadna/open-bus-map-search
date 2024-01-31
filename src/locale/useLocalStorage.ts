import { useState } from "react"

export function useLocalStorage<T>(key: string) {
  try {
    const [state, setState] = useState(localStorage.getItem(key) as T)

    const setItem = (value: T | ((val: T) => T)) => {
      const valueToStore = value instanceof Function ? value(state) : value
      setState(valueToStore)
      localStorage.setItem(key, valueToStore as unknown as string)
    }

    return [state, setItem] as const
  } catch (error) {
    console.log('No support for local storage')
    return [undefined, () =>{
      throw new Error('No support for local storage')
    }] as const
  }
}
