## nginx使用

### 配置https

1. https证书是需要购买的，去阿里购买就行了。购买完成后下载该私钥文件(.key文件)和证书文件(.crt文件)；
2. 为项目上线后所需要的域名配置dns域名解析，这个去阿里云做配置就好了。
3. 我这边没有修改nginx的默认，把刚才购买后的https证书放在nginx根目录下的certs文件夹内部。在nginx的配置文件下，增加一个server，监听443端口，然后写好 ssl_certificate_key 和 ssl_certificate对应的证书的目录。因为已经在阿里云配置好了域名解析，所以我们这边的server_name就写配置好的域名就好：例如，baidu.com；
4. 为我们写的server增加location指令，前端以后打包出来静态文件就部署在这个下面。在/var/www/下面建立一个文件夹 baidu_prod用来存放文件。

配置完成后，大概有如下配置：
```bash
server {
  listen 443 ssl; 
  ssl_certificate_key certs/2240286_baidu.com.key;
  ssl_certificate certs/2240286_baidu.com.pem;
  ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
  ssl_ciphers         HIGH:!aNULL:!MD5;
  server_name baidu.com;

  location / {
    index index.html;
     try_files $uri $uri/ /index.html;
     root /var/www/baidu_prod
  }
}
```

5. 为了验证是否成功，nginx -t。看到success后代表我们的配置生效了。可以在/var/www/baidu_prod下建立一个index.html。访问：https://www.baidu.com，能看到该index.html文件就大功告成了，之后只需要做前端工程的开发了。

## 使用nginx做转发

#### 产品那边经常会有一些这样子的需求。需要做一个h5页面，这个页面是孤立的，不需要和外部有任何的联系，而且还不需要登陆。

#### 为什么做这个转发？

1. 如果不做转发，那么像这样子的页面，就会变的比较多，需要统一管理
2. 这个子域名配置十分松散，难管理
3. ...

结论：难管理！！！

#### 转发策略

目的：最终效果。我们希望访问 https://www.baidu.com/pageA的时候，会转发到页面pageA。https://www.baidu.com/pageB，会转发到页面pageB。就算产品有再多的上方这种页面，我们只需要配置转发就好了

#### 配置

1. 建立pageA的文件夹，把前端打包好的文件夹放在pageA目录下，注意只需要dist下的所有文件，index.html需要放在pageA下目录就ok。
```bash 
# 脚本执行
cd /var/www
mkdir pageA
```
2. 打开nginx的配置，找到baidu.com的server的配置
```bash
location /pageA {
  index index.html;
  proxy_pass http://pageA.baidu.com/pageA/;
  # http://pageA.baidu.com/pageA/
  # pageA 这个参数需要前端在webpack打包的时候做配置 publicPath: '/pageA'。这样，你打包后webpack一般会有如下显示  http://localhost:8081/pageA/，打开dist，目录结构是 /dist/pageA/index.html就ok了
}
```
然后为域名：http://pageA.baidu.com在阿里云增加DNS域名解析，写入以下配置。
```bash
server {
  listen 80;
  server_name pageA.baidu.com;
  root /var/www/pageA;

  location / {
    index index.html;
    try_files $uri $uri/ /pageA/index.html; #nginx 查找文件为 /pageA/pageA .....，直到找到index.html
  }
}
```
然后重启nginx，执行脚本：
```bash
nginx -s reload
```

3. 访问https://www.baidu.com/pageA和访问 https://www.pageA.baidu.com/pageA应该是一样的效果。如果出现403 或者500一般是nginx的目录不对，调整以下即可。到这里为止，我们就完成了整个转发过程。

4. 当有pageB需要转发。则只需要做两个事情：1.为baidu.com的server增加一个location匹配/pageB，2.写pageB的server。这个时候所有的h5页面都在baidu.com这个server中有记录了。清晰多了，不是吗？

## nginx转发的缺点（配合vue-router或者react-router的使用）

假如转发后的pageA是一个vue或者react应用，并且修改了url，场景如下：
```javascript
// 假设有下面的router
const routes = [
      {
      path: '/', //根目录就是pageA，访问https://www.baidu.com/pageA和访问https://www.pageA.baidu.com/pageA
      component: () => import('./pages/orderConsultant')
    },
      {
      path: '/test',
      name: 'product_list',
      component: () => import('./pages/productList/productList')
    },
]
```
#### 问题出现的原因

当这个单页面的位置为路由 /test的时候，此时浏览器的地址是 https://www.baidu.com/pageA/test。测试如果刷新页面，那么路径/pageA/test 无法匹配到ngnix任何的location。就出现了500。因为对于https://www.baidu.com/pageA/test这样子的访问，nginx会认为你要访问文件目录/pageA/test，显然，我们没有/test这个目录。出现了500或者403

尝试方式：
1. 尝试过重定向，/test/* 全部转发到/test，那样出现了问题，比如我在/test/pageA刷新，nginx策略就会把我重定向/test，本来路径pageA对应一个组件，但是丢失了该路径信息，回到了根目录，就出现错误了。没有合适的规则去匹配react-router 或者 vue-router这种/A/B这种路径，因为nginx在匹配转发策略的时候会认为 /A/B是目录A下的目录B，从而导致404或者403，然后也就出错了。对应的配置如下
```bash
# location /pageA 上写如下配置：
rewrite ~^ /pageA/* /pageA;
```

## 结论
不要使用nginx去转发一个使用了react-router 或者 vue-router的应用页面。因为那样会出现错误。正确的解决方式应该为每一个 使用了react-router 或者 vue-router的应用的页面都直接写一个server，不经过任何nginx的转发。nginx转发适合那些完全的单页面，地址不会发生变化的单页面应用。
