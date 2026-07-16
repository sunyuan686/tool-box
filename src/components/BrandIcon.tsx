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
        fill="#0e0e10"
        stroke="#52525b"
        strokeWidth="1.25"
      />
      <path
        fill="none"
        stroke="#e4e4e7"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.25 22.25c-1.15 0-1.85.85-1.85 1.85v1.3c0 1 .7 1.85 1.85 1.85M25.75 22.25c1.15 0 1.85.85 1.85 1.85v1.3c0 1-.7 1.85-1.85 1.85"
      />
      <path
        stroke="#fafafa"
        strokeWidth="1.35"
        strokeLinecap="round"
        d="M18.5 25.75h3"
      />
      <circle cx="20" cy="21.25" r="0.85" fill="#fafafa" />
      <defs>
        <linearGradient id={bgId} x1="6" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#09090b" />
          <stop offset="1" stopColor="#121214" />
        </linearGradient>
        <linearGradient
          id={handleId}
          x1="9.5"
          y1="12"
          x2="30.5"
          y2="17.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#52525b" />
          <stop offset="1" stopColor="#d4d4d8" />
        </linearGradient>
      </defs>
    </svg>
  )
}
