// __mocks__/mock-fetch.ts
export function mockFetch(fakeEvents: any) {
  return jest.fn(
    () =>
      Promise.resolve({
        ok: true,
        status: 200, // Optionally add a status to mimic a successful response
        json: () => Promise.resolve(fakeEvents), // Return the fake events as JSON
      } as Response) // Type assertion to tell TypeScript it's a Response object
  );
}
