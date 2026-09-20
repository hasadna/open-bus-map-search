import cn from 'classnames'
import busImageSvg from '../../img/busImg.svg?raw'

export const BusImage = (props: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...props}
      className={cn('bus-image', props.className)}
      dangerouslySetInnerHTML={{ __html: busImageSvg }}
    />
  )
}
