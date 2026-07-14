export function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(amount);
}

export function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC"
  }).format(new Date(value));
}

export function getCurrentMonthYear() {
  const now = new Date();

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear()
  };
}

export function getMonthLabel(month) {
  const date = new Date(Date.UTC(2026, Number(month) - 1, 1));

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    timeZone: "UTC"
  }).format(date);
}

export function toInputDate(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}
