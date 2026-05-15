import React, { useState } from 'react'
import { DEFAULT_EVENT_IMAGE, getDisplayEventImage } from '../../utils/eventImages'

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, ...rest } = props
  const displaySrc = getDisplayEventImage(typeof src === 'string' ? src : '')

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img src={DEFAULT_EVENT_IMAGE} alt={alt || 'Event image'} {...rest} data-original-url={src} />
      </div>
    </div>
  ) : (
    <img src={displaySrc} alt={alt} className={className} style={style} {...rest} onError={handleError} />
  )
}
