# MerchantAgent Backend (FastAPI)

## 1. Setup Virtual Environment

### Windows (PowerShell)
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### Windows (Command Prompt)
```cmd
python -m venv venv
venv\Scripts\activate.bat
```

### macOS / Linux
```bash
python3 -m venv venv
source venv/bin/activate
```

---

## 2. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 3. Environment Configuration

```bash
cp .env.example .env
```

---

## 4. Database Migrations (Alembic)

### Initialize Async Alembic (Already configured)
```bash
alembic init -t async alembic
```

### Generate Migration from SQLAlchemy Models
```bash
alembic revision --autogenerate -m "create_users_addresses_merchant_profiles"
```

### Apply Migrations to Database
```bash
alembic upgrade head
```

### Rollback Migration (if needed)
```bash
alembic downgrade -1
```

---

## 5. Run Development Server

```bash
uvicorn app.main:app --reload --port 8000
```

---

## 6. API Documentation & Health Check

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health/