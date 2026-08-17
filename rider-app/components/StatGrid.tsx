type Stat = {
  label: string;
  value: string;
  caption?: string;
  emphasis?: "navy" | "burgundy";
};

export default function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label}>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-charcoal/50">
            {stat.label}
          </p>
          <p
            className={`mt-1 font-display text-2xl font-semibold ${
              stat.emphasis === "burgundy" ? "text-burgundy" : "text-navy"
            }`}
          >
            {stat.value}
          </p>
          {stat.caption && (
            <p className="text-xs text-charcoal/50">{stat.caption}</p>
          )}
        </div>
      ))}
    </div>
  );
}
