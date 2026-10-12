import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

describe("root page", () => {
  it("renders the dashboard placeholder", () => {
    render(<Home />);
    expect(screen.getByText(/dashboard placeholder/i)).toBeInTheDocument();
  });
});
