import { useState } from 'react'
import { useSelector } from 'react-redux'
import { IndianRupee, Wallet, Send } from 'lucide-react'
import { useGetBookingsQuery } from '../../services/bookingService'
import { useGetPayoutsQuery, useRequestPayoutMutation } from '../../services/payoutService'
import { useGetSettingsQuery } from '../../services/settingsService'
import { useGetExpertQuery } from '../../services/expertService'
import { PageHeader, Button, Field, inputCls } from '../../components/Common'
import StatCard from '../../components/StatCard'
import Modal from '../../components/Modal'
import Badge from '../../components/Badge'
import { meta, currency, formatDate } from '../../utils/status'

export default function Earnings() {
  const user = useSelector((s) => s.auth.user)
  const { data: expert } = useGetExpertQuery(user.id)
  const { data: bookings = [] } = useGetBookingsQuery()
  const { data: payouts = [] } = useGetPayoutsQuery()
  const { data: settings } = useGetSettingsQuery()
  const [requestPayout, { isLoading }] = useRequestPayoutMutation()
  const [modalOpen, setModalOpen] = useState(false)
  const [amount, setAmount] = useState('')

  const commission = settings?.commissionPercent ?? 20
  const myBookings = bookings.filter((b) => b.expertId === user.id && b.status === 'completed')
  const grossCompleted = myBookings.reduce((s, b) => s + b.amount, 0)
  const netEarned = Math.round(grossCompleted * (1 - commission / 100))

  const myPayouts = payouts.filter((p) => p.expertId === user.id)
  const alreadyRequested = myPayouts.reduce((s, p) => s + p.amount, 0)
  const availableBalance = Math.max(netEarned - alreadyRequested + 21600, 0) // seed baseline so demo has a balance to withdraw

  const handleRequest = async (e) => {
    e.preventDefault()
    await requestPayout({ expertId: user.id, amount: Number(amount), accountLast4: '7734' })
    setAmount('')
    setModalOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Earnings & Payouts"
        subtitle={`Platform commission is ${commission}% — you keep ${100 - commission}% of every booking.`}
        action={<Button variant="accent" onClick={() => setModalOpen(true)}><Send size={15} /> Request Payout</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Available to withdraw" value={currency(availableBalance)} icon={Wallet} accent="sage" />
        <StatCard label="Lifetime earnings" value={currency(expert?.earningsLifetime)} icon={IndianRupee} accent="dusk" />
        <StatCard label="Awaiting payout approval" value={currency(myPayouts.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0))} icon={Wallet} accent="marigold" />
      </div>

      <div className="mt-5 rounded-2xl border border-dusk-50 bg-white p-5 shadow-sm">
        <h3 className="mb-3 font-display text-base font-semibold text-ink">Commission breakdown example</h3>
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div><p className="text-ink-soft">Session price</p><p className="font-semibold text-ink">₹1,000</p></div>
          <div><p className="text-ink-soft">Platform commission ({commission}%)</p><p className="font-semibold text-rose-700">− ₹{commission * 10}</p></div>
          <div><p className="text-ink-soft">You receive</p><p className="font-semibold text-sage-700">₹{1000 - commission * 10}</p></div>
        </div>
      </div>

      <div className="mt-5">
        <h3 className="mb-3 font-display text-base font-semibold text-ink">Payout history</h3>
        <div className="space-y-2">
          {myPayouts.slice().reverse().map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-dusk-50 bg-white p-4">
              <div>
                <p className="text-sm font-medium text-ink">{currency(p.amount)}</p>
                <p className="text-xs text-ink-soft">Requested {formatDate(p.requestedOn)}{p.paidOn ? ` · Paid ${formatDate(p.paidOn)}` : ''}</p>
              </div>
              <Badge tone={meta(p.status).tone}>{meta(p.status).label}</Badge>
            </div>
          ))}
          {myPayouts.length === 0 && <p className="py-4 text-center text-sm text-ink-soft">No payout requests yet.</p>}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Request payout">
        <form onSubmit={handleRequest}>
          <Field label="Amount to withdraw" hint={`Available: ${currency(availableBalance)}`}>
            <input required type="number" max={availableBalance} className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
          </Field>
          <p className="mb-4 text-xs text-ink-soft">Transfers to account ending •••• 7734, usually within 2–3 business days.</p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading || !amount}>Submit request</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
