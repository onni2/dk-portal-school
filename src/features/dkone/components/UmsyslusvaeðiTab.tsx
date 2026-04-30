import { useSubCompanies } from "../api/dkone.queries";

export function UmsyslusvaeðiTab() {
  const { data: companies } = useSubCompanies();

  if (companies.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-(--color-text-secondary)">
        Engar undirfyrirtæki skráð.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-(--color-border)">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-(--color-border) bg-(--color-surface)">
          <tr>
            <th className="px-4 py-3 font-medium text-(--color-text-secondary)">Fyrirtæki</th>
            <th className="px-4 py-3 font-medium text-(--color-text-secondary)">Auðkenni</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-(--color-border)">
          {companies.map((company) => (
            <tr key={company.id} className="hover:bg-(--color-surface-hover)">
              <td className="px-4 py-3 font-medium text-(--color-text)">{company.name}</td>
              <td className="px-4 py-3 text-(--color-text-secondary)">{company.id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
