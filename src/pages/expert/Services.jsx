import { useState } from "react";
import { useSelector } from "react-redux";
import {
  Plus,
  Pencil,
  Send,
  Video,
  ExternalLink,
  BadgeCheck,
  Film,
  Trash2,
} from "lucide-react";
import {
  useGetSessionsByExpertQuery,
  useCreateLiveSessionMutation,
  useCreateRecordedSessionMutation,
  useUpdateSessionMutation,
  useDeleteSessionsMutation,
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
import { meta, currency, formatDate } from "../../utils/status";

const sessionTypeOptions = [
  { value: "LIVE", label: "Live Session (Google Meet, etc.)" },
  { value: "RECORDED", label: "Recorded Course / Workshop" },
];

const emptyForm = {
  title: "",
  session_type: "LIVE",
  category_id: "",
  price: "",
  description: "",
  thumbnail: "",
  language: "English",
  // Live Specific
  start_time: "",
  end_time: "",
  duration_minutes: "",
  max_participants: "",
  meeting_link: "",
  // Recorded Specific
  video_url: "",
};

export default function Services() {
  const user = useSelector((s) => s.auth.user);
  console.log(user?.id,"lllllllllllllllllll")
  
  // Use the new API endpoints
  const { data: mine = [], isLoading } = useGetSessionsByExpertQuery(user?.id, { skip: !user?.id });
  const { data: categories = [] } = useGetCategoriesQuery();
  
  const [createLive] = useCreateLiveSessionMutation();
  const [createRecorded] = useCreateRecordedSessionMutation();
  const [updateSession] = useUpdateSessionMutation();
  const [deleteSessions] = useDeleteSessionsMutation();
  console.log(mine,"555555555555555")

  const [filterType, setFilterType] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };
  
  const openEdit = (svc) => {
    setEditing(svc);
    
    // Map existing session fields to form
    const isLive = svc.session_type === "LIVE";
    
    setForm({
      title: svc.title || "",
      session_type: svc.session_type || "LIVE",
      category_id: svc.category_id || "",
      price: svc.price !== undefined ? svc.price : "",
      description: svc.description || "",
      thumbnail: svc.thumbnail || "",
      language: svc.language || "English",
      
      start_time: svc.start_time ? new Date(svc.start_time).toISOString().slice(0, 16) : "",
      end_time: svc.end_time ? new Date(svc.end_time).toISOString().slice(0, 16) : "",
      duration_minutes: svc.duration_minutes || "",
      max_participants: svc.max_participants || "",
      meeting_link: svc.meeting_link || "",
      
      video_url: svc.video_url || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isLive = form.session_type === "LIVE";

    const payload = {
      expert_id: user.id,
      category_id: form.category_id,
      title: form.title,
      description: form.description,
      thumbnail: form.thumbnail,
      price: Number(form.price) || 0,
      language: form.language,
      session_type: form.session_type,
      status: isLive ? "UPCOMING" : "COMPLETE",
    };

    if (isLive) {
      payload.start_time = form.start_time ? new Date(form.start_time).toISOString() : null;
      payload.end_time = form.end_time ? new Date(form.end_time).toISOString() : null;
      payload.duration_minutes = form.duration_minutes ? Number(form.duration_minutes) : null;
      payload.max_participants = form.max_participants ? Number(form.max_participants) : null;
      payload.meeting_link = form.meeting_link;
      payload.video_url = "";
    } else {
      payload.video_url = form.video_url;
      // Clear out live fields just to be safe
      payload.meeting_link = "";
      payload.start_time = null;
      payload.end_time = null;
      payload.duration_minutes = null;
      payload.max_participants = null;
    }

    try {
      if (editing) {
        await updateSession({ id: editing.id, ...payload }).unwrap();
      } else {
        if (isLive) {
          await createLive(payload).unwrap();
        } else {
          await createRecorded(payload).unwrap();
        }
      }
      setModalOpen(false);
    } catch (err) {
      alert(err?.data?.message || "Failed to save session. Please check your inputs.");
    }
  };
  
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this session?")) {
      try {
        await deleteSessions([id]).unwrap();
      } catch (err) {
        alert(err?.data?.message || "Failed to delete session.");
      }
    }
  }

  const filteredSessions = mine.filter((s) => {
    if (filterType === "ALL") return true;
    return s.session_type === filterType;
  });

  const columns = [
    {
      key: "title",
      header: "Session",
      render: (r) => (
        <div className="flex items-center gap-3">
          {r.thumbnail ? (
            <img src={r.thumbnail} alt={r.title} className="w-10 h-10 object-cover rounded-md border border-dusk-100" />
          ) : (
            <div className="w-10 h-10 bg-canvas-alt flex items-center justify-center rounded-md border border-dusk-100">
              {r.session_type === 'LIVE' ? <Video size={16} className="text-marigold-500" /> : <Film size={16} className="text-dusk-500" />}
            </div>
          )}
          <span className="max-w-[200px] truncate font-medium text-ink">
            {r.title}
          </span>
        </div>
      ),
    },
    { 
      key: "type", 
      header: "Type", 
      render: (r) => (
        <Badge tone={r.session_type === 'LIVE' ? 'warning' : 'info'}>
          {r.session_type === 'LIVE' ? 'Live' : 'Recorded'}
        </Badge>
      )
    },
    { key: "price", header: "Price", render: (r) => currency(r.price) },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge tone={meta(r.status).tone}>{r.status}</Badge>
      ),
    },
    {
      key: "createdOn",
      header: "Created",
      render: (r) => formatDate(r.created_at || r.createdOn),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost"
            className="!px-2 !py-1 text-xs"
            onClick={() => setDetailOpen(r)}
          >
            View
          </Button>
          <Button
            variant="ghost"
            className="!px-2 !py-1 text-xs"
            onClick={() => openEdit(r)}
          >
            <Pencil size={13} /> Edit
          </Button>
          <Button
            variant="ghost"
            className="!px-2 !py-1 text-xs !text-rose-600 hover:!bg-rose-50"
            onClick={() => handleDelete(r.id)}
          >
            <Trash2 size={13} /> Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="My Sessions"
        subtitle="Manage your Live Consultations and Recorded Courses."
        action={
          <div className="flex items-center gap-4">
            <div className="flex bg-canvas-alt rounded-lg p-1 border border-dusk-100">
              {['ALL', 'LIVE', 'RECORDED'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    filterType === type 
                      ? 'bg-white text-ink shadow-sm' 
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  {type === 'ALL' ? 'All' : type === 'LIVE' ? 'Live' : 'Recorded'}
                </button>
              ))}
            </div>
            <Button onClick={openAdd}>
              <Plus size={16} /> New Session
            </Button>
          </div>
        }
      />

      {!isLoading && filteredSessions.length === 0 ? (
        <EmptyState
          icon={BadgeCheck}
          title={filterType === "ALL" ? "No sessions yet" : `No ${filterType.toLowerCase()} sessions`}
          message={filterType === "ALL" ? "Create your first Live Session or Recorded Course." : `You don't have any ${filterType.toLowerCase()} sessions yet.`}
          action={
            <Button onClick={openAdd}>
              <Plus size={16} /> Create Session
            </Button>
          }
        />
      ) : (
        <DataTable columns={columns} data={filteredSessions} isLoading={isLoading} />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit session" : "New session"}
        width="max-w-2xl"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Title">
              <input
                required
                className={inputCls}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Reiki Healing for Deep Relaxation"
              />
            </Field>
            <Field label="Thumbnail">
              <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-dusk-200 bg-canvas hover:bg-dusk-50/50 overflow-hidden transition-all">
                {thumbnailPreview ? (
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center p-3">
                    <ImageIcon size={22} className="mx-auto text-ink-soft mb-1" />
                    <span className="mt-1 block text-xs text-ink font-medium">
                      Upload Thumbnail
                    </span>
                    <span className="block text-[10px] text-ink-soft mt-0.5">
                      JPG, PNG or WEBP
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Session Type">
              <select
                className={inputCls}
                value={form.session_type}
                onChange={(e) => setForm({ ...form, session_type: e.target.value })}
                disabled={!!editing} // Often shouldn't change type after creation
              >
                {sessionTypeOptions.map((t) => (
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
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
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
          
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (₹)">
              <input
                required
                type="number"
                min="0"
                className={inputCls}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </Field>
            <Field label="Language">
              <input
                className={inputCls}
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                placeholder="e.g. English, Hindi"
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

          {form.session_type === "LIVE" && (
            <div className="rounded-xl border border-marigold-100 bg-marigold-50/30 p-4 mb-4">
              <p className="mb-3 text-sm font-medium text-marigold-900 flex items-center gap-2">
                <Video size={16} /> Live Session Details
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start Time">
                  <input
                    type="datetime-local"
                    className={inputCls}
                    required={form.session_type === "LIVE"}
                    value={form.start_time}
                    onChange={(e) =>
                      setForm({ ...form, start_time: e.target.value })
                    }
                  />
                </Field>
                <Field label="End Time">
                  <input
                    type="datetime-local"
                    className={inputCls}
                    required={form.session_type === "LIVE"}
                    value={form.end_time}
                    onChange={(e) =>
                      setForm({ ...form, end_time: e.target.value })
                    }
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Duration (minutes)">
                  <input
                    type="number"
                    min="1"
                    className={inputCls}
                    value={form.duration_minutes}
                    onChange={(e) =>
                      setForm({ ...form, duration_minutes: e.target.value })
                    }
                  />
                </Field>
                <Field label="Max Participants">
                  <input
                    type="number"
                    min="1"
                    className={inputCls}
                    value={form.max_participants}
                    onChange={(e) =>
                      setForm({ ...form, max_participants: e.target.value })
                    }
                  />
                </Field>
              </div>
              <Field
                label="Meeting Link (Google Meet / Zoom)"
                hint="Paste the meeting URL for the participants to join."
              >
                <div className="flex gap-2">
                  <input
                    className={inputCls}
                    required={form.session_type === "LIVE"}
                    value={form.meeting_link}
                    onChange={(e) =>
                      setForm({ ...form, meeting_link: e.target.value })
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
                    Create
                  </Button>
                </div>
              </Field>
            </div>
          )}

          {form.session_type === "RECORDED" && (
            <div className="rounded-xl border border-dusk-100 bg-canvas-alt/50 p-4 mb-4">
              <p className="mb-3 text-sm font-medium text-ink flex items-center gap-2">
                <Film size={16} /> Recorded Video Details
              </p>
              <Field label="Video URL">
                <input
                  required={form.session_type === "RECORDED"}
                  className={inputCls}
                  value={form.video_url}
                  onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                  placeholder="https://..."
                />
              </Field>
              {form.video_url && (
                <div className="mt-3">
                  <p className="text-xs text-ink-soft mb-1">Preview:</p>
                  <video 
                    src={form.video_url} 
                    controls 
                    className="w-full max-h-48 rounded-lg bg-black object-contain"
                  />
                </div>
              )}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editing ? "Save changes" : "Create Session"}
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
            <div className="flex gap-4 items-start mb-4">
              {detailOpen.thumbnail && (
                <img src={detailOpen.thumbnail} alt="" className="w-32 h-24 object-cover rounded-xl border border-dusk-100" />
              )}
              <div>
                <div className="flex gap-2 items-center mb-1">
                  <Badge tone={detailOpen.session_type === 'LIVE' ? 'warning' : 'info'}>
                    {detailOpen.session_type}
                  </Badge>
                  <Badge tone={meta(detailOpen.status).tone}>{detailOpen.status}</Badge>
                </div>
                <p className="text-xl font-bold text-ink">{detailOpen.title}</p>
                <p className="text-sm font-medium text-ink-soft mt-1">
                  {currency(detailOpen.price)} · {detailOpen.language}
                </p>
              </div>
            </div>

            <p className="mt-2 mb-5 text-sm text-ink whitespace-pre-wrap">{detailOpen.description}</p>

            {detailOpen.session_type === "RECORDED" && detailOpen.video_url && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-ink">Recorded Video</p>
                <video
                  src={detailOpen.video_url}
                  controls
                  className="w-full max-h-56 rounded-lg bg-black object-contain"
                />
              </div>
            )}

            {detailOpen.session_type === "LIVE" && (
              <div className="mt-4 grid grid-cols-2 gap-4 bg-canvas-alt p-4 rounded-xl border border-dusk-50">
                <div>
                  <p className="text-xs text-ink-soft mb-0.5">Start Time</p>
                  <p className="text-sm font-semibold">{formatDate(detailOpen.start_time)}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-soft mb-0.5">End Time</p>
                  <p className="text-sm font-semibold">{formatDate(detailOpen.end_time)}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-soft mb-0.5">Duration</p>
                  <p className="text-sm font-semibold">{detailOpen.duration_minutes ? `${detailOpen.duration_minutes} min` : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-soft mb-0.5">Max Participants</p>
                  <p className="text-sm font-semibold">{detailOpen.max_participants || '-'}</p>
                </div>
                {detailOpen.meeting_link && (
                  <div className="col-span-2 mt-2">
                    <p className="text-xs text-ink-soft mb-1">Meeting Link</p>
                    <a
                      href={detailOpen.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex w-fit items-center gap-1.5 rounded-lg bg-dusk-50 px-3 py-2 text-sm font-medium text-dusk-700 hover:bg-dusk-100 transition-colors"
                    >
                      <Video size={16} /> {detailOpen.meeting_link} <ExternalLink size={14} />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
