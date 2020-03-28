'use strict'
module.exports = {
    devServer: {
        proxy: {
            '/api': {    //将www.exaple.com印射为/apis
                target: 'https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com',  // 接口域名
                secure: true,  // 如果是https接口，需要配置这个参数
                changeOrigin: true,  //是否跨域
                pathRewrite: {
                    '^/api': ''   //需要rewrite的,
                }
            }
        }
    }
}