import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Video,
  Sparkles,
  Users2,
  ShieldCheck,
  Zap,
  Mic,
  Monitor,
} from "lucide-react";
import { useCreateVirtualMeetingMutation } from "../../services/virtualMeetingService";
import { PageHeader } from "../../components/Common";

export default function ExpertMeetings() {
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const [createVirtualMeeting, { isLoading: isCreating }] =
    useCreateVirtualMeetingMutation();

  const [instantRoomTitle, setInstantRoomTitle] = useState("");
  const [joinMeetingInput, setJoinMeetingInput] = useState("");

  const handleStartInstantMeeting = async (e) => {
    e.preventDefault();
    try {
      const res = await createVirtualMeeting().unwrap();
      const meetingId =
        res?.meetingId || `room-${Math.random().toString(36).substring(2, 8)}`;
      navigate(`/meeting/${meetingId}`, {
        state: {
          title: instantRoomTitle.trim() || "Instant Agora Video Meeting",
          token: res?.token,
          channelName: res?.channelName,
          appId: res?.appId,
          uid: res?.uid,
        },
      });
    } catch (err) {
      console.warn("Create virtual meeting API fallback to local room:", err);
      const cleanRoom = `room-${Math.random().toString(36).substring(2, 8)}`;
      navigate(`/meeting/${cleanRoom}`, {
        state: {
          title: instantRoomTitle.trim() || "Instant Agora Video Meeting",
        },
      });
    }
  };

  const handleJoinByCode = (e) => {
    e.preventDefault();
    if (!joinMeetingInput.trim()) return;

    // Handle full URL pasted or meeting ID
    let id = joinMeetingInput.trim();
    if (id.includes("/meeting/")) {
      id = id.split("/meeting/")[1].split("?")[0];
    }
    id = id.replace(/^cosmic_guru_/, "").trim();

    if (id) {
      navigate(`/meeting/${id}`, {
        state: { title: "Online Video Meeting" },
      });
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeader
        title="Cosmicguruji Online Video Meetings"
        subtitle="Host instant consultations, live interactive video calls, and group meetings powered by Cosmicguruji."
      />

      {/* Two Column Quick Actions: Create or Join */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Card 1: Create Instant Meeting */}
        <div className="flex flex-col justify-between rounded-3xl border border-dusk-100 bg-white p-6 sm:p-8 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-dusk-700">
              <Sparkles size={14} /> Host New Meeting
            </div>
            <h2 className="mt-2 text-2xl font-bold text-ink">
              Start an Instant Video Room
            </h2>
            <p className="mt-1.5 text-xs text-ink-soft leading-relaxed">
              Generate an Agora HD video meeting room instantly and invite
              clients, attendees, or admins with a single click.
            </p>
          </div>

          <form onSubmit={handleStartInstantMeeting} className="mt-8 space-y-3">
            <input
              type="text"
              placeholder="Meeting Topic (e.g. 1-on-1 Consultation)"
              value={instantRoomTitle}
              onChange={(e) => setInstantRoomTitle(e.target.value)}
              className="w-full rounded-xl border border-dusk-200 bg-dusk-50/50 px-4 py-3 text-xs text-ink placeholder-ink-soft/60 focus:border-dusk-500 focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={isCreating}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-dusk-700 py-3.5 text-xs font-bold text-white shadow-md hover:bg-dusk-900 active:scale-95 transition-all disabled:opacity-50"
            >
              <Video size={16} />{" "}
              {isCreating ? "Creating Room…" : "Start Instant Meeting"}
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
              Enter a Meeting ID or paste an invite link shared by an admin,
              client, or team member.
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
    </div>
  );
}
