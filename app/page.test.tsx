import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SmartCityEventsMapContent from "./page";
import Page from "./auth/login/page";
import "@testing-library/jest-dom";
import * as dotenv from "dotenv";
import { mockedSupabase } from "../__mocks__/@supabase/ssr";
import { pushMock } from "../__mocks__/next/navigation";
import { act } from "react";
import AuthButton from "@/components/auth-button";
import { mockFetch } from "@/__mocks__/mock-fetch";
import ProfilePage from "./profile/page";

dotenv.config({ path: "./env.local" });

jest.mock("@supabase/ssr");

describe("SmartCityEventsMapContent", () => {
  beforeEach(() => {
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "my-cookie=value;",
    });
  });

  it("renders without crashing", () => {
    render(<SmartCityEventsMapContent />);
    expect(screen.getByText("Tartu Events")).toBeInTheDocument();
  });

  it("logs in with Supabase", async () => {
    console.log = jest.fn();

    render(<Page />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@email.com" },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "qwerty" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.queryByText(/logging in/i)).not.toBeInTheDocument();
    });

    expect(console.log).toHaveBeenCalledWith("worked");
    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("fetches and displays events", async () => {
    const fakeEvents = [
      {
        id: "1",
        title:
          "“Washing Machine Made of Beetroot: Resourcefulness in the Countryside”",
        description:
          "Event: “Washing Machine Made of Beetroot: Resourcefulness in the Countryside”",
        start_date: "2025-09-12T00:00:00",
        location_name: "Eesti Põllumajandusmuuseum",
        category: 1,
        latitude: 58.317483,
        longitude: 26.723589,
      },
      {
        id: "2",
        title: "Exhibition ‘Europe Plays’",
        description: "Event: Exhibition ‘Europe Plays’",
        start_date: "2025-09-12T00:00:00",
        location_name: "Tartu Mänguasjamuuseum",
        category: 1,
        latitude: 58.382244,
        longitude: 26.718055,
      },
    ];

    // Use the mock fetch function
    global.fetch = mockFetch(fakeEvents);

    render(<SmartCityEventsMapContent />);

    await waitFor(() => {
      expect(screen.getByText("Exhibition ‘Europe Plays’")).toBeInTheDocument();
    });
  });

  it("shows the avatar if user is logged in", async () => {
    const getUserSpy = jest.spyOn(mockedSupabase.auth, "getUser");

    getUserSpy.mockResolvedValueOnce({
      data: {
        user: {
          id: "mockedUserId12345",
          email: "test@email.com",
        },
      },
      error: null,
    });

    // Clear any previous calls to the mock to ensure a clean test
    (mockedSupabase.auth.onAuthStateChange as jest.Mock).mockClear();

    render(<AuthButton />);

    await waitFor(() => {
      expect(getUserSpy).toHaveBeenCalled();
    });

    // 1. Get the callback function passed to the original mock.
    const authStateChangeCallback = (
      mockedSupabase.auth.onAuthStateChange as jest.Mock
    ).mock.calls[0][0];

    // 2. Simulate the state change by calling the callback with the correct arguments.
    await act(async () => {
      authStateChangeCallback("SIGNED_IN", {
        user: {
          id: "mockedUserId12345",
          email: "test@email.com",
        },
      });
    });

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  it("displays user profile correctly", async () => {
    // Fake profile data to return from the mock
    const fakeProfileData = {
      display_name: "John Doe",
      avatar_url: "https://example.com/avatar.jpg",
      bio: "A short bio",
    };

    // Mock the `getUser` method to return the user ID
    const getUserSpy = jest.spyOn(mockedSupabase.auth, "getUser");
    getUserSpy.mockResolvedValueOnce({
      data: {
        user: {
          id: "mockedUserId12345",
          email: "test@email.com",
        },
      },
      error: null,
    });

    // Create mock functions for each chainable method in `supabase.from()`
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValueOnce({
      data: fakeProfileData,
      error: null,
    });

    // Mock the chainable methods of supabase.from()
    const getProfileSpy = jest
      .spyOn(mockedSupabase, "from")
      .mockReturnValueOnce({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

    // Render the ProfilePage component directly (no auth state change)
    render(<ProfilePage />);

    // Wait for the profile data to be fetched and displayed
    await waitFor(() => {
      expect(getProfileSpy).toHaveBeenCalledWith("profiles");
      expect(mockSelect).toHaveBeenCalledWith("display_name, avatar_url, bio");
      expect(mockEq).toHaveBeenCalledWith("id", "mockedUserId12345");
      expect(mockSingle).toHaveBeenCalled();
    });

    // Check if the profile data is displayed correctly
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("A short bio")).toBeInTheDocument();
  });
});
