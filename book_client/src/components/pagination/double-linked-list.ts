class ListNode<T> {
  private data: any;
  private next: ListNode<T> | null;
  private previous: ListNode<T> | null;

  constructor(data: T) {
    this.data = data;
    this.next = null;
    this.previous = null;
  }
}

class LinkedList<T> {
  private head: ListNode<T> | null;

  constructor(head = null) {
    this.head = head;
  }
}

export default LinkedList;
