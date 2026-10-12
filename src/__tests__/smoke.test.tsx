import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

describe("root page", () => {
  it("renders the dashboard loading state initially", () => {
    render(<Home />);
    expect(screen.getByTestId("dashboard-loading")).toBeInTheDocument();
  });
});
