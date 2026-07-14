export function getErrorMessage(error) {
  const message = error?.response?.data?.message || error?.message;

  const translations = {
    "Invalid email or password.": "Email ou senha inválidos.",
    "Authentication token is required.": "Sessão expirada. Faça login novamente.",
    "Invalid or expired token.": "Sessão expirada. Faça login novamente.",
    "Email is already registered.": "Este email já está cadastrado.",
    "Category not found or unavailable for this user.": "Categoria não encontrada para este usuário.",
    "Income not found.": "Receita não encontrada.",
    "Expense not found.": "Despesa não encontrada.",
    "A record with these unique fields already exists.": "Já existe um registro com essas informações.",
    "Internal server error.": "Erro interno no servidor."
  };

  if (message) {
    if (message.includes("must be greater than zero")) {
      return "O valor deve ser maior que zero.";
    }

    if (message.includes("is required")) {
      return "Preencha todos os campos obrigatórios.";
    }

    if (message.includes("must be a valid date")) {
      return "Informe uma data válida.";
    }

    if (message.includes("must be one of")) {
      return "Uma das opções informadas é inválida.";
    }

    return translations[message] || message;
  }

  return "Não foi possível concluir a operação.";
}
