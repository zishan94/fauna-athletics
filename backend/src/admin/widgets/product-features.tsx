import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Input, Button, Text } from "@medusajs/ui"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { useState, useEffect } from "react"

/**
 * Product Features Widget
 *
 * Displays and lets admin users edit the `metadata.features` array
 * and the `metadata.tag` badge directly on the product detail page.
 *
 * Saves changes back to the product via the Admin API.
 */
const ProductFeaturesWidget = ({
  data,
}: DetailWidgetProps<AdminProduct>) => {
  const meta = (data.metadata ?? {}) as Record<string, unknown>
  const initialFeatures = Array.isArray(meta.features)
    ? (meta.features as string[])
    : []
  const initialTag = typeof meta.tag === "string" ? meta.tag : ""

  // Size guide from metadata
  const initialSizeGuide = meta.size_guide as
    | { columns: string[]; rows: string[][] }
    | undefined
  const defaultColumns = ["Grösse", "Brust (cm)", "Taille (cm)", "Hüfte (cm)"]

  const [features, setFeatures] = useState<string[]>(initialFeatures)
  const [tag, setTag] = useState(initialTag)
  const [newFeature, setNewFeature] = useState("")
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle")

  // Size guide state
  const [sgColumns, setSgColumns] = useState<string[]>(
    initialSizeGuide?.columns || defaultColumns
  )
  const [sgRows, setSgRows] = useState<string[][]>(
    initialSizeGuide?.rows || []
  )
  const [sgEnabled, setSgEnabled] = useState(!!initialSizeGuide)

  // Sync when product data changes (e.g. after navigating to another product)
  useEffect(() => {
    const m = (data.metadata ?? {}) as Record<string, unknown>
    setFeatures(Array.isArray(m.features) ? (m.features as string[]) : [])
    setTag(typeof m.tag === "string" ? m.tag : "")
    const sg = m.size_guide as
      | { columns: string[]; rows: string[][] }
      | undefined
    setSgColumns(sg?.columns || defaultColumns)
    setSgRows(sg?.rows || [])
    setSgEnabled(!!sg)
    setStatus("idle")
  }, [data.id])

  const addFeature = () => {
    const trimmed = newFeature.trim()
    if (trimmed) {
      setFeatures((prev) => [...prev, trimmed])
      setNewFeature("")
      setStatus("idle")
    }
  }

  const removeFeature = (index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index))
    setStatus("idle")
  }

  const updateFeature = (index: number, value: string) => {
    setFeatures((prev) => {
      const updated = [...prev]
      updated[index] = value
      return updated
    })
    setStatus("idle")
  }

  const moveFeature = (index: number, direction: "up" | "down") => {
    setFeatures((prev) => {
      const updated = [...prev]
      const targetIndex = direction === "up" ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= updated.length) return prev
      ;[updated[index], updated[targetIndex]] = [
        updated[targetIndex],
        updated[index],
      ]
      return updated
    })
    setStatus("idle")
  }

  const saveMetadata = async () => {
    setSaving(true)
    setStatus("idle")
    try {
      const updatedMetadata: Record<string, unknown> = { ...meta }
      // Update features — remove key if empty, otherwise set the array
      if (features.length > 0) {
        updatedMetadata.features = features.filter((f) => f.trim())
      } else {
        delete updatedMetadata.features
      }
      // Update tag — remove key if empty, otherwise set the string
      if (tag.trim()) {
        updatedMetadata.tag = tag.trim()
      } else {
        delete updatedMetadata.tag
      }

      // Update size guide
      if (sgEnabled && sgRows.length > 0) {
        updatedMetadata.size_guide = {
          columns: sgColumns.map((c) => c.trim()).filter(Boolean),
          rows: sgRows.filter((row) => row.some((cell) => cell.trim())),
        }
      } else {
        delete updatedMetadata.size_guide
      }

      const res = await fetch(`/admin/products/${data.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ metadata: updatedMetadata }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setStatus("saved")
      setTimeout(() => setStatus("idle"), 3000)
    } catch (err) {
      console.error("Failed to save product metadata:", err)
      setStatus("error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Produktmerkmale &amp; Kennzeichnung</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-0.5">
            Verwalte die Feature-Liste und das Produkt-Badge, das auf dem Storefront angezeigt wird.
          </Text>
        </div>
        <div className="flex items-center gap-2">
          {status === "saved" && (
            <Text size="small" className="text-ui-fg-interactive">
              ✓ Gespeichert
            </Text>
          )}
          {status === "error" && (
            <Text size="small" className="text-ui-fg-error">
              Fehler beim Speichern
            </Text>
          )}
          <Button
            size="small"
            variant="secondary"
            onClick={saveMetadata}
            isLoading={saving}
          >
            Speichern
          </Button>
        </div>
      </div>

      {/* Tag / Badge */}
      <div className="px-6 py-4">
        <Text size="small" weight="plus" className="mb-2 block">
          Produkt-Badge (Tag)
        </Text>
        <Text size="small" className="text-ui-fg-subtle mb-2 block">
          z.B. BESTSELLER, NEU, SPARE 15% — wird als Badge auf der
          Produktkarte angezeigt.
        </Text>
        <Input
          size="small"
          placeholder='z.B. "BESTSELLER" oder leer lassen'
          value={tag}
          onChange={(e) => {
            setTag(e.target.value)
            setStatus("idle")
          }}
        />
      </div>

      {/* Features list */}
      <div className="px-6 py-4">
        <Text size="small" weight="plus" className="mb-2 block">
          Merkmale ({features.length})
        </Text>
        <Text size="small" className="text-ui-fg-subtle mb-3 block">
          Wird als Checkliste auf der Produktdetailseite angezeigt.
        </Text>

        {features.length === 0 && (
          <Text size="small" className="text-ui-fg-muted italic mb-3 block">
            Keine Merkmale vorhanden. Füge unten ein neues Merkmal hinzu.
          </Text>
        )}

        <div className="space-y-2">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2">
              {/* Order controls */}
              <div className="flex flex-col">
                <button
                  type="button"
                  className="text-ui-fg-subtle hover:text-ui-fg-base text-xs leading-none px-0.5 disabled:opacity-30"
                  disabled={i === 0}
                  onClick={() => moveFeature(i, "up")}
                  title="Nach oben"
                >
                  ▲
                </button>
                <button
                  type="button"
                  className="text-ui-fg-subtle hover:text-ui-fg-base text-xs leading-none px-0.5 disabled:opacity-30"
                  disabled={i === features.length - 1}
                  onClick={() => moveFeature(i, "down")}
                  title="Nach unten"
                >
                  ▼
                </button>
              </div>

              {/* Feature input */}
              <Input
                size="small"
                className="flex-1"
                value={feature}
                onChange={(e) => updateFeature(i, e.target.value)}
              />

              {/* Remove button */}
              <button
                type="button"
                className="text-ui-fg-subtle hover:text-ui-fg-error text-sm px-2 py-1 rounded transition-colors"
                onClick={() => removeFeature(i)}
                title="Entfernen"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Add new feature */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-ui-border-base">
          <Input
            size="small"
            className="flex-1"
            placeholder="Neues Feature hinzufügen…"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addFeature()
              }
            }}
          />
          <Button size="small" variant="secondary" onClick={addFeature}>
            + Hinzufügen
          </Button>
        </div>
      </div>
      {/* Size Guide Editor */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <Text size="small" weight="plus" className="block">
            Grössentabelle
          </Text>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sgEnabled}
              onChange={(e) => {
                setSgEnabled(e.target.checked)
                setStatus("idle")
                if (e.target.checked && sgRows.length === 0) {
                  // Add a default empty row
                  setSgRows([sgColumns.map(() => "")])
                }
              }}
              className="accent-[#2d6a4f]"
            />
            <Text size="small" className="text-ui-fg-subtle">
              Aktiviert
            </Text>
          </label>
        </div>
        <Text size="small" className="text-ui-fg-subtle mb-3 block">
          Konfiguriere die Grössentabelle für dieses Produkt. Wird auf der
          Produktdetailseite als Popup angezeigt.
        </Text>

        {sgEnabled && (
          <div className="space-y-3">
            {/* Column headers */}
            <div>
              <Text size="xsmall" className="text-ui-fg-muted mb-1 block">
                Spaltenüberschriften
              </Text>
              <div className="flex items-center gap-1 flex-wrap">
                {sgColumns.map((col, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <Input
                      size="small"
                      value={col}
                      onChange={(e) => {
                        const updated = [...sgColumns]
                        updated[i] = e.target.value
                        setSgColumns(updated)
                        setStatus("idle")
                      }}
                      style={{ width: "130px" }}
                    />
                    {sgColumns.length > 2 && (
                      <button
                        type="button"
                        className="text-ui-fg-subtle hover:text-ui-fg-error text-xs px-1"
                        onClick={() => {
                          setSgColumns((prev) => prev.filter((_, j) => j !== i))
                          setSgRows((prev) =>
                            prev.map((row) => row.filter((_, j) => j !== i))
                          )
                          setStatus("idle")
                        }}
                        title="Spalte entfernen"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => {
                    setSgColumns((prev) => [...prev, "Neu"])
                    setSgRows((prev) => prev.map((row) => [...row, ""]))
                    setStatus("idle")
                  }}
                >
                  + Spalte
                </Button>
              </div>
            </div>

            {/* Rows */}
            <div>
              <Text size="xsmall" className="text-ui-fg-muted mb-1 block">
                Zeilen ({sgRows.length})
              </Text>
              <div className="space-y-1">
                {sgRows.map((row, ri) => (
                  <div key={ri} className="flex items-center gap-1">
                    {row.map((cell, ci) => (
                      <Input
                        key={ci}
                        size="small"
                        value={cell}
                        placeholder={sgColumns[ci] || ""}
                        onChange={(e) => {
                          const updated = sgRows.map((r) => [...r])
                          updated[ri][ci] = e.target.value
                          setSgRows(updated)
                          setStatus("idle")
                        }}
                        style={{ width: "130px" }}
                      />
                    ))}
                    <button
                      type="button"
                      className="text-ui-fg-subtle hover:text-ui-fg-error text-sm px-2 py-1 rounded transition-colors"
                      onClick={() => {
                        setSgRows((prev) => prev.filter((_, j) => j !== ri))
                        setStatus("idle")
                      }}
                      title="Zeile entfernen"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <Button
                size="small"
                variant="secondary"
                className="mt-2"
                onClick={() => {
                  setSgRows((prev) => [...prev, sgColumns.map(() => "")])
                  setStatus("idle")
                }}
              >
                + Zeile hinzufügen
              </Button>
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductFeaturesWidget
