import { useAuthTokenLogs } from "../api/dkplus.queries";

function formatDate(iso: string): string {
  const d = new Date(iso);
  const dd = d.getDate().toString().padStart(2, "0");
  const mm = (d.getMonth() + 1).toString().padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = d.getHours().toString().padStart(2, "0");
  const min = d.getMinutes().toString().padStart(2, "0");
  return `${dd}.${mm}.${yyyy} - ${hh}:${min}`;
}

interface AuthTokenLogsPanelProps {
  tokenId: string;
  tokenDescription: string;
}

export function AuthTokenLogsPanel({ tokenId, tokenDescription }: AuthTokenLogsPanelProps) {
  const { data: logs = [], isLoading } = useAuthTokenLogs(tokenId);

  return (
    <div className="overflow-hidden rounded-xl border border-(--color-border)">
      <div className="border-b border-(--color-border) bg-(--color-surface) px-4 py-3">
        <h3 className="text-sm font-semibold text-(--color-text)">{tokenDescription} - Log</h3>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-sm text-(--color-text-secondary)">
          Hleður...
        </div>
      ) : logs.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-sm text-(--color-text-secondary)">
          Engar færslur í skrá.
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--color-border)">
                <th className="px-4 py-3 text-left font-semibold text-(--color-text)">Stofndagur</th>
                <th className="px-4 py-3 text-left font-semibold text-(--color-text)">Lýsing</th>
                <th className="px-4 py-3 text-left font-semibold text-(--color-text)">Framkvæmt af</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr
                  key={log.id}
                  className={i % 2 === 0 ? "bg-(--color-surface)" : "bg-(--color-background)"}
                >
                  <td className="whitespace-nowrap px-4 py-3 text-(--color-text-secondary)">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-(--color-text)">{log.description}</td>
                  <td className="px-4 py-3 text-(--color-text)">{log.executedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
