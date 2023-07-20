import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export function userEventSetup(jsx) {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  }
}
