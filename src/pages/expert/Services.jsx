import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  Plus,
  Pencil,
  Send,
  Video,
  ExternalLink,
  BadgeCheck,
  Film,
  UploadCloud,
  X,
} from "lucide-react";
import {
  useGetServicesQuery,
  useAddServiceMutation,
  useUpdateServiceMutation,
  useUpdateServiceStatusMutation,
} from "../../services/serviceService";
import { useGetCategoriesQuery } from "../../services/categoryService";
import {
  PageHeader,
  Button,
  Field,
  inputCls,
  EmptyState,
} from "../../components/Common";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import Badge from "../../components/Badge";
import StatusStepper from "../../components/StatusStepper";
import { meta, currency, formatDate } from "../../utils/status";

const typeOptions = [
  { value: "live_session", label: "Live Session (Google Meet)" },
  { value: "1_1_consultation", label: "1:1 Consultation" },
  { value: "workshop", label: "Workshop" },
  { value: "course", label: "Recorded Course" },
  { value: "membership", label: "Membership" },
];

const steps = [
  { key: "draft", label: "Draft" },
  { key: "pending_review", label: "Submitted" },
  { key: "approved", label: "Approved" },
  { key: "live", label: "Live" },
];

const emptyForm = {
  title: "",
  type: "live_session",
  category: "",
  price: "",
  duration: "",
  maxSeats: "",
  description: "",
  hasLiveComponent: true,
  scheduledAt: "",
  meetLink: "",
  videoUrl: "",
  videoStatus: "not_submitted",
  videoFileName: "",
};

