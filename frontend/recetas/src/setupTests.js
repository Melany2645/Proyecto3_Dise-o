// Matchers de Testing Library para el DOM: toBeInTheDocument, toHaveFocus, etc.
import "@testing-library/jest-dom";
// Matcher toHaveNoViolations: revisa reglas WCAG / WAI-ARIA con axe-core.
import { toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

beforeEach(() => {
  window.location.hash = "";
  document.title = "";
});

afterEach(() => {
  jest.restoreAllMocks();
});
