export function mockFetch(fakeEvents: any) {
  return jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(fakeEvents),
    } as Response)
  );
}
