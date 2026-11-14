"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

const API = "http://127.0.0.1:8000";
const contentKinds = [
  { id: "districts", label: "Districts" },
  { id: "categories", label: "Heritage sections" },
  { id: "places", label: "Places" },
  { id: "timelines", label: "Timeline" },
] as const;

type ContentKind = (typeof contentKinds)[number]["id"];
type ContentRecord = Record<string, unknown>;
type Draft = Record<string, string>;
type FieldDefinition = {
  key: string;
  label: string;
  help?: string;
  format?: "lines" | "json" | "number" | "text";
};
type ApiResult = {
  detail?: string;
  message?: string;
  districts?: ContentRecord[];
  categories?: ContentRecord[];
  places?: ContentRecord[];
  timelines?: ContentRecord[];
};

const fieldsByKind: Record<ContentKind, FieldDefinition[]> = {
  districts: [
    { key: "id", label: "District ID", help: "Lowercase words separated by hyphens." },
    { key: "name", label: "District name" },
    { key: "headquarters", label: "Headquarters" },
    { key: "primary_language", label: "Languages" },
    { key: "geographic_features", label: "Landscape introduction", format: "text" },
    { key: "climate", label: "Climate", format: "text" },
    { key: "image", label: "Local image path", help: "Choose an existing /images/karavali/... asset." },
    { key: "image_alt", label: "Image description" },
    { key: "image_credit", label: "Image credit" },
  ],
  categories: [
    { key: "id", label: "Section ID", help: "Lowercase words separated by hyphens." },
    { key: "title", label: "Section title" },
    { key: "icon", label: "Icon name" },
    { key: "image", label: "Local image path", help: "Choose an existing /images/karavali/... asset." },
    { key: "overview", label: "Overview", format: "text" },
    { key: "details", label: "Section text", format: "lines", help: "One paragraph per line." },
    { key: "highlights", label: "Highlights", format: "lines", help: "One highlight per line." },
    { key: "verificationNote", label: "Context / verification note", format: "text" },
    { key: "sources", label: "Sources (JSON)", format: "json", help: 'Array of {"label":"...","url":"https://..."} objects.' },
  ],
  places: [
    { key: "id", label: "Place ID", help: "Lowercase words separated by hyphens." },
    { key: "name", label: "Place name" },
    { key: "district_id", label: "District ID" },
    { key: "category", label: "Place category" },
    { key: "summary", label: "Short summary", format: "text" },
    { key: "description", label: "Description", format: "text" },
    { key: "coordinates", label: "Coordinates" },
    { key: "image", label: "Local image path", help: "Choose an existing /images/karavali/... asset." },
    { key: "image_alt", label: "Image description" },
    { key: "image_credit", label: "Image credit" },
    { key: "historical_background", label: "Historical background", format: "text" },
    { key: "cultural_significance", label: "Cultural significance", format: "text" },
    { key: "geographical_importance", label: "Landscape & location", format: "text" },
    { key: "architectural_details", label: "Architecture details", format: "text" },
    { key: "important_attractions", label: "What to explore", format: "lines" },
    { key: "nearby_destinations", label: "Nearby destinations", format: "lines" },
    { key: "source_ids", label: "Source IDs", format: "lines", help: "One existing source ID per line." },
  ],
  timelines: [
    { key: "id", label: "Timeline ID", help: "Lowercase words separated by hyphens." },
    { key: "district_id", label: "District ID" },
    { key: "place_id", label: "Place ID (optional)" },
    { key: "period", label: "Period / date" },
    { key: "sort_order", label: "Sort order", format: "number" },
    { key: "title", label: "Event title" },
    { key: "description", label: "Public account", format: "text" },
    { key: "details", label: "Context and interpretation", format: "text" },
    { key: "source_ids", label: "Source IDs", format: "lines", help: "One existing source ID per line." },
  ],
};

function getId(record: ContentRecord) {
  return typeof record.id === "string" ? record.id : "";
}

function recordsFrom(data: ApiResult, kind: ContentKind) {
  return data[kind] ?? [];
}

