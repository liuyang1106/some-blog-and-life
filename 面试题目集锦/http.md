## “三次握手”

1. 客户端发起建立连接的请求，并且发送给服务器建立连接请求的序号，客户端进入同步发送的状态
2. 服务器收到了连接请求，向客户端发起响应建立连接的请求，并发送同步的请求信号和确认完毕信号，服务器进入同步收到的状态
3. 客户端收到同步信号后，给服务器发送确认信号和同步信号。客户段此时为连接建立状态，服务器在收到确认和同步信号后也为连接建立状态。直接可以传输数据了
  
为什么客户端A还要发送一次确认呢？
为了防止已经失效的连接请求报文段突然有传送到了B服务器。
什么是失效的连接请求报文段？
A发送请求建立连接，但是A的报文段可能延迟了，对于A觉得这个报文段失效了，但是B却收到了一个有效的请求报文，于是将自己状态置为同步确认的状态，浪费了B的资源，因为此时A不会理会B的请求确认同步的报文段。

## “四次挥手”

1. A（客户端）发送请求关闭报文和确认序号
2. B（服务器）收到后发送确认信号和请求关闭确认信号，并且B将最后一次的数据发送给A。此时处于TCP连接处于半关闭状态（B处于关闭等待）
3. 此时B如果没有数据了发送给A了，就会发送关闭连接的信号给客户端，此时B状态为等待关闭
4. A收到信号后，发送确认信号给服务器B。B收到信号后关闭。A在2MSL后主动关闭

为什么等待2个时间周期关闭？
1. 和三次握手一样的原因
2. 防止最后一次的确认关闭的信号B没有收到，需要重传

## Https 连接的过程

SSL 安全套接字层
1. 协商加密算法。A向B发送浏览器的SSL版本号，告诉B一些可选的加密算法，B从中选取自己支持的算法，并告诉A。
2. 服务器鉴别。B向A发送一个包含B的RSA公钥数字证书，A会对起数字证书进行认证。
3. 会话密钥计算。浏览器A产生一个随机秘密数，用服务器的公钥加密后发送给B，双方根据协商的算法产生一个共享的对称会话密钥。
4. 安全数据传输。利用密钥加密和解密他们之间传送的数据并且认证其完整性。


TIP：上述的A说的是客户端，B指的是服务器