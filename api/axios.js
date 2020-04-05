import axios from 'axios';

// 根据不同的状态码，生成不同的提示信息
const showStatus = status => {
  let message = '';
  // 这一坨代码可以使用策略模式进行优化
  switch (status) {
    case 400:
      message = '请求错误(400)';
      break;
    case 401:
      message = '未授权，请重新登录(401)';
      break;
    case 403:
      message = '拒绝访问(403)';
      break;
    case 404:
      message = '请求出错(404)';
      break;
    case 408:
      message = '请求超时(408)';
      break;
    case 500:
      message = '服务器错误(500)';
      break;
    case 501:
      message = '服务未实现(501)';
      break;
    case 502:
      message = '网络错误(502)';
      break;
    case 503:
      message = '服务不可用(503)';
      break;
    case 504:
      message = '网络超时(504)';
      break;
    case 505:
      message = 'HTTP版本不受支持(505)';
      break;
    default:
      message = `连接出错(${status})!`;
  }
  return `${message}，请检查网络或联系管理员！`;
};

const service = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? `/` : '/apis',
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  },
  withCredentials: true,
  timeout: 10000,
  validateStatus: function() {
    return true;
    // 业务中自行判断
    // 如果候选是基于http statusCode就需要这一行
    // 如果所有的异常请求代码通过http 200返回，那么不需要该函数
  },
  transformRequest: [
    function(data) {
      data = JSON.stringify(data);
      return data;
    }
  ],
  // 在传递给 then/catch 前，修改响应数据
  transformResponse: [
    data => {
      if (typeof data === 'string' && data.startsWith('{')) {
        data = JSON.parse(data);
      }
      return data;
    }
  ]
});

// 请求拦截器
service.interceptors.response.use(
  response => {
    const { status, data } = response;
    let msg = '';
    if (status < 200 || status >= 300) {
      // 处理http错误，抛到业务代码
      msg = showStatus(status);
      if (typeof data === 'string') {
        data = { msg };
      } else {
        data = { ...data, msg };
      }
    }
    return response;
  },
  error => {
    error.data = {};
    error.data.msg = '请求超时或服务器异常，请检查网络或联系管理员！';
    // 这个错误可以在services层主动捕获或者不捕获
    return Promise.resolve(error);
  }
);
