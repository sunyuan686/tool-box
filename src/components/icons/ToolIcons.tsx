type IconProps = {
  size?: number
  className?: string
}

const defaults = { size: 18, className: undefined as string | undefined }

export function HomeIcon({ size = defaults.size, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M10 2.5 3.75 7.25v9.5a1.25 1.25 0 0 0 1.25 1.25H8.5v-5h3v5h3.5a1.25 1.25 0 0 0 1.25-1.25v-9.5L10 2.5Z"
      />
    </svg>
  )
}

export function JsonIcon({ size = defaults.size, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.25 5.5C5.5 5.5 4.5 6.75 4.5 8.25v3.5c0 1.5 1 2.75 2.75 2.75M12.75 5.5c1.75 0 2.75 1.25 2.75 2.75v3.5c0 1.5-1 2.75-2.75 2.75"
      />
      <path
        fill="currentColor"
        d="M9.25 8.5h1.5v3h-1.5zM10 7.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
      />
    </svg>
  )
}

export function ShieldLocalIcon({ size = defaults.size, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M10 2.25 4.5 4.5v5.25c0 3.15 2.35 6.1 5.5 7 3.15-.9 5.5-3.85 5.5-7V4.5L10 2.25Zm0 2.2 3.25 1.45v4.35c0 2.1-1.55 4.05-3.25 4.85-1.7-.8-3.25-2.75-3.25-4.85V5.9L10 4.45Z"
      />
      <path
        fill="currentColor"
        d="M8.6 9.85 7.4 11.05l1.15 1.15 2.55-2.55-1.15-1.15-1.2 1.2Z"
      />
    </svg>
  )
}

export type ToolIconName = 'home' | 'json'

export function CopyIcon({ size = defaults.size, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M6.5 4.75A1.75 1.75 0 0 1 8.25 3h6.5A1.75 1.75 0 0 1 16.5 4.75v9.5A1.75 1.75 0 0 1 14.75 16h-6.5A1.75 1.75 0 0 1 6.5 14.25v-9.5ZM8.25 4.5c-.14 0-.25.11-.25.25v9.5c0 .14.11.25.25.25h6.5c.14 0 .25-.11.25-.25v-9.5c0-.14-.11-.25-.25-.25h-6.5Z"
      />
      <path
        fill="currentColor"
        d="M4.75 6.5A1.75 1.75 0 0 0 3 8.25v7.5C3 16.77 3.73 17.5 4.75 17.5h7.5c.97 0 1.75-.73 1.75-1.75v-.5H8.25A2.25 2.25 0 0 1 6 13v-6.5h-.5Z"
      />
    </svg>
  )
}

export function DownloadIcon({ size = defaults.size, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M10 3.25a.75.75 0 0 1 .75.75v7.19l2.22-2.22a.75.75 0 1 1 1.06 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 1 1 1.06-1.06l2.22 2.22V4a.75.75 0 0 1 .75-.75Z"
      />
      <path
        fill="currentColor"
        d="M4.75 14.25a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5H4.75Z"
      />
    </svg>
  )
}

export function FileOpenIcon({ size = defaults.size, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M4.75 4.5A1.75 1.75 0 0 1 6.5 2.75h3.88a1.75 1.75 0 0 1 1.24.51l1.13 1.14A1.75 1.75 0 0 0 13.99 5.5H13.5A1.75 1.75 0 0 1 15.25 7.25v8.5A1.75 1.75 0 0 1 13.5 17.5h-7A1.75 1.75 0 0 1 4.75 15.75V4.5Zm1.75-.75a.25.25 0 0 0-.25.25v11.25c0 .14.11.25.25.25h7c.14 0 .25-.11.25-.25V7.25a.25.25 0 0 0-.25-.25H9.88a1.75 1.75 0 0 1-1.24-.51L7.51 5.6a.25.25 0 0 0-.18-.07H6.5Z"
      />
    </svg>
  )
}

export function TrashIcon({ size = defaults.size, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M7.25 3.5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1V5h3.25a.75.75 0 0 1 0 1.5h-.66l-.73 9.52A1.75 1.75 0 0 1 12.62 17.5H7.38a1.75 1.75 0 0 1-1.74-1.98l-.73-9.52H4.75a.75.75 0 0 1 0-1.5H7.25V3.5Zm2 0V5h1.5V3.5h-1.5ZM8.1 6.5l.68 8.86h2.44l.68-8.86H8.1Z"
      />
    </svg>
  )
}

export function ToolIcon({
  name,
  size = defaults.size,
  className,
}: IconProps & { name: ToolIconName }) {
  switch (name) {
    case 'home':
      return <HomeIcon size={size} className={className} />
    case 'json':
      return <JsonIcon size={size} className={className} />
    default:
      return <JsonIcon size={size} className={className} />
  }
}
