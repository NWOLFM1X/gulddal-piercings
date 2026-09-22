import { useCallback, useEffect, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Flex,
  Spinner,
  Stack,
  Text,
} from '@sanity/ui'
import { useClient } from 'sanity'

const API_VERSION = '2024-01-01'

type BookingRow = {
  _id: string
  name?: string
  status?: string
  piercingNames?: string[]
  startsAt?: string
}

const STATUS_LABEL: Record<string, string> = {
  new: '🆕 Ny',
  confirmed: '✅ Bekræftet',
  cancelled: '❌ Aflyst',
}

function formatDate(iso?: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('da-DK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Copenhagen',
  })
}

export function BookingsBulkList() {
  const client = useClient({ apiVersion: API_VERSION })
  const [bookings, setBookings] = useState<BookingRow[] | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<{ tone: 'critical' | 'positive'; text: string } | null>(
    null,
  )

  const loadBookings = useCallback(() => {
    client
      .fetch<BookingRow[]>(
        `*[_type == "booking"] | order(_createdAt desc){
          _id, name, status, "piercingNames": piercings[]->name, "startsAt": slot->startsAt
        }`,
      )
      .then((result) => {
        setBookings(result)
        setSelected((prev) => {
          const ids = new Set(result.map((b) => b._id))
          return new Set([...prev].filter((id) => ids.has(id)))
        })
      })
      .catch(() => {
        setMessage({ tone: 'critical', text: 'Kunne ikke hente bookinger' })
      })
  }, [client])

  useEffect(() => {
    loadBookings()
    // Hold listen op-to-date hvis andre ændrer bookinger imens siden er åben.
    const sub = client
      .listen('*[_type == "booking"]', {}, { visibility: 'query' })
      .subscribe(() => loadBookings())
    return () => sub.unsubscribe()
  }, [client, loadBookings])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (!bookings) return
    setSelected((prev) =>
      prev.size === bookings.length ? new Set() : new Set(bookings.map((b) => b._id)),
    )
  }

  async function deleteSelected() {
    if (selected.size === 0) return
    const confirmed = window.confirm(
      `Er du sikker på, at du vil slette ${selected.size} booking(er)? Dette kan ikke fortrydes.`,
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
      setMessage({ tone: 'positive', text: `${selected.size} booking(er) slettet` })
      setSelected(new Set())
      loadBookings()
    } catch (err) {
      setMessage({
        tone: 'critical',
        text: `Kunne ikke slette bookinger${err instanceof Error ? `: ${err.message}` : ''}`,
      })
    } finally {
      setDeleting(false)
    }
  }

  if (!bookings) {
    return (
      <Flex align="center" justify="center" padding={5}>
        <Spinner muted />
      </Flex>
    )
  }

  if (bookings.length === 0) {
    return (
      <Box padding={4}>
        <Text muted>Ingen bookinger endnu.</Text>
      </Box>
    )
  }

  const allSelected = selected.size === bookings.length

  return (
    <Box padding={3}>
      <Flex align="center" justify="space-between" paddingBottom={3}>
        <Flex align="center" gap={2}>
          <Checkbox checked={allSelected} onChange={toggleAll} />
          <Text size={1} muted>
            {selected.size} valgt af {bookings.length}
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
        {bookings.map((b) => {
          const label = b.status ? STATUS_LABEL[b.status] ?? b.status : ''
          const piercing = b.piercingNames?.filter(Boolean).join(', ')
          return (
            <Card key={b._id} padding={3} radius={2} shadow={1} tone={selected.has(b._id) ? 'primary' : undefined}>
              <Flex align="center" gap={3}>
                <Checkbox checked={selected.has(b._id)} onChange={() => toggle(b._id)} />
                <Stack space={2}>
                  <Flex align="center" gap={2}>
                    <Text weight="semibold">{b.name ?? 'Ukendt'}</Text>
                    {label && <Badge mode="outline">{label}</Badge>}
                  </Flex>
                  <Text size={1} muted>
                    {piercing || 'Ingen piercing'}
                    {b.startsAt ? ` · ${formatDate(b.startsAt)}` : ''}
                  </Text>
                </Stack>
              </Flex>
            </Card>
          )
        })}
      </Stack>
    </Box>
  )
}
