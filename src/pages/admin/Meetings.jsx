import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Video,
  Sparkles,
  Users2,
  ShieldCheck,
  Zap,
  Monitor,
} from "lucide-react";
import { useCreateVirtualMeetingMutation } from "../../services/virtualMeetingService";
import { PageHeader } from "../../components/Common";

export default function AdminMeetings() {
  const navigate = useNavigate();
  const [createVirtualMeeting, { isLoading: isCreating }] =
    useCreateVirtualMeetingMutation();

  const [instantRoomTitle, setInstantRoomTitle] = useState("");
  const [joinMeetingInput, setJoinMeetingInput] = useState("");

  const handleStartInstantMeeting = async (e) => {
    e.preventDefault();
    try {
      const res = await createVirtualMeeting().unwrap();
      const meetingId =
        res?.meetingId ||
        `admin-room-${Math.random().toString(36).substring(2, 8)}`;
      navigate(`/meeting/${meetingId}`, {
        state: {
          title: instantRoomTitle.trim() || "Admin Video Meeting",
          token: res?.token,
          channelName: res?.channelName,
          appId: res?.appId,
          uid: res?.uid,
        },
      });
    } catch (err) {
      console.warn("Admin create virtual meeting API fallback:", err);
      const cleanRoom = `admin-room-${Math.random().toString(36).substring(2, 8)}`;
      navigate(`/meeting/${cleanRoom}`, {
        state: { title: instantRoomTitle.trim() || "Admin Video Meeting" },
      });
    }
  };

  const handleJoinByCode = (e) => {
    e.preventDefault();
    if (!joinMeetingInput.trim()) return;

    // Handle full URL or raw meeting ID
    let id = joinMeetingInput.trim();
    if (id.includes("/meeting/")) {
      id = id.split("/meeting/")[1].split("?")[0];
    }
    id = id.replace(/^cosmic_guru_/, "").trim();

    if (id) {
      navigate(`/meeting/${id}`, {
        state: { title: "Online Video Session" },
      });
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeader
        title="Cosmicguruji Online Meetings Hub"
        subtitle="Oversee, host, and join real-time interactive video meetings powered by Cosmicguruji."
      />

      {/* Two Column Quick Actions: Create or Join */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Card 1: Admin Create Instant Meeting */}
        <div className="flex flex-col justify-between rounded-3xl border border-dusk-100 bg-gradient-to-br from-dusk-900 via-dusk-800 to-dusk-900 p-6 sm:p-8 text-white shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-marigold-400">
              <Sparkles size={14} /> Admin Video Room
            </div>
            <h2 className="mt-2 text-2xl font-bold text-white">
              Create Instant Video Meeting
            </h2>
            <p className="mt-1.5 text-xs text-white/70 leading-relaxed">
              Launch a live Agora HD meeting room instantly for administrative
              reviews, client consultations, or team syncs.
            </p>
          </div>

          <form onSubmit={handleStartInstantMeeting} className="mt-8 space-y-3">
            <input
              type="text"
              placeholder="Meeting Title (e.g. Weekly Strategy Sync)"
              value={instantRoomTitle}
              onChange={(e) => setInstantRoomTitle(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-xs text-white placeholder-white/40 focus:border-marigold-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isCreating}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-marigold-500 to-marigold-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-marigold-500/25 hover:from-marigold-600 hover:to-marigold-700 active:scale-95 transition-all disabled:opacity-50"
            >
              <Video size={16} />{" "}
              {isCreating ? "Launching Room…" : "Launch Instant Room"}
            </button>
          </form>
        </div>

        {/* Card 2: Join Meeting with ID or Link */}
        <div className="flex flex-col justify-between rounded-3xl border border-dusk-100 bg-white p-6 sm:p-8 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600">
              <Video size={14} /> Join Call
            </div>
            <h2 className="mt-2 text-2xl font-bold text-ink">
              Join Existing Meeting
            </h2>
            <p className="mt-1.5 text-xs text-ink-soft leading-relaxed">
              Enter a Meeting ID or paste an invite link to join or monitor any
              ongoing meeting in real time.
            </p>
          </div>

          <form onSubmit={handleJoinByCode} className="mt-8 space-y-3">
            <input
              type="text"
              placeholder="Paste Meeting ID or Link (e.g. 53752807-...)"
              value={joinMeetingInput}
              onChange={(e) => setJoinMeetingInput(e.target.value)}
              className="w-full rounded-xl border border-dusk-200 bg-dusk-50/50 px-4 py-3 text-xs text-ink placeholder-ink-soft/60 focus:border-emerald-500 focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={!joinMeetingInput.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-xs font-bold text-white shadow-md hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition-all disabled:opacity-40"
            >
              <Users2 size={16} /> Join Meeting
            </button>
          </form>
        </div>
      </div>

      {/* Feature Highlights Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3.5 rounded-2xl border border-dusk-100 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-marigold-500/10 text-marigold-600">
            <Zap size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-ink">Ultra-Low Latency</p>
            <p className="text-[11px] text-ink-soft">
              Real-time HD audio & video engagement
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-dusk-100 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
            <Monitor size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-ink">Screen Sharing</p>
            <p className="text-[11px] text-ink-soft">
              Share documents, tabs, and presentations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-dusk-100 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-ink">Secure RTC Tokens</p>
            <p className="text-[11px] text-ink-soft">
              Encrypted channels & token authentication
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
