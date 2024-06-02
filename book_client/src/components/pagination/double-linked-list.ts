class ListNode {
  private data: any;
  private next: ListNode | null;

  constructor(data: any) {
    this.data = data;
    this.next = null;
  }
}

class LinkedList {
  private head: ListNode | null;

  constructor(head = null) {
    this.head = head;
  }
}

export default LinkedList;