function toDraft(record: ContentRecord, kind: ContentKind): Draft {
  const draft: Draft = {};
  for (const field of fieldsByKind[kind]) {
    const value = record[field.key];
    if (field.format === "lines") {
      draft[field.key] = Array.isArray(value) ? value.join("\n") : String(value ?? "");
    } else if (field.format === "json") {
      draft[field.key] = JSON.stringify(value ?? [], null, 2);
    } else {
      draft[field.key] = String(value ?? "");
    }
  }
  return draft;
}

function emptyDraft(kind: ContentKind): Draft {
  return Object.fromEntries(fieldsByKind[kind].map((field) => [field.key, ""]));
}

function toPayload(draft: Draft, kind: ContentKind) {
  const payload: Record<string, unknown> = {};
  for (const field of fieldsByKind[kind]) {
    const value = draft[field.key] ?? "";
    if (field.format === "lines") {
      payload[field.key] = value
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean);
    } else if (field.format === "text") {
      payload[field.key] = value.trim() || null;
    } else if (field.format === "json") {
      payload[field.key] = value.trim() ? JSON.parse(value) : [];
    } else if (field.format === "number") {
      const number = Number(value);
      if (!Number.isInteger(number)) {
        throw new Error(`${field.label} must be a whole number.`);
      }
      payload[field.key] = number;
    } else {
      payload[field.key] = value.trim();
    }
  }
  return payload;
}

