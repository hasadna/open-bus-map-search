export function useLocalStorage<T>(key: string) {
  const setItem = (value: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.log('No support for local storage')
    }
  }

  const getItem = () => {
    try {
      const item = localStorage.getItem(key)
      if (item) return JSON.parse(item) as T
    } catch (error) {
      console.log('No support for local storage')
    }
  }

  return { setItem, getItem }
}
