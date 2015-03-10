#require

### 简单代码显示
```js
 /**
   * 加载函数
   * @param deps
   * @param factory
   */
  function fnRequire([deps], factory) {
    ...
  }

  /**
   * 定义函数
   * @param id
   * @param deps
   * @param factory
   */
  function fnDefine([id], [deps], factory) {
    ...
  }
```

### 有问题？
有任何问题都可以留言 https://github.com/52css/require/issues/new

为什么仿seajs而不是requirejs
  - 小：体积比requirejs小很多
  - 巧：通过一个小巧的方法来实现
  - 懂：node以后（现在）是毕热的东西，写法仿node你说能不火吗
