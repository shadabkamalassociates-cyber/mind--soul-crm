import { CheckCircle2, Wallet } from 'lucide-react'
import { useGetPayoutsQuery, useUpdatePayoutStatusMutation } from '../../services/payoutService'
import { useGetExpertsQuery } from '../../services/expertService'
import { PageHeader, Button, EmptyState } from '../../components/Common'
import DataTable from '../../components/DataTable'
import Badge from '../../components/Badge'
import { meta, currency, formatDate } from '../../utils/status'

export default function Payouts() {
  const { data: payouts = [], isLoading } = useGetPayoutsQuery()
  const { data: experts = [] } = useGetExpertsQuery()
  const [updateStatus] = useUpdatePayoutStatusMutation()
  const expertById = Object.fromEntries(experts.map((e) => [e.id, e]))

  const pending = payouts.filter((p) => p.status === 'pending')
  const totalPending = pending.reduce((s, p) => s + p.amount, 0)

  const columns = [
    {
      key: 'expert', header: 'Expert', render: (r) => (
        <div className="flex items-center gap-2.5">
          <img src={expertById[r.expertId]?.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
          <span className="font-medium text-ink">{expertById[r.expertId]?.name}</span>
        </div>
      ),
    },
    { key: 'amount', header: 'Amount', render: (r) => <span className="font-semibold">{currency(r.amount)}</span> },
    { key: 'account', header: 'Account', render: (r) => `••••${r.accountLast4}` },
    { key: 'requestedOn', header: 'Requested', render: (r) => formatDate(r.requestedOn) },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={meta(r.status).tone}>{meta(r.status).label}</Badge> },
    {
      key: 'actions', header: '', render: (r) => r.status === 'pending' && (
        <Button variant="success" className="!px-2.5 !py-1 text-xs" onClick={() => updateStatus({ id: r.id })}><CheckCircle2 size={13} /> Approve & Pay</Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Payouts"
        subtitle={`${pending.length} requests awaiting approval · ${currency(totalPending)} pending`}
      />
      {!isLoading && payouts.length === 0 ? (
        <EmptyState icon={Wallet} title="No payout requests yet" />
      ) : (
        <DataTable columns={columns} data={payouts.slice().reverse()} isLoading={isLoading} />
      )}
    </div>
  )
}
