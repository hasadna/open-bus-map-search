import { useState } from 'react'

export function useLocalStorage<T>(key: string, defaultValue?: T) {
  try {
    const [state, setState] = useState<T | undefined>(() => {
      const item = localStorage.getItem(key)
      if (item !== null) return JSON.parse(item) as T
      if (defaultValue !== undefined) localStorage.setItem(key, JSON.stringify(defaultValue))
      return defaultValue
    })

    const setItem = (value: T | ((val: T | undefined) => T)) => {
      const valueToStore = value instanceof Function ? value(state) : value
      setState(valueToStore)
      localStorage.setItem(key, JSON.stringify(valueToStore))
    }

    return [state, setItem] as const
  } catch (error) {
    console.log('No support for local storage', error)
    return [
      defaultValue,
      () => {
        throw new Error('No support for local storage')
      },
    ] as const
  }
}
