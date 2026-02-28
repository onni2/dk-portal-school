# Testing — How To Guide

## How to run tests

```bash
# Run all tests once
npm test

# Run tests and re-run automatically when you save a file
npm run test:watch
```

That's it. If all tests pass you'll see green checkmarks. If something fails you'll see red with an explanation of what went wrong.

---

## Where do test files go?

Put them in a `__tests__` folder next to the code they test:

```
src/
  shared/
    components/
      PageTemplate.tsx
      __tests__/
        PageTemplate.test.tsx     <-- tests for PageTemplate
    utils/
      cn.ts
      __tests__/
        cn.test.ts                <-- tests for cn
  features/
    projects/
      components/
        ProjectCard.tsx
        __tests__/
          ProjectCard.test.tsx    <-- tests for ProjectCard
```

Name the file `<WhatYouAreTesting>.test.ts` (or `.test.tsx` if it has JSX).

---

## How to write a test (copy-paste this)

### Testing a function

```ts
import { describe, it, expect } from "vitest";
import { myFunction } from "../myFunction";

describe("myFunction", () => {
  it("does the thing I expect", () => {
    const result = myFunction("input");
    expect(result).toBe("expected output");
  });
});
```

### Testing a component

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MyComponent } from "../MyComponent";

describe("MyComponent", () => {
  it("shows the title", () => {
    // 1. Render the component
    render(<MyComponent title="Hello" />);

    // 2. Find something on screen
    const title = screen.getByText("Hello");

    // 3. Check it's there
    expect(title).toBeInTheDocument();
  });
});
```

### Testing a button click

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { Counter } from "../Counter";

describe("Counter", () => {
  it("increases when you click the button", async () => {
    const user = userEvent.setup();

    render(<Counter />);

    // Click the button
    await user.click(screen.getByRole("button", { name: "Add" }));

    // Check the number changed
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
```

---

## Cheat sheet — common checks

| What you want to check | Code                                                                        |
| ---------------------- | --------------------------------------------------------------------------- |
| Text is on screen      | `expect(screen.getByText("Hello")).toBeInTheDocument()`                     |
| Text is NOT on screen  | `expect(screen.queryByText("Hello")).not.toBeInTheDocument()`               |
| Button exists          | `screen.getByRole("button", { name: "Save" })`                              |
| Input exists           | `screen.getByRole("textbox")` or `screen.getByPlaceholderText("Search...")` |
| Value equals something | `expect(result).toBe("hello")`                                              |
| Array has length       | `expect(items).toHaveLength(3)`                                             |
| Object has property    | `expect(obj).toHaveProperty("name")`                                        |
| Something is truthy    | `expect(value).toBeTruthy()`                                                |

---

## Tips

- **Start small.** One test is better than zero tests.
- **Test what the user sees**, not internal code. If the user sees a title, test that the title shows up.
- **`getByText`** throws an error if it can't find the text — that's the test failing, which is what you want.
- **`queryByText`** returns `null` instead of throwing — use this when you want to check something is NOT there.
- If your test needs the router or query client, ask Onni for help — there's extra setup for that.
