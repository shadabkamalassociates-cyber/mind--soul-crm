export const statusMeta = {
  // expert / service review pipeline
  pending: { label: 'Pending Review', tone: 'pending' },
  pending_review: { label: 'Pending Review', tone: 'pending' },
  needs_changes: { label: 'Needs Changes', tone: 'info' },
  not_submitted: { label: 'Not Submitted', tone: 'neutral' },
  approved: { label: 'Approved', tone: 'approved' },
  draft: { label: 'Draft', tone: 'neutral' },
  live: { label: 'Live', tone: 'live' },
  rejected: { label: 'Rejected', tone: 'rejected' },

  // bookings & sessions
  upcoming: { label: 'Upcoming', tone: 'live' },
  confirmed: { label: 'Confirmed', tone: 'approved' },
  completed: { label: 'Completed', tone: 'info' },
  refunded: { label: 'Refunded', tone: 'rejected' },
  cancelled: { label: 'Cancelled', tone: 'rejected' },

  // users
  active: { label: 'Active', tone: 'approved' },
  blocked: { label: 'Blocked', tone: 'rejected' },

  // coupons
  expired: { label: 'Expired', tone: 'rejected' },

  // payouts
  paid: { label: 'Paid', tone: 'approved' },

  // reviews
  published: { label: 'Published', tone: 'approved' },
  flagged: { label: 'Flagged', tone: 'rejected' },
}

export function meta(status) {
  return statusMeta[status] || { label: status, tone: 'neutral' }
}

export const currency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)

export const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const formatDateTime = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}
