export function useLocalStorage(key: string) {
  const setItem = (value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {}
  }

  const getItem = () => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : undefined
    } catch (error) {}
  }

  return { setItem, getItem }
}
