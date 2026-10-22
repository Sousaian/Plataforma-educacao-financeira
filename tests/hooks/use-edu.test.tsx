// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"
import { useCurrentUser } from "@/hooks/use-edu"
import { eduService } from "@/lib/services"

let renders = 0

function Balance() {
  renders++
  const user = useCurrentUser()
  return <span data-testid="balance">{user ? user.balance : "anon"}</span>
}

beforeEach(() => {
  localStorage.clear()
  renders = 0
})

describe("useCurrentUser (useSyncExternalStore + localStorage)", () => {
  it("renderiza um número estável de vezes e reage a mutações", () => {
    act(() => {
      eduService.logout()
    })
    render(<Balance />)
    expect(screen.getByTestId("balance").textContent).toBe("anon")

    act(() => {
      eduService.login("ana@escola.com", "1234")
    })
    expect(screen.getByTestId("balance").textContent).toBe("620")
    const afterLogin = renders

    act(() => {
      eduService.addCoinsDemo(25)
    })
    expect(screen.getByTestId("balance").textContent).toBe("645")
    expect(renders).toBe(afterLogin + 1)
    expect(renders).toBeLessThan(5)

    // grava nas mesmas chaves do localStorage
    expect(JSON.parse(localStorage.getItem("edu:current")!)).toBe(eduService.getCurrentUser()!.id)
    expect(localStorage.getItem("edu:users")).toContain("ana@escola.com")
  })
})
