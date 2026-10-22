import type React from "react"

export function InfoRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-sm font-medium ${valueClass ?? ""}`}>{value}</div>
    </div>
  )
}

export function Tip({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5">{icon}</div>
      <div>
        <div className="text-sm font-medium" style={{ color: "#0A2540" }}>
          {title}
        </div>
        <div className="text-sm text-muted-foreground">{text}</div>
      </div>
    </div>
  )
}
