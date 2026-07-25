import { useMemo, useState } from "react";
import { Search, Pencil, Trash2 } from "lucide-react";
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "../../services/userService";
import { PageHeader, Button, Field, inputCls } from "../../components/Common";
import DataTable from "../../components/DataTable";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import { formatDate } from "../../utils/status";

const tabs = [
  { key: "all", label: "All" },
  { key: "user", label: "Clients" },
  { key: "expert", label: "Experts" },
  { key: "admin", label: "Admins" },
];

const emptyForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  password: "",
  alternate_phone: "",
  role: "user",
  bio: "",
  experience_years: "",
  consultation_fee: "",
  country: "",
  timezone: "",
  professional_title: "",
  profession: "",
  whatsapp_number: "",
  city: "",
  state: "",
  education: "",
  certifications: "",
  specialization: "",
  languages: "",
  about: "",
  why_started: "",
  mission: "",
  client_approach: "",
  uniqueness: "",
  profile_completed: false,
  profile_image: "",
  cover_image: "",
  profile_image_file: null,
  cover_image_file: null,
};

export default function Users() {
  const { data: users = [], isLoading } = useGetUsersQuery();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [editTab, setEditTab] = useState("basic");

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    return users
      .filter((u) => {
        if (tab === "all") return true;
        if (tab === "user") return u.role === "user" || u.role === "client";
        return u.role === tab;
      })
      .filter((u) => {
        if (!s) return true;
        const nameMatch = (u.name || "").toLowerCase().includes(s);
        const emailMatch = (u.email || "").toLowerCase().includes(s);
        const phoneMatch = (u.phone || u.alternate_phone || "").includes(s);
        const cityMatch = (u.city || "").toLowerCase().includes(s);
        const professionMatch = (u.profession || "").toLowerCase().includes(s);
        return (
          nameMatch || emailMatch || phoneMatch || cityMatch || professionMatch
        );
      });
  }, [users, tab, search]);

  const openEdit = (e, user) => {
    e.stopPropagation();
    setEditingUser(user);
    setForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "", // do not pre-fill passwords
      alternate_phone: user.alternate_phone || "",
      role: user.role || "user",
      bio: user.bio || "",
      experience_years: user.experience_years ?? "",
      consultation_fee: user.consultation_fee ?? "",
      country: user.country || "",
      timezone: user.timezone || "",
      professional_title: user.professional_title || "",
      profession: user.profession || "",
      whatsapp_number: user.whatsapp_number || "",
      city: user.city || "",
      state: user.state || "",
      education: user.education || "",
      certifications: Array.isArray(user.certifications)
        ? user.certifications.join(", ")
        : user.certifications || "",
      specialization: user.specialization || "",
      languages: Array.isArray(user.languages)
        ? user.languages.join(", ")
        : user.languages || "",
      about: user.about || "",
      why_started: user.why_started || "",
      mission: user.mission || "",
      client_approach: user.client_approach || "",
      uniqueness: user.uniqueness || "",
      profile_completed: !!user.profile_completed,
      profile_image: user.profile_image || "",
      cover_image: user.cover_image || "",
      profile_image_file: null,
      cover_image_file: null,
    });
    setEditTab("basic");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("first_name", form.first_name);
    formData.append("last_name", form.last_name || "");
    formData.append("email", form.email);
    formData.append("phone", form.phone);
    formData.append("alternate_phone", form.alternate_phone || "");
    formData.append("role", form.role);
    formData.append("bio", form.bio || "");
    formData.append(
      "experience_years",
      form.experience_years ? String(Number(form.experience_years)) : "",
    );
    formData.append(
      "consultation_fee",
      form.consultation_fee !== undefined && form.consultation_fee !== ""
        ? String(Number(form.consultation_fee))
        : "",
    );
    formData.append("country", form.country || "");
    formData.append("timezone", form.timezone || "");
    formData.append("professional_title", form.professional_title || "");
    formData.append("profession", form.profession || "");
    formData.append("whatsapp_number", form.whatsapp_number || "");
    formData.append("city", form.city || "");
    formData.append("state", form.state || "");
    formData.append("education", form.education || "");
    formData.append("specialization", form.specialization || "");
    formData.append("about", form.about || "");
    formData.append("why_started", form.why_started || "");
    formData.append("mission", form.mission || "");
    formData.append("client_approach", form.client_approach || "");
    formData.append("uniqueness", form.uniqueness || "");
    formData.append(
      "profile_completed",
      form.profile_completed ? "true" : "false",
    );

    if (form.password) {
      formData.append("password", form.password);
    }

    const langs = form.languages
      ? form.languages
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    formData.append("languages", JSON.stringify(langs));

    const certs = form.certifications
      ? form.certifications
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    formData.append("certifications", JSON.stringify(certs));

    if (form.profile_image_file) {
      formData.append("profile_image", form.profile_image_file);
    } else if (form.profile_image && !form.profile_image.startsWith("data:")) {
      formData.append("profile_image", form.profile_image);
    }

    if (form.cover_image_file) {
      formData.append("cover_image", form.cover_image_file);
    } else if (form.cover_image && !form.cover_image.startsWith("data:")) {
      formData.append("cover_image", form.cover_image);
    }

    if (editingUser) {
      await updateUser({
        id: editingUser.id,
        formData,
      });
      setEditingUser(null);
    }
  };

  const handleDelete = async (id) => {
    await deleteUser(id);
    setDeleteConfirmId(null);
  };

  const getRoleTone = (role) => {
    if (role === "admin") return "info";
    if (role === "expert") return "pending";
    return "approved";
  };

  const columns = [
    {
      key: "name",
      header: "User",
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <img
            src={r.avatar}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
          />
          <div>
            <p className="font-medium text-ink">{r.name}</p>
            <p className="text-xs text-ink-soft">{r.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (r) => (
        <Badge tone={getRoleTone(r.role)}>{r.role?.toUpperCase()}</Badge>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (r) => (
        <div>
          <p className="text-sm text-ink">{r.phone || "—"}</p>
          {r.alternate_phone && (
            <p className="text-xs text-ink-soft">Alt: {r.alternate_phone}</p>
          )}
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (r) => (
        <span className="text-ink-soft">
          {[r.city, r.state, r.country].filter(Boolean).join(", ") || "—"}
        </span>
      ),
    },
    {
      key: "profile_completed",
      header: "Profile Completed",
      render: (r) => (
        <Badge tone={r.profile_completed ? "approved" : "neutral"}>
          {r.profile_completed ? "Completed" : "Incomplete"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Joined Date",
      render: (r) => formatDate(r.created_at),
    },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => openEdit(e, r)}
            className="rounded-lg p-1.5 text-ink-soft hover:bg-dusk-50 hover:text-ink"
            title="Edit User"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteConfirmId(r.id);
            }}
            className="rounded-lg p-1.5 text-ink-soft hover:bg-rose-100 hover:text-rose-700"
            title="Delete User"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Manage user accounts, roles, access levels, and profile information."
      />

      {/* Stats row */}
      {/* <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-dusk-50 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Total Users
          </p>
          <p className="mt-2 text-3xl font-bold text-ink">
            {isLoading ? "..." : users.length}
          </p>
        </div>
        <div className="rounded-2xl border border-dusk-50 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Clients / Users
          </p>
          <p className="mt-2 text-3xl font-bold text-ink">
            {isLoading
              ? "..."
              : users.filter((u) => u.role === "user" || u.role === "client")
                  .length}
          </p>
        </div>
        <div className="rounded-2xl border border-dusk-50 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Experts
          </p>
          <p className="mt-2 text-3xl font-bold text-ink">
            {isLoading
              ? "..."
              : users.filter((u) => u.role === "expert").length}
          </p>
        </div>
        <div className="rounded-2xl border border-dusk-50 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Admins
          </p>
          <p className="mt-2 text-3xl font-bold text-ink">
            {isLoading ? "..." : users.filter((u) => u.role === "admin").length}
          </p>
        </div>
      </div> */}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {/* <div className="flex gap-1 rounded-xl bg-canvas-alt p-1">
          {tabs.map((t) => {
            const count =
              t.key === "all"
                ? users.length
                : t.key === "user"
                  ? users.filter(
                      (u) => u.role === "user" || u.role === "client",
                    ).length
                  : users.filter((u) => u.role === t.key).length;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  tab === t.key
                    ? "bg-white text-ink shadow-sm"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {t.label}{" "}
                <span className="text-xs text-ink-soft">({count})</span>
              </button>
            );
          })}
        </div> */}
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
          />
          <input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputCls} w-64 pl-8`}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        emptyMessage="No users match this view."
      />

      {/* Edit User Modal */}
      <Modal
        open={!!editingUser}
        onClose={() => {
          setEditingUser(null);
        }}
        title="Edit User Profile"
        width="max-w-2xl"
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex border-b border-dusk-100">
            {[
              { key: "basic", label: "Basic" },
              { key: "professional", label: "Professional" },
              { key: "philosophy", label: "Philosophy" },
              { key: "location", label: "Location" },
              { key: "media", label: "Media" },
            ].map((t) => (
              <button
                type="button"
                key={t.key}
                onClick={() => setEditTab(t.key)}
                className={`border-b-2 px-3 py-2 text-xs font-semibold transition-colors ${
                  editTab === t.key
                    ? "border-dusk-700 text-dusk-700 bg-dusk-50/50"
                    : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="max-h-[60vh] overflow-y-auto px-1 py-2">
            {editTab === "basic" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First Name">
                    <input
                      required
                      className={inputCls}
                      value={form.first_name}
                      onChange={(e) =>
                        setForm({ ...form, first_name: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Last Name">
                    <input
                      className={inputCls}
                      value={form.last_name}
                      onChange={(e) =>
                        setForm({ ...form, last_name: e.target.value })
                      }
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Email">
                    <input
                      type="email"
                      required
                      className={inputCls}
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Phone">
                    <input
                      required
                      className={inputCls}
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Alternate Phone">
                    <input
                      className={inputCls}
                      value={form.alternate_phone}
                      onChange={(e) =>
                        setForm({ ...form, alternate_phone: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Role">
                    <select
                      className={inputCls}
                      value={form.role}
                      onChange={(e) =>
                        setForm({ ...form, role: e.target.value })
                      }
                    >
                      <option value="user">User / Client</option>
                      <option value="expert">Expert</option>
                      <option value="admin">Admin</option>
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="New Password (Optional)">
                    <input
                      type="password"
                      className={inputCls}
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      placeholder="******"
                    />
                  </Field>
                  <label className="flex items-center gap-2.5 pt-7">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-dusk-300 text-dusk-700 focus:ring-dusk-500"
                      checked={form.profile_completed}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          profile_completed: e.target.checked,
                        })
                      }
                    />
                    <span className="text-sm font-medium text-ink">
                      Profile Completed
                    </span>
                  </label>
                </div>
              </div>
            )}

            {editTab === "professional" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Professional Title">
                    <input
                      className={inputCls}
                      value={form.professional_title}
                      onChange={(e) =>
                        setForm({ ...form, professional_title: e.target.value })
                      }
                      placeholder="e.g. Master Yogi"
                    />
                  </Field>
                  <Field label="Profession">
                    <input
                      className={inputCls}
                      value={form.profession}
                      onChange={(e) =>
                        setForm({ ...form, profession: e.target.value })
                      }
                      placeholder="e.g. Yoga Instructor"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Experience (Years)">
                    <input
                      type="number"
                      className={inputCls}
                      value={form.experience_years}
                      onChange={(e) =>
                        setForm({ ...form, experience_years: e.target.value })
                      }
                      placeholder="e.g. 5"
                    />
                  </Field>
                  <Field label="Consultation Fee (₹)">
                    <input
                      type="number"
                      className={inputCls}
                      value={form.consultation_fee}
                      onChange={(e) =>
                        setForm({ ...form, consultation_fee: e.target.value })
                      }
                      placeholder="e.g. 500"
                    />
                  </Field>
                  <Field label="Specialization">
                    <input
                      className={inputCls}
                      value={form.specialization}
                      onChange={(e) =>
                        setForm({ ...form, specialization: e.target.value })
                      }
                      placeholder="e.g. Vinyasa, Meditation"
                    />
                  </Field>
                </div>
                <Field label="Education">
                  <input
                    className={inputCls}
                    value={form.education}
                    onChange={(e) =>
                      setForm({ ...form, education: e.target.value })
                    }
                    placeholder="e.g. Masters in Psychology"
                  />
                </Field>
                <Field label="Languages (comma separated)">
                  <input
                    className={inputCls}
                    value={form.languages}
                    onChange={(e) =>
                      setForm({ ...form, languages: e.target.value })
                    }
                    placeholder="e.g. English, Hindi, Spanish"
                  />
                </Field>
                <Field label="Certifications (comma separated)">
                  <textarea
                    rows={2}
                    className={inputCls}
                    value={form.certifications}
                    onChange={(e) =>
                      setForm({ ...form, certifications: e.target.value })
                    }
                    placeholder="e.g. Yoga Alliance RYT-200, Certified Health Coach"
                  />
                </Field>
              </div>
            )}

            {editTab === "philosophy" && (
              <div className="space-y-3">
                <Field label="Bio (Short Summary)">
                  <textarea
                    rows={2}
                    className={inputCls}
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Short bio summary..."
                  />
                </Field>
                <Field label="About Me (Full Story)">
                  <textarea
                    rows={3}
                    className={inputCls}
                    value={form.about}
                    onChange={(e) =>
                      setForm({ ...form, about: e.target.value })
                    }
                    placeholder="Full biography details..."
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Why Started">
                    <textarea
                      rows={3}
                      className={inputCls}
                      value={form.why_started}
                      onChange={(e) =>
                        setForm({ ...form, why_started: e.target.value })
                      }
                      placeholder="What motivated starting..."
                    />
                  </Field>
                  <Field label="Mission">
                    <textarea
                      rows={3}
                      className={inputCls}
                      value={form.mission}
                      onChange={(e) =>
                        setForm({ ...form, mission: e.target.value })
                      }
                      placeholder="Your core mission statement..."
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Client Approach">
                    <textarea
                      rows={3}
                      className={inputCls}
                      value={form.client_approach}
                      onChange={(e) =>
                        setForm({ ...form, client_approach: e.target.value })
                      }
                      placeholder="How clients are supported..."
                    />
                  </Field>
                  <Field label="Uniqueness">
                    <textarea
                      rows={3}
                      className={inputCls}
                      value={form.uniqueness}
                      onChange={(e) =>
                        setForm({ ...form, uniqueness: e.target.value })
                      }
                      placeholder="What makes your sessions unique..."
                    />
                  </Field>
                </div>
              </div>
            )}

            {editTab === "location" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Country">
                    <input
                      className={inputCls}
                      value={form.country}
                      onChange={(e) =>
                        setForm({ ...form, country: e.target.value })
                      }
                      placeholder="e.g. India"
                    />
                  </Field>
                  <Field label="Timezone">
                    <input
                      className={inputCls}
                      value={form.timezone}
                      onChange={(e) =>
                        setForm({ ...form, timezone: e.target.value })
                      }
                      placeholder="e.g. Asia/Kolkata"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="City">
                    <input
                      className={inputCls}
                      value={form.city}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                      placeholder="e.g. Mumbai"
                    />
                  </Field>
                  <Field label="State">
                    <input
                      className={inputCls}
                      value={form.state}
                      onChange={(e) =>
                        setForm({ ...form, state: e.target.value })
                      }
                      placeholder="e.g. Maharashtra"
                    />
                  </Field>
                  <Field label="WhatsApp Number">
                    <input
                      className={inputCls}
                      value={form.whatsapp_number}
                      onChange={(e) =>
                        setForm({ ...form, whatsapp_number: e.target.value })
                      }
                      placeholder="e.g. +91..."
                    />
                  </Field>
                </div>
              </div>
            )}

            {editTab === "media" && (
              <div className="space-y-4">
                <div>
                  <span className="mb-1.5 block text-sm font-medium text-ink font-sans">
                    Profile Image (Avatar)
                  </span>
                  {form.profile_image && (
                    <img
                      src={form.profile_image}
                      alt="Avatar Preview"
                      className="mb-2 h-20 w-20 rounded-2xl border border-dusk-100 object-cover"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className={inputCls}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () =>
                          setForm((prev) => ({
                            ...prev,
                            profile_image: reader.result,
                            profile_image_file: file,
                          }));
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <Field label="Or paste Image URL" className="mt-2">
                    <input
                      className={inputCls}
                      value={form.profile_image}
                      onChange={(e) =>
                        setForm({ ...form, profile_image: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </Field>
                </div>
                <div className="border-t border-dusk-50 pt-3">
                  <span className="mb-1.5 block text-sm font-medium text-ink font-sans">
                    Cover Image
                  </span>
                  {form.cover_image && (
                    <img
                      src={form.cover_image}
                      alt="Cover Preview"
                      className="mb-2 h-24 w-full rounded-xl border border-dusk-100 object-cover"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className={inputCls}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () =>
                          setForm((prev) => ({
                            ...prev,
                            cover_image: reader.result,
                            cover_image_file: file,
                          }));
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <Field label="Or paste Cover URL" className="mt-2">
                    <input
                      className={inputCls}
                      value={form.cover_image}
                      onChange={(e) =>
                        setForm({ ...form, cover_image: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </Field>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-dusk-50 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditingUser(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete User"
      >
        <p className="text-sm text-ink-soft">
          Are you sure you want to delete this user? This action cannot be
          undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={isDeleting}
            onClick={() => handleDelete(deleteConfirmId)}
          >
            {isDeleting ? "Deleting..." : "Delete User"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
