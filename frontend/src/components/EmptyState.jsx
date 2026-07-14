function EmptyState({ title = "Nenhum registro encontrado", description = "" }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      {description ? <span>{description}</span> : null}
    </div>
  );
}

export default EmptyState;
