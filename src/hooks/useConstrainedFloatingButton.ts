import { RefObject, useEffect } from 'react'

export function useConstrainedFloatingButton(
  mapContainerRef: RefObject<HTMLDivElement | null>,
  buttonRef: RefObject<HTMLButtonElement | null>,
  isExpanded: boolean,
) {
  useEffect(() => {
    const updateButtonPosition = () => {
      if (!mapContainerRef.current || !buttonRef.current) return

      const mapRect = mapContainerRef.current.getBoundingClientRect()
      const buttonRect = buttonRef.current.getBoundingClientRect()
      const buttonHeight = buttonRect.height || 48
      const offset = 5

      const buttonElement = buttonRef.current

      if (isExpanded) {
        if (buttonElement) {
          buttonElement.style.position = 'fixed'
          buttonElement.style.left = `${offset}px`
          buttonElement.style.bottom = `${offset}px`
          buttonElement.style.top = ''
          buttonElement.style.zIndex = '2000'
          buttonElement.style.display = ''
        }
        return
      }

      const mapTop = mapRect.top
      const mapBottom = mapRect.bottom
      const mapVisible = mapBottom > 0 && mapTop < window.innerHeight

      if (!mapVisible) {
        if (buttonElement) {
          buttonElement.style.display = 'none'
        }
        return
      }

      if (buttonElement) {
        buttonElement.style.display = ''
      }

      const desiredBottomFromViewportBottom = offset
      const desiredTopFromViewportTop = window.innerHeight - buttonHeight - offset
      const desiredBottomFromViewportTop = window.innerHeight - desiredBottomFromViewportBottom

      let finalTop: number | undefined
      let finalBottom: number | undefined

      const buttonTopFromViewportTop = desiredTopFromViewportTop
      const buttonBottomFromViewportTop = desiredBottomFromViewportTop

      if (buttonTopFromViewportTop < mapTop) {
        finalTop = mapTop + offset
        finalBottom = undefined
      } else if (buttonBottomFromViewportTop > mapBottom) {
        const constrainedBottomFromTop = mapBottom - offset
        if (constrainedBottomFromTop - buttonHeight < mapTop) {
          finalTop = mapTop + offset
          finalBottom = undefined
        } else {
          finalBottom = window.innerHeight - constrainedBottomFromTop
          finalTop = undefined
        }
      } else {
        finalBottom = desiredBottomFromViewportBottom
        finalTop = undefined
      }

      if (buttonElement) {
        buttonElement.style.position = 'fixed'
        buttonElement.style.left = `${mapRect.left + offset}px`
        buttonElement.style.zIndex = '2000'
        if (finalTop !== undefined) {
          buttonElement.style.top = `${finalTop}px`
          buttonElement.style.bottom = ''
        } else if (finalBottom !== undefined) {
          buttonElement.style.bottom = `${finalBottom}px`
          buttonElement.style.top = ''
        }
      }
    }

    updateButtonPosition()

    let intersectionObserver: IntersectionObserver | null = null
    if (mapContainerRef.current) {
      intersectionObserver = new IntersectionObserver(
        () => {
          updateButtonPosition()
        },
        {
          threshold: 0,
          rootMargin: '0px',
        },
      )
      intersectionObserver.observe(mapContainerRef.current)
    }

    window.addEventListener('scroll', updateButtonPosition, { passive: true })
    window.addEventListener('resize', updateButtonPosition)

    const intervalId = setInterval(updateButtonPosition, 200)

    return () => {
      clearInterval(intervalId)
      if (intersectionObserver) {
        intersectionObserver.disconnect()
      }
      window.removeEventListener('scroll', updateButtonPosition)
      window.removeEventListener('resize', updateButtonPosition)
    }
  }, [mapContainerRef, buttonRef, isExpanded])
}
