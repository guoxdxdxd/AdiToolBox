# 使用nginx作为基础镜像，指定具体版本
FROM nginx:1.24.0-alpine

# 设置工作目录
WORKDIR /usr/share/nginx/html

# 复制项目文件
COPY . .

# 复制nginx配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 设置适当的权限
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# 使用非root用户
USER nginx

# 暴露80端口
EXPOSE 80

# 添加健康检查
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# 使用nginx默认命令启动服务
CMD ["nginx", "-g", "daemon off;"] 