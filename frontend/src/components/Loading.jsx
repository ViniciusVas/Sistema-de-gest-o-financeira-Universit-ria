function Loading({ message = "Carregando..." }) {
  return (
    <div className="loading">
      <div className="spinner" />
      <span>{message}</span>
    </div>
  );
}

export default Loading;
