/**
 * Validate if url contain '/', throw error.
 * Note: This checker are making sure url is consistent.
 *
 * @param {Object} target - The decorator binding object.
 * @param {string} propertyKey - The property name.
 * @param {TypedPropertyDescriptor<any>} descriptor - The descriptor value.
 * @returns {TypedPropertyDescriptor<any>}  - The descriptor.
 */
export default function (
  target: Object,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<any>): TypedPropertyDescriptor<any> {
    const originalMethod = descriptor.value;
    descriptor.value = function(...args: any[]) {
      const subUrl: string = args[0];
      // if contain "/" then throw error, else run origin method.
      if (/^\/(\w|-)+/.test(subUrl)) {
        throw new Error(`Sub url "${subUrl}" are formatting wrong!`);
      }
      return originalMethod.apply(this, args);
    };
  return descriptor;
};
