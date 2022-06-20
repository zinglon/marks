export default <S>() => {
  const getValue = <Key extends keyof S & string>(key: Key): S[Key] | null =>
    JSON.parse(localStorage.getItem(key) ?? "null");

  const setValue = <Key extends keyof S & string>(key: Key, value: S[Key]) =>
    localStorage.setItem(key, JSON.stringify(value));
  return { getValue, setValue };
};
