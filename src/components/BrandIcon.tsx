import { useId } from 'react'

type BrandIconProps = {
  size?: number
  className?: string
}

export function BrandIcon({ size = 40, className }: BrandIconProps) {
  const id = useId().replace(/:/g, '')
  const bgId = `brand-bg-${id}`
  const handleId = `brand-handle-${id}`

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="10" fill={`url(#${bgId})`} />
      <path
        d="M12.5 12h15a3 3 0 0 1 3 3v2.5H9.5V15a3 3 0 0 1 3-3Z"
        fill={`url(#${handleId})`}
      />
      <rect
        x="8.5"
        y="17.5"
        width="23"
        height="14.5"
        rx="4"
        fill="#101A26"
        stroke="#4A8FE7"
        strokeWidth="1.25"
      />
      <path
        fill="none"
        stroke="#5C9DFF"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.25 22.25c-1.15 0-1.85.85-1.85 1.85v1.3c0 1 .7 1.85 1.85 1.85M25.75 22.25c1.15 0 1.85.85 1.85 1.85v1.3c0 1-.7 1.85-1.85 1.85"
      />
      <path
        stroke="#38BDF8"
        strokeWidth="1.35"
        strokeLinecap="round"
        d="M18.5 25.75h3"
      />
      <circle cx="20" cy="21.25" r="0.85" fill="#3D8BFD" />
      <defs>
        <linearGradient id={bgId} x1="6" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0C141D" />
          <stop offset="1" stopColor="#111C2A" />
        </linearGradient>
        <linearGradient
          id={handleId}
          x1="9.5"
          y1="12"
          x2="30.5"
          y2="17.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#38BDF8" />
        </linearGradient>
      </defs>
    </svg>
  )
}
