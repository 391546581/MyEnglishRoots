# RootFlow Kubernetes 部署指南

本项目提供了标准的 K8S 部署文件，支持持久化存储 SQLite 数据库。

## 1. 准备镜像

首先，您需要构建 Docker 镜像并推送到镜像仓库。

```bash
# 构建镜像
docker build -t your-registry/rootflow:latest .

# 推送镜像
docker push your-registry/rootflow:latest
```

*注意：请将 `your-registry` 替换为您实际使用的仓库地址。*

## 2. 部署步骤

按照以下顺序应用 Kubernetes 配置文件：

### B. 部署应用 (方式一：标准 PVC 模式)
如果您希望让 K8S 自动管理存储空间，使用标准的存储声明。

```bash
kubectl apply -f k8s/pvc.yaml
kubectl apply -f k8s/deployment.yaml
```

### B. 部署应用 (方式二：本地目录映射模式 - 推荐开发使用)
如果您希望直接在容器中使用您宿主机上的 `dev.db` 和 `data/` 目录，可以使用 `hostPath` 映射。

1. 编辑 `k8s/deployment-hostpath.yaml` 中的 `hostPath.path`。
2. **Windows 用户注意**：如果您使用的是 Docker Desktop，路径需要转换为类似以下格式：
   - 原始路径：`D:\MyEnglishRoots\rootflow\prisma`
   - K8S 格式：`/host_mnt/d/MyEnglishRoots/rootflow/prisma`

```bash
kubectl apply -f k8s/deployment-hostpath.yaml
```

### C. 配置域名访问 (Ingress - 可选)
如果您配置了 Ingress Controller（如 Nginx Ingress），可以启用域名访问。

```bash
kubectl apply -f k8s/ingress.yaml
```

部署完成后，在 `hosts` 文件中添加：
`127.0.0.1 rootflow.local`

## 3. 初始化数据库

由于使用了外部卷挂载 `/app/prisma` 目录，初次启动时该目录可能是空的。您需要手动执行数据库初始化：

```bash
# 获取 Pod 名称
export POD_NAME=$(kubectl get pods -l app=rootflow -o jsonpath="{.items[0].metadata.name}")

# 执行迁移和种子数据
kubectl exec $POD_NAME -- npx prisma migrate deploy
kubectl exec $POD_NAME -- npm run seed
```

## 4. 常用维护命令

- **查看日志**: `kubectl logs -f deployment/rootflow`
- **查看状态**: `kubectl get all -l app=rootflow`
- **重启应用**: `kubectl rollout restart deployment/rootflow`
