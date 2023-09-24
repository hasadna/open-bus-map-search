export const GetColorByExecution = (planned: number, actual: number) => {
  const misses = planned - actual
  const percentageMisses = (misses / planned) * 100

  if (percentageMisses <= 5) {
    return 'green'
  } else if (percentageMisses <= 50) {
    return 'orange'
  } else {
    return 'red'
  }
}
