function baseFlatten(array, depth, result) {
  result || (result = []);

  if (array == null) {
    return result;
  }

  for (let i = 0; i < array.length; i++) {
    const value = array[i];
    if (depth > 0) {
      if (depth > 1) {
        // Recursively flatten arrays (susceptible to call stack limits).
        baseFlatten(value, depth - 1, result);
      } else {
        if (Array.isArray(value)) {
          result.push(...value);
        } else {
          result.push(value);
        }
      }
    } else {
      result[result.length] = value;
    }
  }
  return result;
}

const array = [12, [2, 3, 1, [321312]]];

console.log(baseFlatten(array, 3));
