import os, re, uuid, threading, json
from datetime import datetime, date, timedelta
from typing import Optional, List
from sqlalchemy import create_engine, text, Column, String, Integer, Float, DateTime, Text, Boolean, JSON, Date, func
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session
from fastapi import FastAPI, HTTPException, Depends, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

PORT = int(os.environ.get("COMPANY_PORT", 8000))
DATABASE_URL = os.environ.get("DATABASE_URL", "")
COMPANY_SLUG = re.sub(r"[^a-z0-9_]", "_", os.environ.get("COMPANY_SLUG", "pixelforge").lower())

STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "")
STRIPE_CONNECT_ID = os.environ.get("STRIPE_CONNECT_ID", "")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

_NANOCORP_BASE = 'https://nanocorp.app'
_NANOCORP_CO = 'PixelForge Studios'
_NANOCORP_TOKEN = 'f843b90d58663c9991d3ad64ab1bcaa7'

db_engine = None
SessionLocal = None

class Base(DeclarativeBase):
    pass

if DATABASE_URL:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    db_engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        connect_args={"options": f"-csearch_path={COMPANY_SLUG},public"},
    )
    SessionLocal = sessionmaker(bind=db_engine)
    with db_engine.connect() as _conn:
        _conn.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{COMPANY_SLUG}"'))
        _conn.commit()

class Tool(Base):
    __tablename__ = "tools"
    __table_args__ = {"schema": COMPANY_SLUG}
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    status = Column(String, default="active")
    usage = Column(Integer, default=0)
    config = Column(JSON, default=dict)
    analytics = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": COMPANY_SLUG}
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, nullable=False, unique=True)
    name = Column(String, default="")
    plan = Column(String, default="free")
    mrr = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Subscription(Base):
    __tablename__ = "subscriptions"
    __table_args__ = {"schema": COMPANY_SLUG}
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_email = Column(String, nullable=False, index=True)
    plan = Column(String, nullable=False)
    status = Column(String, default="active")
    next_billing = Column(Date, default=lambda: datetime.utcnow().date())
    stripe_session_id = Column(String, nullable=True)
    stripe_customer_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Lead(Base):
    __tablename__ = "leads"
    __table_args__ = {"schema": COMPANY_SLUG}
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, nullable=False)
    name = Column(String, default="")
    source = Column(String, default="web")
    status = Column(String, default="new")
    created_at = Column(DateTime, default=datetime.utcnow)

class Activity(Base):
    __tablename__ = "activities"
    __table_args__ = {"schema": COMPANY_SLUG}
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    action = Column(String, nullable=False)
    description = Column(Text, default="")
    entity_type = Column(String, default="tool")
    entity_id = Column(String, nullable=True)
    user_email = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

class ChartData(Base):
    __tablename__ = "chart_data"
    __table_args__ = {"schema": COMPANY_SLUG}
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    label = Column(String, nullable=False)
    value = Column(Float, default=0.0)
    category = Column(String, default="revenue")
    date_recorded = Column(Date, default=datetime.utcnow().date)
    created_at = Column(DateTime, default=datetime.utcnow)

if db_engine:
    Base.metadata.create_all(db_engine)

