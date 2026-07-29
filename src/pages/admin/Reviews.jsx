import { Star, Flag, CheckCircle2 } from 'lucide-react'
import { useGetReviewsQuery, useUpdateReviewStatusMutation } from '../../services/reviewService'
import { useGetAllSessionsQuery } from '../../services/serviceService'
import { useGetUsersQuery } from '../../services/userService'
import { PageHeader, Button, EmptyState } from '../../components/Common'
import Badge from '../../components/Badge'
import { meta, formatDate } from '../../utils/status'

export default function Reviews() {
  const { data: reviews = [], isLoading } = useGetReviewsQuery()
  const { data: services = [] } = useGetAllSessionsQuery()
  const { data: users = [] } = useGetUsersQuery()
  const [updateStatus] = useUpdateReviewStatusMutation()
  const serviceById = Object.fromEntries(services.map((s) => [s.id, s]))
  const userById = Object.fromEntries(users.map((u) => [u.id, u]))

  return (
    <div>
      <PageHeader title="Reviews" subtitle="Moderate feedback left by users after their sessions." />

      {!isLoading && reviews.length === 0 && <EmptyState icon={Star} title="No reviews yet" />}

      <div className="space-y-3">
        {reviews.slice().reverse().map((r) => (
          <div key={r.id} className="rounded-2xl border border-dusk-50 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-ink">{userById[r.userId]?.name}</p>
                  <span className="flex items-center gap-0.5 text-marigold-500">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill={i < r.rating ? 'currentColor' : 'none'} />)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-ink-soft">on {serviceById[r.serviceId]?.title} · {formatDate(r.createdOn)}</p>
                <p className="mt-2 max-w-2xl text-sm text-ink">{r.comment}</p>
              </div>
              <Badge tone={meta(r.status).tone}>{meta(r.status).label}</Badge>
            </div>
            {r.status === 'flagged' && (
              <div className="mt-3 flex gap-2 border-t border-dusk-50 pt-3">
                <Button variant="success" className="!px-2.5 !py-1 text-xs" onClick={() => updateStatus({ id: r.id, status: 'published' })}><CheckCircle2 size={13} /> Keep published</Button>
                <Button variant="danger" className="!px-2.5 !py-1 text-xs" onClick={() => updateStatus({ id: r.id, status: 'hidden' })}><Flag size={13} /> Hide review</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
