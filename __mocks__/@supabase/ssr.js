// __mocks__/@supabase/ssr.js

export const mockedSupabase = {
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: {
        user: {
          id: "mockedUserId12345",
          email: "test@email.com",
        },
      },
      error: null,
    }),
    signInWithPassword: jest.fn().mockResolvedValue({
      user: { id: "mockedUserId12345", email: "test@email.com" },
      error: null,
    }),
    onAuthStateChange: jest.fn().mockImplementation((callback) => {
      // Simulate the callback execution if needed for the test
      const fakeSession = { user: { id: "mockedUserId12345" } };
      callback("SIGNED_IN", fakeSession);

      // Return the correct structure that the code expects
      return {
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      };
    }),
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: [
        {
          display_name: "John Doe",
          avatar_url: "https://example.com/avatar.jpg",
        },
      ],
      error: null,
    }),
  }),
};

export const createBrowserClient = jest.fn().mockReturnValue(mockedSupabase);
