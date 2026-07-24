import { useSelector } from 'react-redux'
import { Star } from 'lucide-react'
import { useGetReviewsQuery } from '../../services/reviewService'
import { useGetServicesQuery } from '../../services/serviceService'
import { useGetUsersQuery } from '../../services/userService'
import { PageHeader, EmptyState } from '../../components/Common'
import { formatDate } from '../../utils/status'

export default function Reviews() {
  const user = useSelector((s) => s.auth.user)
  const { data: reviews = [], isLoading } = useGetReviewsQuery()
  const { data: services = [] } = useGetServicesQuery()
  const { data: users = [] } = useGetUsersQuery()

  const serviceById = Object.fromEntries(services.map((s) => [s.id, s]))
  const userById = Object.fromEntries(users.map((u) => [u.id, u]))
  const mine = reviews.filter((r) => r.expertId === user.id && r.status !== 'hidden')

  const avg = mine.length ? (mine.reduce((s, r) => s + r.rating, 0) / mine.length).toFixed(1) : null

  return (
    <div>
      <PageHeader title="Reviews" subtitle={avg ? `Average rating: ${avg} ★ across ${mine.length} reviews` : 'No reviews yet'} />

      {!isLoading && mine.length === 0 && <EmptyState icon={Star} title="No reviews yet" message="Reviews from users will show up here after completed sessions." />}

      <div className="space-y-3">
        {mine.slice().reverse().map((r) => (
          <div key={r.id} className="rounded-2xl border border-dusk-50 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <p className="font-medium text-ink">{userById[r.userId]?.name}</p>
              <span className="flex items-center gap-0.5 text-marigold-500">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill={i < r.rating ? 'currentColor' : 'none'} />)}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-ink-soft">on {serviceById[r.serviceId]?.title} · {formatDate(r.createdOn)}</p>
            <p className="mt-2 text-sm text-ink">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
