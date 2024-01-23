export function useLocalStorage(key: string) {
  const setItem = (value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.log('No support for local storage')
    }
  }

  const getItem = () => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : undefined
    } catch (error) {
      console.log('No support for local storage')
    }
  }

  return { setItem, getItem }
}
