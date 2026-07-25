import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserRound, Sparkles, CheckCircle2 } from "lucide-react";
import { useExpertSignUpMutation } from "../../services/expertService";
import { Button, Field, inputCls, Spinner } from "../../components/Common";

export default function ExpertSignUp() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [expertSignUp, { isLoading }] = useExpertSignUpMutation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    alternate_phone: "",
    password: "",
    profession: "",
    professional_title: "",
    experience_years: "",
    consultation_fee: "",
    bio: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    setError("");

    // Basic step 1 validation
    if (!form.first_name || !form.email || !form.phone || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (form.phone.trim().replace(/[^\d]/g, "").length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.profession || !form.professional_title || !form.experience_years) {
      setError("Please fill in all professional details.");
      return;
    }

    const cleanPhone = form.phone.trim().replace(/[^\d]/g, "");
    const payload = {
      first_name: form.first_name,
      last_name: form.last_name || "",
      email: form.email,
      phone: cleanPhone,
      alternate_phone: form.alternate_phone || "",
      password: form.password,
      profession: form.profession,
      professional_title: form.professional_title,
      experience_years: Number(form.experience_years),
      consultation_fee: form.consultation_fee ? Number(form.consultation_fee) : 0,
      bio: form.bio || "",
      role: "expert",
    };

    const { data, error: err } = await expertSignUp(payload);

    if (err) {
      const errorMsg =
        typeof err.data === "string"
          ? err.data
          : err.data?.message || "Registration failed. Please check your inputs.";
      setError(errorMsg);
      return;
    }

    if (data) {
      if (data.success === false) {
        setError(data.message || "Registration failed.");
        return;
      }
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dusk-900 px-4 py-10">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-2xl sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-100 text-sage-600">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold text-ink">
            Application Received!
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Thank you for registering as an expert on SoulSensei. Your profile
            has been successfully created and submitted for verification. Our
            administrators will review your credentials and contact you shortly.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Button onClick={() => navigate("/expert/login")} className="w-full">
              Proceed to Expert Log In
            </Button>
            <Link
              to="/login"
              className="text-xs font-semibold text-ink-soft hover:text-ink hover:underline"
            >
              Back to Portal Selection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-dusk-900 px-4 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">
        {/* Left branding card */}
        <div className="relative hidden flex-col justify-between bg-marigold-500 p-9 text-white md:flex">
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />
          <div className="relative flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
              <Sparkles size={18} />
            </div>
            <span className="font-display text-lg font-semibold">SoulSensei</span>
          </div>
          <div className="relative">
            <p className="font-display text-2xl font-medium leading-snug">
              "Share your wisdom, guide seekers, and build your practice."
            </p>
            <p className="mt-3 text-sm text-dusk-100">
              Join a curated community of spiritual mentors, yoga instructors, and
              wellness guides.
            </p>
          </div>
          <p className="relative text-xs text-dusk-100">
            Expert Registration Portal
          </p>
        </div>

        {/* Right form card */}
        <div className="p-8 sm:p-10">
          <Link
            to="/login"
            className="mb-5 inline-block text-xs font-medium text-ink-soft hover:text-ink"
          >
            ← Back to portal selection
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-semibold text-ink">
              Expert Sign Up
            </h1>
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Step {step} of 2
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            Register to offer your consultations and classes.
          </p>

          {step === 1 ? (
            <form onSubmit={handleNext} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name">
                  <input
                    type="text"
                    required
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="John"
                  />
                </Field>
                <Field label="Last Name">
                  <input
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="Doe"
                  />
                </Field>
              </div>

              <Field label="Email Address">
                <input
                  type="email"
                  required
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="john.doe@example.com"
                />
              </Field>

              <Field label="Phone Number">
                <input
                  type="tel"
                  required
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="9876543210"
                />
              </Field>

              <Field label="Password">
                <input
                  type="password"
                  required
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="••••••••"
                />
              </Field>

              {error && <p className="text-sm text-rose-700">{error}</p>}

              <div className="flex items-center justify-between pt-2">
                <Link
                  to="/expert/login"
                  className="text-xs font-medium text-dusk-700 hover:underline"
                >
                  Already registered? Log In
                </Link>
                <Button type="submit">Continue</Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Profession">
                  <input
                    type="text"
                    required
                    name="profession"
                    value={form.profession}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="e.g. Astrologer, Yoga Teacher"
                  />
                </Field>
                <Field label="Professional Title">
                  <input
                    type="text"
                    required
                    name="professional_title"
                    value={form.professional_title}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="e.g. Master Reiki Guide"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Experience (Years)">
                  <input
                    type="number"
                    required
                    name="experience_years"
                    value={form.experience_years}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="e.g. 5"
                  />
                </Field>
                <Field label="Consultation Fee (₹)">
                  <input
                    type="number"
                    name="consultation_fee"
                    value={form.consultation_fee}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="e.g. 500"
                  />
                </Field>
              </div>

              <Field label="Bio / About Me">
                <textarea
                  name="bio"
                  rows={2}
                  value={form.bio}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="A short summary of your background and spiritual focus..."
                />
              </Field>

              {error && <p className="text-sm text-rose-700">{error}</p>}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-medium text-ink-soft hover:text-ink hover:underline"
                >
                  ← Back to account credentials
                </button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Spinner className="border-t-white border-white/30" />
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
