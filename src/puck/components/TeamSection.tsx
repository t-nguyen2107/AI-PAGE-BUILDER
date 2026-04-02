import type { TeamSectionProps } from "../types";

export function TeamSection({ heading, subtext, members }: TeamSectionProps) {
  return (
    <section className="w-full py-20 px-6 bg-background text-foreground">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{heading}</h2>
          {subtext && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {subtext}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {members.map((member, i) => (
            <div key={i} className="text-center">
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 text-xl font-semibold">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
              )}
              <p className="font-semibold">{member.name}</p>
              <p className="text-muted-foreground text-sm">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