def _seed_if_empty(db):
    if db.query(Tool).count() == 0:
        tools_data = [
            Tool(name="Keyword Explorer", status="active", usage=150, config={"max_keywords": 100}, analytics={"searches": 5000}),
            Tool(name="Social Scheduler", status="active", usage=89, config={"platforms": ["twitter", "linkedin"]}, analytics={"posts_scheduled": 1200}),
            Tool(name="Invoice Generator", status="active", usage=234, config={"currency": "USD"}, analytics={"invoices_created": 890}),
            Tool(name="Page Speed Analyzer", status="active", usage=67, config={"locations": ["us-east", "eu-west"]}, analytics={"tests_run": 340}),
            Tool(name="Email Warmup Tool", status="active", usage=45, config={"daily_limit": 50}, analytics={"emails_warmed": 12000}),
        ]
        db.add_all(tools_data)
        db.commit()

    if db.query(User).count() == 0:
        users_data = [
            User(email="alex@startup.io", name="Alex Chen", plan="pro", mrr=19.0),
            User(email="sarah@builder.com", name="Sarah Kim", plan="starter", mrr=9.0),
            User(email="marcus@devshop.dev", name="Marcus Johnson", plan="studio", mrr=29.0),
            User(email="lisa@solopreneur.co", name="Lisa Rodriguez", plan="pro", mrr=19.0),
            User(email="tom@microsaas.app", name="Tom Williams", plan="starter", mrr=9.0),
        ]
        db.add_all(users_data)
        db.commit()

    if db.query(Subscription).count() == 0:
        subs_data = [
            Subscription(user_email="alex@startup.io", plan="pro", status="active", next_billing=date(2024, 12, 1)),
            Subscription(user_email="sarah@builder.com", plan="starter", status="active", next_billing=date(2024, 11, 15)),
            Subscription(user_email="marcus@devshop.dev", plan="studio", status="active", next_billing=date(2024, 12, 20)),
            Subscription(user_email="lisa@solopreneur.co", plan="pro", status="active", next_billing=date(2024, 11, 28)),
            Subscription(user_email="tom@microsaas.app", plan="starter", status="active", next_billing=date(2024, 12, 5)),
        ]
        db.add_all(subs_data)
        db.commit()

    if db.query(Lead).count() == 0:
        leads_data = [
            Lead(email="jane@newventures.com", name="Jane Doe", source="website", status="new"),
            Lead(email="bob@sideproject.io", name="Bob Smith", source="referral", status="contacted"),
            Lead(email="emma@indiehack.er", name="Emma Wilson", source="twitter", status="new"),
        ]
        db.add_all(leads_data)
        db.commit()

    if db.query(Activity).count() == 0:
        now = datetime.utcnow()
        activities_data = [
            Activity(action="tool_created", description="Created Keyword Explorer tool", entity_type="tool", user_email="alex@startup.io", created_at=now - timedelta(hours=2)),
            Activity(action="user_signed_up", description="Alex Chen signed up for Pro plan", entity_type="user", user_email="alex@startup.io", created_at=now - timedelta(hours=3)),
            Activity(action="subscription_renewed", description="Sarah Kim renewed Starter plan", entity_type="subscription", user_email="sarah@builder.com", created_at=now - timedelta(hours=5)),
            Activity(action="tool_updated", description="Updated Social Scheduler config", entity_type="tool", user_email="marcus@devshop.dev", created_at=now - timedelta(hours=6)),
            Activity(action="lead_captured", description="New lead from website: Jane Doe", entity_type="lead", user_email="", created_at=now - timedelta(hours=8)),
            Activity(action="tool_used", description="Invoice Generator used 234 times today", entity_type="tool", user_email="lisa@solopreneur.co", created_at=now - timedelta(hours=10)),
            Activity(action="user_signed_up", description="Tom Williams joined Starter plan", entity_type="user", user_email="tom@microsaas.app", created_at=now - timedelta(hours=12)),
            Activity(action="subscription_created", description="Marcus Johnson upgraded to Studio", entity_type="subscription", user_email="marcus@devshop.dev", created_at=now - timedelta(hours=14)),
            Activity(action="tool_deleted", description="Removed unused analytics tool", entity_type="tool", user_email="alex@startup.io", created_at=now - timedelta(hours=16)),
            Activity(action="payment_received", description="Payment of $19.00 from Lisa Rodriguez", entity_type="subscription", user_email="lisa@solopreneur.co", created_at=now - timedelta(hours=18)),
        ]
        db.add_all(activities_data)
        db.commit()

    if db.query(ChartData).count() == 0:
        today = date.today()
        chart_data_list = []
        # Revenue data for last 12 months
        for i in range(12):
            month_date = date(today.year, 1 + (today.month - 1 - i) % 12, 1) if today.month - i > 0 else date(today.year - 1, 12 + (today.month - i), 1)
            month_label = month_date.strftime("%b %Y")
            monthly_revenue = 1200 + i * 50 + (i * 30)
            for plan_name, base_amount in [("starter", 9), ("pro", 19), ("studio", 29)]:
                count = 10 + i * 2 + (i % 3) * 5
                chart_data_list.append(ChartData(
                    label=month_label,
                    value=float(count * base_amount),
                    category=f"{plan_name}_revenue",
                    date_recorded=month_date
                ))
            chart_data_list.append(ChartData(
                label=month_label,
                value=float(monthly_revenue),
                category="total_revenue",
                date_recorded=month_date
            ))
        # User growth data for last 30 days
        for i in range(30):
            day = today - timedelta(days=i)
            day_label = day.strftime("%Y-%m-%d")
            new_users = 2 + (i % 5) * 3
            active_users = 50 + i * 2 - (i % 7) * 5
            chart_data_list.append(ChartData(
                label=day_label,
                value=float(new_users),
                category="new_users",
                date_recorded=day
            ))
            chart_data_list.append(ChartData(
                label=day_label,
                value=float(active_users),
                category="active_users",
                date_recorded=day
            ))
        # Tool usage data
        for i in range(7):
            day = today - timedelta(days=i)
            day_label = day.strftime("%Y-%m-%d")
            chart_data_list.append(ChartData(
                label=day_label,
                value=float(100 + i * 20 + (i % 3) * 15),
                category="tool_usage",
                date_recorded=day
            ))
        db.add_all(chart_data_list)
        db.commit()
        print(f"[{COMPANY_SLUG}] Seeded initial data")

