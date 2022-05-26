export const unwrapValue = (e: Event) => (e.target as HTMLInputElement | HTMLSelectElement).value // ¯\_(ツ)_/¯

export const assertNotNull = <T>(value: T) => {
  if (value === null) {
    throw new Error('Value is null')
  } else {
    return value as NonNullable<T>
  }
}

export const getElement = <E extends Element>(parent: ParentNode, selector: string) => {
  return assertNotNull(parent.querySelector(selector)) as E
}
