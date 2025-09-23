const pushMock = jest.fn();

export const useRouter = jest.fn().mockReturnValue({
  push: pushMock,
  replace: jest.fn(),
  prefetch: jest.fn(),
});

export const useSearchParams = jest.fn().mockReturnValue({
  get: jest.fn(),
});

export { pushMock };