export default function KaravaliAdminContentManager({
  token,
  onChange,
}: {
  token: string;
  onChange: () => void;
}) {
  const [kind, setKind] = useState<ContentKind>("districts");
  const [records, setRecords] = useState<ContentRecord[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<Draft>(() => emptyDraft("districts"));
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const endpoint = useMemo(
    () => `${API}/api/karavali/admin/${kind}`,
    [kind],
  );
  const selectedRecord = records.find((record) => getId(record) === selectedId);

  const loadRecords = useCallback(
    async (preferredId = "") => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(endpoint, {
          headers: { "X-Admin-Token": token },
          cache: "no-store",
        });
        const data = (await response.json()) as ApiResult;
        if (!response.ok) {
          throw new Error(data.detail || "Could not load Karavali content.");
        }
        const nextRecords = recordsFrom(data, kind);
        const nextId =
          nextRecords.find((record) => getId(record) === preferredId)
            ? preferredId
            : getId(nextRecords[0] ?? {});
        setRecords(nextRecords);
        setSelectedId(nextId);
        setCreating(false);
        setDraft(toDraft(nextRecords.find((record) => getId(record) === nextId) ?? {}, kind));
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load Karavali content.",
        );
      } finally {
        setLoading(false);
      }
    },
    [endpoint, kind, token],
  );

  useEffect(() => {
    setRecords([]);
    setSelectedId("");
    setCreating(false);
    setDraft(emptyDraft(kind));
    setMessage("");
    void loadRecords();
  }, [kind, loadRecords]);

  function chooseRecord(id: string) {
    setSelectedId(id);
    setCreating(false);
    const record = records.find((item) => getId(item) === id);
    setDraft(record ? toDraft(record, kind) : emptyDraft(kind));
    setError("");
    setMessage("");
  }

  function beginCreate() {
    setSelectedId("");
    setCreating(true);
    setDraft(emptyDraft(kind));
    setError("");
    setMessage("");
  }

  async function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const payload = toPayload(draft, kind);
      const recordId = typeof payload.id === "string" ? payload.id : selectedId;
      const url = creating
        ? endpoint
        : `${endpoint}/${encodeURIComponent(recordId)}`;
      const response = await fetch(url, {
        method: creating ? "POST" : "PUT",
        headers: {
          "X-Admin-Token": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as ApiResult;
      if (!response.ok) {
        throw new Error(data.detail || "Karavali content could not be saved.");
      }
      await loadRecords(recordId);
      onChange();
      setMessage(creating ? "New record created." : "Record changes saved.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Karavali content could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecord() {
    if (!selectedId || creating) return;
    if (!window.confirm(`Delete “${selectedId}”? Linked records may prevent deletion.`)) {
      return;
    }
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const response = await fetch(
        `${endpoint}/${encodeURIComponent(selectedId)}`,
        { method: "DELETE", headers: { "X-Admin-Token": token } },
      );
      const data = (await response.json()) as ApiResult;
      if (!response.ok) {
        throw new Error(data.detail || "Karavali content could not be deleted.");
      }
      await loadRecords();
      onChange();
      setMessage(data.message || "Record deleted.");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Karavali content could not be deleted.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="karavali-admin-content" aria-labelledby="karavali-admin-content-title">
      <header className="karavali-admin-content-heading">
        <div>
          <p className="district-explorer-kicker">EDITORIAL WORKSPACE</p>
          <h2 id="karavali-admin-content-title">Manage the coastal atlas</h2>
          <p>Changes are saved to the same JSON records served to public Karavali pages.</p>
        </div>
      </header>

      <div className="karavali-admin-content-tabs" aria-label="Content type">
        {contentKinds.map((item) => (
          <button
            type="button"
            className={kind === item.id ? "is-active" : ""}
            aria-pressed={kind === item.id}
            key={item.id}
            onClick={() => setKind(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="karavali-admin-editor-layout">
        <aside className="karavali-admin-records">
          <div className="karavali-admin-records-heading">
            <h3>{contentKinds.find((item) => item.id === kind)?.label}</h3>
            <button type="button" onClick={beginCreate} disabled={loading || saving}>
              + New
            </button>
          </div>
          {loading && <p role="status">Loading records…</p>}
          {!loading && records.length === 0 && !creating && (
            <p>No records yet. Create the first one.</p>
          )}
          <ul>
            {records.map((record) => {
              const id = getId(record);
              const title =
                typeof record.title === "string"
                  ? record.title
                  : typeof record.name === "string"
                    ? record.name
                    : id;
              return (
                <li key={id}>
                  <button
                    type="button"
                    className={selectedId === id && !creating ? "is-selected" : ""}
                    onClick={() => chooseRecord(id)}
                  >
                    <strong>{title}</strong>
                    <span>{id}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <form className="karavali-admin-editor-form" onSubmit={saveRecord}>
          <div className="karavali-admin-editor-title">
            <div>
              <p className="district-explorer-kicker">
                {creating ? "CREATE RECORD" : selectedRecord ? "EDIT RECORD" : "SELECT A RECORD"}
              </p>
              <h3>{creating ? "New record" : selectedRecord ? selectedId : "Content editor"}</h3>
            </div>
            {!creating && selectedRecord && (
              <button
                type="button"
                className="karavali-admin-delete"
                onClick={() => void deleteRecord()}
                disabled={saving}
              >
                Delete
              </button>
            )}
          </div>
          {fieldsByKind[kind].map((field) => {
            const multiline =
              field.format === "lines" ||
              field.format === "json" ||
              field.format === "text";
            return (
              <label className="karavali-admin-field" key={field.key}>
                {field.label}
                {multiline ? (
                  <textarea
                    value={draft[field.key] ?? ""}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, [field.key]: event.target.value }))
                    }
                    disabled={loading || saving || (!creating && field.key === "id")}
                    rows={field.format === "json" ? 7 : 4}
                    required={!["verificationNote", "architectural_details", "place_id"].includes(field.key)}
                  />
                ) : (
                  <input
                    type={field.format === "number" ? "number" : "text"}
                    value={draft[field.key] ?? ""}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, [field.key]: event.target.value }))
                    }
                    disabled={loading || saving || (!creating && field.key === "id")}
                    required={!["place_id"].includes(field.key)}
                  />
                )}
                {field.help && <span>{field.help}</span>}
              </label>
            );
          })}
          <div className="karavali-admin-editor-actions">
            <button type="submit" disabled={loading || saving || (!creating && !selectedRecord)}>
              {saving ? "Saving…" : creating ? "Create record" : "Save changes"}
            </button>
            {creating && (
              <button type="button" onClick={() => chooseRecord(records[0] ? getId(records[0]) : "")}>
                Cancel
              </button>
            )}
          </div>
          {error && <p className="karavali-inline-error" role="alert">{error}</p>}
          {message && <p className="karavali-inline-status" role="status">{message}</p>}
        </form>
      </div>
    </section>
  );
}
