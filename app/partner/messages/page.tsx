import MessagesInbox from "@/components/partner/MessagesInbox";

export const metadata = { title: "Messages" };

export default function PartnerMessagesPage() {
  return (
    <div>
      <div className="admin-rise">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft">
          Inbox
        </p>
        <h1 className="mt-1 font-display text-xl font-bold tracking-tight text-ink @sm:text-2xl">
          Messages
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-soft">
          Notices from field admins and conservation partners — open a row to read the full note.
        </p>
      </div>
      <div className="admin-rise-delay mt-5">
        <MessagesInbox />
      </div>
    </div>
  );
}
