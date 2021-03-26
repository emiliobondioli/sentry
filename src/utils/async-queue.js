export default class AsyncQueue {
  constructor() {
    this.tasks = [];
    this.id = 0;
  }

  add(method, params) {
    let resolve;
    const promise = new Promise((res) => {
      resolve = res;
    });
    this.tasks.push({ method, params, id: this.id, resolve });
    this.id++;
    return promise;
  }

  async process() {
    while (this.tasks.length) {
      await Promise.all(
        this.tasks.splice(0, 1).map(async (task) => {
          return await task.method(task.params).then((r) => task.resolve(r));
        })
      );
    }
  }
}
