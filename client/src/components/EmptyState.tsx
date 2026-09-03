import { Link } from "react-router-dom";

type Props = {
  title: string;
  body: string;
  actionLabel?: string;
  actionTo?: string;
};

export function EmptyState({ title, body, actionLabel, actionTo }: Props) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p className="muted">{body}</p>
      {actionLabel && actionTo ? (
        <p>
          <Link className="btn-accent" to={actionTo}>
            {actionLabel}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
