import { useState } from 'react'
import { Plus, Trash2, Ticket } from 'lucide-react'
import { useGetCouponsQuery, useAddCouponMutation, useDeleteCouponMutation } from '../../services/couponService'
import { PageHeader, Button, Field, inputCls, EmptyState } from '../../components/Common'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import Badge from '../../components/Badge'
import { meta, formatDate } from '../../utils/status'

const emptyForm = { code: '', type: 'percent', value: '', maxUses: '', expiresOn: '' }

export default function Coupons() {
  const { data: coupons = [], isLoading } = useGetCouponsQuery()
  const [addCoupon] = useAddCouponMutation()
  const [deleteCoupon] = useDeleteCouponMutation()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const handleSubmit = async (e) => {
    e.preventDefault()
    await addCoupon({ ...form, code: form.code.toUpperCase(), value: Number(form.value), maxUses: Number(form.maxUses) })
    setForm(emptyForm)
    setModalOpen(false)
  }

  const columns = [
    { key: 'code', header: 'Code', render: (r) => <span className="font-mono font-medium text-ink">{r.code}</span> },
    { key: 'value', header: 'Discount', render: (r) => (r.type === 'percent' ? `${r.value}%` : `₹${r.value}`) },
    { key: 'usage', header: 'Usage', render: (r) => `${r.used} / ${r.maxUses}` },
    { key: 'expiresOn', header: 'Expires', render: (r) => formatDate(r.expiresOn) },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={meta(r.status).tone}>{meta(r.status).label}</Badge> },
    { key: 'actions', header: '', render: (r) => <button onClick={() => deleteCoupon(r.id)} className="rounded-lg p-1.5 text-ink-soft hover:bg-rose-100 hover:text-rose-700"><Trash2 size={15} /></button> },
  ]

  return (
    <div>
      <PageHeader title="Coupons" subtitle="Discount codes available at checkout." action={<Button onClick={() => setModalOpen(true)}><Plus size={16} /> Add Coupon</Button>} />

      {!isLoading && coupons.length === 0 ? (
        <EmptyState icon={Ticket} title="No coupons yet" />
      ) : (
        <DataTable columns={columns} data={coupons} isLoading={isLoading} />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add coupon">
        <form onSubmit={handleSubmit}>
          <Field label="Coupon code"><input required className={inputCls} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. SOULFIRST" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="percent">Percentage</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </Field>
            <Field label="Value"><input required type="number" className={inputCls} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Max uses"><input required type="number" className={inputCls} value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} /></Field>
            <Field label="Expires on"><input required type="date" className={inputCls} value={form.expiresOn} onChange={(e) => setForm({ ...form, expiresOn: e.target.value })} /></Field>
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Add coupon</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
