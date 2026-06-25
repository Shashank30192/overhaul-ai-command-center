export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 overflow-hidden bg-[var(--mil-bg)] z-10"
      style={{ top: "calc(4rem + 33px)" }}
    >
      {children}
    </div>
  );
}
