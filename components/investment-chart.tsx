"use client"

import React from "react"

type Point = { t: number; v: number }
export function InvestmentChart({
  data,
  width = 600,
  height = 200,
  stroke = "#0A2540",
}: {
  data: Point[]
  width?: number
  height?: number
  stroke?: string
}) {
  const pad = 24
  const w = width
  const h = height

  // Sanitize data: keep only finite points
  const cleaned = (Array.isArray(data) ? data : []).filter(
    (d) => Number.isFinite(d?.t) && Number.isFinite(d?.v)
  )

  // If no valid points, render an empty grid fallback
  if (cleaned.length === 0) {
    return (
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Gráfico vazio">
        <rect x="0" y="0" width={w} height={h} fill="#FFFFFF" />
        {[0.25, 0.5, 0.75].map((p) => (
          <line key={p} x1={pad} y1={p * h} x2={w - pad} y2={p * h} stroke="#E5E7EB" strokeDasharray="4 4" />
        ))}
      </svg>
    )
  }

  const xs = cleaned.map((d) => d.t)
  const ys = cleaned.map((d) => d.v)

  // Safe min/max with defaults
  const minX = Number.isFinite(Math.min(...xs)) ? Math.min(...xs) : 0
  const maxX = Number.isFinite(Math.max(...xs)) ? Math.max(...xs) : minX + 1
  const minY = Number.isFinite(Math.min(...ys)) ? Math.min(...ys) : 0
  const maxY = Number.isFinite(Math.max(...ys)) ? Math.max(...ys) : minY + 1

  const xDen = maxX - minX || 1
  const yDen = maxY - minY || 1

  const xScale = (x: number) => pad + ((x - minX) / xDen) * (w - 2 * pad)
  const yScale = (y: number) => h - pad - ((y - minY) / yDen) * (h - 2 * pad)

  const path = cleaned
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(d.t)} ${yScale(d.v)}`)
    .join(" ")

  const last = cleaned[cleaned.length - 1]
  const cx = xScale(last.t)
  const cy = yScale(last.v)
  const canDrawLast = Number.isFinite(cx) && Number.isFinite(cy)

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Gráfico de valor do portfólio">
      <rect x="0" y="0" width={w} height={h} fill="#FFFFFF" />
      {[0.25, 0.5, 0.75].map((p) => (
        <line key={p} x1={pad} y1={p * h} x2={w - pad} y2={p * h} stroke="#E5E7EB" strokeDasharray="4 4" />
      ))}
      <path d={path} fill="none" stroke={stroke} strokeWidth={2} />
      {canDrawLast && <circle cx={cx} cy={cy} r={3} fill={stroke} />}
    </svg>
  )
}
