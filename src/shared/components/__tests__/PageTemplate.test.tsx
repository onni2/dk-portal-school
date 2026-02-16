import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PageTemplate } from "../PageTemplate";

describe("PageTemplate", () => {
  it("shows the title", () => {
    render(<PageTemplate title="Yfirlit">Content here</PageTemplate>);

    expect(screen.getByText("Yfirlit")).toBeInTheDocument();
  });

  it("shows the description when provided", () => {
    render(
      <PageTemplate title="Yfirlit" description="Velkomin í DK Portal">
        Content here
      </PageTemplate>,
    );

    expect(screen.getByText("Velkomin í DK Portal")).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    render(<PageTemplate title="Yfirlit">Content here</PageTemplate>);

    expect(screen.queryByText("Velkomin í DK Portal")).not.toBeInTheDocument();
  });

  it("renders children", () => {
    render(
      <PageTemplate title="Test">
        <p>Hello world</p>
      </PageTemplate>,
    );

    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders action buttons when provided", () => {
    render(
      <PageTemplate title="Test" actions={<button>Nýtt</button>}>
        Content
      </PageTemplate>,
    );

    expect(screen.getByText("Nýtt")).toBeInTheDocument();
  });
});
