export const monthOptions = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" }
];

export const expenseTypeOptions = [
  { value: "FIXED", label: "Fixa" },
  { value: "VARIABLE", label: "Variável" }
];

export const paymentMethodOptions = [
  { value: "CASH", label: "Dinheiro" },
  { value: "PIX", label: "Pix" },
  { value: "DEBIT_CARD", label: "Cartão de débito" },
  { value: "CREDIT_CARD", label: "Cartão de crédito" },
  { value: "BANK_SLIP", label: "Boleto" },
  { value: "BANK_TRANSFER", label: "Transferência" },
  { value: "OTHER", label: "Outro" }
];

export function getOptionLabel(options, value) {
  return options.find((option) => option.value === value)?.label ?? value ?? "-";
}
