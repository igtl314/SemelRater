import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CategoryRatingInput, CATEGORY_LABELS } from "./CategoryRatingInput";

const emptyValues = {
  gradde: "",
  mandelmassa: "",
  lock: "",
  helhet: "",
  bulle: "",
};

describe("CategoryRatingInput", () => {
  it("should render all 5 category rating inputs", () => {
    render(<CategoryRatingInput values={emptyValues} onChange={() => {}} />);

    expect(screen.getByLabelText(/grädde/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mandelmassa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/lock/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bulle/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/helhet/i)).toBeInTheDocument();
  });

  it("should render inputs with correct min/max values", () => {
    render(<CategoryRatingInput values={emptyValues} onChange={() => {}} />);

    const inputs = screen.getAllByRole("spinbutton");
    expect(inputs).toHaveLength(5);

    inputs.forEach((input) => {
      expect(input).toHaveAttribute("min", "1");
      expect(input).toHaveAttribute("max", "5");
    });
  });

  it("should call onChange with correct category when value changes", () => {
    const handleChange = vi.fn();
    render(<CategoryRatingInput values={emptyValues} onChange={handleChange} />);

    const graddeInput = screen.getByLabelText(/grädde/i);
    fireEvent.change(graddeInput, { target: { value: "4" } });

    expect(handleChange).toHaveBeenCalledWith("gradde", "4");
  });

  it("should display provided values", () => {
    const filledValues = {
      gradde: "5",
      mandelmassa: "4",
      lock: "3",
      helhet: "5",
      bulle: "4",
    };
    render(<CategoryRatingInput values={filledValues} onChange={() => {}} />);

    expect(screen.getByLabelText(/grädde/i)).toHaveValue(5);
    expect(screen.getByLabelText(/mandelmassa/i)).toHaveValue(4);
    expect(screen.getByLabelText(/lock/i)).toHaveValue(3);
    expect(screen.getByLabelText(/helhet/i)).toHaveValue(5);
    expect(screen.getByLabelText(/bulle/i)).toHaveValue(4);
  });

  it("should have all inputs marked as required", () => {
    render(<CategoryRatingInput values={emptyValues} onChange={() => {}} />);

    CATEGORY_LABELS.forEach(({ label }) => {
      const input = screen.getByLabelText(new RegExp(label.split(" ")[0], "i"));
      expect(input).toBeRequired();
    });
  });
});
