/* eslint-disable no-use-before-define */
export class Node<T> {
  data: T;
  next: Node<T> | null;
  previous: Node<T> | null;

  constructor(data: T) {
    this.data = data;
    this.next = null;
    this.previous = null;
  }
}

class LinkedList {
  private static array: unknown[];
  private static nodes: Node<unknown>[] = [];

  static insertToArray<T>(node: Node<T>): void {
    LinkedList.nodes.push(node);
  }

  static createdFromArray<T>(array: T[]): void {
    this.array = array;
    this.nodes = [];
    this.createNodes();
  }

  static get Nodes(): Node<unknown>[] {
    return LinkedList.nodes;
  }

  private static createNodes(): void {
    const createNode = (index = 0, previousNode: Node<unknown> | null = null) => {
      const node = new Node<unknown>(this.array[index]);
      node.previous = previousNode;
      node.next = null;

      if (previousNode) {
        previousNode.next = node;
      }

      LinkedList.insertToArray(node);

      index = index + 1;
      if (index < this.array.length) {
        createNode(index, node as Node<unknown>);
      }
    };
    createNode();
  }
}

export default LinkedList;
