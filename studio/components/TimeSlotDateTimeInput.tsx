import {useCallback, useEffect, useMemo, useState} from 'react'
import {set, unset, type StringInputProps} from 'sanity'

// Forudbestemte tidspunkter. Justér start/slut/interval her efter behov.
const START_HOUR = 9
const END_HOUR = 18
const STEP_MINUTES = 15

const pad = (n: number) => String(n).padStart(2, '0')

const TIMES: string[] = (() => {
  const list: string[] = []
  for (let mins = START_HOUR * 60; mins <= END_HOUR * 60; mins += STEP_MINUTES) {
    list.push(`${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`)
  }
  return list
})()

/** Læs et ISO-datetime ud som lokal dato (YYYY-MM-DD) og tid (HH:mm). */
function parseValue(value?: string): {date: string; time: string} {
  if (!value) return {date: '', time: ''}
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return {date: '', time: ''}
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}

/**
 * Custom input til "Dato og tid": vælg en dato og klik derefter på et
 * forudbestemt tidspunkt. Gemmer stadig et almindeligt datetime (ISO), så
 * resten af siden fungerer uændret.
 */
export function TimeSlotDateTimeInput(props: StringInputProps) {
  const {value, onChange, readOnly} = props
  const parsed = useMemo(() => parseValue(value), [value])

  const [date, setDate] = useState(parsed.date)
  const [time, setTime] = useState(parsed.time)

  // Hold lokal state i sync hvis værdien ændres udefra.
  useEffect(() => {
    setDate(parsed.date)
    setTime(parsed.time)
  }, [parsed.date, parsed.time])

  const commit = useCallback(
    (nextDate: string, nextTime: string) => {
      if (nextDate && nextTime) {
        const local = new Date(`${nextDate}T${nextTime}:00`)
        if (!Number.isNaN(local.getTime())) {
          onChange(set(local.toISOString()))
          return
        }
      }
      onChange(unset())
    },
    [onChange],
  )

  const onPickDate = (v: string) => {
    setDate(v)
    commit(v, time)
  }

  const onPickTime = (v: string) => {
    setTime(v)
    commit(date, v)
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <label style={{fontSize: 13, fontWeight: 500}}>Dato</label>
        <input
          type="date"
          value={date}
          disabled={readOnly}
          onChange={(e) => onPickDate(e.currentTarget.value)}
          style={{
            padding: '8px 10px',
            border: '1px solid #ccd2e0',
            borderRadius: 6,
            fontSize: 14,
            maxWidth: 220,
          }}
        />
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
        <label style={{fontSize: 13, fontWeight: 500}}>Tidspunkt</label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))',
            gap: 6,
            opacity: date ? 1 : 0.5,
            pointerEvents: date && !readOnly ? 'auto' : 'none',
          }}
        >
          {TIMES.map((t) => {
            const active = t === time
            return (
              <button
                key={t}
                type="button"
                onClick={() => onPickTime(t)}
                style={{
                  padding: '8px 4px',
                  border: `1px solid ${active ? '#2276fc' : '#ccd2e0'}`,
                  background: active ? '#2276fc' : '#fff',
                  color: active ? '#fff' : '#1b1f26',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                {t}
              </button>
            )
          })}
        </div>
        {!date && (
          <span style={{fontSize: 12, color: '#6b7280'}}>
            Vælg en dato først for at kunne vælge tidspunkt.
          </span>
        )}
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 220}}>
        <label style={{fontSize: 12, color: '#6b7280'}}>Andet tidspunkt (valgfrit)</label>
        <input
          type="time"
          value={time}
          step={STEP_MINUTES * 60}
          disabled={readOnly || !date}
          onChange={(e) => onPickTime(e.currentTarget.value)}
          style={{
            padding: '6px 10px',
            border: '1px solid #ccd2e0',
            borderRadius: 6,
            fontSize: 13,
          }}
        />
      </div>
    </div>
  )
}