if db_engine:
    with SessionLocal() as db:
        _seed_if_empty(db)

def _nanocorp_sync(db):
    import datetime
    try:
        import requests as _req
    except ImportError:
        return
    try:
        customers = []
        for u in db.query(User).all():
            customers.append({
                'id': str(u.id),
                'email': str(u.email),
                'name': str(u.name),
                'plan': str(u.plan),
                'mrr': float(u.mrr or 0),
                'created_at': str(u.created_at)
            })
        leads = []
        for l in db.query(Lead).all():
            leads.append({
                'id': str(l.id),
                'email': str(l.email),
                'name': str(l.name),
                'source': str(l.source),
                'status': str(l.status),
                'created_at': str(l.created_at)
            })
        orders = []
        for s in db.query(Subscription).all():
            orders.append({
                'id': str(s.id),
                'customer_email': str(s.user_email),
                'product': str(s.plan),
                'amount': 9.0 if s.plan == 'starter' else 19.0 if s.plan == 'pro' else 29.0,
                'created_at': str(s.created_at)
            })
        total_mrr = sum(c['mrr'] for c in customers)
        metrics = {
            'total_users': len(customers),
            'mrr': total_mrr,
            'arr': total_mrr * 12,
            'active_today': 0,
            'churn_rate': 0
        }
        _req.post(
            f'{_NANOCORP_BASE}/api/company/{_NANOCORP_CO}/sync',
            json={'customers': customers, 'leads': leads, 'orders': orders, 'metrics': metrics},
            headers={'Authorization': f'Bearer {_NANOCORP_TOKEN}', 'Content-Type': 'application/json'},
            timeout=6
        )
    except Exception:
        pass

