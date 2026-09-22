import { useCallback, useEffect, useState } from 'react'
import { Badge, Box, Button, Card, Checkbox, Flex, Spinner, Stack, Text } from '@sanity/ui'
import { useClient } from 'sanity'

const API_VERSION = '2024-01-01'

type TimeSlotRow = {
  _id: string
  startsAt?: string
  status?: string
  note?: string
}

const STATUS_LABEL: Record<string, string> = {
  available: 'Ledig',
  booked: 'Booket',
  blocked: 'Blokeret',
}

function formatDate(iso?: string) {
  if (!iso) return 'Ingen tid valgt'
  return new Date(iso).toLocaleString('da-DK', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Copenhagen',
  })
}

export function TimeSlotsBulkList() {
  const client = useClient({ apiVersion: API_VERSION })
  const [slots, setSlots] = useState<TimeSlotRow[] | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<{ tone: 'critical' | 'positive'; text: string } | null>(
    null,
  )

  const loadSlots = useCallback(() => {
    client
      .fetch<TimeSlotRow[]>(
        `*[_type == "timeSlot"] | order(startsAt asc){ _id, startsAt, status, note }`,
      )
      .then((result) => {
        setSlots(result)
        setSelected((prev) => {
          const ids = new Set(result.map((s) => s._id))
          return new Set([...prev].filter((id) => ids.has(id)))
        })
      })
      .catch(() => {
        setMessage({ tone: 'critical', text: 'Kunne ikke hente ledige tider' })
      })
  }, [client])

  useEffect(() => {
    loadSlots()
    // Hold listen op-to-date hvis andre ændrer tider imens siden er åben.
    const sub = client
      .listen('*[_type == "timeSlot"]', {}, { visibility: 'query' })
      .subscribe(() => loadSlots())
    return () => sub.unsubscribe()
  }, [client, loadSlots])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (!slots) return
    setSelected((prev) =>
      prev.size === slots.length ? new Set() : new Set(slots.map((s) => s._id)),
    )
  }

  async function deleteSelected() {
    if (selected.size === 0) return
    const confirmed = window.confirm(
      `Er du sikker på, at du vil slette ${selected.size} tid(er)? Dette kan ikke fortrydes.`,
    )
    if (!confirmed) return

    setDeleting(true)
    setMessage(null)
    try {
      const tx = client.transaction()
      selected.forEach((id) => {
        tx.delete(id)
        tx.delete(`drafts.${id}`)
      })
      await tx.commit()
      setMessage({ tone: 'positive', text: `${selected.size} tid(er) slettet` })
      setSelected(new Set())
      loadSlots()
    } catch (err) {
      setMessage({
        tone: 'critical',
        text: `Kunne ikke slette tider${err instanceof Error ? `: ${err.message}` : ''}`,
      })
    } finally {
      setDeleting(false)
    }
  }

  if (!slots) {
    return (
      <Flex align="center" justify="center" padding={5}>
        <Spinner muted />
      </Flex>
    )
  }

  if (slots.length === 0) {
    return (
      <Box padding={4}>
        <Text muted>Ingen ledige tider endnu.</Text>
      </Box>
    )
  }

  const allSelected = selected.size === slots.length

  return (
    <Box padding={3}>
      <Flex align="center" justify="space-between" paddingBottom={3}>
        <Flex align="center" gap={2}>
          <Checkbox checked={allSelected} onChange={toggleAll} />
          <Text size={1} muted>
            {selected.size} valgt af {slots.length}
          </Text>
        </Flex>
        <Button
          tone="critical"
          text={deleting ? 'Sletter…' : 'Slet valgte'}
          disabled={selected.size === 0 || deleting}
          onClick={deleteSelected}
        />
      </Flex>

      {message && (
        <Card padding={3} radius={2} tone={message.tone} marginBottom={3}>
          <Text size={1}>{message.text}</Text>
        </Card>
      )}

      <Stack space={2}>
        {slots.map((s) => {
          const label = s.status ? STATUS_LABEL[s.status] ?? s.status : ''
          return (
            <Card
              key={s._id}
              padding={3}
              radius={2}
              shadow={1}
              tone={selected.has(s._id) ? 'primary' : undefined}
            >
              <Flex align="center" gap={3}>
                <Checkbox checked={selected.has(s._id)} onChange={() => toggle(s._id)} />
                <Stack space={2}>
                  <Flex align="center" gap={2}>
                    <Text weight="semibold">{formatDate(s.startsAt)}</Text>
                    {label && <Badge mode="outline">{label}</Badge>}
                  </Flex>
                  {s.note && (
                    <Text size={1} muted>
                      {s.note}
                    </Text>
                  )}
                </Stack>
              </Flex>
            </Card>
          )
        })}
      </Stack>
    </Box>
  )
}
