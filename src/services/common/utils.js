/**
 * Allows the use of multiple sets of promises for each pool,
 */
export class BatchRequest {
  constructor() {
    this.promises = [];
    this.calls = [];
    this.modifier = null;
  }

  /**
   * Adds a contract method and modifier to the batch
   * @param {function} method contract method to be called
   * @param {function} modifier function to modify the returned value before resolving
   */
  add(method, modifier = (r) => r, defaultBlock = "latest") {
    this.promises.push(
      new Promise((resolve, reject) => {
        this.calls.push({
          method,
          defaultBlock,
          result: (e, r) => {
            if (e) reject(e);
            else resolve(modifier(r));
          },
        });
      })
    );
  }

  /**
   * Adds all batch calls to the provided request
   * @param {w3.BatchRequest} request
   */
  addToRequest(request) {
    this.calls.forEach((c) => {
      request.add(c.method.call.request({}, c.defaultBlock, c.result));
    });
    return this.all();
  }

  /**
   * Returns a Promise resolved once all calls are done
   */
  async all() {
    const r = await Promise.all(this.promises);
    if (this.modifier) return this.modifier(r);
    return r;
  }
}
