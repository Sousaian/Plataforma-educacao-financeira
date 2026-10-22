// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/hooks/use-toast"

describe("Toaster", () => {
  it("renderiza o toast disparado por toast()", () => {
    render(<Toaster />)
    expect(screen.queryByText("Missão concluída!")).toBeNull()

    act(() => {
      toast({ title: "Missão concluída!", description: "Você ganhou 50 moedas." })
    })

    expect(screen.getByText("Missão concluída!")).toBeTruthy()
    expect(screen.getByText("Você ganhou 50 moedas.")).toBeTruthy()
  })
})
