import { Field, inputCls } from "./Common";

const formTabs = [
  { key: "basic", label: "Basic" },
  { key: "professional", label: "Professional" },
  { key: "philosophy", label: "Philosophy" },
  { key: "location", label: "Location" },
  { key: "media", label: "Media" },
];

export function ExpertFormTabBar({ activeTab, onChange }) {
  return (
    <div className="mb-4 flex border-b border-dusk-100">
      {formTabs.map((t) => (
        <button
          type="button"
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`border-b-2 px-3 py-2 text-xs font-semibold transition-colors ${
            activeTab === t.key
              ? "border-dusk-700 text-dusk-700 bg-dusk-50/50"
              : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export default function ExpertFormFields({
  tab,
  form,
  setForm,
  includePassword = false,
  includeAdminFields = false,
}) {
  if (tab === "basic") {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First Name *">
            <input
              required
              className={inputCls}
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            />
          </Field>
          <Field label="Last Name">
            <input
              className={inputCls}
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Email *">
            <input
              type="email"
              required
              className={inputCls}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label="Phone/Mobile">
            <input
              className={inputCls}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>
        </div>
        {includePassword && (
          <Field label="Password *" hint="Minimum 6 characters recommended">
            <input
              type="password"
              required
              className={inputCls}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </Field>
        )}
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
          <Field label="WhatsApp Number">
            <input
              className={inputCls}
              value={form.whatsapp_number}
              onChange={(e) =>
                setForm({ ...form, whatsapp_number: e.target.value })
              }
            />
          </Field>
        </div>
        {includeAdminFields && (
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2.5 pt-7">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-dusk-300 text-dusk-700 focus:ring-dusk-500"
                checked={form.profile_completed}
                onChange={(e) =>
                  setForm({ ...form, profile_completed: e.target.checked })
                }
              />
              <span className="text-sm font-medium text-ink">
                Profile Completed
              </span>
            </label>
          </div>
        )}
      </div>
    );
  }

  if (tab === "professional") {
    return (
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
              onChange={(e) => setForm({ ...form, profession: e.target.value })}
              placeholder="e.g. Yoga Teacher"
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
              placeholder="e.g. Vinyasa Yoga"
            />
          </Field>
        </div>
        <Field label="Education">
          <input
            className={inputCls}
            value={form.education}
            onChange={(e) => setForm({ ...form, education: e.target.value })}
            placeholder="e.g. B.Sc in Yogic Sciences"
          />
        </Field>
        <Field label="Languages (comma separated)">
          <input
            className={inputCls}
            value={form.languagesArray ?? form.languages ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                languagesArray: e.target.value,
                languages: e.target.value,
              })
            }
            placeholder="e.g. English, Hindi, Spanish"
          />
        </Field>
        <Field label="Certifications">
          <textarea
            rows={2}
            className={inputCls}
            value={form.certificationsValue ?? form.certifications ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                certificationsValue: e.target.value,
                certifications: e.target.value,
              })
            }
            placeholder="e.g. Yoga Alliance RYT-200, Reiki Level II"
          />
        </Field>
      </div>
    );
  }

  if (tab === "philosophy") {
    return (
      <div className="space-y-3">
        <Field label="Bio (Short Summary)">
          <textarea
            rows={2}
            className={inputCls}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Brief summary for list views..."
          />
        </Field>
        <Field label="About Me (Full Story)">
          <textarea
            rows={3}
            className={inputCls}
            value={form.about}
            onChange={(e) => setForm({ ...form, about: e.target.value })}
            placeholder="Detailed biography..."
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
              placeholder="What inspired you to start..."
            />
          </Field>
          <Field label="Mission">
            <textarea
              rows={3}
              className={inputCls}
              value={form.mission}
              onChange={(e) => setForm({ ...form, mission: e.target.value })}
              placeholder="Your professional mission..."
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
              placeholder="How you approach working with clients..."
            />
          </Field>
          <Field label="Uniqueness">
            <textarea
              rows={3}
              className={inputCls}
              value={form.uniqueness}
              onChange={(e) => setForm({ ...form, uniqueness: e.target.value })}
              placeholder="What makes your sessions unique..."
            />
          </Field>
        </div>
      </div>
    );
  }

  if (tab === "location") {
    return (
      <div className="grid grid-cols-2 gap-3">
        <Field label="Country">
          <input
            className={inputCls}
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            placeholder="e.g. India"
          />
        </Field>
        <Field label="Timezone">
          <input
            className={inputCls}
            value={form.timezone}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            placeholder="e.g. Asia/Kolkata"
          />
        </Field>
        <Field label="City">
          <input
            className={inputCls}
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="e.g. Mumbai"
          />
        </Field>
        <Field label="State">
          <input
            className={inputCls}
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            placeholder="e.g. Maharashtra"
          />
        </Field>
      </div>
    );
  }

  if (tab === "media") {
    return (
      <div className="space-y-4">
        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink font-sans">
            Profile Image (Avatar)
          </span>
          {form.profile_image && (
            <img
              src={form.profile_image}
              alt="Profile Preview"
              className="mb-2 h-20 w-20 rounded-2xl object-cover border border-dusk-100"
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
        </div>
        <div className="border-t border-dusk-50 pt-3">
          <span className="mb-1.5 block text-sm font-medium text-ink font-sans">
            Cover Image
          </span>
          {form.cover_image && (
            <img
              src={form.cover_image}
              alt="Cover Preview"
              className="mb-2 h-24 w-full rounded-xl object-cover border border-dusk-100"
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
        </div>
      </div>
    );
  }

  return null;
}

export function buildExpertRegisterFormData(form) {
  const cleanPhone = (form.phone || "").trim().replace(/[^\d]/g, "");
  const formData = new FormData();

  formData.append("first_name", form.first_name);
  formData.append("last_name", form.last_name || "");
  formData.append("email", form.email);
  formData.append("phone", cleanPhone || "");
  formData.append("alternate_phone", form.alternate_phone || "");
  formData.append("password", form.password);
  formData.append("bio", form.bio || "");

  if (form.experience_years !== "" && form.experience_years != null) {
    formData.append("experience_years", String(Number(form.experience_years)));
  }

  if (form.consultation_fee !== "" && form.consultation_fee != null) {
    formData.append("consultation_fee", String(Number(form.consultation_fee)));
  }

  formData.append("country", form.country || "");
  formData.append("timezone", form.timezone || "");
  formData.append("professional_title", form.professional_title || "");
  formData.append("profession", form.profession || "");
  formData.append("whatsapp_number", form.whatsapp_number || "");
  formData.append("city", form.city || "");
  formData.append("state", form.state || "");
  formData.append("education", form.education || "");
  formData.append(
    "certifications",
    (form.certificationsValue ?? form.certifications ?? "").trim(),
  );
  formData.append("specialization", form.specialization || "");
  formData.append("languages", form.languagesArray ?? form.languages ?? "");
  formData.append("about", form.about || "");
  formData.append("why_started", form.why_started || "");
  formData.append("mission", form.mission || "");
  formData.append("client_approach", form.client_approach || "");
  formData.append("uniqueness", form.uniqueness || "");

  if (form.profile_image_file) {
    formData.append("profile_image", form.profile_image_file);
  }
  if (form.cover_image_file) {
    formData.append("cover_image", form.cover_image_file);
  }

  return formData;
}

export function buildExpertUpdateFormData(form) {
  const cleanPhone = (form.phone || "").trim().replace(/[^\d]/g, "");
  const formData = new FormData();

  formData.append("first_name", form.first_name);
  formData.append("last_name", form.last_name || "");
  formData.append("email", form.email);
  formData.append("phone", cleanPhone || "");
  formData.append("alternate_phone", form.alternate_phone || "");
  formData.append("bio", form.bio || "");

  if (form.experience_years !== "" && form.experience_years != null) {
    formData.append("experience_years", String(Number(form.experience_years)));
  } else {
    formData.append("experience_years", "0");
  }

  if (form.consultation_fee !== "" && form.consultation_fee != null) {
    formData.append("consultation_fee", String(Number(form.consultation_fee)));
  } else {
    formData.append("consultation_fee", "0");
  }

  formData.append("country", form.country || "");
  formData.append("timezone", form.timezone || "");
  formData.append("professional_title", form.professional_title || "");
  formData.append("profession", form.profession || "");
  formData.append("whatsapp_number", form.whatsapp_number || "");
  formData.append("city", form.city || "");
  formData.append("state", form.state || "");
  formData.append("education", form.education || "");
  formData.append(
    "certifications",
    (form.certificationsValue ?? form.certifications ?? "").trim(),
  );
  formData.append("specialization", form.specialization || "");
  formData.append("languages", form.languagesArray ?? form.languages ?? "");
  formData.append("about", form.about || "");
  formData.append("why_started", form.why_started || "");
  formData.append("mission", form.mission || "");
  formData.append("client_approach", form.client_approach || "");
  formData.append("uniqueness", form.uniqueness || "");

  formData.append("status", form.verification_status || "PENDING");
  formData.append("verification_status", form.verification_status || "PENDING");
  formData.append(
    "profile_completed",
    form.profile_completed ? "true" : "false",
  );

  if (form.profile_image_file) {
    formData.append("profile_image", form.profile_image_file);
  }
  if (form.cover_image_file) {
    formData.append("cover_image", form.cover_image_file);
  }

  return formData;
}
