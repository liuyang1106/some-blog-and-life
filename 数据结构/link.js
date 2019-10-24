/**
 * 节点构造方法
 * @param {any} val 
 */
function LinkNode(val){
  this.val = val || null
  this.next = null
}

/**
 * 节点工厂方法
 * @param {any} val 
 */
function createLinkNode(val){
  return new LinkNode(val)
}

/**
 * 单项链表定义：[维基百科](https://zh.wikipedia.org/wiki/%E5%8D%95%E5%90%91%E9%93%BE%E8%A1%A8)
 */
class Link{
  constructor(){
    this.head = createLinkNode()
    this.size = 0
  }

  /**
   * 为链表尾部增加一个节点
   * @param {any} val 
   */
  add(val){
    let currentNode = this.head
    while(currentNode.next !==null){
       currentNode = currentNode.next
    }
    currentNode.next = createLinkNode(val)
    this.size++
  }

  /**
   * 根据值删除链表的一个节点
   * @param {any} val 
   */
  removeBy(val){
    let currentNode = this.head, preNode = null
    while(currentNode.next !==null){
       if(currentNode.val === val){
        preNode.next = currentNode.next
        this.size --
        break
       }
       preNode = currentNode
       currentNode = currentNode.next
    }
  }

  /**
   * 根据值获取某个节点的值
   * @param {any} val 
   */
  get(val){
    let node = null
    let currentNode = this.head
    while(currentNode.next !==null){
      if(currentNode.val === val){
        node =  currentNode
        break
      }
      currentNode = currentNode.next
    }
    return node
  }

  /**
   * 清空链表
   */
  clear(){
    this.head.next = null
    this.size = 0
  }

}

const link = new Link()

const data = [1,2,3,4,5]

data.forEach(v => link.add(v))

console.log(link) // link链表

link.removeBy(1)

console.log(link) // 删除了val=1的link链表

console.log(link.get(3)) // 获取val=3的链表节点

link.clear()  // 清空link链表

console.log(link)
