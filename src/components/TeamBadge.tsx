type TeamBadgeProps = {
  code?: string;
  name: string;
};

export function TeamBadge({ code, name }: TeamBadgeProps) {
  return (
    <span className="team-badge">
      {code ? (
        <img alt={name} src={`https://flagcdn.com/w80/${code}.png`} />
      ) : (
        <span className="team-fallback">{name.slice(0, 1)}</span>
      )}
      <span>{name}</span>
    </span>
  );
}
