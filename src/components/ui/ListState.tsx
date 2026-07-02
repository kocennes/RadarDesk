import { Text } from '@fluentui/react-components'

export type ListStateProps = {
  message: string
  tone?: 'default' | 'error'
}

export function ListState({ message, tone = 'default' }: ListStateProps) {
  const role = tone === 'error' ? 'alert' : 'status'

  return (
    <div aria-live={tone === 'error' ? 'assertive' : 'polite'} className={`list-state list-state-${tone}`} role={role}>
      <Text weight="semibold">{message}</Text>
      <Text className="muted" size={200}>
        Bu bir frontend durum onizlemesi.
      </Text>
    </div>
  )
}
