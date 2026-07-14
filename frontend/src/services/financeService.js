import { api } from "./api";

function unwrap(data, key) {
  return data?.[key] ?? data ?? [];
}

export const categoriesApi = {
  async list() {
    const response = await api.get("/categories");
    return unwrap(response.data, "categories");
  }
};

export const incomesApi = {
  async list(params) {
    const response = await api.get("/incomes", { params });
    return unwrap(response.data, "incomes");
  },
  async create(payload) {
    const response = await api.post("/incomes", payload);
    return response.data?.income ?? response.data;
  },
  async update(id, payload) {
    const response = await api.put(`/incomes/${id}`, payload);
    return response.data?.income ?? response.data;
  },
  async remove(id) {
    await api.delete(`/incomes/${id}`);
  }
};

export const expensesApi = {
  async list(params) {
    const response = await api.get("/expenses", { params });
    return unwrap(response.data, "expenses");
  },
  async create(payload) {
    const response = await api.post("/expenses", payload);
    return response.data?.expense ?? response.data;
  },
  async update(id, payload) {
    const response = await api.put(`/expenses/${id}`, payload);
    return response.data?.expense ?? response.data;
  },
  async remove(id) {
    await api.delete(`/expenses/${id}`);
  }
};

export const goalsApi = {
  async list(params) {
    const response = await api.get("/monthly-goals", { params });
    return unwrap(response.data, "goals");
  },
  async save(payload) {
    const response = await api.post("/monthly-goals", payload);
    return response.data?.goal ?? response.data;
  },
  async update(id, payload) {
    const response = await api.put(`/monthly-goals/${id}`, payload);
    return response.data?.goal ?? response.data;
  }
};

export const limitsApi = {
  async list(params) {
    const response = await api.get("/category-limits", { params });
    return unwrap(response.data, "limits");
  },
  async save(payload) {
    const response = await api.post("/category-limits", payload);
    return response.data?.limit ?? response.data;
  },
  async update(id, payload) {
    const response = await api.put(`/category-limits/${id}`, payload);
    return response.data?.limit ?? response.data;
  }
};

export const dashboardApi = {
  async summary(params) {
    const response = await api.get("/dashboard/monthly-summary", { params });
    return response.data;
  },
  async categoryExpenses(params) {
    const response = await api.get("/dashboard/category-expenses", { params });
    return response.data;
  },
  async alerts(params) {
    const response = await api.get("/dashboard/alerts", { params });
    return response.data;
  }
};

export const reportsApi = {
  async monthlyHistory(params) {
    const response = await api.get("/reports/monthly-history", { params });
    return response.data;
  }
};

export const profileApi = {
  async financialProfile() {
    const response = await api.get("/financial-profile");
    return response.data?.profile ?? response.data;
  }
};
