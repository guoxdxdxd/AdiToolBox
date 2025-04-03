# 使用nginx作为基础镜像
FROM nginx:alpine

# 将项目文件复制到nginx的默认静态文件目录
COPY . /usr/share/nginx/html/

# 暴露80端口
EXPOSE 80

# 使用nginx默认命令启动服务
CMD ["nginx", "-g", "daemon off;"] 