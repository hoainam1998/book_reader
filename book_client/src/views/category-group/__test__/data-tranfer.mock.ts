class DataTransfer {
  items: any;
  files: any;
  constructor() {
    const foo = document.createElement('input');
    foo.type = 'file';
    /**
     * You can't construct a FileList, so we have to steal one.
     */
    const fileList: any = foo.files;
    const arr: any = [];

    /**
     * Bolt on DataTransferItemList things so we can manipulate and reuse it.
     */
    const fileListProxy = new Proxy(fileList, {
      get(target, prop, receiver) {
        if (prop === 'add') {
          return (x: any) => {
            arr.push(x);
          };
        } else if (prop === 'length') {
          return arr.length;
        } else if (arr[prop]) {
          return arr[prop];
        }

        return [];
      }
    });

    this.items = fileListProxy;
    this.files = fileListProxy;
  }
};

export default DataTransfer;
