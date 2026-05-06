export default function LockedPage() {
  return (
    <main className="locked-shell">
      <section className="locked-panel">
        <p className="eyebrow">Private workspace</p>
        <h1>Access locked</h1>
        <p>
          This app is private. Open it with your owner unlock link once in this browser, then the normal app URL will
          work without a password prompt.
        </p>
        <p className="locked-note">Automation tools can use the same unlock link before filling the app forms.</p>
      </section>
    </main>
  );
}