export default function Services() {
  const user = useSelector((s) => s.auth.user);
  const { data: services = [], isLoading } = useGetServicesQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const [addService] = useAddServiceMutation();
  const [updateService] = useUpdateServiceMutation();
  const [updateStatus] = useUpdateServiceStatusMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const fileInputRef = useRef(null);

  const mine = services.filter((s) => s.expertId === user.id);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };
  const openEdit = (svc) => {
    setEditing(svc);
    setForm({
      title: svc.title,
      type: svc.type,
      category: svc.category,
      price: svc.price,
      duration: svc.duration || "",
      maxSeats: svc.maxSeats || "",
      description: svc.description,
      hasLiveComponent: !!svc.hasLiveComponent,
      scheduledAt: svc.scheduledAt ? svc.scheduledAt.slice(0, 16) : "",
      meetLink: svc.meetLink || "",
      videoUrl: svc.videoUrl || "",
      videoStatus: svc.videoStatus || "not_submitted",
      videoFileName: "",
    });
    setModalOpen(true);
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    // Selecting a new file always resets review to pending — admin must review the new recording.
    setForm({
      ...form,
      videoUrl: objectUrl,
      videoFileName: file.name,
      videoStatus: "pending_review",
    });
  };

  const removeVideo = () =>
    setForm({
      ...form,
      videoUrl: "",
      videoFileName: "",
      videoStatus: "not_submitted",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const videoChanged = editing
      ? form.videoUrl !== (editing.videoUrl || "")
      : !!form.videoUrl;
    const payload = {
      title: form.title,
      type: form.type,
      category: form.category,
      price: Number(form.price),
      duration: form.duration ? Number(form.duration) : null,
      maxSeats: form.maxSeats ? Number(form.maxSeats) : null,
      description: form.description,
      hasLiveComponent: form.hasLiveComponent,
      scheduledAt:
        form.hasLiveComponent && form.scheduledAt
          ? new Date(form.scheduledAt).toISOString()
          : null,
      meetLink: form.hasLiveComponent ? form.meetLink : "",
      videoUrl: form.videoUrl,
      videoStatus: form.videoUrl
        ? videoChanged
          ? "pending_review"
          : form.videoStatus
        : "not_submitted",
      videoReviewNote: videoChanged ? null : undefined,
    };
    if (editing) await updateService({ id: editing.id, ...payload });
    else await addService({ expertId: user.id, ...payload });
    setModalOpen(false);
  };

  const submitForReview = (svc) =>
    updateStatus({ id: svc.id, status: "pending_review" });

  const columns = [
    {
      key: "title",
      header: "Service",
      render: (r) => (
        <div className="flex items-center gap-2">
          {r.hasLiveComponent && (
            <Video size={14} className="shrink-0 text-marigold-500" />
          )}
          {r.videoUrl && <Film size={14} className="shrink-0 text-dusk-500" />}
          <span className="max-w-xs truncate font-medium text-ink">
            {r.title}
          </span>
        </div>
      ),
    },
    { key: "price", header: "Price", render: (r) => currency(r.price) },
    { key: "bookings", header: "Bookings" },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge tone={meta(r.status).tone}>{meta(r.status).label}</Badge>
      ),
    },
    {
      key: "video",
      header: "Video",
      render: (r) =>
        r.videoUrl ? (
          <Badge tone={meta(r.videoStatus).tone}>
            {meta(r.videoStatus).label}
          </Badge>
        ) : (
          <span className="text-xs text-ink-soft">—</span>
        ),
    },
    {
      key: "createdOn",
      header: "Updated",
      render: (r) => formatDate(r.createdOn),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex items-center gap-1">
          {(r.status === "draft" || r.status === "needs_changes") && (
            <Button
              variant="ghost"
              className="!px-2 !py-1 text-xs"
              onClick={() => openEdit(r)}
            >
              <Pencil size={13} /> Edit
            </Button>
          )}
          {r.status === "draft" && (
            <Button
              variant="accent"
              className="!px-2 !py-1 text-xs"
              onClick={() => submitForReview(r)}
            >
              <Send size={13} /> Submit
            </Button>
          )}
          {(r.status === "approved" ||
            r.status === "live" ||
            r.status === "pending_review" ||
            r.status === "rejected") && (
            <Button
              variant="ghost"
              className="!px-2 !py-1 text-xs"
              onClick={() => setDetailOpen(r)}
            >
              View
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="My Sessions"
        subtitle="Recorded sessions, courses, workshops, and consultations you offer."
        action={
          <Button onClick={openAdd}>
            <Plus size={16} /> New Session
          </Button>
        }
      />

      {!isLoading && mine.length === 0 ? (
        <EmptyState
          icon={BadgeCheck}
          title="No sessions yet"
          message="Post your first session — save as draft, then submit it for admin approval."
        />
      ) : (
        <DataTable columns={columns} data={mine} isLoading={isLoading} />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit session" : "New session"}
        width="max-w-2xl"
      >
        <form onSubmit={handleSubmit}>
          <Field label="Title">
            <input
              required
              className={inputCls}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Reiki Healing for Deep Relaxation"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <select
                className={inputCls}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {typeOptions.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Category">
              <select
                required
                className={inputCls}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Price (₹)">
              <input
                required
                type="number"
                className={inputCls}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </Field>
            <Field label="Duration (min)">
              <input
                type="number"
                className={inputCls}
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              />
            </Field>
            <Field label="Max seats">
              <input
                type="number"
                className={inputCls}
                value={form.maxSeats}
                onChange={(e) => setForm({ ...form, maxSeats: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Description">
            <textarea
              required
              rows={3}
              className={inputCls}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </Field>

          <div className="mb-4 rounded-xl border border-dusk-100 bg-canvas-alt/50 p-4">
            <p className="mb-3 text-sm font-medium text-ink">Recorded video</p>
            {form.videoUrl ? (
              <div>
                <video
                  src={form.videoUrl}
                  controls
                  className="w-full max-h-56 rounded-lg bg-black"
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-ink-soft">
                    <Film size={13} />{" "}
                    {form.videoFileName || "Uploaded recording"}
                  </span>
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="flex items-center gap-1 text-xs font-medium text-rose-700 hover:underline"
                  >
                    <X size={12} /> Remove
                  </button>
                </div>
                {form.videoStatus === "pending_review" && (
                  <p className="mt-1.5 text-xs text-marigold-700">
                    This recording is awaiting admin review before it can go
                    live.
                  </p>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-dusk-100 py-6 text-ink-soft hover:border-dusk-300 hover:text-ink"
              >
                <UploadCloud size={20} />
                <span className="text-sm font-medium">
                  Upload a recorded video
                </span>
                <span className="text-xs">
                  MP4, MOV — admin reviews it before it goes live
                </span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoSelect}
            />
          </div>

          <label className="mb-4 flex items-center gap-2.5 rounded-xl border border-dusk-100 bg-canvas-alt/50 p-4">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-dusk-300 text-dusk-700 focus:ring-dusk-500"
              checked={form.hasLiveComponent}
              onChange={(e) =>
                setForm({ ...form, hasLiveComponent: e.target.checked })
              }
            />
            <span className="text-sm font-medium text-ink">
              This session also includes a live component
            </span>
          </label>

          {form.hasLiveComponent && (
            <div className="rounded-xl border border-dusk-100 bg-canvas-alt/50 p-4">
              <p className="mb-3 text-sm font-medium text-ink">
                Live session details
              </p>
              <Field label="Scheduled date & time">
                <input
                  type="datetime-local"
                  className={inputCls}
                  value={form.scheduledAt}
                  onChange={(e) =>
                    setForm({ ...form, scheduledAt: e.target.value })
                  }
                />
              </Field>
              <Field
                label="Google Meet link"
                hint="Create a meeting at meet.google.com/new, then paste the link here."
              >
                <div className="flex gap-2">
                  <input
                    className={inputCls}
                    value={form.meetLink}
                    onChange={(e) =>
                      setForm({ ...form, meetLink: e.target.value })
                    }
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      window.open("https://meet.google.com/new", "_blank")
                    }
                  >
                    <Video size={14} /> Create
                  </Button>
                </div>
              </Field>
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editing ? "Save changes" : "Save as draft"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!detailOpen}
        onClose={() => setDetailOpen(null)}
        title={detailOpen?.title || ""}
      >
        {detailOpen && (
          <div>
            <StatusStepper
              steps={steps}
              currentStatus={
                detailOpen.status === "pending_review"
                  ? "pending_review"
                  : detailOpen.status
              }
              rejected={detailOpen.status === "rejected"}
              reviewNote={detailOpen.reviewNote}
            />
            <p className="mt-5 text-sm text-ink">{detailOpen.description}</p>

            {detailOpen.videoUrl && (
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-ink">
                    Recorded video
                  </span>
                  <Badge tone={meta(detailOpen.videoStatus).tone}>
                    {meta(detailOpen.videoStatus).label}
                  </Badge>
                </div>
                <video
                  src={detailOpen.videoUrl}
                  controls
                  className="w-full max-h-56 rounded-lg bg-black"
                />
                {detailOpen.videoReviewNote && (
                  <p className="mt-2 rounded-lg bg-rose-100 px-3 py-2 text-xs text-rose-700">
                    <span className="font-semibold">Admin note: </span>
                    {detailOpen.videoReviewNote}
                  </p>
                )}
              </div>
            )}

            {detailOpen.hasLiveComponent && detailOpen.meetLink && (
              <a
                href={detailOpen.meetLink}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex w-fit items-center gap-1.5 rounded-lg bg-dusk-50 px-3 py-1.5 text-xs font-medium text-dusk-700 hover:bg-dusk-100"
              >
                <Video size={14} /> {detailOpen.meetLink}{" "}
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
