export function MondayBanner() {
  return (
    <div className="bg-sw-pink text-white px-4 py-3 flex items-center gap-3">
      <span className="text-xl shrink-0">🚨</span>
      <div>
        <p className="font-body font-bold text-sm">Submission Monday!</p>
        <p className="font-body text-xs text-white/90">
          Submit your steps from last week by midnight tonight.
        </p>
      </div>
    </div>
  );
}