app = FastAPI(title="PixelForge Micro-Tools API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    if not db_engine:
        raise HTTPException(status_code=503, detail="Database not configured")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
async def startup():
    if db_engine:
        with SessionLocal() as db:
            threading.Thread(target=_nanocorp_sync, args=(db,), daemon=True).start()

@app.get("/health")
def health():
    return {"status": "ok", "schema": COMPANY_SLUG, "db": bool(db_engine)}

@app.get("/api/info")
def get_info():
    return {
        "name": "PixelForge Studios",
        "app_name": "PixelForge Micro-Tools",
        "tagline": "Powerful SaaS micro-tools for solopreneurs",
        "founded": "2023",
        "team_size": 5,
        "pricing_tiers": [
            {"name": "Starter", "price": 9, "features": ["1 micro-tool", "basic analytics"]},
            {"name": "Pro", "price": 19, "features": ["3 micro-tools", "advanced analytics", "custom domain"]},
            {"name": "Studio", "price": 29, "features": ["unlimited tools", "team access", "priority support"]}
        ]
    }

@app.get("/api/metrics")
def get_metrics(db: Session = Depends(get_db)):
    users = db.query(User).count()
    tools = db.query(Tool).count()
    total_revenue = sum(
        9 if s.plan == 'starter' else 19 if s.plan == 'pro' else 29
        for s in db.query(Subscription).filter(Subscription.status == 'active').all()
    )
    return {"users": users, "tools": tools, "revenue": float(total_revenue)}

@app.get("/api/chart-data")
def get_chart_data(
    category: Optional[str] = Query(None, description="Filter by category"),
    days: int = Query(30, description="Number of days of data"),
    db: Session = Depends(get_db)
):
    query = db.query(ChartData)
    if category:
        query = query.filter(ChartData.category == category)
    cutoff_date = date.today() - timedelta(days=days)
    query = query.filter(ChartData.date_recorded >= cutoff_date)
    records = query.order_by(ChartData.date_recorded.asc()).all()
    if not records:
        return []
    return [
        {
            "label": r.label,
            "value": r.value,
            "category": r.category,
            "date_recorded": r.date_recorded.isoformat()
        }
        for r in records
    ]

@app.get("/api/recent-activity")
def get_recent_activity(
    limit: int = Query(10, description="Number of recent activities"),
    db: Session = Depends(get_db)
):
    activities = db.query(Activity).order_by(Activity.created_at.desc()).limit(limit).all()
    if not activities:
        return []
    return [
        {
            "id": int(a.id) if a.id.isdigit() else hash(a.id),
            "action": a.action,
            "description": a.description,
            "entity_type": a.entity_type,
            "user_email": a.user_email,
            "created_at": a.created_at.isoformat()
        }
        for a in activities
    ]

@app.get("/api/tools")
def list_tools(db: Session = Depends(get_db)):
    tools = db.query(Tool).all()
    return [{"id": int(t.id) if t.id.isdigit() else hash(t.id), "name": t.name, "status": t.status, "usage": t.usage} for t in tools]

class ToolCreate(BaseModel):
    name: str
    status: str = "active"

class ToolUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None

@app.post("/api/tools")
def create_tool(tool: ToolCreate, db: Session = Depends(get_db)):
    db_tool = Tool(name=tool.name, status=tool.status)
    db.add(db_tool)
    db.commit()
    db.refresh(db_tool)
    threading.Thread(target=_nanocorp_sync, args=(db,), daemon=True).start()
    return {"id": int(db_tool.id) if db_tool.id.isdigit() else hash(db_tool.id), "name": db_tool.name, "status": db_tool.status}

@app.get("/api/tools/{tool_id}")
def get_tool(tool_id: str, db: Session = Depends(get_db)):
    db_tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if not db_tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    return {"id": int(db_tool.id) if db_tool.id.isdigit() else hash(db_tool.id), "name": db_tool.name, "config": db_tool.config or {}, "analytics": db_tool.analytics or {}}

@app.put("/api/tools/{tool_id}")
def update_tool(tool_id: str, tool: ToolUpdate, db: Session = Depends(get_db)):
    db_tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if not db_tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    if tool.name is not None:
        db_tool.name = tool.name
    if tool.status is not None:
        db_tool.status = tool.status
    db.commit()
    db.refresh(db_tool)
    return {"id": int(db_tool.id) if db_tool.id.isdigit() else hash(db_tool.id), "name": db_tool.name, "status": db_tool.status}

@app.delete("/api/tools/{tool_id}")
def delete_tool(tool_id: str, db: Session = Depends(get_db)):
    db_tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if not db_tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    db.delete(db_tool)
    db.commit()
    return {}

@app.get("/api/subscriptions")
def list_subscriptions(db: Session = Depends(get_db)):
    subs = db.query(Subscription).all()
    return [{"id": int(s.id) if s.id.isdigit() else hash(s.id), "plan": s.plan, "status": s.status, "next_billing": s.next_billing} for s in subs]

class SubscriptionCreate(BaseModel):
    user_email: str
    plan: str
    status: str = "active"

@app.post("/api/subscriptions")
def create_subscription(sub: SubscriptionCreate, db: Session = Depends(get_db)):
    db_sub = Subscription(user_email=sub.user_email, plan=sub.plan, status=sub.status)
    db.add(db_sub)
    db.commit()
    db.refresh(db_sub)
    threading.Thread(target=_nanocorp_sync, args=(db,), daemon=True).start()
    return {"id": int(db_sub.id) if db_sub.id.isdigit() else hash(db_sub.id), "plan": db_sub.plan, "status": db_sub.status}

@app.post("/api/checkout")
async def create_checkout(request: Request):
    if not STRIPE_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Payments not configured")
    import stripe
    stripe.api_key = STRIPE_SECRET_KEY
    body = json.loads(await request.body())
    plan = body.get("plan", "starter")
    user_email = body.get("user_email", "")
    success_url = body.get("success_url", "")
    cancel_url = body.get("cancel_url", "")
    price_map = {"starter": 900, "pro": 1900, "studio": 2900}
    price_cents = price_map.get(plan, 900)
    session_params = {
        "payment_method_types": ["card"],
        "line_items": [{"price_data": {"currency": "usd", "product_data": {"name": f"PixelForge {plan.capitalize()} Plan"}, "unit_amount": price_cents, "recurring": {"interval": "month"}}, "quantity": 1}],
        "mode": "subscription",
        "success_url": success_url,
        "cancel_url": cancel_url,
        "customer_email": user_email,
    }
    if STRIPE_CONNECT_ID:
        session_params["payment_intent_data"] = {
            "application_fee_amount": int(price_cents * 0.2),
            "transfer_data": {"destination": STRIPE_CONNECT_ID}
        }
    session = stripe.checkout.Session.create(**session_params)
    return {"checkout_url": session.url}

@app.post("/api/webhook")
async def webhook(request: Request, db: Session = Depends(get_db)):
    if not STRIPE_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Payments not configured")
    import stripe
    stripe.api_key = STRIPE_SECRET_KEY
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except:
        raise HTTPException(status_code=400, detail="Invalid signature")
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_email = session.get("customer_email", "")
        plan = "starter"
        if session.get("display_items"):
            plan_name = session["display_items"][0].get("custom", {}).get("name", "starter")
            plan = plan_name.replace("PixelForge ", "").replace(" Plan", "").lower()
        existing = db.query(Subscription).filter(Subscription.user_email == user_email).first()
        if existing:
            existing.plan = plan
            existing.status = "active"
            existing.stripe_session_id = session.get("id", "")
        else:
            db_sub = Subscription(
                user_email=user_email,
                plan=plan,
                status="active",
                stripe_session_id=session.get("id", ""),
                stripe_customer_id=session.get("customer", "")
            )
            db.add(db_sub)
        db.commit()
    return {"status": "ok"}

@app.get("/api/subscription")
def get_subscription(email: str = Query(""), db: Session = Depends(get_db)):
    if not email:
        return {"plan": "free", "status": "none"}
    sub = db.query(Subscription).filter(Subscription.user_email == email).first()
    if sub and sub.status == "active":
        return {"plan": sub.plan, "status": "active"}
    return {"plan": "free", "status": "none"}

@app.post("/api/portal")
async def portal(request: Request):
    if not STRIPE_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Payments not configured")
    import stripe
    stripe.api_key = STRIPE_SECRET_KEY
    body = json.loads(await request.body())
    customer_id = body.get("customer_id", "")
    session = stripe.billing_portal.Session.create(customer=customer_id)
    return {"portal_url": session.url}

# ─── AUTO-MIGRATE (injected): add model columns create_all can't ────────────
def _nc_auto_migrate():
    if not db_engine:
        return
    try:
        from sqlalchemy import inspect as _sa_inspect, text as _sa_text
        if db_engine.dialect.name != "postgresql":
            return
        _insp = _sa_inspect(db_engine)
        with db_engine.connect() as _mc:
            for _tbl in Base.metadata.sorted_tables:
                _sch = _tbl.schema or "public"
                try:
                    if not _insp.has_table(_tbl.name, schema=_sch):
                        continue  # create_all creates brand-new tables whole
                    _have = {_c["name"] for _c in _insp.get_columns(_tbl.name, schema=_sch)}
                except Exception:
                    continue
                for _col in _tbl.columns:
                    if _col.name in _have:
                        continue
                    try:
                        _ddl = _col.type.compile(db_engine.dialect)
                        _mc.execute(_sa_text(
                            f'ALTER TABLE "{_sch}"."{_tbl.name}" '
                            f'ADD COLUMN IF NOT EXISTS "{_col.name}" {_ddl}'
                        ))
                        _mc.commit()
                        print(f"[DB] migrated: added {_tbl.name}.{_col.name} ({_ddl})", flush=True)
                    except Exception as _col_e:
                        print(f"[DB] migrate skip {_tbl.name}.{_col.name}: {_col_e}", flush=True)
    except Exception as _mig_e:
        print(f"[DB] auto-migrate warning: {_mig_e}", flush=True)

_nc_auto_migrate()
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT)