import { monthOptions } from "../utils/options";

function MonthYearFilter({ month, year, onChange, showButton = false, onSubmit }) {
  function updateField(field, value) {
    onChange({
      month,
      year,
      [field]: Number(value)
    });
  }

  return (
    <form
      className="period-filter"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <label>
        Mês
        <select value={month} onChange={(event) => updateField("month", event.target.value)}>
          {monthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Ano
        <input
          type="number"
          min="2000"
          max="2100"
          value={year}
          onChange={(event) => updateField("year", event.target.value)}
        />
      </label>
      {showButton ? <button className="btn btn-secondary">Filtrar</button> : null}
    </form>
  );
}

export default MonthYearFilter;
