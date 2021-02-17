export function intersection(arr1, arr2) {
  return arr1.filter((el) => arr2.includes(el));
}

export function parseContractMethods(contract) {
  const allMethods = Object.keys(contract.methods);
  const methods = allMethods
    .map((method) => {
      const args = [];
      if (!method.includes("0x") && !method.includes("(")) {
        const shape = allMethods.find(
          (m) => m.startsWith(method + "(") && m !== method + "()"
        );
        if (shape) {
          const params = shape.split(",");
          for (let i = 0; i < params.length; i++) {
            args.push(0);
          }
        }
        const signature = contract.methods[method](...args)._method.signature;
        return { method, signature };
      } else if (method.includes("0x")) {
        return { method };
      }
    })
    .filter((m) => m);
  console.log(methods);
}

export function convertValue(value) {
  return Number(value) * 0.000000000000000001;
}

export function parseAddress(address) {
  if (!address) return null;
  return address.toLowerCase();
}

export function merge(array, data) {
  const idx = array.findIndex((e) => e.id === data.id);
  if (idx < 0) return [...array, data];
  array[idx] = data;
  return array;
}
