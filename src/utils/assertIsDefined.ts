type AssertIsDefined = <T>(val: T) => asserts val is NonNullable<T>;
export const assertIsDefined: AssertIsDefined = <T>(
  val: T
): asserts val is NonNullable<T> => {
  if (val === undefined || val === null)
    throw `Expected 'val' to be defined, but received ${val}`; // using AssertionError fails to build with: "Error: 'AssertionError' is not exported by __vite-browser-external"
};

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;
  describe("assertIsDefined", () => {
    it("throws if val is undefined", () => {
      expect(() => assertIsDefined(undefined)).toThrowError();
    });
    it("throws if val is null", () => {
      expect(() => assertIsDefined(null)).toThrowError();
    });
    it("does not throw if val is defined", () => {
      expect(() => assertIsDefined("")).not.toThrowError();
    });
  });
}
