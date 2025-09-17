import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SmartCityEventsMapContent from "./page";
import Page from "./auth/login/page";
import "@testing-library/jest-dom";
import * as dotenv from "dotenv";
import { mockFetch } from "../__mocks__/next/mock-fetch";

dotenv.config({ path: "./env.local" });
jest.mock("next/navigation");

describe("SmartCityEventsMapContent", () => {
  it("renders without crashing", () => {
    render(<SmartCityEventsMapContent />);
    expect(screen.getByText("Tartu Events")).toBeInTheDocument();
  });

  it("logs in with Supabase", async () => {
    render(<Page />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "mishadrogovoz@gmail.com" },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "qwerty" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.queryByText(/logging in/i)).not.toBeInTheDocument();
    });
  });

  it("fetches and displays events on button click", async () => {
    const fakeEvents = [
      { id: "1", name: "Haori Sewing" },
      {
        id: "2",
        name: "Triinu Jürves, Kaarel Kütas and Villem Jahu  “On Branch Road”",
      },
    ];

    global.fetch = mockFetch(fakeEvents);

    render(<SmartCityEventsMapContent />);

    setTimeout(function () {
      expect(
        screen.getByText(
          "Triinu Jürves, Kaarel Kütas and Villem Jahu  “On Branch Road”"
        )
      ).toBeInTheDocument();
    }, 1000);
  });
});
