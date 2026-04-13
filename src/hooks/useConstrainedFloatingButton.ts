import { RefObject, useEffect } from 'react'

export function useConstrainedFloatingButton(
  mapContainerRef: RefObject<HTMLDivElement | null>,
  buttonRef: RefObject<HTMLButtonElement | null>,
  isExpanded: boolean,
) {
  useEffect(() => {
    if (!buttonRef.current) return

    const buttonElement = buttonRef.current

    if (isExpanded) {
      buttonElement.style.left = '5px'
      buttonElement.style.bottom = '20px'
      buttonElement.style.top = ''
    } else {
      buttonElement.style.left = ''
      buttonElement.style.bottom = ''
      buttonElement.style.top = ''
    }
  }, [mapContainerRef, buttonRef, isExpanded])
}
