# 📘 SecureAI Gateway — Hướng dẫn Deploy (Helm Flow)

Dự án này sử dụng **Helm** để tự động hóa việc deploy các thành phần lên cụm Kubernetes mini (K3d) ở local. Đây là flow rất thực tế và chuyên nghiệp.

---

## 1. Cấu trúc thư mục Deployment

Tất cả cấu hình Kubernetes nằm trong thư mục `chart/`:

*   `chart/Chart.yaml`: Định nghĩa thông tin cơ bản của Helm chart.
*   `chart/values.yaml`: **Trái tim của dự án**. Nơi bạn tùy chỉnh MỌI THỨ (API Keys, số lượng Replicas, Cấu hình môi trường).
*   `chart/templates/`: Chứa các file YAML mẫu. Helm sẽ tự động "nhét" dữ liệu từ `values.yaml` vào các file này khi chạy.

---

## 2. Hướng dẫn Deploy từng bước

### Bước 1: Điền API Keys (Cực kỳ quan trọng)
Mở file `chart/values.yaml`. Cuộn xuống dưới cùng phần `secrets:`.
Bạn điền API Keys trực tiếp dưới dạng **text thô** (raw text).

> 💡 **Tin vui:** Bạn KHÔNG CẦN tự encode base64 bằng tay nữa! Template của Helm đã được cấu hình hàm `b64enc` để tự động mã hóa mọi thứ an toàn khi đưa vào Kubernetes.

```yaml
secrets:
  secretKey: "nhap_mat_khau_bi_mat_cua_ban"
  openaiApiKey: "sk-proj-key-cua-ban"
  geminiApiKey: "AIza-key-cua-ban"
  # ...
```

### Bước 2: Khởi chạy cụm và Deploy (1 Lệnh Duy Nhất)
Mở terminal tại thư mục project (`secureai-gateway`) và chạy:

```bash
bash setup-k3d.sh
# Hoặc dùng phím tắt Makefile:
# make deploy
```

**Kịch bản (Script) này sẽ tự động làm các việc sau:**
1. Tạo cụm K3d tên là `secureai-gateway` và mở cổng `8080`.
2. Build Docker images cho Backend và Frontend.
3. Import các images đó vào bên trong cụm K3d.
4. Chạy lệnh `helm upgrade --install` để deploy toàn bộ project (dựa trên file `values.yaml` bạn vừa sửa).

### Bước 3: Truy cập ứng dụng
Sau khi script chạy xong, đợi khoảng 30s - 1 phút để các Pod (container trong k8s) khởi động xong. Mở trình duyệt web của bạn:
*   **Frontend Dashboard:** `http://localhost:8080`
*   **Backend API Docs (Swagger):** `http://localhost:8080/api/docs`

---

## 3. Cách Update ứng dụng sau khi đã chạy

Nếu bạn thay đổi code Python/React hoặc sửa file `values.yaml` (ví dụ: đổi API Key, tăng `replicas` từ 1 lên 3):

**Cách 1: Chạy lại toàn bộ script (Khuyên dùng khi có SỬA CODE)**
Script sẽ build lại image mới và nhờ Helm update hệ thống:
```bash
bash setup-k3d.sh
```

**Cách 2: Cập nhật nhanh bằng Helm (Khi CHỈ SỬA file `values.yaml`)**
Không cần build lại image, chỉ cần apply config mới:
```bash
helm upgrade secureai-release ./chart --namespace secureai-gateway
```

---

## 4. Troubleshooting & Lệnh hay dùng (Cheatsheet)

### Kiểm tra hệ thống
```bash
kubectl get pods -n secureai-gateway      # Xem danh sách và trạng thái các Pods
kubectl get svc -n secureai-gateway       # Xem các Services (Redis, Postgres, Backend...)
```

### Xem logs (Để debug khi gặp lỗi)
```bash
kubectl logs -f deployment/backend -n secureai-gateway
kubectl logs -f deployment/frontend -n secureai-gateway
```

### Quản lý Helm Release (Cực kỳ mạnh mẽ)
```bash
helm list -n secureai-gateway             # Xem các phiên bản phần mềm đã cài đặt
helm history secureai-release -n secureai-gateway # Xem lịch sử các lần deploy (revision)
helm rollback secureai-release 1 -n secureai-gateway # Tính năng "quay xe": Lùi về phiên bản cũ (VD: revision 1) nếu bản mới bị lỗi
```

### Dọn dẹp (Xóa sạch sẽ toàn bộ project khỏi máy)
```bash
make clean
# Hoặc gõ lệnh thủ công:
# k3d cluster delete secureai-gateway
```
