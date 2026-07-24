import { Check, X, Clock } from 'lucide-react'

// A visual pipeline of the exact review journey (Draft → Submitted → Approved → Live, or
// Pending → Approved for experts). Branches to a rejected/needs-changes end state when relevant.
export default function StatusStepper({ steps, currentStatus, rejected, rejectedLabel = 'Rejected', reviewNote }) {
  const currentIndex = steps.findIndex((s) => s.key === currentStatus)

  return (
    <div>
      <div className="flex items-center">
        {steps.map((step, i) => {
          const isDone = !rejected && i < currentIndex
          const isCurrent = !rejected && i === currentIndex
          const isFuture = rejected || i > currentIndex

          return (
            <div key={step.key} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold shrink-0
                    ${isDone ? 'border-sage-500 bg-sage-500 text-white' : ''}
                    ${isCurrent ? 'border-marigold-500 bg-marigold-500 text-white' : ''}
                    ${isFuture ? 'border-dusk-100 bg-canvas text-ink-soft' : ''}
                  `}
                >
                  {isDone ? <Check size={15} /> : isCurrent ? <Clock size={15} /> : i + 1}
                </div>
                <span className={`text-xs font-medium whitespace-nowrap ${isCurrent ? 'text-marigold-700' : isDone ? 'text-sage-700' : 'text-ink-soft'}`}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`mx-1 h-0.5 flex-1 rounded ${isDone ? 'bg-sage-500' : 'bg-dusk-100'}`} />
              )}
            </div>
          )
        })}
        {rejected && (
          <div className="flex flex-col items-center gap-1.5 ml-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-rose-500 bg-rose-500 text-white shrink-0">
              <X size={15} />
            </div>
            <span className="text-xs font-medium text-rose-700 whitespace-nowrap">{rejectedLabel}</span>
          </div>
        )}
      </div>
      {reviewNote && (
        <p className="mt-3 rounded-lg bg-rose-100 px-3 py-2 text-xs text-rose-700">
          <span className="font-semibold">Admin note: </span>{reviewNote}
        </p>
      )}
    </div>
  )
}
