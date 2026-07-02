export type ButtonInfoProps = {
  label: string
}

export function ButtonInfo({ label }: ButtonInfoProps) {
  return (
    <span className="button-info">
      <span
        aria-label={label}
        className="button-info-icon"
        role="img"
        tabIndex={0}
      >
        i
      </span>
      <span className="button-info-tooltip" role="tooltip">
        {label}
      </span>
    </span>
  )
}
